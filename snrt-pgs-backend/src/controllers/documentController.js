// src/controllers/documentController.js
const Document = require('../models/Document');
const Application = require('../models/Application');
const storageService = require('../services/storageService');
const { ROLES, STAFF_TREATMENT_ROLES } = require('../config/constants');

exports.uploadDocument = async (req, res) => {
    try {
        const { type, applicationId, uploadedByModel } = req.body;
        let { candidatId } = req.body;

        // IDOR (critique) : un etudiant ne peut uploader un document que pour
        // lui-meme. Avant ce correctif, n'importe quel utilisateur pouvait
        // fournir le candidatId d'un autre etudiant et uploader un document
        // (ex: faux CV) en son nom.
        if (req.user?.role === ROLES.ETUDIANT) {
            candidatId = req.user.id;
        } else if (!candidatId) {
            return res.status(400).json({
                success: false,
                message: 'candidatId est obligatoire'
            });
        }

        const document = await storageService.createDocumentFromUpload({
            file: req.file,
            type,
            candidatId,
            applicationId,
            uploadedBy: req.user?._id,
            uploadedByModel: uploadedByModel || 'UtilisateurExterne'
        });

        return res.status(201).json({
            success: true,
            message: 'Document uploadé avec succès',
            data: document
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l’upload du document',
            error: error.message
        });
    }
};

exports.uploadDocumentForApplication = async (req, res) => {
    try {
        const { type, uploadedByModel } = req.body;
        let { candidatId } = req.body;
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        // IDOR (critique) : un etudiant ne peut deposer un document que sur
        // sa propre candidature, et uniquement en son propre nom.
        if (req.user?.role === ROLES.ETUDIANT) {
            if (application.etudiantId.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez déposer des documents que sur votre propre candidature'
                });
            }
            candidatId = req.user.id;
        }

        const finalCandidatId = candidatId || application.etudiantId;

        const document = await storageService.createDocumentFromUpload({
            file: req.file,
            type,
            candidatId: finalCandidatId,
            applicationId,
            uploadedBy: req.user?._id,
            uploadedByModel: uploadedByModel || 'UtilisateurExterne'
        });

        return res.status(201).json({
            success: true,
            message: 'Document associé à la candidature avec succès',
            data: document
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l’upload du document',
            error: error.message
        });
    }
};

exports.getApplicationDocuments = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId).select('etudiantId');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        // IDOR (critique) : un etudiant ne peut consulter que les documents
        // de sa propre candidature.
        if (req.user?.role === ROLES.ETUDIANT && application.etudiantId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé à cette candidature'
            });
        }

        const documents = await Document.find({ applicationId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des documents',
            error: error.message
        });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('candidatId', 'nom prenom email cin')
            .populate('applicationId')
            .populate('verifiedBy', 'nom prenom email');

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
            });
        }

        // IDOR (critique) : un etudiant ne peut consulter que ses propres documents.
        const ownerId = document.candidatId?._id
            ? document.candidatId._id.toString()
            : document.candidatId?.toString();
        if (req.user?.role === ROLES.ETUDIANT && ownerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé à ce document'
            });
        }

        return res.status(200).json({
            success: true,
            data: document
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du document',
            error: error.message
        });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id).select('candidatId');

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
            });
        }

        // IDOR (critique) : un etudiant ne peut supprimer que ses propres documents.
        if (req.user?.role === ROLES.ETUDIANT && document.candidatId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Vous ne pouvez supprimer que vos propres documents'
            });
        }

        await storageService.deleteDocument(req.params.id, req.user?._id);

        return res.status(200).json({
            success: true,
            message: 'Document supprimé avec succès'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du document',
            error: error.message
        });
    }
};

exports.verifyDocument = async (req, res) => {
    try {
        // Critique : seul le personnel charge du traitement des candidatures
        // (RH / departement / administrateur) peut valider ou refuser un
        // document. Avant ce correctif, un etudiant pouvait valider/refuser
        // n'importe quel document, y compris le sien ou celui d'un tiers.
        if (!STAFF_TREATMENT_ROLES.includes(req.user?.role)) {
            return res.status(403).json({
                success: false,
                message: 'Seuls le RH, le departement ou un administrateur peuvent vérifier un document'
            });
        }

        const { statut, commentaire } = req.body;

        const document = await storageService.verifyDocument({
            documentId: req.params.id,
            statut,
            commentaire,
            verifiedBy: req.user?._id
        });

        return res.status(200).json({
            success: true,
            message: 'Document vérifié avec succès',
            data: document
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification du document',
            error: error.message
        });
    }
};
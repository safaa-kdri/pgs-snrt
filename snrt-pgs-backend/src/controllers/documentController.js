// src/controllers/documentController.js
const Document = require('../models/Document');
const Application = require('../models/Application');
const storageService = require('../services/storageService');

exports.uploadDocument = async (req, res) => {
    try {
        const { type, candidatId, applicationId, uploadedByModel } = req.body;

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
        const { type, candidatId, uploadedByModel } = req.body;
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
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
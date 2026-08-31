// src/controllers/documentController.js
// ✅ CORRECTION : Ajouter la logique de changement de statut de l'application

const mongoose = require('mongoose');
const Document = require('../models/Document');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Offer = require('../models/Offer');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const gridfsService = require('../services/gridfsService');
const { ROLES, APPLICATION_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

async function resolveGridFsFileMetadata(fileId) {
    if (!fileId) return null;

    try {
        const db = mongoose.connection.db;
        if (!db) return null;

        const objectId = new mongoose.Types.ObjectId(fileId);
        return await db.collection('documents.files').findOne({ _id: objectId });
    } catch (error) {
        logger.warn(`GridFS metadata lookup failed for ${fileId}: ${error.message}`);
        return null;
    }
}

function setPdfResponseHeaders(res, fileName, mimeType) {
    const normalizedName = String(fileName || 'document.pdf');
    const normalizedMime = (mimeType || 'application/pdf').toLowerCase();

    if (normalizedMime.includes('pdf') || normalizedName.toLowerCase().endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${normalizedName}"`);
        return;
    }

    res.setHeader('Content-Type', normalizedMime || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${normalizedName}"`);
}

// ============================================
// HELPERS
// ============================================

async function fetchApplicationParties(application) {
    const [student, offer] = await Promise.all([
        UtilisateurExterne.findById(application.etudiantId).select('email nom prenom'),
        Offer.findById(application.offreId).select('titre'),
    ]);
    return { student, offer };
}

// ============================================
// UPLOAD - Stocker dans GridFS
// ============================================
exports.uploadDocument = async (req, res) => {
    try {
        const { type, applicationId, uploadedByModel } = req.body;
        let { candidatId } = req.body;

        if (req.user?.role === ROLES.ETUDIANT) {
            candidatId = req.user.id;
        } else if (!candidatId) {
            return res.status(400).json({
                success: false,
                message: 'candidatId est obligatoire'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier fourni'
            });
        }

        // ✅ Upload vers GridFS
        const gridfsFile = await gridfsService.uploadFile(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        if (!gridfsFile || !gridfsFile._id) {
            throw new Error('Erreur lors de l\'upload vers GridFS');
        }

        // ✅ Créer le document
        const document = await Document.create({
            nomOriginal: req.file.originalname,
            nomStocke: req.file.originalname,
            type: type || 'Autre',
            mimeType: req.file.mimetype,
            taille: req.file.size,
            gridFsId: gridfsFile._id,
            url: `/api/v1/documents/file/${gridfsFile._id}`,
            candidatId: candidatId,
            applicationId: applicationId || null,
            uploadedBy: req.user?._id,
            uploadedByModel: uploadedByModel || 'UtilisateurExterne',
            statut: 'EnAttente'
        });

        if (applicationId) {
            const application = await Application.findById(applicationId);
            if (application && !application.documents.includes(document._id)) {
                application.documents.push(document._id);
                await application.save();
            }
        }

        logger.info(`Document uploadé: ${document.nomOriginal}`);

        return res.status(201).json({
            success: true,
            message: 'Document uploadé avec succès',
            data: document
        });
    } catch (error) {
        logger.error(`Erreur uploadDocument: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload',
            error: error.message
        });
    }
};

// ============================================
// TÉLÉCHARGER
// ============================================
exports.downloadDocument = async (req, res) => {
    try {
        const { fileId } = req.params;

        const document = await Document.findOne({ gridFsId: fileId });
        if (!document) {
            const gridFile = await resolveGridFsFileMetadata(fileId);
            const mimeType = gridFile?.contentType || 'application/pdf';
            const fileName = gridFile?.filename || `document_${fileId}.pdf`;

            const downloadStream = gridfsService.downloadFile(fileId);
            setPdfResponseHeaders(res, fileName, mimeType);
            return downloadStream.pipe(res);
        }

        if (req.user?.role === ROLES.ETUDIANT) {
            if (document.candidatId.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé'
                });
            }
        }

        const downloadStream = gridfsService.downloadFile(fileId);

        setPdfResponseHeaders(res, document.nomOriginal || `document_${fileId}.pdf`, document.mimeType || 'application/pdf');

        return downloadStream.pipe(res);
    } catch (error) {
        logger.error(`Erreur downloadDocument: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du téléchargement'
        });
    }
};

// ============================================
// PRÉVISUALISER (Base64)
// ============================================
exports.previewDocument = async (req, res) => {
    try {
        const { fileId } = req.params;

        const document = await Document.findOne({ gridFsId: fileId });
        if (!document) {
            const gridFile = await resolveGridFsFileMetadata(fileId);
            const base64 = await gridfsService.getFileAsBase64(fileId);
            return res.status(200).json({
                success: true,
                data: {
                    base64,
                    mimeType: gridFile?.contentType || 'application/pdf',
                    nomOriginal: gridFile?.filename || `document_${fileId}.pdf`
                }
            });
        }

        if (req.user?.role === ROLES.ETUDIANT) {
            if (document.candidatId.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé'
                });
            }
        }

        const base64 = await gridfsService.getFileAsBase64(fileId);

        return res.status(200).json({
            success: true,
            data: {
                base64: base64,
                mimeType: document.mimeType,
                nomOriginal: document.nomOriginal
            }
        });
    } catch (error) {
        logger.error(`Erreur previewDocument: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la prévisualisation'
        });
    }
};

// ============================================
// SUPPRIMER
// ============================================
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
            });
        }

        if (req.user?.role === ROLES.ETUDIANT) {
            if (document.candidatId.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez supprimer que vos propres documents'
                });
            }
        }

        if (document.gridFsId) {
            await gridfsService.deleteFile(document.gridFsId);
        }
        await document.softDelete(req.user?._id);

        return res.status(200).json({
            success: true,
            message: 'Document supprimé avec succès'
        });
    } catch (error) {
        logger.error(`Erreur deleteDocument: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression'
        });
    }
};

// ============================================
// RÉCUPÉRER UN DOCUMENT PAR ID
// ============================================
exports.getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('candidatId', 'nom prenom email cin')
            .populate('applicationId');

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
            });
        }

        if (req.user?.role === ROLES.ETUDIANT) {
            if (document.candidatId._id.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Accès refusé'
                });
            }
        }

        return res.status(200).json({
            success: true,
            data: document
        });
    } catch (error) {
        logger.error(`Erreur getDocumentById: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération'
        });
    }
};

// ============================================
// ✅ VÉRIFIER UN DOCUMENT (RH) - AVEC CHANGEMENT DE STATUT AUTOMATIQUE
// ============================================
exports.verifyDocument = async (req, res) => {
    try {
        const { statut, commentaire } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
            });
        }

        // ✅ Mettre à jour le document
        document.statut = statut || 'Valide';
        document.commentaire = commentaire || '';
        document.isVerified = statut === 'Valide';
        document.verifiedBy = req.user?._id;
        document.verifiedAt = new Date();

        await document.save();

        // ✅ Si le document est validé et associé à une application
        if (statut === 'Valide' && document.applicationId) {
            const application = await Application.findById(document.applicationId)
                .populate('documents');
            
            if (application) {
                // ✅ Vérifier si tous les documents sont validés
                const documents = await Document.find({
                    _id: { $in: application.documents }
                });
                
                const allVerified = documents.every(doc => doc.isVerified === true);
                const hasDocuments = documents.length > 0;

                // ✅ Si tous les documents sont validés, changer le statut
                if (allVerified && hasDocuments) {
                    const ancienStatut = application.statut;
                    
                    // ✅ Changer le statut selon le workflow
                    if (ancienStatut === 'Soumise') {
                        application.statut = 'EnAnalyse';
                    } else if (ancienStatut === 'EnAnalyse') {
                        application.statut = 'Acceptee';
                    }
                    
                    application.traiteurId = req.user?._id;
                    
                    // ✅ Ajouter à l'historique
                    if (!application.historique) application.historique = [];
                    application.historique.push({
                        date: new Date(),
                        ancienStatut: ancienStatut,
                        nouveauStatut: application.statut,
                        commentaire: 'Tous les documents ont été validés par le RH',
                        auteurId: req.user?._id
                    });

                    await application.save();

                    // ✅ Notifier l'étudiant
                    try {
                        const { student, offer } = await fetchApplicationParties(application);
                        if (student) {
                            await Notification.create({
                                type: 'InApp',
                                titre: 'Documents validés',
                                message: `Tous vos documents pour "${offer?.titre || 'l\'offre'}" ont été validés par le RH. Votre candidature est maintenant en analyse.`,
                                lien: `/candidatures/${application._id}`,
                                userId: student._id,
                                userModel: 'UtilisateurExterne',
                            });
                        }
                    } catch (notifError) {
                        logger.warn(`[Document] Notification non envoyée: ${notifError.message}`);
                    }

                    logger.info(`[Document] Application ${application._id} passée de ${ancienStatut} à ${application.statut}`);
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Document vérifié avec succès',
            data: document
        });
    } catch (error) {
        logger.error(`Erreur verifyDocument: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification',
            error: error.message
        });
    }
};

// ============================================
// ✅ NOUVEAU : VALIDER TOUS LES DOCUMENTS D'UNE APPLICATION
// ============================================
exports.validateAllDocuments = async (req, res) => {
    try {
        const { applicationId } = req.params;
        
        // ✅ Vérifier que l'utilisateur est RH
        if (req.user?.role !== ROLES.RH && req.user?.role !== ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Seul le RH peut valider les documents'
            });
        }

        const application = await Application.findById(applicationId)
            .populate('documents');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        // ✅ Vérifier que tous les documents existent
        if (!application.documents || application.documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Aucun document à valider'
            });
        }

        // ✅ Valider tous les documents
        const documentIds = application.documents.map(doc => doc._id);
        await Document.updateMany(
            { _id: { $in: documentIds } },
            { 
                $set: { 
                    isVerified: true, 
                    statut: 'Valide',
                    verifiedBy: req.user?._id,
                    verifiedAt: new Date()
                } 
            }
        );

        // ✅ Changer le statut de l'application
        const ancienStatut = application.statut;
        
        if (ancienStatut === 'Soumise') {
            application.statut = 'EnAnalyse';
        } else if (ancienStatut === 'EnAnalyse') {
            application.statut = 'Acceptee';
        }
        
        application.traiteurId = req.user?._id;
        
        if (!application.historique) application.historique = [];
        application.historique.push({
            date: new Date(),
            ancienStatut: ancienStatut,
            nouveauStatut: application.statut,
            commentaire: 'Tous les documents ont été validés par le RH',
            auteurId: req.user?._id
        });

        await application.save();

        // ✅ Notifier l'étudiant
        try {
            const { student, offer } = await fetchApplicationParties(application);
            if (student) {
                await Notification.create({
                    type: 'InApp',
                    titre: 'Documents validés',
                    message: `Tous vos documents pour "${offer?.titre || 'l\'offre'}" ont été validés par le RH. Votre candidature est maintenant en analyse.`,
                    lien: `/candidatures/${application._id}`,
                    userId: student._id,
                    userModel: 'UtilisateurExterne',
                });
            }
        } catch (notifError) {
            logger.warn(`[Document] Notification non envoyée: ${notifError.message}`);
        }

        logger.info(`[Document] Tous les documents de l'application ${application._id} validés, statut: ${application.statut}`);

        return res.status(200).json({
            success: true,
            message: 'Tous les documents ont été validés avec succès',
            data: application
        });

    } catch (error) {
        logger.error(`Erreur validateAllDocuments: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la validation',
            error: error.message
        });
    }
};
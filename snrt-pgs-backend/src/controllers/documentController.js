// src/controllers/documentController.js
const Document = require('../models/Document');
const Application = require('../models/Application');
const gridfsService = require('../services/gridfsService');
const { ROLES } = require('../config/constants');
const logger = require('../utils/logger');

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

        // ✅ Vérifier que gridfsFile a bien un _id
        if (!gridfsFile || !gridfsFile._id) {
            throw new Error('Erreur lors de l\'upload vers GridFS');
        }

        // ✅ Créer le document avec tous les champs requis
        const document = await Document.create({
            nomOriginal: req.file.originalname,
            nomStocke: req.file.originalname, // ✅ AJOUTÉ - nomStocke requis
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
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
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

        const downloadStream = gridfsService.downloadFile(fileId);

        res.setHeader('Content-Type', document.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${document.nomOriginal}"`);

        downloadStream.pipe(res);
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
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
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
// VÉRIFIER UN DOCUMENT (RH)
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

        document.statut = statut || 'Valide';
        document.commentaire = commentaire || '';
        document.isVerified = statut === 'Valide';
        document.verifiedBy = req.user?._id;
        document.verifiedAt = new Date();

        await document.save();

        return res.status(200).json({
            success: true,
            message: 'Document vérifié avec succès',
            data: document
        });
    } catch (error) {
        logger.error(`Erreur verifyDocument: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification'
        });
    }
};
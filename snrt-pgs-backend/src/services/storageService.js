// src/services/storageService.js
const path = require('path');
const fs = require('fs');

const Document = require('../models/Document');
const Application = require('../models/Application');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const { sendDocumentRejectedEmail } = require('./emailService');
const logger = require('../utils/logger');
const gridfsService = require('./gridfsService');

const ALLOWED_DOCUMENT_TYPES = ['CV', 'LettreMotivation', 'Convention', 'Attestation', 'ReleveNotes', 'Autre'];


const getDocumentType = (type) => {
    if (!ALLOWED_DOCUMENT_TYPES.includes(type)) {
        throw new Error(
            `Type de document invalide : "${type}". Valeurs autorisees : ${ALLOWED_DOCUMENT_TYPES.join(', ')}.`
        );
    }
    return type;
};

exports.createDocumentFromUpload = async ({
    file,
    type,
    candidatId,
    applicationId,
    uploadedBy,
    uploadedByModel
}) => {
    if (!file) {
        throw new Error('Aucun fichier fourni');
    }

    // Support memory uploads (GridFS) and disk uploads.
    let docPayload = {
        nomOriginal: file.originalname,
        type: getDocumentType(type),
        mimeType: file.mimetype,
        taille: file.size,
        candidatId,
        applicationId,
        uploadedBy,
        uploadedByModel
    };

    if (file.buffer) {
        // Upload to GridFS
        const uploaded = await gridfsService.uploadBuffer({ buffer: file.buffer, filename: file.originalname, contentType: file.mimetype });
        docPayload.nomStocke = uploaded.filename;
        docPayload.gridFsId = uploaded._id;
        docPayload.chemin = null;
        docPayload.url = `/api/v1/documents/stream/${uploaded._id}`;
    } else {
        // Disk-backed upload (backwards compatible)
        docPayload.nomStocke = file.filename;
        docPayload.chemin = file.path;
        docPayload.url = `/uploads/documents/${file.filename}`;
    }

    const document = await Document.create(docPayload);

    if (applicationId) {
        const application = await Application.findById(applicationId);

        if (!application) {
            throw new Error('Candidature non trouvée');
        }

        if (!application.documents.includes(document._id)) {
            application.documents.push(document._id);
            await application.save();
        }
    }

    return document;
};

exports.deletePhysicalFile = async (document) => {
    // If file is stored on disk
    if (document?.chemin) {
        const filePath = path.resolve(document.chemin);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    // If file is stored in GridFS, delete from GridFS
    if (document?.gridFsId) {
        try {
            await gridfsService.deleteById(document.gridFsId);
        } catch (err) {
            logger.warn(`[Storage] Erreur suppression GridFS: ${err.message}`);
        }
    }
};

exports.deleteDocument = async (documentId, userId) => {
    const document = await Document.findById(documentId);

    if (!document) {
        throw new Error('Document non trouvé');
    }

    await exports.deletePhysicalFile(document);
    await document.softDelete(userId);

    return document;
};

exports.verifyDocument = async ({ documentId, statut, commentaire, verifiedBy }) => {
    const allowedStatus = ['EnAttente', 'Valide', 'Refuse'];

    if (!allowedStatus.includes(statut)) {
        throw new Error('Statut de document invalide');
    }

    const document = await Document.findById(documentId);

    if (!document) {
        throw new Error('Document non trouvé');
    }

    document.statut = statut;
    document.commentaire = commentaire;
    document.isVerified = statut === 'Valide';
    document.verifiedBy = verifiedBy;
    document.verifiedAt = new Date();

    await document.save();

    if (statut === 'Refuse') {
        try {
            const student = await UtilisateurExterne.findById(document.candidatId).select('email nom prenom');
            if (student) {
                await sendDocumentRejectedEmail({
                    to: student.email,
                    studentName: `${student.prenom} ${student.nom}`,
                    documentName: document.nomOriginal,
                    reason: commentaire,
                });
            }
        } catch (err) {
            logger.warn(`[Document] Email de refus non envoye: ${err.message}`);
        }
    }

    return document;
};
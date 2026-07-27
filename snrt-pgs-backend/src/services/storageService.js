// src/services/storageService.js
const path = require('path');
const fs = require('fs');

const Document = require('../models/Document');
const Application = require('../models/Application');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const { sendDocumentRejectedEmail } = require('./emailService');
const logger = require('../utils/logger');

const ALLOWED_DOCUMENT_TYPES = ['CV', 'LettreMotivation', 'Convention', 'Attestation', 'ReleveNotes', 'Autre'];

// BUGFIX (important) : cette fonction remappait silencieusement tout type
// non reconnu vers 'Autre' (ex: une faute de frappe 'cv' au lieu de 'CV').
// Consequence concrete : un candidat qui uploadait bien son CV pouvait se
// voir bloquer plus tard par applicationController.submitApplication avec
// un message "CV obligatoire" trompeur, car le document avait ete
// silencieusement enregistre comme 'Autre'. On leve maintenant une erreur
// explicite plutot que de deviner/corrompre la donnee envoyee par l'appelant.
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

    const document = await Document.create({
        nomOriginal: file.originalname,
        nomStocke: file.filename,
        type: getDocumentType(type),
        mimeType: file.mimetype,
        taille: file.size,
        chemin: file.path,
        url: `/uploads/documents/${file.filename}`,
        candidatId,
        applicationId,
        uploadedBy,
        uploadedByModel
    });

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
    if (!document?.chemin) return;

    const filePath = path.resolve(document.chemin);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
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
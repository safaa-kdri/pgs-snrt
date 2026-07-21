// src/controllers/applicationController.js
const Application = require('../models/Application');
const Document = require('../models/Document');
const Offer = require('../models/Offer');
const Notification = require('../models/Notification');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const { APPLICATION_STATUS } = require('../config/constants');
const { sendApplicationStatusChangedEmail } = require('../services/emailService');
const logger = require('../utils/logger');

// RG-018 : toute etape cle du workflow de candidature declenche une
// notification (plateforme + email). Non bloquant : un echec d'envoi ne doit
// jamais faire echouer le changement de statut lui-meme.
async function notifyStudentStatusChanged(application, statut) {
    try {
        const [student, offer] = await Promise.all([
            UtilisateurExterne.findById(application.etudiantId).select('email nom prenom'),
            Offer.findById(application.offreId).select('titre'),
        ]);
        if (!student) return;

        await Notification.create({
            type: 'InApp',
            titre: 'Mise a jour de candidature',
            message: `Le statut de votre candidature pour "${offer?.titre || 'une offre'}" est maintenant : ${statut}.`,
            lien: `/candidatures/${application._id}`,
            userId: student._id,
            userModel: 'UtilisateurExterne',
        });

        await sendApplicationStatusChangedEmail({
            to: student.email,
            studentName: `${student.prenom} ${student.nom}`,
            offerTitle: offer?.titre || 'votre offre',
            status: statut,
        });
    } catch (err) {
        logger.warn(`[Application] Notification de changement de statut non envoyee: ${err.message}`);
    }
}

// Source unique de verite pour les statuts : config/constants.js
// (evite le desalignement Analyse/EnAnalyse entre schema et controleur).
const STATUTS = Object.values(APPLICATION_STATUS);

const TRANSITIONS_AUTORISEES = {
    [APPLICATION_STATUS.BROUILLON]: [APPLICATION_STATUS.SOUMISE],
    [APPLICATION_STATUS.SOUMISE]: [APPLICATION_STATUS.EN_ANALYSE, APPLICATION_STATUS.REFUSEE],
    [APPLICATION_STATUS.EN_ANALYSE]: [
        APPLICATION_STATUS.ENTRETIEN,
        APPLICATION_STATUS.ACCEPTEE,
        APPLICATION_STATUS.REFUSEE,
    ],
    [APPLICATION_STATUS.ENTRETIEN]: [APPLICATION_STATUS.ACCEPTEE, APPLICATION_STATUS.REFUSEE],
    [APPLICATION_STATUS.ACCEPTEE]: [],
    [APPLICATION_STATUS.REFUSEE]: [],
};

const canChangeStatus = (ancienStatut, nouveauStatut) => {
    return TRANSITIONS_AUTORISEES[ancienStatut]?.includes(nouveauStatut);
};

exports.createApplication = async (req, res) => {
    try {
        const { etudiantId, offreId, commentaire, documents } = req.body;

        const offer = await Offer.findById(offreId);

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offre non trouvée'
            });
        }

        const existingApplication = await Application.findOne({
            etudiantId,
            offreId
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'Une candidature existe déjà pour cette offre'
            });
        }

        const application = await Application.create({
            etudiantId,
            offreId,
            commentaire,
            documents,
            statut: APPLICATION_STATUS.BROUILLON,
            createdBy: req.user?._id
        });

        return res.status(201).json({
            success: true,
            message: 'Candidature créée avec succès',
            data: application
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la candidature',
            error: error.message
        });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        const { statut, etudiantId, offreId } = req.query;

        const filter = {};

        if (statut) filter.statut = statut;
        if (etudiantId) filter.etudiantId = etudiantId;
        if (offreId) filter.offreId = offreId;

        const applications = await Application.find(filter)
            .populate('etudiantId', 'nom prenom email cin')
            .populate('offreId', 'titre typeStage statut dateLimiteCandidature')
            .populate('traiteurId', 'nom prenom email')
            .populate('documents')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des candidatures',
            error: error.message
        });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('etudiantId', 'nom prenom email cin telephone')
            .populate('offreId', 'titre description typeStage statut dateDebut dateFin dateLimiteCandidature')
            .populate('traiteurId', 'nom prenom email')
            .populate('documents')
            .populate('historique.auteurId', 'nom prenom email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        return res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la candidature',
            error: error.message
        });
    }
};

exports.updateApplication = async (req, res) => {
    try {
        const { commentaire, documents } = req.body;

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        if (application.statut !== APPLICATION_STATUS.BROUILLON) {
            return res.status(400).json({
                success: false,
                message: 'Seule une candidature en brouillon peut être modifiée'
            });
        }

        if (commentaire !== undefined) application.commentaire = commentaire;
        if (documents !== undefined) application.documents = documents;

        application.updatedBy = req.user?._id;

        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Candidature modifiée avec succès',
            data: application
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de la candidature',
            error: error.message
        });
    }
};

exports.submitApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        if (application.statut !== APPLICATION_STATUS.BROUILLON) {
            return res.status(400).json({
                success: false,
                message: 'Seule une candidature en brouillon peut être soumise'
            });
        }

        // RG-013 : le CV est un document obligatoire pour toute candidature.
        const documents = await Document.find({ _id: { $in: application.documents } }).select('type');
        const hasCv = documents.some((doc) => doc.type === 'CV');
        if (!hasCv) {
            return res.status(400).json({
                success: false,
                message: 'Un CV est obligatoire avant de soumettre la candidature (RG-013).'
            });
        }

        const ancienStatut = application.statut;

        application.statut = APPLICATION_STATUS.SOUMISE;
        application.dateSoumission = new Date();
        application.updatedBy = req.user?._id;

        application.historique.push({
            ancienStatut,
            nouveauStatut: APPLICATION_STATUS.SOUMISE,
            commentaire: 'Candidature soumise par l’étudiant',
            auteurId: req.user?._id
        });

        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Candidature soumise avec succès',
            data: application
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la soumission de la candidature',
            error: error.message
        });
    }
};

exports.changeApplicationStatus = async (req, res) => {
    try {
        const { statut, commentaire } = req.body;

        if (!STATUTS.includes(statut)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        const ancienStatut = application.statut;

        if (!canChangeStatus(ancienStatut, statut)) {
            return res.status(400).json({
                success: false,
                message: `Transition non autorisée : ${ancienStatut} vers ${statut}`
            });
        }

        application.statut = statut;
        application.commentaire = commentaire || application.commentaire;
        application.traiteurId = req.user?._id;
        application.updatedBy = req.user?._id;

        application.historique.push({
            ancienStatut,
            nouveauStatut: statut,
            commentaire,
            auteurId: req.user?._id
        });

        await application.save();

        await notifyStudentStatusChanged(application, statut);

        return res.status(200).json({
            success: true,
            message: 'Statut de candidature modifié avec succès',
            data: application
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de statut',
            error: error.message
        });
    }
};

exports.getApplicationHistory = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('historique.auteurId', 'nom prenom email')
            .select('historique');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        return res.status(200).json({
            success: true,
            count: application.historique.length,
            data: application.historique
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l’historique',
            error: error.message
        });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        await application.softDelete(req.user?._id);

        return res.status(200).json({
            success: true,
            message: 'Candidature supprimée avec succès'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la candidature',
            error: error.message
        });
    }
};

exports.addDocumentToApplication = async (req, res) => {
    try {
        const { documentId } = req.body;

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
            });
        }

        if (application.documents.includes(documentId)) {
            return res.status(400).json({
                success: false,
                message: 'Ce document est déjà associé à la candidature'
            });
        }

        application.documents.push(documentId);
        application.updatedBy = req.user?._id;

        document.applicationId = application._id;
        await document.save();
        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Document ajouté à la candidature avec succès',
            data: application
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l’ajout du document',
            error: error.message
        });
    }
};
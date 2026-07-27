// src/controllers/applicationController.js
const Application = require('../models/Application');
const Document = require('../models/Document');
const Offer = require('../models/Offer');
const Notification = require('../models/Notification');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const { APPLICATION_STATUS, ROLES, STAFF_TREATMENT_ROLES } = require('../config/constants');
const { sendApplicationStatusChangedEmail, sendApplicationSubmittedEmail } = require('../services/emailService');
const { assertDepartmentOwnsOffer, departmentOfferIds } = require('../utils/departmentScope');
const logger = require('../utils/logger');

// Bloc de recuperation commun aux deux notifications ci-dessous (etudiant +
// titre de l'offre concernee par la candidature). Auparavant recopie a
// l'identique dans notifyStudentStatusChanged et
// notifyStudentApplicationSubmitted.
async function fetchApplicationParties(application) {
    const [student, offer] = await Promise.all([
        UtilisateurExterne.findById(application.etudiantId).select('email nom prenom'),
        Offer.findById(application.offreId).select('titre'),
    ]);
    return { student, offer };
}

// RG-018 : toute etape cle du workflow de candidature declenche une
// notification (plateforme + email). Non bloquant : un echec d'envoi ne doit
// jamais faire echouer le changement de statut lui-meme.
async function notifyStudentStatusChanged(application, statut) {
    try {
        const { student, offer } = await fetchApplicationParties(application);
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

// BUGFIX (important) : la soumission d'une candidature (Brouillon ->
// Soumise) ne declenchait AUCUNE notification, contrairement a tous les
// changements de statut ulterieurs (voir notifyStudentStatusChanged
// ci-dessus, appelee par changeApplicationStatus). RG-018/RG-022 attendent
// une notification a chaque etape cle du workflow, et la soumission en est
// une - c'est aussi la seule confirmation que l'etudiant recoit que son
// dossier a bien ete pris en compte. sendApplicationSubmittedEmail existait
// deja dans services/emailService.js mais n'etait appelee nulle part.
async function notifyStudentApplicationSubmitted(application) {
    try {
        const { student, offer } = await fetchApplicationParties(application);
        if (!student) return;

        await Notification.create({
            type: 'InApp',
            titre: 'Candidature soumise',
            message: `Votre candidature pour "${offer?.titre || 'une offre'}" a ete soumise avec succes.`,
            lien: `/candidatures/${application._id}`,
            userId: student._id,
            userModel: 'UtilisateurExterne',
        });

        await sendApplicationSubmittedEmail({
            to: student.email,
            studentName: `${student.prenom} ${student.nom}`,
            offerTitle: offer?.titre || 'votre offre',
        });
    } catch (err) {
        logger.warn(`[Application] Notification de soumission non envoyee: ${err.message}`);
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

// IDOR (critique) : un etudiant ne peut agir que sur SA propre candidature ;
// le personnel interne n'est pas restreint par cette verification (les
// controles de role specifiques a chaque action, eux, restent separes).
// `etudiantIdField` peut etre un ObjectId brut ou un document populate.
const isOwnerOrStaff = (req, etudiantIdField) => {
    if (req.user?.role !== ROLES.ETUDIANT) return true;
    const ownerId = etudiantIdField?._id ? etudiantIdField._id.toString() : etudiantIdField?.toString();
    return ownerId === req.user.id;
};

exports.createApplication = async (req, res) => {
    try {
        // IDOR (critique) : seul un etudiant peut postuler, et uniquement en
        // son propre nom. On ignore volontairement tout etudiantId fourni
        // dans le body : sans ce controle, n'importe quel utilisateur
        // authentifie pouvait creer une candidature au nom d'un autre
        // etudiant en fournissant son id dans la requete.
        if (req.user?.role !== ROLES.ETUDIANT) {
            return res.status(403).json({
                success: false,
                message: 'Seul un etudiant peut creer une candidature.'
            });
        }

        const etudiantId = req.user.id;
        const { offreId, commentaire, documents } = req.body;

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

        // IDOR (critique) : empeche d'attacher a sa candidature un document
        // qui appartient a un autre candidat.
        let safeDocuments = [];
        if (documents && documents.length > 0) {
            const foundDocuments = await Document.find({ _id: { $in: documents } }).select('candidatId');
            const allOwnedByCaller =
                foundDocuments.length === documents.length &&
                foundDocuments.every((doc) => doc.candidatId.toString() === etudiantId);

            if (!allOwnedByCaller) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez associer que vos propres documents a votre candidature'
                });
            }
            safeDocuments = documents;
        }

        const application = await Application.create({
            etudiantId,
            offreId,
            commentaire,
            documents: safeDocuments,
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

        // IDOR (critique) : un etudiant ne doit jamais voir les candidatures
        // d'un autre etudiant, quel que soit le contenu de la query string.
        if (req.user?.role === ROLES.ETUDIANT) {
            filter.etudiantId = req.user.id;
        } else if (etudiantId) {
            filter.etudiantId = etudiantId;
        }

        // BUGFIX (important - controle d'acces) : un utilisateur DEPARTEMENT
        // voyait jusqu'ici les candidatures de TOUTES les offres, y compris
        // celles d'autres departements. Meme classe de probleme que l'IDOR
        // etudiant ci-dessus, cote personnel interne cette fois.
        if (offreId) {
            await assertDepartmentOwnsOffer(req, offreId);
            filter.offreId = offreId;
        } else {
            const restrictedOfferIds = await departmentOfferIds(req);
            if (restrictedOfferIds !== null) {
                filter.offreId = { $in: restrictedOfferIds };
            }
        }

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
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Erreur lors de la récupération des candidatures' : error.message,
            error: statusCode === 500 ? error.message : undefined
        });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('etudiantId', 'nom prenom email cin telephone')
            .populate('offreId', 'titre description typeStage statut dateDebut dateFin dateLimiteCandidature departementId')
            .populate('traiteurId', 'nom prenom email')
            .populate('documents')
            .populate('historique.auteurId', 'nom prenom email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        // IDOR (critique) : un etudiant ne peut consulter que sa propre candidature.
        if (!isOwnerOrStaff(req, application.etudiantId)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
            });
        }

        // BUGFIX (important - controle d'acces) : un utilisateur DEPARTEMENT
        // pouvait consulter la candidature d'une offre hors de son propre
        // departement.
        await assertDepartmentOwnsOffer(req, application.offreId?._id || application.offreId);

        return res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Erreur lors de la récupération de la candidature' : error.message,
            error: statusCode === 500 ? error.message : undefined
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

        // IDOR (critique) : seul le proprietaire (etudiant) ou un
        // administrateur peut modifier une candidature en brouillon.
        if (!isOwnerOrStaff(req, application.etudiantId) && req.user?.role !== ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
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

        // IDOR (critique) : seul le proprietaire peut soumettre sa propre candidature.
        if (!isOwnerOrStaff(req, application.etudiantId)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
            });
        }

        if (application.statut !== APPLICATION_STATUS.BROUILLON) {
            return res.status(400).json({
                success: false,
                message: 'Seule une candidature en brouillon peut être soumise'
            });
        }

        // RG-016 : le CV est un document obligatoire pour toute candidature.
        const documents = await Document.find({ _id: { $in: application.documents } }).select('type');
        const hasCv = documents.some((doc) => doc.type === 'CV');
        if (!hasCv) {
            return res.status(400).json({
                success: false,
                message: 'Un CV est obligatoire avant de soumettre la candidature (RG-016).'
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

        // BUGFIX (important) : notification manquante a la soumission -
        // voir notifyStudentApplicationSubmitted plus haut dans ce fichier.
        await notifyStudentApplicationSubmitted(application);

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
        // Critique : la decision (analyse, entretien, acceptation, refus)
        // releve du RH / departement, jamais de l'etudiant lui-meme. Avant ce
        // correctif, n'importe quel etudiant authentifie pouvait appeler
        // cette route et faire passer sa propre candidature a "Acceptee".
        if (!STAFF_TREATMENT_ROLES.includes(req.user?.role)) {
            return res.status(403).json({
                success: false,
                message: "Seuls le RH, le departement ou un administrateur peuvent modifier le statut d'une candidature"
            });
        }

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

        // BUGFIX (important - controle d'acces) : un utilisateur DEPARTEMENT
        // pouvait changer le statut d'une candidature liee a une offre d'un
        // AUTRE departement (ex: accepter/refuser un candidat qui n'a jamais
        // postule chez lui). RH et Admin restent sans restriction.
        try {
            await assertDepartmentOwnsOffer(req, application.offreId);
        } catch (scopeError) {
            const statusCode = scopeError.statusCode || 403;
            return res.status(statusCode).json({ success: false, message: scopeError.message });
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
            .select('historique etudiantId offreId');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        // IDOR (critique) : un etudiant ne peut consulter que l'historique de
        // sa propre candidature.
        if (!isOwnerOrStaff(req, application.etudiantId)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
            });
        }

        try {
            await assertDepartmentOwnsOffer(req, application.offreId);
        } catch (scopeError) {
            const statusCode = scopeError.statusCode || 403;
            return res.status(statusCode).json({ success: false, message: scopeError.message });
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

        // IDOR (critique) : un etudiant ne peut retirer que sa propre candidature.
        if (!isOwnerOrStaff(req, application.etudiantId) && req.user?.role !== ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
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

        // IDOR (critique) : un etudiant ne peut ajouter un document qu'a sa
        // propre candidature.
        if (!isOwnerOrStaff(req, application.etudiantId)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
            });
        }

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
            });
        }

        // IDOR (critique) : le document ajoute doit appartenir au meme
        // candidat que la candidature, sinon un etudiant pourrait rattacher
        // le CV/document d'un autre candidat a son propre dossier.
        if (document.candidatId.toString() !== application.etudiantId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Ce document n'appartient pas au candidat de cette candidature"
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
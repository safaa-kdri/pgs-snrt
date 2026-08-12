// src/controllers/applicationController.js
// ✅ CORRECTION : Ajout de la transition EnAnalyse -> Acceptee + vérification du rôle
// ✅ AJOUT : Vérification des conflits de stage en cours
// ✅ AJOUT : Workflow de candidature en 3 étapes (saveEtape1, saveEtape2, submitWorkflow, getWorkflowState)
// ✅ AJOUT : getDepartmentApplications pour le département
// ✅ CORRECTION : Renommer engagementAccepte en ficheAccepte pour l'étape 2

const Application = require('../models/Application');
const Document = require('../models/Document');
const Offer = require('../models/Offer');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const { APPLICATION_STATUS, ROLES, STAFF_TREATMENT_ROLES } = require('../config/constants');
const { sendApplicationStatusChangedEmail, sendApplicationSubmittedEmail } = require('../services/emailService');
const { assertDepartmentOwnsOffer, departmentOfferIds } = require('../utils/departmentScope');
const logger = require('../utils/logger');


async function fetchApplicationParties(application) {
    const [student, offer] = await Promise.all([
        UtilisateurExterne.findById(application.etudiantId).select('email nom prenom'),
        Offer.findById(application.offreId).select('titre'),
    ]);
    return { student, offer };
}


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


const STATUTS = Object.values(APPLICATION_STATUS);

// ✅ CORRECTION : Ajouter la transition EnAnalyse -> Acceptee
const TRANSITIONS_AUTORISEES = {
    [APPLICATION_STATUS.BROUILLON]: [APPLICATION_STATUS.SOUMISE],
    [APPLICATION_STATUS.SOUMISE]: [APPLICATION_STATUS.EN_ANALYSE, APPLICATION_STATUS.REFUSEE],
    [APPLICATION_STATUS.EN_ANALYSE]: [
        APPLICATION_STATUS.ENTRETIEN,
        APPLICATION_STATUS.ACCEPTEE,  // ✅ AJOUTÉ
        APPLICATION_STATUS.REFUSEE,
    ],
    [APPLICATION_STATUS.ENTRETIEN]: [APPLICATION_STATUS.ACCEPTEE, APPLICATION_STATUS.REFUSEE],
    [APPLICATION_STATUS.ACCEPTEE]: [],
    [APPLICATION_STATUS.REFUSEE]: [],
};

const canChangeStatus = (ancienStatut, nouveauStatut) => {
    return TRANSITIONS_AUTORISEES[ancienStatut]?.includes(nouveauStatut);
};


const isOwnerOrStaff = (req, etudiantIdField) => {
    if (req.user?.role !== ROLES.ETUDIANT) return true;
    const ownerId = etudiantIdField?._id ? etudiantIdField._id.toString() : etudiantIdField?.toString();
    return ownerId === req.user.id;
};

/**
 * ✅ Vérifier si un étudiant a un stage en cours pendant une période donnée
 */
const checkStudentAvailability = async (etudiantId, dateDebut, dateFin) => {
    // Statuts considérés comme "stage en cours"
    const activeStatuses = [
        'EnCours', 
        'EngagementEnvoye', 
        'EngagementRecu', 
        'EnAttenteValidationDirecteur', 
        'ValideParDirecteur'
    ];

    const currentInternship = await Internship.findOne({
        etudiantId: etudiantId,
        statut: { $in: activeStatuses }
    });

    if (!currentInternship) {
        return { available: true, currentInternship: null };
    }

    // Vérifier si les périodes se chevauchent
    const newStart = new Date(dateDebut);
    const newEnd = new Date(dateFin);
    const currentStart = new Date(currentInternship.dateDebut);
    const currentEnd = new Date(currentInternship.dateFin);

    const hasOverlap = (newStart <= currentEnd && newEnd >= currentStart);

    return {
        available: !hasOverlap,
        currentInternship: currentInternship,
        hasOverlap: hasOverlap,
        currentPeriod: {
            dateDebut: currentInternship.dateDebut,
            dateFin: currentInternship.dateFin,
            sujetTitre: currentInternship.sujetTitre
        }
    };
};

exports.createApplication = async (req, res) => {
    try {
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

        // ✅ VÉRIFICATION : L'étudiant a-t-il un stage en cours qui chevauche la période ?
        if (offer.dateDebut && offer.dateFin) {
            const availability = await checkStudentAvailability(
                etudiantId,
                offer.dateDebut,
                offer.dateFin
            );

            if (!availability.available) {
                const stage = availability.currentInternship;
                return res.status(400).json({
                    success: false,
                    message: `Vous ne pouvez pas postuler à cette offre car vous avez déjà un stage en cours du ${new Date(stage.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(stage.dateFin).toLocaleDateString('fr-FR')} : "${stage.sujetTitre}".`,
                    data: {
                        currentInternship: availability.currentPeriod
                    }
                });
            }
        }

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
            createdBy: req.user?._id,
            workflowEtape: 1,
            workflowComplete: false
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

        if (req.user?.role === ROLES.ETUDIANT) {
            filter.etudiantId = req.user.id;
        } else if (etudiantId) {
            filter.etudiantId = etudiantId;
        }

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

        if (!isOwnerOrStaff(req, application.etudiantId)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas acces a cette candidature"
            });
        }

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
        const application = await Application.findById(req.params.id)
            .populate('offreId', 'dateDebut dateFin titre');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

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

        // ✅ VÉRIFICATION : L'étudiant a-t-il un stage en cours qui chevauche la période ?
        if (application.offreId && application.offreId.dateDebut && application.offreId.dateFin) {
            const availability = await checkStudentAvailability(
                application.etudiantId,
                application.offreId.dateDebut,
                application.offreId.dateFin
            );

            if (!availability.available) {
                const stage = availability.currentInternship;
                return res.status(400).json({
                    success: false,
                    message: `Vous ne pouvez pas soumettre cette candidature car vous avez déjà un stage en cours du ${new Date(stage.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(stage.dateFin).toLocaleDateString('fr-FR')} : "${stage.sujetTitre}".`,
                    data: {
                        currentInternship: availability.currentPeriod,
                        requestedPeriod: {
                            dateDebut: application.offreId.dateDebut,
                            dateFin: application.offreId.dateFin
                        }
                    }
                });
            }
        }

        // ✅ Vérifier que la candidature a des documents
        if (!application.documents || application.documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vous devez déposer au moins un document avant de soumettre votre candidature.'
            });
        }

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
        application.workflowComplete = true;
        application.workflowEtape = 3;

        application.historique.push({
            ancienStatut,
            nouveauStatut: APPLICATION_STATUS.SOUMISE,
            commentaire: 'Candidature soumise par l’étudiant',
            auteurId: req.user?._id
        });

        await application.save();

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
        // ✅ CORRECTION : Vérifier explicitement le rôle
        const userRole = req.user?.role;
        const allowedRoles = ['RH', 'Departement', 'Administrateur'];
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas les droits necessaires pour cette action. Rôle requis: RH, Departement ou Administrateur."
            });
        }

        const { statut, commentaire } = req.body;

        if (!STATUTS.includes(statut)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        const application = await Application.findById(req.params.id)
            .populate('offreId', 'dateDebut dateFin titre');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

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

        // ✅ VÉRIFICATION : Si on accepte, vérifier qu'il n'y a pas de conflit
        if (statut === APPLICATION_STATUS.ACCEPTEE && application.offreId) {
            const availability = await checkStudentAvailability(
                application.etudiantId,
                application.offreId.dateDebut,
                application.offreId.dateFin
            );

            if (!availability.available) {
                const stage = availability.currentInternship;
                return res.status(400).json({
                    success: false,
                    message: `Impossible d'accepter cette candidature : l'étudiant a déjà un stage en cours du ${new Date(stage.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(stage.dateFin).toLocaleDateString('fr-FR')} : "${stage.sujetTitre}".`,
                    data: {
                        currentInternship: availability.currentPeriod
                    }
                });
            }
        }

        application.statut = statut;
        application.commentaire = commentaire || application.commentaire;
        application.traiteurId = req.user?._id;
        application.updatedBy = req.user?._id;

        if (!application.historique) application.historique = [];
        application.historique.push({
            ancienStatut,
            nouveauStatut: statut,
            commentaire,
            auteurId: req.user?._id,
            date: new Date()
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
            message: 'Erreur lors de l\'ajout du document à la candidature',
            error: error.message
        });
    }
};

// ============================================
// ✅ RÉCUPÉRER LES CANDIDATURES DU DÉPARTEMENT
// ============================================

exports.getDepartmentApplications = async (req, res) => {
    try {
        const { departementId } = req.user;

        if (!departementId) {
            return res.status(403).json({
                success: false,
                message: "Votre compte n'est rattaché à aucun département."
            });
        }

        // Récupérer toutes les offres du département
        const offers = await Offer.find({ departementId }).select('_id');
        const offerIds = offers.map(o => o._id);

        if (offerIds.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }

        const applications = await Application.find({
            offreId: { $in: offerIds }
        })
            .populate('etudiantId', 'nom prenom email cin')
            .populate('offreId', 'titre typeStage')
            .populate('documents')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });

    } catch (error) {
        console.error('❌ Erreur getDepartmentApplications:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des candidatures',
            error: error.message
        });
    }
};

// ============================================
// ✅ WORKFLOW DE CANDIDATURE EN 3 ÉTAPES
// ============================================

/**
 * ÉTAPE 1 - Sauvegarder les informations universitaires
 * POST /api/v1/applications/:id/workflow/etape1
 */
exports.saveEtape1 = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            universite,
            etablissement,
            filiere,
            niveau,
            anneeUniversitaire,
            typeStageDemande,
            dureeStage,
            dateDebutPrevue,
            dateFinPrevue
        } = req.body;

        // Vérifier que l'application existe
        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        // Vérifier que l'étudiant est le propriétaire
        if (application.etudiantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à modifier cette candidature'
            });
        }

        // Vérifier que la candidature est en brouillon ou en cours
        if (application.statut === APPLICATION_STATUS.SOUMISE) {
            return res.status(400).json({
                success: false,
                message: 'Cette candidature a déjà été soumise, vous ne pouvez plus la modifier'
            });
        }

        // Mettre à jour les champs
        application.universite = universite || application.universite || '';
        application.etablissement = etablissement || application.etablissement || '';
        application.filiere = filiere || application.filiere || '';
        application.niveau = niveau || application.niveau || '';
        application.anneeUniversitaire = anneeUniversitaire || application.anneeUniversitaire || '';
        application.typeStageDemande = typeStageDemande || application.typeStageDemande || '';
        application.dureeStage = dureeStage || application.dureeStage || '';
        application.dateDebutPrevue = dateDebutPrevue || application.dateDebutPrevue || null;
        application.dateFinPrevue = dateFinPrevue || application.dateFinPrevue || null;
        application.workflowEtape = 1;
        application.updatedBy = req.user?._id;

        await application.save();

        logger.info(`✅ Étape 1 sauvegardée pour l'application ${id} par l'étudiant ${req.user._id}`);

        res.status(200).json({
            success: true,
            message: 'Informations universitaires sauvegardées avec succès',
            data: {
                id: application._id,
                workflowEtape: application.workflowEtape,
                universite: application.universite,
                etablissement: application.etablissement,
                filiere: application.filiere,
                niveau: application.niveau,
                anneeUniversitaire: application.anneeUniversitaire,
                typeStageDemande: application.typeStageDemande,
                dureeStage: application.dureeStage,
                dateDebutPrevue: application.dateDebutPrevue,
                dateFinPrevue: application.dateFinPrevue
            }
        });

    } catch (error) {
        console.error('❌ Erreur saveEtape1:', error);
        logger.error(`Erreur saveEtape1: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la sauvegarde des informations universitaires',
            error: error.message
        });
    }
};

/**
 * ✅ ÉTAPE 2 - Sauvegarder la confirmation de téléchargement de la fiche de demande
 * POST /api/v1/applications/:id/workflow/etape2
 */
exports.saveEtape2 = async (req, res) => {
    try {
        const { id } = req.params;
        const { ficheAccepte } = req.body;

        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        // Vérifier que l'étudiant est le propriétaire
        if (application.etudiantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à modifier cette candidature'
            });
        }

        // Vérifier que la candidature est en brouillon ou en cours
        if (application.statut === APPLICATION_STATUS.SOUMISE) {
            return res.status(400).json({
                success: false,
                message: 'Cette candidature a déjà été soumise'
            });
        }

        // Vérifier que l'étape 1 est complétée
        if (!application.universite && !application.filiere) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez d\'abord renseigner vos informations universitaires (Étape 1)'
            });
        }

        // ✅ CORRECTION : Sauvegarder ficheAccepte au lieu de engagementAccepte
        application.ficheAccepte = ficheAccepte === true;
        if (ficheAccepte) {
            application.ficheDateAccepte = new Date();
        }
        application.workflowEtape = 2;
        application.updatedBy = req.user?._id;

        await application.save();

        logger.info(`✅ Étape 2 sauvegardée pour l'application ${id} par l'étudiant ${req.user._id}`);

        res.status(200).json({
            success: true,
            message: ficheAccepte ? 'Fiche de demande de stage confirmée' : 'Confirmation annulée',
            data: {
                id: application._id,
                workflowEtape: application.workflowEtape,
                ficheAccepte: application.ficheAccepte,
                ficheDateAccepte: application.ficheDateAccepte
            }
        });

    } catch (error) {
        console.error('❌ Erreur saveEtape2:', error);
        logger.error(`Erreur saveEtape2: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la sauvegarde de la confirmation',
            error: error.message
        });
    }
};

/**
 * ✅ ÉTAPE 3 - Soumettre la candidature complète
 * POST /api/v1/applications/:id/workflow/submit
 */
exports.submitWorkflow = async (req, res) => {
    try {
        const { id } = req.params;
        const { documents } = req.body;

        const application = await Application.findById(id)
            .populate('offreId', 'titre dateDebut dateFin');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        // Vérifier que l'étudiant est le propriétaire
        if (application.etudiantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à modifier cette candidature'
            });
        }

        // Vérifier que la candidature est en brouillon
        if (application.statut === APPLICATION_STATUS.SOUMISE) {
            return res.status(400).json({
                success: false,
                message: 'Cette candidature a déjà été soumise'
            });
        }

        // Vérifier que l'étape 1 est complétée
        if (!application.universite && !application.filiere) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez d\'abord renseigner vos informations universitaires (Étape 1)'
            });
        }

        // ✅ CORRECTION : Vérifier que la fiche a été acceptée (étape 2)
        if (!application.ficheAccepte) {
            return res.status(400).json({
                success: false,
                message: 'Vous devez confirmer que vous avez téléchargé la fiche de demande de stage avant de soumettre votre candidature (Étape 2)'
            });
        }

        // Vérifier qu'il y a des documents
        if (!documents || documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vous devez déposer au moins un document avant de soumettre votre candidature'
            });
        }

        // ✅ VÉRIFICATION : L'étudiant a-t-il un stage en cours qui chevauche la période ?
        if (application.offreId && application.offreId.dateDebut && application.offreId.dateFin) {
            const availability = await checkStudentAvailability(
                application.etudiantId,
                application.offreId.dateDebut,
                application.offreId.dateFin
            );

            if (!availability.available) {
                const stage = availability.currentInternship;
                return res.status(400).json({
                    success: false,
                    message: `Vous ne pouvez pas soumettre cette candidature car vous avez déjà un stage en cours du ${new Date(stage.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(stage.dateFin).toLocaleDateString('fr-FR')} : "${stage.sujetTitre}".`,
                    data: {
                        currentInternship: availability.currentPeriod,
                        requestedPeriod: {
                            dateDebut: application.offreId.dateDebut,
                            dateFin: application.offreId.dateFin
                        }
                    }
                });
            }
        }

        // Ajouter les documents à la candidature
        if (documents && documents.length > 0) {
            const foundDocuments = await Document.find({ _id: { $in: documents } }).select('candidatId');
            const allOwnedByCaller =
                foundDocuments.length === documents.length &&
                foundDocuments.every((doc) => doc.candidatId.toString() === req.user._id.toString());

            if (!allOwnedByCaller) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez associer que vos propres documents à votre candidature'
                });
            }
            
            // Ajouter les documents s'ils ne sont pas déjà présents
            const existingDocIds = application.documents.map(d => d.toString());
            const newDocs = documents.filter(d => !existingDocIds.includes(d));
            if (newDocs.length > 0) {
                application.documents = [...application.documents, ...newDocs];
                
                // Mettre à jour les documents avec l'applicationId
                await Document.updateMany(
                    { _id: { $in: newDocs } },
                    { applicationId: application._id }
                );
            }
        }

        // Vérifier qu'il y a un CV
        const docs = await Document.find({ _id: { $in: application.documents } }).select('type');
        const hasCv = docs.some((doc) => doc.type === 'CV');
        if (!hasCv) {
            return res.status(400).json({
                success: false,
                message: 'Un CV est obligatoire avant de soumettre la candidature'
            });
        }

        // Changer le statut
        const ancienStatut = application.statut;
        application.statut = APPLICATION_STATUS.SOUMISE;
        application.dateSoumission = new Date();
        application.workflowEtape = 3;
        application.workflowComplete = true;
        application.updatedBy = req.user?._id;

        // Ajouter à l'historique
        if (!application.historique) application.historique = [];
        application.historique.push({
            ancienStatut,
            nouveauStatut: APPLICATION_STATUS.SOUMISE,
            commentaire: 'Candidature soumise via le workflow en 3 étapes',
            auteurId: req.user?._id,
            date: new Date()
        });

        await application.save();

        // Notification à l'étudiant
        await notifyStudentApplicationSubmitted(application);

        logger.info(`✅ Candidature soumise avec succès pour l'application ${id} par l'étudiant ${req.user._id}`);

        res.status(200).json({
            success: true,
            message: 'Votre candidature a été déposée avec succès !',
            data: {
                id: application._id,
                statut: application.statut,
                workflowComplete: application.workflowComplete,
                documentsCount: application.documents.length,
                dateSoumission: application.dateSoumission
            }
        });

    } catch (error) {
        console.error('❌ Erreur submitWorkflow:', error);
        logger.error(`Erreur submitWorkflow: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la soumission de la candidature',
            error: error.message
        });
    }
};

/**
 * Récupérer l'état du workflow
 * GET /api/v1/applications/:id/workflow/state
 */
exports.getWorkflowState = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        // Vérifier que l'étudiant est le propriétaire ou staff
        if (!isOwnerOrStaff(req, application.etudiantId) && req.user?.role !== ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'avez pas accès à cette candidature'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: application._id,
                workflowEtape: application.workflowEtape || 1,
                workflowComplete: application.workflowComplete || false,
                statut: application.statut,
                // Étape 1
                universite: application.universite || '',
                etablissement: application.etablissement || '',
                filiere: application.filiere || '',
                niveau: application.niveau || '',
                anneeUniversitaire: application.anneeUniversitaire || '',
                typeStageDemande: application.typeStageDemande || '',
                dureeStage: application.dureeStage || '',
                dateDebutPrevue: application.dateDebutPrevue || null,
                dateFinPrevue: application.dateFinPrevue || null,
                // ✅ Étape 2 - CORRECTION : ficheAccepte au lieu de engagementAccepte
                ficheAccepte: application.ficheAccepte || false,
                ficheDateAccepte: application.ficheDateAccepte || null,
                // Documents
                documents: application.documents || []
            }
        });

    } catch (error) {
        console.error('❌ Erreur getWorkflowState:', error);
        logger.error(`Erreur getWorkflowState: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'état du workflow',
            error: error.message
        });
    }
};
// src/controllers/applicationController.js
// CORRECTION : Ajout de la transition EnAnalyse -> Acceptee + vérification du rôle
// AJOUT : Vérification des conflits de stage en cours
// AJOUT : getDepartmentApplications pour le département
// MODIFICATION : createApplication - Création directe avec statut "Soumise"
// MODIFICATION : createApplication - Accepter les données des étapes 1 et 2
// SUPPRESSION : Fonctions de workflow intermédiaires (saveEtape1, saveEtape2, submitWorkflow)
// CONSERVÉ : getWorkflowState pour la consultation des candidatures existantes
// AJOUT : Envoi automatique de l'engagement quand le statut passe à Acceptee
// AJOUT : Imports manquants (pdfService, emailService)
// AJOUT : refuseConflictingApplications - Refus automatique des candidatures conflictuelles
// AJOUT : Restriction RH - Le RH ne peut pas accepter directement
// AJOUT : Transitions d'engagement - EngagementRecu -> EngagementValide/Rejete, EngagementValide -> DemandeEnvoyee
// AJOUT : Vérification statut identique dans changeApplicationStatus
// CORRECTION : Récupération de etudiantId dans sendEngagementAutomatically
// CORRECTION : Ajout de logs pour les champs dans createApplication
// CORRECTION : Vérification si le stage existe déjà dans sendEngagementAutomatically pour éviter les doublons

const Application = require('../models/Application');
const Document = require('../models/Document');
const Offer = require('../models/Offer');
const Internship = require('../models/Internship');
const Notification = require('../models/Notification');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const { APPLICATION_STATUS, ROLES, STAFF_TREATMENT_ROLES } = require('../config/constants');
const { sendApplicationStatusChangedEmail, sendApplicationSubmittedEmail } = require('../services/emailService');
const { assertDepartmentOwnsOffer, departmentOfferIds } = require('../utils/departmentScope');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');
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

// CORRECTION : Ajouter la transition EnAnalyse -> Acceptee
// AJOUT : Transitions d'engagement
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
    // AJOUT : Transitions d'engagement
    'EngagementRecu': ['EngagementValide', 'EngagementRejete'],
    'EngagementValide': ['DemandeEnvoyee'],
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
 * Verifier si un etudiant a un stage en cours pendant une periode donnee
 */
const checkStudentAvailability = async (etudiantId, dateDebut, dateFin) => {
    // Statuts consideres comme "stage en cours"
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

    // Verifier si les periodes se chevauchent
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

// ============================================
// AJOUT : Fonction pour refuser automatiquement les candidatures conflictuelles
// ============================================

/**
 * Refuser automatiquement les candidatures conflictuelles
 */
const refuseConflictingApplications = async (acceptedApplication) => {
    try {
        const etudiantId = acceptedApplication.etudiantId._id;
        const offreId = acceptedApplication.offreId._id;
        const dateDebut = acceptedApplication.offreId.dateDebut;
        const dateFin = acceptedApplication.offreId.dateFin;

        // Trouver toutes les autres candidatures de l'etudiant (qui ne sont pas refusees)
        const otherApplications = await Application.find({
            etudiantId: etudiantId,
            _id: { $ne: acceptedApplication._id },
            statut: { $nin: ['Refusee', 'Acceptee'] }
        }).populate('offreId', 'dateDebut dateFin');

        const applicationsToRefuse = [];

        for (const app of otherApplications) {
            if (app.offreId && app.offreId.dateDebut && app.offreId.dateFin) {
                // Verifier le chevauchement de periode
                const hasOverlap = (
                    new Date(dateDebut) <= new Date(app.offreId.dateFin) &&
                    new Date(dateFin) >= new Date(app.offreId.dateDebut)
                );

                if (hasOverlap) {
                    applicationsToRefuse.push(app);
                }
            }
        }

        // Refuser les candidatures conflictuelles
        for (const app of applicationsToRefuse) {
            const ancienStatut = app.statut;
            app.statut = APPLICATION_STATUS.REFUSEE;
            app.commentaire = `Refus automatique : Etudiant accepte a un autre stage pour la meme periode (${new Date(dateDebut).toLocaleDateString('fr-FR')} - ${new Date(dateFin).toLocaleDateString('fr-FR')})`;
            
            if (!app.historique) app.historique = [];
            app.historique.push({
                ancienStatut,
                nouveauStatut: APPLICATION_STATUS.REFUSEE,
                commentaire: app.commentaire,
                date: new Date()
            });
            
            await app.save();
            
            // Notifier l'etudiant
            await notifyStudentStatusChanged(app, APPLICATION_STATUS.REFUSEE);
            
            console.log(`[refuseConflictingApplications] Candidature ${app._id} refusee automatiquement`);
        }

        return applicationsToRefuse.length;
    } catch (error) {
        console.error('Erreur refuseConflictingApplications:', error);
        throw error;
    }
};

// ============================================
// FONCTION : Envoi automatique de l'engagement
// CORRECTION : Vérification si le stage existe déjà pour éviter les doublons
// ============================================
const sendEngagementAutomatically = async (application) => {
    try {
        // 1. Rechercher le stage existant
        let internship = await Internship.findOne({ applicationId: application._id });
        
        // Recuperer les IDs correctement
        const etudiantId = application.etudiantId?._id || application.etudiantId;
        const offreId = application.offreId?._id || application.offreId;
        
        // Recuperer l'etudiant complet
        const etudiant = await UtilisateurExterne.findById(etudiantId);
        if (!etudiant) {
            console.error('[sendEngagementAutomatically] Etudiant non trouve');
            throw new Error('Etudiant non trouve');
        }
        
        // Si le stage existe deja, ne pas le recréer
        if (internship) {
            console.log(`[sendEngagementAutomatically] Stage deja existant: ${internship._id}`);
        } else {
            // Creer le stage seulement s'il n'existe pas
            internship = await Internship.create({
                etudiantId: etudiantId,
                offreId: offreId,
                applicationId: application._id,
                dateDebut: application.offreId?.dateDebut || new Date(),
                dateFin: application.offreId?.dateFin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                statut: 'EnCours',
                encadrantId: null
            });
            console.log(`[sendEngagementAutomatically] Stage cree: ${internship._id}`);
        }

        // 2. Generer l'engagement
        const internshipData = {
            _id: internship._id,
            etudiantId: etudiant,
            offreId: application.offreId,
            dateDebut: internship.dateDebut,
            dateFin: internship.dateFin,
            etudiantNom: `${etudiant.prenom || ''} ${etudiant.nom || ''}`.trim()
        };

        const pdfPath = await pdfService.generateEngagementConfidentialite(internshipData);
        console.log(`[sendEngagementAutomatically] PDF genere: ${pdfPath}`);

        // 3. Envoyer l'email
        await emailService.sendEngagementConfidentialiteEmail({
            to: etudiant.email,
            studentName: `${etudiant.prenom} ${etudiant.nom}`,
            pdfPath: pdfPath,
        });
        console.log(`[sendEngagementAutomatically] Email envoye a ${etudiant.email}`);

        // 4. Mettre a jour le statut du stage
        internship.statut = 'EngagementEnvoye';
        await internship.save();

        // 5. Ajouter a l'historique de l'application
        if (!application.historique) application.historique = [];
        application.historique.push({
            date: new Date(),
            ancienStatut: application.statut,
            nouveauStatut: application.statut,
            commentaire: 'Engagement de confidentialite envoye automatiquement a l\'etudiant',
            auteurId: application.traiteurId || application.updatedBy || null
        });
        await application.save();

        // 6. Notification a l'etudiant
        await Notification.create({
            type: 'InApp',
            titre: 'Engagement de confidentialite',
            message: `Un engagement de confidentialite vous a ete envoye par email pour votre stage "${application.offreId?.titre || ''}". Veuillez le signer et le deposer.`,
            lien: `/dashboard/application/${application._id}`,
            userId: etudiantId,
            userModel: 'UtilisateurExterne',
        });

        return true;

    } catch (error) {
        console.error('[sendEngagementAutomatically] Erreur:', error);
        throw error;
    }
};

// ============================================
// MODIFICATION : createApplication - Creation directe avec statut "Soumise"
// SUPPRESSION AUTOMATIQUE DES BROUILLONS EXISTANTS
// AJOUT : Logs pour verifier les champs
// ============================================
exports.createApplication = async (req, res) => {
    try {
        console.log('[createApplication] Debut...');
        console.log('[createApplication] req.user:', req.user);
        console.log('[createApplication] req.body:', req.body);

        if (req.user?.role !== ROLES.ETUDIANT) {
            return res.status(403).json({
                success: false,
                message: 'Seul un etudiant peut creer une candidature.'
            });
        }

        const etudiantId = req.user.id;
        const { 
            offreId, 
            commentaire, 
            documents,
            universite,
            filiere,
            niveau,
            annee,
            ficheAccepte
        } = req.body;

        // AJOUT : Logs pour verifier les champs
        console.log('[createApplication] Champs universite:', {
            universite: universite,
            filiere: filiere,
            niveau: niveau,
            annee: annee,
            ficheAccepte: ficheAccepte
        });

        if (!offreId) {
            return res.status(400).json({
                success: false,
                message: 'L\'ID de l\'offre est obligatoire'
            });
        }

        const offer = await Offer.findById(offreId);

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offre non trouvee'
            });
        }

        // 1. Verifier s'il existe deja une candidature SOUMISE
        const existingSubmitted = await Application.findOne({
            etudiantId,
            offreId,
            statut: APPLICATION_STATUS.SOUMISE
        });

        if (existingSubmitted) {
            return res.status(400).json({
                success: false,
                message: 'Vous avez deja soumis une candidature pour cette offre'
            });
        }

        // 2. Verifier s'il existe une candidature en cours (Brouillon ou EnCoursCreation) et la supprimer automatiquement
        const existingDraft = await Application.findOne({
            etudiantId,
            offreId,
            statut: { $in: ['Brouillon', 'EnCoursCreation'] }
        });

        if (existingDraft) {
            console.log(`Suppression automatique de l'ancienne candidature en cours: ${existingDraft._id}`);
            await Application.deleteOne({ _id: existingDraft._id });
            
            // Supprimer egalement les documents associes a cette candidature
            await Document.updateMany(
                { applicationId: existingDraft._id },
                { applicationId: null }
            );
        }

        // 3. VERIFICATION : L'etudiant a-t-il un stage en cours ?
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
                    message: `Vous ne pouvez pas postuler a cette offre car vous avez deja un stage en cours du ${new Date(stage.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(stage.dateFin).toLocaleDateString('fr-FR')} : "${stage.sujetTitre}".`
                });
            }
        }

        // 4. Verifier que les documents appartiennent a l'etudiant
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

        // 5. Creer la candidature avec TOUTES les donnees - Statut "Soumise"
        console.log('[createApplication] Donnees avant creation:', {
            universite: universite,
            filiere: filiere,
            niveau: niveau,
            annee: annee,
            ficheAccepte: ficheAccepte
        });

        const application = await Application.create({
            etudiantId,
            offreId,
            commentaire: commentaire || 'Candidature soumise',
            documents: safeDocuments,
            statut: APPLICATION_STATUS.SOUMISE,
            createdBy: req.user?._id,
            workflowEtape: 3,
            workflowComplete: true,
            dateSoumission: new Date(),
            universite: universite || '',
            filiere: filiere || '',
            niveau: niveau || '',
            annee: annee || '',
            ficheAccepte: ficheAccepte || false,
        });

        // 6. Ajouter a l'historique
        if (!application.historique) application.historique = [];
        application.historique.push({
            ancienStatut: null,
            nouveauStatut: APPLICATION_STATUS.SOUMISE,
            commentaire: 'Candidature soumise avec succes',
            auteurId: req.user?._id,
            date: new Date()
        });

        await application.save();

        // 7. Mettre a jour les documents avec l'applicationId
        if (safeDocuments.length > 0) {
            await Document.updateMany(
                { _id: { $in: safeDocuments } },
                { applicationId: application._id }
            );
        }

        // 8. Notification
        await notifyStudentApplicationSubmitted(application);

        console.log(`Candidature creee avec succes: ${application._id}`);

        return res.status(201).json({
            success: true,
            message: 'Candidature soumise avec succes',
            data: application
        });

    } catch (error) {
        console.error('Erreur createApplication:', error);
        console.error('Stack:', error.stack);
        
        // Gestion de l'erreur de duplication
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Vous avez deja soumis une candidature pour cette offre. Une seule candidature par offre est autorisee.'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la creation de la candidature',
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
            message: statusCode === 500 ? 'Erreur lors de la recuperation des candidatures' : error.message,
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
                message: 'Candidature non trouvee'
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
            message: statusCode === 500 ? 'Erreur lors de la recuperation de la candidature' : error.message,
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
                message: 'Candidature non trouvee'
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
                message: 'Seule une candidature en brouillon peut etre modifiee'
            });
        }

        if (commentaire !== undefined) application.commentaire = commentaire;
        if (documents !== undefined) application.documents = documents;

        application.updatedBy = req.user?._id;

        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Candidature modifiee avec succes',
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
                message: 'Candidature non trouvee'
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
                message: 'Seule une candidature en brouillon peut etre soumise'
            });
        }

        // VERIFICATION : L'etudiant a-t-il un stage en cours qui chevauche la periode ?
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
                    message: `Vous ne pouvez pas soumettre cette candidature car vous avez deja un stage en cours du ${new Date(stage.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(stage.dateFin).toLocaleDateString('fr-FR')} : "${stage.sujetTitre}".`,
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

        // Verifier que la candidature a des documents
        if (!application.documents || application.documents.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vous devez deposer au moins un document avant de soumettre votre candidature.'
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
            commentaire: 'Candidature soumise par l\'etudiant',
            auteurId: req.user?._id
        });

        await application.save();

        await notifyStudentApplicationSubmitted(application);

        return res.status(200).json({
            success: true,
            message: 'Candidature soumise avec succes',
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

// ============================================
// MODIFIE : changeApplicationStatus avec gestion des conflits
// AJOUT : Restriction RH - Le RH ne peut pas accepter directement
// AJOUT : Verification statut identique
// ============================================
exports.changeApplicationStatus = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const allowedRoles = ['RH', 'Departement', 'Administrateur'];
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas les droits necessaires pour cette action. Role requis: RH, Departement ou Administrateur."
            });
        }

        const { statut, commentaire } = req.body;

        if (!STATUTS.includes(statut)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide'
            });
        }

        // RESTRICTION : Le RH ne peut PAS accepter directement
        if (userRole === 'RH' && statut === APPLICATION_STATUS.ACCEPTEE) {
            return res.status(403).json({
                success: false,
                message: "Le RH ne peut pas accepter une candidature. Seul le Departement peut le faire."
            });
        }

        const application = await Application.findById(req.params.id)
            .populate('offreId', 'dateDebut dateFin titre nbPostes')
            .populate('etudiantId', 'nom prenom email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvee'
            });
        }

        try {
            await assertDepartmentOwnsOffer(req, application.offreId);
        } catch (scopeError) {
            const statusCode = scopeError.statusCode || 403;
            return res.status(statusCode).json({ success: false, message: scopeError.message });
        }

        const ancienStatut = application.statut;

        // SI LE STATUT EST DEJA LE MEME, ON NE FAIT RIEN
        if (ancienStatut === statut) {
            console.log(`[changeApplicationStatus] Statut deja ${statut}, aucune modification`);
            return res.status(200).json({
                success: true,
                message: `Le statut est deja : ${statut}`,
                data: application
            });
        }

        if (!canChangeStatus(ancienStatut, statut)) {
            return res.status(400).json({
                success: false,
                message: `Transition non autorisee : ${ancienStatut} vers ${statut}`
            });
        }

        // VERIFICATION : Si on accepte, verifier les conflits AVANT de modifier
        if (statut === APPLICATION_STATUS.ACCEPTEE) {
            // 1. Verifier si l'etudiant a deja un stage en cours
            const availability = await checkStudentAvailability(
                application.etudiantId,
                application.offreId.dateDebut,
                application.offreId.dateFin
            );

            if (!availability.available) {
                const stage = availability.currentInternship;
                return res.status(400).json({
                    success: false,
                    message: `Cet etudiant a deja un stage en cours du ${new Date(stage.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(stage.dateFin).toLocaleDateString('fr-FR')} : "${stage.sujetTitre}".`
                });
            }

            // 2. Verifier le nombre de postes disponibles
            const offer = application.offreId;
            if (offer.nbPostes) {
                const acceptedCount = await Application.countDocuments({
                    offreId: offer._id,
                    statut: APPLICATION_STATUS.ACCEPTEE
                });
                
                if (acceptedCount >= offer.nbPostes) {
                    return res.status(400).json({
                        success: false,
                        message: `Tous les postes (${offer.nbPostes}) pour cette offre sont deja pourvus.`
                    });
                }
            }

            // 3. Si tout est OK, on peut accepter
        }

        // Mettre a jour le statut
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

        // Si accepte, refuser automatiquement les autres candidatures conflictuelles
        if (statut === APPLICATION_STATUS.ACCEPTEE) {
            await refuseConflictingApplications(application);
        }

        // Envoi automatique de l'engagement SI le role est "Departement" et statut "Acceptee"
        if (statut === APPLICATION_STATUS.ACCEPTEE && userRole === 'Departement') {
            console.log(`[changeApplicationStatus] Acceptee par Departement - Envoi automatique de l'engagement`);
            try {
                await sendEngagementAutomatically(application);
                console.log(`[changeApplicationStatus] Engagement envoye automatiquement`);
            } catch (engagementError) {
                console.error(`[changeApplicationStatus] Erreur envoi engagement:`, engagementError);
            }
        }

        // Notification a l'etudiant
        await notifyStudentStatusChanged(application, statut);

        return res.status(200).json({
            success: true,
            message: `Statut de candidature modifie avec succes : ${statut}`,
            data: application
        });

    } catch (error) {
        console.error('Erreur changeApplicationStatus:', error);
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
                message: 'Candidature non trouvee'
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
            message: 'Erreur lors de la recuperation de l\'historique',
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
                message: 'Candidature non trouvee'
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
            message: 'Candidature supprimee avec succes'
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
                message: 'Candidature non trouvee'
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
                message: 'Document non trouve'
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
                message: 'Ce document est deja associe a la candidature'
            });
        }

        application.documents.push(documentId);
        application.updatedBy = req.user?._id;

        document.applicationId = application._id;
        await document.save();
        await application.save();

        return res.status(200).json({
            success: true,
            message: 'Document ajoute a la candidature avec succes',
            data: application
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout du document a la candidature',
            error: error.message
        });
    }
};

// ============================================
// RECUPERER LES CANDIDATURES DU DEPARTEMENT
// ============================================

exports.getDepartmentApplications = async (req, res) => {
    try {
        const { departementId } = req.user;

        if (!departementId) {
            return res.status(403).json({
                success: false,
                message: "Votre compte n'est rattache a aucun departement."
            });
        }

        // Recuperer toutes les offres du departement
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
        console.error('Erreur getDepartmentApplications:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation des candidatures',
            error: error.message
        });
    }
};

// ============================================
// CONSERVE : Recuperer l'etat du workflow pour les candidatures existantes
// ============================================

/**
 * Recuperer l'etat du workflow
 * GET /api/v1/applications/:id/workflow/state
 */
exports.getWorkflowState = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvee'
            });
        }

        // Verifier que l'etudiant est le proprietaire ou staff
        if (!isOwnerOrStaff(req, application.etudiantId) && req.user?.role !== ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'avez pas acces a cette candidature'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: application._id,
                workflowEtape: application.workflowEtape || 1,
                workflowComplete: application.workflowComplete || false,
                statut: application.statut,
                // 4 champs
                universite: application.universite || '',
                filiere: application.filiere || '',
                niveau: application.niveau || '',
                annee: application.annee || '',
                // Etape 2
                ficheAccepte: application.ficheAccepte || false,
                ficheDateAccepte: application.ficheDateAccepte || null,
                // Documents
                documents: application.documents || []
            }
        });

    } catch (error) {
        console.error('Erreur getWorkflowState:', error);
        logger.error(`Erreur getWorkflowState: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation de l\'etat du workflow',
            error: error.message
        });
    }
};
// src/controllers/applicationController.js
// ✅ CORRECTION : Ajout de la transition EnAnalyse -> Acceptee + vérification du rôle
// ✅ AJOUT : Vérification des conflits de stage en cours
// ✅ AJOUT : getDepartmentApplications pour le département
// ✅ MODIFICATION : createApplication - Création directe avec statut "Soumise"
// ✅ MODIFICATION : createApplication - Accepter les données des étapes 1 et 2
// ✅ SUPPRESSION : Fonctions de workflow intermédiaires (saveEtape1, saveEtape2, submitWorkflow)
// ✅ CONSERVÉ : getWorkflowState pour la consultation des candidatures existantes
// ✅ AJOUT : Envoi automatique de l'engagement quand le statut passe à Acceptee
// ✅ AJOUT : Imports manquants (pdfService, emailService)

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

// ============================================
// ✅ NOUVELLE FONCTION : Envoi automatique de l'engagement
// ============================================
const sendEngagementAutomatically = async (application) => {
    try {
        // 1. Récupérer ou créer le stage
        let internship = await Internship.findOne({ applicationId: application._id });
        
        if (!internship) {
            // Créer le stage si nécessaire
            internship = await Internship.create({
                etudiantId: application.etudiantId._id,
                offreId: application.offreId._id,
                applicationId: application._id,
                dateDebut: application.offreId.dateDebut || new Date(),
                dateFin: application.offreId.dateFin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                statut: 'EnCours',
                encadrantId: null
            });
            console.log(`✅ [sendEngagementAutomatically] Stage créé: ${internship._id}`);
        }

        // 2. Générer l'engagement
        const internshipData = {
            _id: internship._id,
            etudiantId: application.etudiantId,
            offreId: application.offreId,
            dateDebut: internship.dateDebut,
            dateFin: internship.dateFin,
            etudiantNom: `${application.etudiantId.prenom} ${application.etudiantId.nom}`
        };

        const pdfPath = await pdfService.generateEngagementConfidentialite(internshipData);
        console.log(`✅ [sendEngagementAutomatically] PDF généré: ${pdfPath}`);

        // 3. Envoyer l'email
        await emailService.sendEngagementConfidentialiteEmail({
            to: application.etudiantId.email,
            studentName: `${application.etudiantId.prenom} ${application.etudiantId.nom}`,
            pdfPath: pdfPath,
        });
        console.log(`✅ [sendEngagementAutomatically] Email envoyé à ${application.etudiantId.email}`);

        // 4. Mettre à jour le statut du stage
        internship.statut = 'EngagementEnvoye';
        await internship.save();

        // 5. Ajouter à l'historique de l'application
        application.historique.push({
            date: new Date(),
            ancienStatut: application.statut,
            nouveauStatut: application.statut,
            commentaire: 'Engagement de confidentialité envoyé automatiquement à l\'étudiant',
            auteurId: application.traiteurId || application.updatedBy
        });
        await application.save();

        // 6. Notification à l'étudiant
        await Notification.create({
            type: 'InApp',
            titre: 'Engagement de confidentialité',
            message: `Un engagement de confidentialité vous a été envoyé par email pour votre stage "${application.offreId?.titre || ''}". Veuillez le signer et le déposer.`,
            lien: `/dashboard/application/${application._id}`,
            userId: application.etudiantId._id,
            userModel: 'UtilisateurExterne',
        });

        return true;

    } catch (error) {
        console.error('❌ [sendEngagementAutomatically] Erreur:', error);
        throw error;
    }
};

// ============================================
// ✅ MODIFICATION : createApplication - Création directe avec statut "Soumise"
// ✅ SUPPRESSION AUTOMATIQUE DES BROUILLONS EXISTANTS
// ============================================
exports.createApplication = async (req, res) => {
    try {
        console.log('🔍 [createApplication] Début...');
        console.log('🔍 [createApplication] req.user:', req.user);
        console.log('🔍 [createApplication] req.body:', req.body);

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
                message: 'Offre non trouvée'
            });
        }

        // ✅ 1. Vérifier s'il existe déjà une candidature SOUMISE
        const existingSubmitted = await Application.findOne({
            etudiantId,
            offreId,
            statut: APPLICATION_STATUS.SOUMISE
        });

        if (existingSubmitted) {
            return res.status(400).json({
                success: false,
                message: 'Vous avez déjà soumis une candidature pour cette offre'
            });
        }

        // ✅ 2. Vérifier s'il existe une candidature en cours (Brouillon ou EnCoursCreation) et la supprimer automatiquement
        const existingDraft = await Application.findOne({
            etudiantId,
            offreId,
            statut: { $in: ['Brouillon', 'EnCoursCreation'] }
        });

        if (existingDraft) {
            console.log(`🗑️ Suppression automatique de l'ancienne candidature en cours: ${existingDraft._id}`);
            await Application.deleteOne({ _id: existingDraft._id });
            
            // Supprimer également les documents associés à cette candidature
            await Document.updateMany(
                { applicationId: existingDraft._id },
                { applicationId: null }
            );
        }

        // ✅ 3. VÉRIFICATION : L'étudiant a-t-il un stage en cours ?
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
                    message: `Vous ne pouvez pas postuler à cette offre car vous avez déjà un stage en cours du ${new Date(stage.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(stage.dateFin).toLocaleDateString('fr-FR')} : "${stage.sujetTitre}".`
                });
            }
        }

        // ✅ 4. Vérifier que les documents appartiennent à l'étudiant
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

        // ✅ 5. Créer la candidature avec TOUTES les données - Statut "Soumise"
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

        // ✅ 6. Ajouter à l'historique
        if (!application.historique) application.historique = [];
        application.historique.push({
            ancienStatut: null,
            nouveauStatut: APPLICATION_STATUS.SOUMISE,
            commentaire: 'Candidature soumise avec succès',
            auteurId: req.user?._id,
            date: new Date()
        });

        await application.save();

        // ✅ 7. Mettre à jour les documents avec l'applicationId
        if (safeDocuments.length > 0) {
            await Document.updateMany(
                { _id: { $in: safeDocuments } },
                { applicationId: application._id }
            );
        }

        // ✅ 8. Notification
        await notifyStudentApplicationSubmitted(application);

        console.log(`✅ Candidature créée avec succès: ${application._id}`);

        return res.status(201).json({
            success: true,
            message: 'Candidature soumise avec succès',
            data: application
        });

    } catch (error) {
        console.error('❌ Erreur createApplication:', error);
        console.error('❌ Stack:', error.stack);
        
        // ✅ Gestion de l'erreur de duplication
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Vous avez déjà soumis une candidature pour cette offre. Une seule candidature par offre est autorisée.'
            });
        }
        
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

// ============================================
// ✅ MODIFIÉ : changeApplicationStatus avec envoi automatique de l'engagement
// ============================================
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
            .populate('offreId', 'dateDebut dateFin titre')
            .populate('etudiantId', 'nom prenom email');

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

        // ✅ Mettre à jour le statut
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

        // ✅ NOUVEAU : Si le statut passe à "Acceptee", envoyer l'engagement automatiquement
        if (statut === APPLICATION_STATUS.ACCEPTEE && ancienStatut !== APPLICATION_STATUS.ACCEPTEE) {
            console.log(`📧 [changeApplicationStatus] Statut Acceptee - Envoi automatique de l'engagement pour l'application ${application._id}`);
            
            try {
                await sendEngagementAutomatically(application);
                console.log(`✅ [changeApplicationStatus] Engagement envoyé automatiquement pour ${application._id}`);
            } catch (engagementError) {
                console.error(`❌ [changeApplicationStatus] Erreur envoi engagement:`, engagementError);
                // On continue, la notification sera envoyée mais l'engagement a échoué
            }
        }

        // ✅ Notification à l'étudiant
        await notifyStudentStatusChanged(application, statut);

        return res.status(200).json({
            success: true,
            message: 'Statut de candidature modifié avec succès',
            data: application
        });

    } catch (error) {
        console.error('❌ Erreur changeApplicationStatus:', error);
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
// ✅ CONSERVÉ : Récupérer l'état du workflow pour les candidatures existantes
// ============================================

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
                // ✅ 4 champs
                universite: application.universite || '',
                filiere: application.filiere || '',
                niveau: application.niveau || '',
                annee: application.annee || '',
                // ✅ Étape 2
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
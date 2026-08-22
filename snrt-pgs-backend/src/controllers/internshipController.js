// src/controllers/internshipController.js
// ✅ LOGIQUE : Une candidature Acceptée = stage actif
// ✅ Plus besoin de la collection internships pour l'affichage

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const Offer = require('../models/Offer');
const Evaluation = require('../models/Evaluation');
const UtilisateurInterne = require('../models/UtilisateurInterne');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const Notification = require('../models/Notification');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// ============================================
// ✅ VÉRIFIER SI L'ÉTUDIANT A UNE CANDIDATURE ACCEPTÉE
// ============================================
exports.hasActiveInternship = async (req, res) => {
    try {
        const studentId = req.user._id;

        console.log('🔍 [hasActiveInternship] Étudiant ID:', studentId);

        // ✅ Vérifier si l'étudiant a une candidature Acceptée
        const acceptedApplication = await Application.findOne({
            etudiantId: studentId,
            statut: 'Acceptée'
        }).populate('offreId', 'titre');

        const hasActive = !!acceptedApplication;

        console.log('🔍 [hasActiveInternship] Candidature Acceptée trouvée:', hasActive);
        if (acceptedApplication) {
            console.log('🔍 [hasActiveInternship] Titre:', acceptedApplication.offreId?.titre);
        }

        return res.status(200).json({
            success: true,
            hasActive: hasActive,
            internship: acceptedApplication ? {
                id: acceptedApplication._id,
                titre: acceptedApplication.offreId?.titre || 'Stage',
                statut: acceptedApplication.statut
            } : null
        });

    } catch (error) {
        console.error('❌ [hasActiveInternship] Erreur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification',
            hasActive: false
        });
    }
};

// ============================================
// ✅ RÉCUPÉRER TOUTES LES CANDIDATURES ACCEPTÉES
// ============================================
exports.getStudentInternships = async (req, res) => {
    try {
        const studentId = req.user._id;

        console.log('🔍 [getStudentInternships] Étudiant ID:', studentId);

        // ✅ Récupérer TOUTES les candidatures Acceptées
        const acceptedApplications = await Application.find({
            etudiantId: studentId,
            statut: 'Acceptée'
        })
            .populate('offreId', 'titre typeStage departementId')
            .populate('etudiantId', 'nom prenom email universite filiere')
            .sort({ createdAt: -1 });

        console.log('🔍 [getStudentInternships] Candidatures Acceptées trouvées:', acceptedApplications.length);

        // ✅ Transformer les candidatures en "stages" virtuels
        const virtualInternships = acceptedApplications.map(app => ({
            _id: app._id,
            etudiantId: app.etudiantId,
            offreId: app.offreId,
            applicationId: app._id,
            dateDebut: app.offreId?.dateDebut || new Date(),
            dateFin: app.offreId?.dateFin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            statut: 'EnCours',
            sujetTitre: app.offreId?.titre || 'Stage',
            encadrantId: null,
            livrables: [],
            remarquesEncadrant: [],
            convention: { status: 'EnAttente' },
            evaluation: null,
            attestationGeneree: false,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
            // ✅ Indiquer que c'est un stage virtuel
            isVirtual: true
        }));

        return res.status(200).json({
            success: true,
            count: virtualInternships.length,
            data: virtualInternships
        });

    } catch (error) {
        console.error('❌ [getStudentInternships] Erreur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des stages'
        });
    }
};

// ============================================
// ✅ RÉCUPÉRER TOUS LES STAGES DE L'ENCADRANT
// ============================================
exports.getSupervisorInternships = async (req, res) => {
    try {
        const supervisorId = req.user._id;

        console.log('🔍 [getSupervisorInternships] Encadrant ID:', supervisorId);

        const internships = await Internship.find({ encadrantId: supervisorId })
            .populate('offreId', 'titre typeStage departementId')
            .populate('etudiantId', 'nom prenom email universite filiere')
            .populate('encadrantId', 'nom prenom email')
            .sort({ createdAt: -1 });

        console.log('🔍 [getSupervisorInternships] Stages trouvés:', internships.length);

        return res.status(200).json({
            success: true,
            count: internships.length,
            data: internships
        });

    } catch (error) {
        console.error('❌ [getSupervisorInternships] Erreur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des stages'
        });
    }
};

// ============================================
// GET - Recuperer tous les stages
// ============================================
exports.getAllInternships = async (req, res) => {
    try {
        const internships = await Internship.find()
            .populate('etudiantId', 'nom prenom email cin')
            .populate('encadrantId', 'nom prenom email')
            .populate('offreId', 'titre')
            .sort({ dateDebut: -1 });
        
        res.status(200).json({
            success: true,
            count: internships.length,
            data: internships
        });
    } catch (error) {
        logger.error(`Erreur getAllInternships: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation des stages'
        });
    }
};

// ============================================
// GET - Recuperer un stage par ID (ou candidature)
// ============================================
exports.getInternshipById = async (req, res) => {
    try {
        const { id } = req.params;
        let internship = null;

        // 1. Chercher dans internships
        internship = await Internship.findById(id)
            .populate('etudiantId', 'nom prenom email telephone cin universite filiere niveau')
            .populate('encadrantId', 'nom prenom email')
            .populate('offreId', 'titre description typeStage');

        // 2. Si pas trouvé, chercher dans applications (candidature Acceptée)
        if (!internship) {
            const application = await Application.findById(id)
                .populate('etudiantId', 'nom prenom email telephone cin universite filiere niveau')
                .populate('offreId', 'titre description typeStage');

            if (application && application.statut === 'Acceptée') {
                // Créer un stage virtuel
                internship = {
                    _id: application._id,
                    etudiantId: application.etudiantId,
                    offreId: application.offreId,
                    applicationId: application._id,
                    dateDebut: application.offreId?.dateDebut || new Date(),
                    dateFin: application.offreId?.dateFin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    statut: 'EnCours',
                    sujetTitre: application.offreId?.titre || 'Stage',
                    encadrantId: null,
                    livrables: [],
                    remarquesEncadrant: [],
                    convention: { status: 'EnAttente' },
                    evaluation: null,
                    attestationGeneree: false,
                    isVirtual: true
                };
            }
        }
        
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }
        
        const evaluation = await Evaluation.findOne({ stageId: internship._id });
        
        res.status(200).json({
            success: true,
            data: {
                ...internship,
                evaluation: evaluation || null
            }
        });
    } catch (error) {
        logger.error(`Erreur getInternshipById: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation du stage'
        });
    }
};

// ============================================
// GET - Recuperer les stages d'un encadrant (DEPRECATED)
// ============================================
exports.getInternshipsBySupervisor = async (req, res) => {
    try {
        const internships = await Internship.find({
            encadrantId: req.user._id,
            statut: { $nin: ['Termine', 'Annule'] }
        })
            .populate('etudiantId', 'nom prenom email')
            .populate('offreId', 'titre')
            .sort({ dateDebut: -1 });
        
        res.status(200).json({
            success: true,
            count: internships.length,
            data: internships
        });
    } catch (error) {
        logger.error(`Erreur getInternshipsBySupervisor: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation des stages'
        });
    }
};

// ============================================
// GET - Recuperer les stages d'un etudiant (DEPRECATED)
// ============================================
exports.getInternshipsByStudent = async (req, res) => {
    try {
        const internships = await Internship.find({
            etudiantId: req.user._id
        })
            .populate('encadrantId', 'nom prenom email')
            .populate('offreId', 'titre')
            .sort({ dateDebut: -1 });
        
        res.status(200).json({
            success: true,
            count: internships.length,
            data: internships
        });
    } catch (error) {
        logger.error(`Erreur getInternshipsByStudent: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation des stages'
        });
    }
};

// ============================================
// GET - Recuperer un stage par Application ID
// ============================================
exports.getInternshipByApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`[getInternshipByApplication] applicationId: ${applicationId}`);

        let internship = null;

        // 1. Chercher dans internships
        internship = await Internship.findOne({ applicationId: applicationId })
            .populate('etudiantId', 'nom prenom email telephone cin universite filiere niveau')
            .populate('encadrantId', 'nom prenom email')
            .populate('offreId', 'titre description typeStage dateDebut dateFin')
            .populate('applicationId');

        // 2. Si pas trouvé, chercher dans applications
        if (!internship) {
            const application = await Application.findById(applicationId)
                .populate('etudiantId', 'nom prenom email telephone cin universite filiere niveau')
                .populate('offreId', 'titre description typeStage dateDebut dateFin');

            if (application && application.statut === 'Acceptée') {
                internship = {
                    _id: application._id,
                    etudiantId: application.etudiantId,
                    offreId: application.offreId,
                    applicationId: application._id,
                    dateDebut: application.offreId?.dateDebut || new Date(),
                    dateFin: application.offreId?.dateFin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    statut: 'EnCours',
                    sujetTitre: application.offreId?.titre || 'Stage',
                    encadrantId: null,
                    livrables: [],
                    remarquesEncadrant: [],
                    convention: { status: 'EnAttente' },
                    evaluation: null,
                    attestationGeneree: false,
                    isVirtual: true
                };
            }
        }

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Aucun stage trouve pour cette candidature'
            });
        }

        if (userRole === 'Etudiant') {
            const etudiantId = internship.etudiantId._id?.toString() || internship.etudiantId?.toString();
            if (etudiantId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'avez pas acces a ce stage'
                });
            }
        }

        return res.status(200).json({
            success: true,
            data: internship
        });
    } catch (error) {
        console.error('Erreur getInternshipByApplication:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation du stage',
            error: error.message
        });
    }
};

// ============================================
// POST - Creer un stage (RH, Admin ou Departement)
// ============================================
exports.createInternship = async (req, res) => {
    try {
        const { etudiantId, offreId, applicationId, dateDebut, dateFin, encadrantId } = req.body;

        console.log('[createInternship] Donnees recues:', {
            etudiantId,
            offreId,
            applicationId
        });

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvee'
            });
        }

        const offer = await Offer.findById(offreId);
        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offre non trouvee'
            });
        }

        const existingInternship = await Internship.findOne({
            applicationId: applicationId
        });
        
        if (existingInternship) {
            return res.status(200).json({
                success: true,
                message: 'Stage deja existant',
                data: existingInternship
            });
        }

        const sujet = offer.sujets && offer.sujets.length > 0 ? offer.sujets[0] : null;

        const internship = await Internship.create({
            dateDebut: dateDebut || offer.dateDebut || new Date(),
            dateFin: dateFin || offer.dateFin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            statut: 'EnCours',
            etudiantId,
            encadrantId: encadrantId || null,
            offreId,
            applicationId,
            sujetTitre: sujet?.titre || null,
            sujetDescription: sujet?.description || null,
            sujetObjectifs: sujet?.objectifs || null,
            sujetTechnologies: sujet?.technologies || null,
            sujetLivrables: sujet?.livrables || null,
        });

        application.statut = 'Acceptee';
        await application.save();

        try {
            await Notification.create({
                type: 'InApp',
                titre: 'Stage cree',
                message: `Votre stage "${offer.titre}" a ete cree avec succes.`,
                userId: etudiantId,
                userModel: 'UtilisateurExterne',
                lien: `/dashboard/internships/${internship._id}`,
            });
        } catch (notifError) {
            console.warn('[createInternship] Notification non envoyee:', notifError.message);
        }

        logger.info(`Stage cree pour l'etudiant ${etudiantId} par ${req.user?.email}`);
        
        res.status(201).json({
            success: true,
            data: internship,
            message: 'Stage cree avec succes'
        });
    } catch (error) {
        console.error('[createInternship] Erreur:', error);
        logger.error(`Erreur createInternship: ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// PUT - Ajouter une remarque
// ============================================
exports.addRemark = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Le message est obligatoire'
            });
        }
        
        const internship = await Internship.findById(req.params.id);
        
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }
        
        internship.remarquesEncadrant.push({
            date: new Date(),
            message,
            auteurId: req.user._id
        });
        
        await internship.save();
        
        logger.info(`Remarque ajoutee au stage ${internship._id} par ${req.user?.email}`);
        
        res.status(200).json({
            success: true,
            data: internship,
            message: 'Remarque ajoutee avec succes'
        });
    } catch (error) {
        logger.error(`Erreur addRemark: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// PUT - Evaluer un stagiaire
// ============================================
exports.evaluateIntern = async (req, res) => {
    try {
        const { note, commentaires, competencesEvaluees, criteres, pointsForts, pointsFaibles, recommandations } = req.body;
        
        if (!note || note < 0 || note > 20) {
            return res.status(400).json({
                success: false,
                message: 'La note doit etre comprise entre 0 et 20'
            });
        }
        
        const internship = await Internship.findById(req.params.id);
        
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }
        
        if (!internship.encadrantId || internship.encadrantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'etes pas l\'encadrant de ce stage ou aucun encadrant n\'est affecte'
            });
        }
        
        const evaluation = await Evaluation.create({
            stageId: internship._id,
            stagiaireId: internship.etudiantId,
            encadrantId: req.user._id,
            dateEvaluation: new Date(),
            note,
            commentaires,
            competencesEvaluees: competencesEvaluees || [],
            criteres: criteres || {},
            pointsForts,
            pointsFaibles,
            recommandations,
            statut: 'Soumise',
            dateSoumission: new Date()
        });
        
        logger.info(`Evaluation du stage ${internship._id} par ${req.user?.email}`);
        
        res.status(200).json({
            success: true,
            data: evaluation,
            message: 'Evaluation enregistree avec succes'
        });
    } catch (error) {
        logger.error(`Erreur evaluateIntern: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// PUT - Cloturer un stage
// ============================================
exports.closeInternship = async (req, res) => {
    try {
        const { noteFinale, remarques } = req.body;
        
        const internship = await Internship.findById(req.params.id);
        
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }
        
        if (!internship.encadrantId || internship.encadrantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'etes pas l\'encadrant de ce stage ou aucun encadrant n\'est affecte'
            });
        }
        
        const hasRapport = internship.livrables.some(l => 
            l.type === 'Rapport' && l.valide === true
        );
        
        if (!hasRapport) {
            return res.status(400).json({
                success: false,
                message: 'Le stagiaire doit deposer son rapport avant la cloture'
            });
        }
        
        const evaluation = await Evaluation.findOne({ stageId: internship._id });
        if (!evaluation) {
            return res.status(400).json({
                success: false,
                message: 'L\'encadrant doit evaluer le stagiaire avant la cloture'
            });
        }
        
        internship.statut = 'Termine';
        internship.noteFinale = noteFinale || evaluation.note || 0;
        internship.remarques = remarques || '';
        internship.dateFin = new Date();
        
        await internship.save();
        
        evaluation.statut = 'Validee';
        evaluation.dateValidation = new Date();
        await evaluation.save();
        
        logger.info(`Stage cloture: ${internship._id} par ${req.user?.email}`);
        
        res.status(200).json({
            success: true,
            data: internship,
            message: 'Stage cloture avec succes'
        });
    } catch (error) {
        logger.error(`Erreur closeInternship: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// POST - Deposer un livrable
// ============================================
exports.addDeliverable = async (req, res) => {
    try {
        const { nom, type, chemin } = req.body;
        
        if (!nom || !type || !chemin) {
            return res.status(400).json({
                success: false,
                message: 'Nom, type et chemin sont obligatoires'
            });
        }
        
        const internship = await Internship.findById(req.params.id);
        
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }
        
        internship.livrables.push({
            nom,
            type,
            chemin,
            dateDepot: new Date(),
            valide: false
        });
        
        await internship.save();
        
        logger.info(`Livrable ajoute au stage ${internship._id} par ${req.user?.email}`);
        
        res.status(200).json({
            success: true,
            data: internship,
            message: 'Livrable depose avec succes'
        });
    } catch (error) {
        logger.error(`Erreur addDeliverable: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// PUT - Valider un livrable (Encadrant)
// ============================================
exports.validateDeliverable = async (req, res) => {
    try {
        const { livrableId, valide, commentaire } = req.body;
        
        if (!livrableId) {
            return res.status(400).json({
                success: false,
                message: 'L\'ID du livrable est obligatoire'
            });
        }
        
        const internship = await Internship.findById(req.params.id);
        
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }
        
        if (!internship.encadrantId || internship.encadrantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'etes pas l\'encadrant de ce stage ou aucun encadrant n\'est affecte'
            });
        }
        
        const livrable = internship.livrables.id(livrableId);
        if (!livrable) {
            return res.status(404).json({
                success: false,
                message: 'Livrable non trouve'
            });
        }
        
        livrable.valide = valide !== undefined ? valide : true;
        if (commentaire) {
            livrable.commentaire = commentaire;
        }
        
        await internship.save();
        
        logger.info(`Livrable ${livrableId} valide par ${req.user?.email}`);
        
        res.status(200).json({
            success: true,
            data: internship,
            message: valide ? 'Livrable valide avec succes' : 'Livrable refuse'
        });
    } catch (error) {
        logger.error(`Erreur validateDeliverable: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// RH - VALIDER LES DOCUMENTS DE CANDIDATURE
// ============================================
exports.validateApplicationDocuments = async (req, res) => {
    try {
        const { applicationId, decision } = req.body;
        const application = await Application.findById(applicationId)
            .populate('etudiantId')
            .populate('offreId');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvee'
            });
        }

        if (decision === 'accepte') {
            application.statut = 'Acceptee';
            await application.save();

            let internship = await Internship.findOne({ applicationId: application._id });
            if (!internship) {
                internship = await Internship.create({
                    etudiantId: application.etudiantId._id,
                    offreId: application.offreId._id,
                    applicationId: application._id,
                    dateDebut: application.offreId.dateDebut || new Date(),
                    dateFin: application.offreId.dateFin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    statut: 'EnCours',
                    encadrantId: req.user._id
                });
            }

            const internshipData = {
                _id: internship._id,
                etudiantId: application.etudiantId,
                offreId: application.offreId,
                dateDebut: internship.dateDebut,
                dateFin: internship.dateFin,
                etudiantNom: `${application.etudiantId.prenom} ${application.etudiantId.nom}`
            };

            const pdfPath = await pdfService.generateEngagementConfidentialite(internshipData);

            await emailService.sendEngagementConfidentialiteEmail({
                to: application.etudiantId.email,
                studentName: `${application.etudiantId.prenom} ${application.etudiantId.nom}`,
                pdfPath: pdfPath,
            });

            internship.statut = 'EngagementEnvoye';
            await internship.save();

            return res.status(200).json({
                success: true,
                message: 'Candidature acceptee. Engagement de confidentialite envoye a l\'etudiant.',
                data: { internship, pdfPath }
            });

        } else {
            application.statut = 'Refusee';
            application.commentaire = req.body.motif || 'Candidature refuse';
            await application.save();

            return res.status(200).json({
                success: false,
                message: 'Candidature refuse'
            });
        }
    } catch (error) {
        logger.error(`Erreur validateApplicationDocuments: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// RH - ENVOYER LA DEMANDE AU DIRECTEUR
// ============================================
exports.sendToDirecteur = async (req, res) => {
    try {
        const { internshipId } = req.params;
        const { directeurEmail, directeurNom } = req.body;

        const internship = await Internship.findById(internshipId)
            .populate('etudiantId')
            .populate('offreId')
            .populate('encadrantId');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        const pdfPath = await pdfService.generateDemandeStage({
            _id: internship._id,
            etudiantNom: `${internship.etudiantId.prenom} ${internship.etudiantId.nom}`,
            dateDebut: internship.dateDebut,
            dateFin: internship.dateFin,
            offreTitre: internship.offreId?.titre || '',
            encadrantNom: internship.encadrantId ? `${internship.encadrantId.prenom} ${internship.encadrantId.nom}` : ''
        });

        await emailService.sendDemandeDirecteurEmail({
            to: directeurEmail,
            directeurNom: directeurNom,
            studentName: `${internship.etudiantId.prenom} ${internship.etudiantId.nom}`,
            startDate: new Date(internship.dateDebut).toLocaleDateString('fr-FR'),
            endDate: new Date(internship.dateFin).toLocaleDateString('fr-FR'),
            pdfPath: pdfPath,
        });

        internship.statut = 'EnAttenteValidationDirecteur';
        await internship.save();

        res.status(200).json({
            success: true,
            message: 'Demande envoyee au Directeur avec succes',
            data: { pdfPath }
        });
    } catch (error) {
        logger.error(`Erreur sendToDirecteur: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// RH - ENVOYER LA FICHE SIGNEE A L'ETUDIANT
// ============================================
exports.sendFicheSigneeToStudent = async (req, res) => {
    try {
        const { internshipId } = req.params;
        const { ficheSigneePath } = req.body;

        if (!ficheSigneePath) {
            return res.status(400).json({
                success: false,
                message: 'Le chemin du fichier signe est obligatoire'
            });
        }

        const internship = await Internship.findById(internshipId)
            .populate('etudiantId');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        await emailService.sendFicheSigneeEtudiant({
            to: internship.etudiantId.email,
            studentName: `${internship.etudiantId.prenom} ${internship.etudiantId.nom}`,
            pdfPath: ficheSigneePath,
        });

        internship.statut = 'ValideParDirecteur';
        await internship.save();

        res.status(200).json({
            success: true,
            message: 'Fiche signee envoyee a l\'etudiant avec succes'
        });
    } catch (error) {
        logger.error(`Erreur sendFicheSigneeToStudent: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// RH - GENERER L'ATTESTATION DE STAGE
// ============================================
exports.generateAttestation = async (req, res) => {
    try {
        const { internshipId } = req.params;

        const internship = await Internship.findById(internshipId)
            .populate('etudiantId')
            .populate('offreId')
            .populate('encadrantId');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        const hasRapport = internship.livrables.some(l => 
            l.type === 'Rapport' && l.valide === true
        );

        if (!hasRapport) {
            return res.status(400).json({
                success: false,
                message: 'Le stagiaire doit deposer son rapport avant de generer l\'attestation'
            });
        }

        const pdfPath = await pdfService.generateAttestation(internship);

        await emailService.sendAttestationStage({
            to: internship.etudiantId.email,
            studentName: `${internship.etudiantId.prenom} ${internship.etudiantId.nom}`,
            pdfPath: pdfPath,
        });

        internship.statut = 'Termine';
        await internship.save();

        res.status(200).json({
            success: true,
            message: 'Attestation de stage generee et envoyee avec succes',
            data: { pdfPath }
        });
    } catch (error) {
        logger.error(`Erreur generateAttestation: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ETUDIANT - DEPOSER LE PDF D'ENGAGEMENT SIGNE
// ============================================
exports.uploadEngagementConfidentialite = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier fourni'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de stage invalide'
            });
        }

        const internship = await Internship.findById(id);

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifie'
            });
        }

        if (internship.etudiantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'etes pas autorise a deposer ce document'
            });
        }

        internship.livrables.push({
            nom: 'Engagement Confidentialite Signe',
            type: 'Autre',
            chemin: file.path,
            dateDepot: new Date(),
            valide: false,
        });

        internship.statut = 'EngagementRecu';
        await internship.save();

        logger.info(`Document d'engagement depose pour le stage ${internship._id} par ${req.user?.email}`);

        res.status(200).json({
            success: true,
            message: 'Document d\'engagement depose avec succes',
            data: internship
        });
    } catch (error) {
        console.error('[uploadEngagementConfidentialite] Erreur:', error);
        logger.error(`Erreur uploadEngagementConfidentialite: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// GENERER L'ENGAGEMENT DE CONFIDENTIALITE (DOWNLOAD)
// ============================================
exports.generateEngagementConfidentialite = async (req, res) => {
    try {
        const { id } = req.params;
        
        const internship = await Internship.findById(id)
            .populate('etudiantId')
            .populate('offreId');
        
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        const internshipData = {
            _id: internship._id,
            etudiantId: internship.etudiantId,
            offreId: internship.offreId,
            dateDebut: internship.dateDebut,
            dateFin: internship.dateFin,
            etudiantNom: `${internship.etudiantId?.prenom || ''} ${internship.etudiantId?.nom || ''}`.trim()
        };

        const pdfPath = await pdfService.generateEngagementConfidentialite(internshipData);

        res.download(pdfPath, 'Engagement_Confidentialite.pdf', (err) => {
            if (err) {
                logger.error(`Erreur telechargement engagement: ${err.message}`);
            }
        });
    } catch (error) {
        logger.error(`Erreur generateEngagementConfidentialite: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la generation de l\'engagement'
        });
    }
};

// ============================================
// GENERER LA DEMANDE DE STAGE POUR LE DIRECTEUR (DOWNLOAD)
// ============================================
exports.generateDemandeStage = async (req, res) => {
    try {
        const { id } = req.params;
        
        const internship = await Internship.findById(id)
            .populate('etudiantId')
            .populate('offreId');
        
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        const internshipData = {
            _id: internship._id,
            etudiantId: internship.etudiantId,
            dateDebut: internship.dateDebut,
            dateFin: internship.dateFin,
            etudiantNom: `${internship.etudiantId?.prenom || ''} ${internship.etudiantId?.nom || ''}`.trim()
        };

        const pdfPath = await pdfService.generateDemandeStage(internshipData);

        internship.statut = 'DemandeEnvoyee';
        await internship.save();

        res.download(pdfPath, 'Demande_Stage_Directeur.pdf', (err) => {
            if (err) {
                logger.error(`Erreur telechargement demande stage: ${err.message}`);
            }
        });
    } catch (error) {
        logger.error(`Erreur generateDemandeStage: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la generation de la demande de stage'
        });
    }
};

// ============================================
// ETUDIANT - TELECHARGER LA DEMANDE DE STAGE EXISTANTE
// ============================================
exports.downloadDemandeStage = async (req, res) => {
    try {
        const { id } = req.params;

        const internship = await Internship.findById(id)
            .populate('etudiantId');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        if (req.user?.role === 'Etudiant') {
            if (internship.etudiantId._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'etes pas autorise a acceder a cette demande'
                });
            }
        }

        const statutsValides = ['DemandeEnvoyee', 'ValideParDirecteur', 'Cloturee', 'Termine'];
        if (!statutsValides.includes(internship.statut)) {
            return res.status(400).json({
                success: false,
                message: 'La demande de stage n\'a pas encore ete generee'
            });
        }

        const dir = path.join(__dirname, '../../uploads/demandes');
        const fileName = `demande_stage_${id}.pdf`;
        const filePath = path.join(dir, fileName);

        if (!fs.existsSync(filePath)) {
            if (req.user?.role === 'RH' || req.user?.role === 'Administrateur') {
                return exports.generateDemandeStage(req, res);
            }
            
            return res.status(404).json({
                success: false,
                message: 'Le fichier de demande de stage n\'a pas ete trouve. Veuillez contacter le service RH.'
            });
        }

        res.download(filePath, `Demande_Stage_${internship.etudiantId.prenom || ''}_${internship.etudiantId.nom || ''}.pdf`, (err) => {
            if (err) {
                console.error('Erreur telechargement demande:', err.message);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Erreur lors du telechargement'
                    });
                }
            }
        });

    } catch (error) {
        console.error('Erreur downloadDemandeStage:', error);
        logger.error(`Erreur downloadDemandeStage: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du telechargement de la demande'
        });
    }
};

// ============================================
// ENVOYER L'ENGAGEMENT A L'ETUDIANT PAR EMAIL
// ============================================
exports.sendEngagementToStudent = async (req, res) => {
    try {
        const { id } = req.params;
        
        const internship = await Internship.findById(id)
            .populate('etudiantId')
            .populate('offreId');
        
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        const internshipData = {
            _id: internship._id,
            etudiantId: internship.etudiantId,
            offreId: internship.offreId,
            dateDebut: internship.dateDebut,
            dateFin: internship.dateFin,
            etudiantNom: `${internship.etudiantId?.prenom || ''} ${internship.etudiantId?.nom || ''}`.trim()
        };

        const pdfPath = await pdfService.generateEngagementConfidentialite(internshipData);

        await emailService.sendEngagementConfidentialiteEmail({
            to: internship.etudiantId.email,
            studentName: `${internship.etudiantId.prenom} ${internship.etudiantId.nom}`,
            pdfPath: pdfPath
        });

        internship.statut = 'EngagementEnvoye';
        await internship.save();

        res.status(200).json({
            success: true,
            message: 'Engagement de confidentialite envoye a l\'etudiant'
        });
    } catch (error) {
        logger.error(`Erreur sendEngagementToStudent: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi de l\'engagement'
        });
    }
};

// ============================================
// RH - ENVOYER LA DEMANDE DE STAGE A L'ETUDIANT
// ============================================
exports.sendDemandeStageToStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const internship = await Internship.findById(id)
            .populate('etudiantId')
            .populate('offreId');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        if (internship.statut !== 'DemandeEnvoyee' && internship.statut !== 'EnAttenteValidationDirecteur') {
            return res.status(400).json({
                success: false,
                message: 'La demande de stage n\'a pas encore ete generee'
            });
        }

        if (!internship.etudiantId || !internship.etudiantId.email) {
            return res.status(400).json({
                success: false,
                message: 'L\'etudiant associe n\'a pas d\'adresse email'
            });
        }

        const internshipData = {
            _id: internship._id,
            etudiantId: internship.etudiantId,
            dateDebut: internship.dateDebut,
            dateFin: internship.dateFin,
            etudiantNom: `${internship.etudiantId?.prenom || ''} ${internship.etudiantId?.nom || ''}`.trim()
        };

        const pdfPath = await pdfService.generateDemandeStage(internshipData);

        await emailService.sendDemandeStageToStudent({
            to: internship.etudiantId.email,
            studentName: `${internship.etudiantId.prenom} ${internship.etudiantId.nom}`,
            pdfPath: pdfPath,
        });

        logger.info(`Demande de stage envoyee a l'etudiant ${internship.etudiantId.email}`);

        return res.status(200).json({
            success: true,
            message: 'Demande de stage envoyee a l\'etudiant avec succes'
        });

    } catch (error) {
        console.error('[sendDemandeStageToStudent] Erreur:', error);
        logger.error(`Erreur sendDemandeStageToStudent: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// AFFECTER UN ENCADRANT
// ============================================
exports.assignSupervisor = async (req, res) => {
    try {
        const { id } = req.params;
        const { encadrantId } = req.body;

        if (!encadrantId) {
            return res.status(400).json({
                success: false,
                message: 'L\'ID de l\'encadrant est obligatoire'
            });
        }

        const internship = await Internship.findById(id)
            .populate('etudiantId', 'nom prenom email')
            .populate('offreId', 'titre');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        const encadrant = await UtilisateurInterne.findById(encadrantId)
            .populate('roleId', 'nom');

        if (!encadrant) {
            return res.status(404).json({
                success: false,
                message: 'Encadrant non trouve'
            });
        }

        const isEncadrant = encadrant.roleId?.nom === 'Encadrant';
        if (!isEncadrant) {
            return res.status(400).json({
                success: false,
                message: 'L\'utilisateur selectionne n\'a pas le role "Encadrant"'
            });
        }

        if (encadrant.departementId?.toString() !== req.user.departementId?.toString()) {
            return res.status(403).json({
                success: false,
                message: 'L\'encadrant doit appartenir au meme departement'
            });
        }

        internship.encadrantId = encadrantId;
        await internship.save();

        await Notification.create({
            type: 'InApp',
            titre: 'Nouveau stagiaire affecte',
            message: `Le stagiaire ${internship.etudiantId?.prenom || ''} ${internship.etudiantId?.nom || ''} vous a ete affecte pour le stage "${internship.offreId?.titre || ''}".`,
            userId: encadrantId,
            userModel: 'UtilisateurInterne',
            lien: `/supervisor/interns/${internship._id}`,
        });

        logger.info(`Encadrant ${encadrantId} affecte au stage ${id} par ${req.user?.email}`);

        return res.status(200).json({
            success: true,
            message: 'Encadrant affecte avec succes',
            data: internship
        });
    } catch (error) {
        logger.error(`Erreur assignSupervisor: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// RECUPERER LES STAGES DU DEPARTEMENT
// ============================================
exports.getDepartmentInternships = async (req, res) => {
    try {
        const { statut, search, page = 1, limit = 20 } = req.query;
        const { departementId } = req.user;

        if (!departementId) {
            return res.status(403).json({
                success: false,
                message: "Votre compte n'est rattache a aucun departement."
            });
        }

        const offreIds = await Offer.find({ departementId }).distinct('_id');

        if (offreIds.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                pagination: { page: 1, limit, total: 0, pages: 0 }
            });
        }

        const filter = { offreId: { $in: offreIds } };
        if (statut) filter.statut = statut;

        if (search) {
            const students = await UtilisateurExterne.find({
                $or: [
                    { nom: { $regex: search, $options: 'i' } },
                    { prenom: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            
            const studentIds = students.map(s => s._id);
            if (studentIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    count: 0,
                    data: [],
                    pagination: { page: 1, limit, total: 0, pages: 0 }
                });
            }
            filter.etudiantId = { $in: studentIds };
        }

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const skip = (pageNum - 1) * limitNum;

        const [internships, total] = await Promise.all([
            Internship.find(filter)
                .populate('etudiantId', 'nom prenom email telephone cin universite filiere')
                .populate('encadrantId', 'nom prenom email')
                .populate('offreId', 'titre typeStage')
                .sort({ dateDebut: -1 })
                .skip(skip)
                .limit(limitNum),
            Internship.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            count: internships.length,
            data: internships,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        logger.error(`Erreur getDepartmentInternships: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation des stages',
            error: error.message
        });
    }
};

// ============================================
// CONSULTER LE RAPPORT DE STAGE
// ============================================
exports.getInternshipReport = async (req, res) => {
    try {
        const { id } = req.params;

        const internship = await Internship.findById(id)
            .populate('etudiantId', 'nom prenom')
            .populate('offreId', 'titre');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        const rapport = internship.livrables.find(l => l.type === 'Rapport');
        if (!rapport || !rapport.chemin) {
            return res.status(404).json({
                success: false,
                message: 'Aucun rapport de stage n\'a ete depose'
            });
        }

        if (!rapport.valide) {
            return res.status(400).json({
                success: false,
                message: 'Le rapport n\'a pas encore ete valide par l\'encadrant'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: rapport._id,
                nom: rapport.nom,
                chemin: rapport.chemin,
                dateDepot: rapport.dateDepot,
                valide: rapport.valide,
                commentaire: rapport.commentaire
            }
        });
    } catch (error) {
        logger.error(`Erreur getInternshipReport: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la recuperation du rapport',
            error: error.message
        });
    }
};

// ============================================
// DEFINIR LE SUJET DU STAGE (DEPARTEMENT)
// ============================================
exports.defineSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, description, objectifs, technologies, livrables } = req.body;

        const internship = await Internship.findById(id);

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        if (titre) internship.sujetTitre = titre;
        if (description) internship.sujetDescription = description;
        if (objectifs) internship.sujetObjectifs = objectifs;
        if (technologies) internship.sujetTechnologies = technologies;
        if (livrables) internship.sujetLivrables = livrables;

        await internship.save();

        logger.info(`Sujet du stage ${id} defini par ${req.user?.email}`);

        return res.status(200).json({
            success: true,
            message: 'Sujet du stage defini avec succes',
            data: internship
        });
    } catch (error) {
        logger.error(`Erreur defineSubject: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// PATCH - Mettre a jour le statut d'un stage
// ============================================
exports.updateInternshipStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;

        if (!statut) {
            return res.status(400).json({
                success: false,
                message: 'Le statut est obligatoire'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de stage invalide'
            });
        }

        const internship = await Internship.findById(id);
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouve'
            });
        }

        const ancienStatut = internship.statut;
        internship.statut = statut;
        await internship.save();

        logger.info(`Statut du stage ${id} change de ${ancienStatut} a ${statut} par ${req.user?.email}`);

        res.status(200).json({
            success: true,
            message: `Statut du stage mis a jour : ${statut}`,
            data: internship
        });
    } catch (error) {
        console.error('[updateInternshipStatus] Erreur:', error);
        logger.error(`Erreur updateInternshipStatus: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// EXPORTS
// ============================================
module.exports = exports;
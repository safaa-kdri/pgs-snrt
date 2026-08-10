// src/controllers/internshipController.js
const mongoose = require('mongoose');
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
// GET - Récupérer tous les stages
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
            message: 'Erreur lors de la récupération des stages'
        });
    }
};

// ============================================
// GET - Récupérer un stage par ID
// ============================================
exports.getInternshipById = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id)
            .populate('etudiantId', 'nom prenom email telephone cin')
            .populate('encadrantId', 'nom prenom email')
            .populate('offreId', 'titre description');
        
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouvé'
            });
        }
        
        const evaluation = await Evaluation.findOne({ stageId: internship._id });
        
        res.status(200).json({
            success: true,
            data: {
                ...internship.toObject(),
                evaluation: evaluation || null
            }
        });
    } catch (error) {
        logger.error(`Erreur getInternshipById: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du stage'
        });
    }
};

// ============================================
// GET - Récupérer les stages d'un encadrant
// ============================================
exports.getInternshipsBySupervisor = async (req, res) => {
    try {
        const internships = await Internship.find({
            encadrantId: req.user._id,
            statut: { $ne: 'Termine' }
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
            message: 'Erreur lors de la récupération des stages'
        });
    }
};

// ============================================
// GET - Récupérer les stages d'un étudiant
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
            message: 'Erreur lors de la récupération des stages'
        });
    }
};

// ============================================
// ✅ GET - Récupérer un stage par Application ID (VERSION ROBUSTE)
// ============================================
exports.getInternshipByApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        console.log(`🔍 [getInternshipByApplication] Recherche du stage pour applicationId: ${applicationId}`);

        // ✅ ESSAYER PLUSIEURS FORMATS
        let internship = null;
        let objectId = null;

        try {
            objectId = new mongoose.Types.ObjectId(applicationId);
        } catch (err) {
            console.log(`⚠️ [getInternshipByApplication] L'ID n'est pas un ObjectId valide: ${applicationId}`);
        }

        // ✅ 1. Recherche avec ObjectId
        if (objectId) {
            console.log(`🔍 [getInternshipByApplication] Recherche avec ObjectId: ${objectId}`);
            internship = await Internship.findOne({ applicationId: objectId })
                .populate('etudiantId', 'nom prenom email telephone cin universite filiere niveau')
                .populate('encadrantId', 'nom prenom email')
                .populate('offreId', 'titre description typeStage dateDebut dateFin')
                .populate('applicationId');
        }

        // ✅ 2. Si pas trouvé, recherche avec la chaîne
        if (!internship) {
            console.log(`🔍 [getInternshipByApplication] Recherche avec la chaîne: ${applicationId}`);
            internship = await Internship.findOne({ applicationId: applicationId })
                .populate('etudiantId', 'nom prenom email telephone cin universite filiere niveau')
                .populate('encadrantId', 'nom prenom email')
                .populate('offreId', 'titre description typeStage dateDebut dateFin')
                .populate('applicationId');
        }

        // ✅ 3. Si toujours pas trouvé, essayer avec $eq
        if (!internship && objectId) {
            console.log(`🔍 [getInternshipByApplication] Recherche avec $eq: ${objectId}`);
            internship = await Internship.findOne({ applicationId: { $eq: objectId } })
                .populate('etudiantId', 'nom prenom email telephone cin universite filiere niveau')
                .populate('encadrantId', 'nom prenom email')
                .populate('offreId', 'titre description typeStage dateDebut dateFin')
                .populate('applicationId');
        }

        if (!internship) {
            console.log(`📭 [getInternshipByApplication] Aucun stage trouvé pour applicationId: ${applicationId}`);
            
            // ✅ Diagnostic : Vérifier combien de stages existent
            const allInternships = await Internship.find().select('applicationId _id').limit(10);
            console.log(`🔍 [getInternshipByApplication] Stages existants (10 max):`, 
                allInternships.map(s => ({ 
                    id: s._id, 
                    appId: s.applicationId,
                    appIdType: typeof s.applicationId,
                    appIdString: s.applicationId?.toString()
                }))
            );
            
            return res.status(404).json({
                success: false,
                message: 'Aucun stage trouvé pour cette candidature',
                debug: {
                    applicationId: applicationId,
                    allInternships: allInternships.map(s => ({
                        stageId: s._id,
                        applicationId: s.applicationId?.toString()
                    }))
                }
            });
        }

        console.log(`✅ [getInternshipByApplication] Stage trouvé: ${internship._id}`);

        return res.status(200).json({
            success: true,
            data: internship
        });
    } catch (error) {
        console.error('❌ Erreur getInternshipByApplication:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du stage',
            error: error.message
        });
    }
};

// ============================================
// POST - Créer un stage (RH, Admin ou Département)
// ============================================
exports.createInternship = async (req, res) => {
    try {
        const { etudiantId, offreId, applicationId, dateDebut, dateFin, encadrantId } = req.body;

        console.log('🔍 [createInternship] Données reçues:', {
            etudiantId,
            offreId,
            applicationId,
            dateDebut,
            dateFin,
            encadrantId
        });

        // ✅ Vérifier que l'application existe
        const application = await Application.findById(applicationId);
        if (!application) {
            console.log('❌ [createInternship] Application non trouvée:', applicationId);
            return res.status(404).json({
                success: false,
                message: 'Candidature non trouvée'
            });
        }

        // ✅ Vérifier que l'offre existe
        const offer = await Offer.findById(offreId);
        if (!offer) {
            console.log('❌ [createInternship] Offre non trouvée:', offreId);
            return res.status(404).json({
                success: false,
                message: 'Offre non trouvée'
            });
        }

        // ✅ Vérifier que l'étudiant existe
        const student = await UtilisateurExterne.findById(etudiantId);
        if (!student) {
            console.log('❌ [createInternship] Étudiant non trouvé:', etudiantId);
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }

        // ✅ Vérifier qu'un stage n'existe pas déjà pour cette application
        const existingInternship = await Internship.findOne({
            applicationId: applicationId
        });
        
        if (existingInternship) {
            console.log('❌ [createInternship] Stage déjà existant pour cette application');
            return res.status(400).json({
                success: false,
                message: 'Un stage existe déjà pour cette candidature'
            });
        }

        // ✅ Vérifier qu'un stage n'existe pas déjà pour cet étudiant
        const existingStudentInternship = await Internship.findOne({
            etudiantId: etudiantId,
            statut: 'EnCours'
        });
        
        if (existingStudentInternship) {
            console.log('❌ [createInternship] Étudiant déjà en stage');
            return res.status(400).json({
                success: false,
                message: 'Cet étudiant a déjà un stage en cours'
            });
        }

        // ✅ Récupérer le sujet de l'offre
        const sujet = offer.sujets && offer.sujets.length > 0 ? offer.sujets[0] : null;

        // ✅ Créer le stage
        const internship = await Internship.create({
            dateDebut: dateDebut || offer.dateDebut || new Date(),
            dateFin: dateFin || offer.dateFin || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            statut: 'EnCours',
            etudiantId,
            encadrantId: encadrantId || null,
            offreId,
            applicationId,
            // ✅ Copier le sujet de l'offre
            sujetTitre: sujet?.titre || null,
            sujetDescription: sujet?.description || null,
            sujetObjectifs: sujet?.objectifs || null,
            sujetTechnologies: sujet?.technologies || null,
            sujetLivrables: sujet?.livrables || null,
        });

        console.log('✅ [createInternship] Stage créé avec ID:', internship._id);
        
        // ✅ Mettre à jour le statut de la candidature
        application.statut = 'Acceptee';
        await application.save();

        // ✅ Notification à l'étudiant
        try {
            await Notification.create({
                type: 'InApp',
                titre: 'Stage créé',
                message: `Votre stage "${offer.titre}" a été créé avec succès.`,
                userId: etudiantId,
                userModel: 'UtilisateurExterne',
                lien: `/dashboard/internships/${internship._id}`,
            });
        } catch (notifError) {
            console.warn('⚠️ [createInternship] Notification non envoyée:', notifError.message);
        }

        logger.info(`Stage créé pour l'étudiant ${etudiantId} par ${req.user?.email}`);
        
        res.status(201).json({
            success: true,
            data: internship,
            message: 'Stage créé avec succès'
        });
    } catch (error) {
        console.error('❌ [createInternship] Erreur:', error);
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
                message: 'Stage non trouvé'
            });
        }
        
        internship.remarquesEncadrant.push({
            date: new Date(),
            message,
            auteurId: req.user._id
        });
        
        await internship.save();
        
        logger.info(`Remarque ajoutée au stage ${internship._id} par ${req.user?.email}`);
        
        res.status(200).json({
            success: true,
            data: internship,
            message: 'Remarque ajoutée avec succès'
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
// PUT - Évaluer un stagiaire
// ============================================
exports.evaluateIntern = async (req, res) => {
    try {
        const { note, commentaires, competencesEvaluees, criteres, pointsForts, pointsFaibles, recommandations } = req.body;
        
        if (!note || note < 0 || note > 20) {
            return res.status(400).json({
                success: false,
                message: 'La note doit être comprise entre 0 et 20'
            });
        }
        
        const internship = await Internship.findById(req.params.id);
        
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouvé'
            });
        }
        
        if (internship.encadrantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas l\'encadrant de ce stage'
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
        
        logger.info(`Évaluation du stage ${internship._id} par ${req.user?.email}`);
        
        res.status(200).json({
            success: true,
            data: evaluation,
            message: 'Évaluation enregistrée avec succès'
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
// PUT - Clôturer un stage
// ============================================
exports.closeInternship = async (req, res) => {
    try {
        const { noteFinale, remarques } = req.body;
        
        const internship = await Internship.findById(req.params.id);
        
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouvé'
            });
        }
        
        if (internship.encadrantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas l\'encadrant de ce stage'
            });
        }
        
        const hasRapport = internship.livrables.some(l => 
            l.type === 'Rapport' && l.valide === true
        );
        
        if (!hasRapport) {
            return res.status(400).json({
                success: false,
                message: 'Le stagiaire doit déposer son rapport avant la clôture'
            });
        }
        
        const evaluation = await Evaluation.findOne({ stageId: internship._id });
        if (!evaluation) {
            return res.status(400).json({
                success: false,
                message: 'L\'encadrant doit évaluer le stagiaire avant la clôture'
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
        
        logger.info(`Stage clôturé: ${internship._id} par ${req.user?.email}`);
        
        res.status(200).json({
            success: true,
            data: internship,
            message: 'Stage clôturé avec succès'
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
// POST - Déposer un livrable
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
                message: 'Stage non trouvé'
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
        
        logger.info(`Livrable ajouté au stage ${internship._id} par ${req.user?.email}`);
        
        res.status(200).json({
            success: true,
            data: internship,
            message: 'Livrable déposé avec succès'
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
                message: 'Stage non trouvé'
            });
        }
        
        if (internship.encadrantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas l\'encadrant de ce stage'
            });
        }
        
        const livrable = internship.livrables.id(livrableId);
        if (!livrable) {
            return res.status(404).json({
                success: false,
                message: 'Livrable non trouvé'
            });
        }
        
        livrable.valide = valide !== undefined ? valide : true;
        if (commentaire) {
            livrable.commentaire = commentaire;
        }
        
        await internship.save();
        
        logger.info(`Livrable ${livrableId} validé par ${req.user?.email}`);
        
        res.status(200).json({
            success: true,
            data: internship,
            message: valide ? 'Livrable validé avec succès' : 'Livrable refusé'
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
                message: 'Candidature non trouvée'
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
                message: 'Candidature acceptée. Engagement de confidentialité envoyé à l\'étudiant.',
                data: { internship, pdfPath }
            });

        } else {
            application.statut = 'Refusee';
            application.commentaire = req.body.motif || 'Candidature refusée';
            await application.save();

            return res.status(200).json({
                success: true,
                message: 'Candidature refusée'
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
                message: 'Stage non trouvé'
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
            message: 'Demande envoyée au Directeur avec succès',
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
// RH - ENVOYER LA FICHE SIGNÉE À L'ÉTUDIANT
// ============================================
exports.sendFicheSigneeToStudent = async (req, res) => {
    try {
        const { internshipId } = req.params;
        const { ficheSigneePath } = req.body;

        if (!ficheSigneePath) {
            return res.status(400).json({
                success: false,
                message: 'Le chemin du fichier signé est obligatoire'
            });
        }

        const internship = await Internship.findById(internshipId)
            .populate('etudiantId');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouvé'
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
            message: 'Fiche signée envoyée à l\'étudiant avec succès'
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
// RH - GÉNÉRER L'ATTESTATION DE STAGE
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
                message: 'Stage non trouvé'
            });
        }

        const hasRapport = internship.livrables.some(l => 
            l.type === 'Rapport' && l.valide === true
        );

        if (!hasRapport) {
            return res.status(400).json({
                success: false,
                message: 'Le stagiaire doit déposer son rapport avant de générer l\'attestation'
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
            message: 'Attestation de stage générée et envoyée avec succès',
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
// ÉTUDIANT - DÉPOSER LE PDF D'ENGAGEMENT SIGNÉ
// ============================================
exports.uploadEngagementConfidentialite = async (req, res) => {
    try {
        const { internshipId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier fourni'
            });
        }

        const internship = await Internship.findById(internshipId);

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouvé'
            });
        }

        if (internship.etudiantId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à déposer ce document'
            });
        }

        internship.livrables.push({
            nom: 'Engagement Confidentialité Signé',
            type: 'Autre',
            chemin: file.path,
            dateDepot: new Date(),
            valide: false,
        });

        internship.statut = 'EngagementRecu';
        await internship.save();

        logger.info(`Document d'engagement déposé pour le stage ${internship._id} par ${req.user?.email}`);

        res.status(200).json({
            success: true,
            message: 'Document d\'engagement déposé avec succès',
            data: internship
        });
    } catch (error) {
        logger.error(`Erreur uploadEngagementConfidentialite: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// GÉNÉRER L'ENGAGEMENT DE CONFIDENTIALITÉ (DOWNLOAD)
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
                message: 'Stage non trouvé'
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
                logger.error(`Erreur téléchargement engagement: ${err.message}`);
            }
        });
    } catch (error) {
        logger.error(`Erreur generateEngagementConfidentialite: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la génération de l\'engagement'
        });
    }
};

// ============================================
// GÉNÉRER LA DEMANDE DE STAGE POUR LE DIRECTEUR (DOWNLOAD)
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
                message: 'Stage non trouvé'
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
                logger.error(`Erreur téléchargement demande stage: ${err.message}`);
            }
        });
    } catch (error) {
        logger.error(`Erreur generateDemandeStage: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la génération de la demande de stage'
        });
    }
};

// ============================================
// ENVOYER L'ENGAGEMENT À L'ÉTUDIANT PAR EMAIL
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
                message: 'Stage non trouvé'
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
            message: 'Engagement de confidentialité envoyé à l\'étudiant'
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
                message: 'Stage non trouvé'
            });
        }

        const encadrant = await UtilisateurInterne.findById(encadrantId)
            .populate('roleId', 'nom');

        if (!encadrant) {
            return res.status(404).json({
                success: false,
                message: 'Encadrant non trouvé'
            });
        }

        const isEncadrant = encadrant.roleId?.nom === 'Encadrant';
        if (!isEncadrant) {
            return res.status(400).json({
                success: false,
                message: 'L\'utilisateur sélectionné n\'a pas le rôle "Encadrant"'
            });
        }

        if (encadrant.departementId?.toString() !== req.user.departementId?.toString()) {
            return res.status(403).json({
                success: false,
                message: 'L\'encadrant doit appartenir au même département'
            });
        }

        internship.encadrantId = encadrantId;
        await internship.save();

        await Notification.create({
            type: 'InApp',
            titre: 'Nouveau stagiaire affecté',
            message: `Le stagiaire ${internship.etudiantId?.prenom || ''} ${internship.etudiantId?.nom || ''} vous a été affecté pour le stage "${internship.offreId?.titre || ''}".`,
            userId: encadrantId,
            userModel: 'UtilisateurInterne',
            lien: `/supervisor/interns/${internship._id}`,
        });

        logger.info(`Encadrant ${encadrantId} affecté au stage ${id} par ${req.user?.email}`);

        return res.status(200).json({
            success: true,
            message: 'Encadrant affecté avec succès',
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
// RÉCUPÉRER LES STAGES DU DÉPARTEMENT
// ============================================
exports.getDepartmentInternships = async (req, res) => {
    try {
        const { statut, search, page = 1, limit = 20 } = req.query;
        const { departementId } = req.user;

        if (!departementId) {
            return res.status(403).json({
                success: false,
                message: "Votre compte n'est rattaché à aucun département."
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
            message: 'Erreur lors de la récupération des stages',
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
                message: 'Stage non trouvé'
            });
        }

        const rapport = internship.livrables.find(l => l.type === 'Rapport');
        if (!rapport || !rapport.chemin) {
            return res.status(404).json({
                success: false,
                message: 'Aucun rapport de stage n\'a été déposé'
            });
        }

        if (!rapport.valide) {
            return res.status(400).json({
                success: false,
                message: 'Le rapport n\'a pas encore été validé par l\'encadrant'
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
            message: 'Erreur lors de la récupération du rapport',
            error: error.message
        });
    }
};

// ============================================
// DÉFINIR LE SUJET DU STAGE (DÉPARTEMENT)
// ============================================
exports.defineSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, description, objectifs, technologies, livrables } = req.body;

        const internship = await Internship.findById(id);

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouvé'
            });
        }

        if (titre) internship.sujetTitre = titre;
        if (description) internship.sujetDescription = description;
        if (objectifs) internship.sujetObjectifs = objectifs;
        if (technologies) internship.sujetTechnologies = technologies;
        if (livrables) internship.sujetLivrables = livrables;

        await internship.save();

        logger.info(`Sujet du stage ${id} défini par ${req.user?.email}`);

        return res.status(200).json({
            success: true,
            message: 'Sujet du stage défini avec succès',
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
// CONVENTION - GESTION COMPLÈTE
// ============================================

// 1. ÉTUDIANT - DÉPOSER SA CONVENTION
// ============================================
exports.depotConvention = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier fourni'
            });
        }

        const internship = await Internship.findById(id)
            .populate('etudiantId')
            .populate('offreId');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouvé'
            });
        }

        if (internship.etudiantId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à déposer une convention pour ce stage'
            });
        }

        if (internship.statut !== 'EnCours' && internship.statut !== 'Acceptee') {
            return res.status(400).json({
                success: false,
                message: 'Le stage n\'est pas dans un état permettant le dépôt de convention'
            });
        }

        internship.convention = {
            nomOriginal: file.originalname,
            chemin: file.path,
            statut: 'DeposeeEtudiant',
            dateDepot: new Date(),
            signedByRH: false,
        };

        await internship.save();

        logger.info(`Convention déposée pour le stage ${id} par ${req.user.email}`);

        return res.status(200).json({
            success: true,
            message: 'Convention déposée avec succès',
            data: internship.convention
        });

    } catch (error) {
        logger.error(`Erreur depotConvention: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. RH - RÉCUPÉRER TOUTES LES CONVENTIONS DÉPOSÉES
// ============================================
exports.getDeposeesConventions = async (req, res) => {
    try {
        const conventions = await Internship.find({
            'convention.statut': 'DeposeeEtudiant'
        })
            .populate('etudiantId', 'nom prenom email')
            .populate('offreId', 'titre typeStage')
            .populate('encadrantId', 'nom prenom')
            .sort({ 'convention.dateDepot': -1 });

        return res.status(200).json({
            success: true,
            count: conventions.length,
            data: conventions
        });

    } catch (error) {
        logger.error(`Erreur getDeposeesConventions: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. RH - SIGNER LA CONVENTION
// ============================================
exports.signConvention = async (req, res) => {
    try {
        const { id } = req.params;
        const { signature } = req.body;

        if (!signature) {
            return res.status(400).json({
                success: false,
                message: 'La signature est obligatoire'
            });
        }

        const internship = await Internship.findById(id)
            .populate('etudiantId')
            .populate('offreId');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouvé'
            });
        }

        if (!internship.convention || internship.convention.statut !== 'DeposeeEtudiant') {
            return res.status(400).json({
                success: false,
                message: 'Aucune convention déposée en attente de signature'
            });
        }

        internship.convention.statut = 'SigneeRH';
        internship.convention.signatureRH = signature;
        internship.convention.signedByRH = true;
        internship.convention.dateSignatureRH = new Date();
        internship.convention.signeePar = req.user._id;

        await internship.save();

        logger.info(`Convention signée par RH pour le stage ${id}`);

        return res.status(200).json({
            success: true,
            message: 'Convention signée avec succès',
            data: internship.convention
        });

    } catch (error) {
        logger.error(`Erreur signConvention: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 4. RH - ENVOYER LA CONVENTION SIGNÉE À L'ÉTUDIANT
// ============================================
exports.sendConventionToStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const internship = await Internship.findById(id)
            .populate('etudiantId')
            .populate('offreId');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouvé'
            });
        }

        if (!internship.convention || internship.convention.statut !== 'SigneeRH') {
            return res.status(400).json({
                success: false,
                message: 'La convention n\'a pas encore été signée par le RH'
            });
        }

        internship.convention.statut = 'EnvoyeeEtudiant';
        internship.convention.dateEnvoi = new Date();

        await internship.save();

        logger.info(`Convention envoyée à l'étudiant pour le stage ${id}`);

        return res.status(200).json({
            success: true,
            message: 'Convention envoyée à l\'étudiant avec succès'
        });

    } catch (error) {
        logger.error(`Erreur sendConventionToStudent: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 5. ÉTUDIANT - TÉLÉCHARGER LA CONVENTION SIGNÉE
// ============================================
exports.downloadConvention = async (req, res) => {
    try {
        const { id } = req.params;

        const internship = await Internship.findById(id)
            .populate('etudiantId');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Stage non trouvé'
            });
        }

        if (internship.etudiantId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé à télécharger cette convention'
            });
        }

        if (!internship.convention || internship.convention.statut !== 'EnvoyeeEtudiant') {
            return res.status(400).json({
                success: false,
                message: 'La convention n\'est pas encore disponible au téléchargement'
            });
        }

        const filePath = internship.convention.chemin;
        if (!filePath) {
            return res.status(404).json({
                success: false,
                message: 'Fichier de convention non trouvé'
            });
        }

        res.download(filePath, 'Convention_Stage_Signee.pdf', (err) => {
            if (err) {
                logger.error(`Erreur téléchargement convention: ${err.message}`);
            }
        });

    } catch (error) {
        logger.error(`Erreur downloadConvention: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ✅ EXPORTS
// ============================================
module.exports = {
    getAllInternships,
    getInternshipById,
    getInternshipsBySupervisor,
    getInternshipsByStudent,
    getInternshipByApplication,
    createInternship,
    addRemark,
    evaluateIntern,
    closeInternship,
    addDeliverable,
    validateDeliverable,
    validateApplicationDocuments,
    sendToDirecteur,
    sendFicheSigneeToStudent,
    generateAttestation,
    uploadEngagementConfidentialite,
    generateEngagementConfidentialite,
    generateDemandeStage,
    sendEngagementToStudent,
    assignSupervisor,
    getDepartmentInternships,
    getInternshipReport,
    defineSubject,
    depotConvention,
    getDeposeesConventions,
    signConvention,
    sendConventionToStudent,
    downloadConvention,
};
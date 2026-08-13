// src/routes/internshipRoutes.js
// ✅ CORRECTION : Ajout de DEPARTEMENT dans authorize + route /application/:applicationId
// ✅ CORRECTION : Ajout de ROLES.ETUDIANT pour le téléchargement de l'engagement
// ✅ AJOUT : Route PATCH /:id/status pour mettre à jour le statut d'un stage
// ✅ AJOUT : Route POST /:id/send-demande-stage pour envoyer la demande à l'étudiant
// ✅ AJOUT : Route GET /:id/download-demande-stage pour télécharger la demande existante
// ✅ SUPPRESSION : Routes pour la gestion complète des conventions (signature)

const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const { logRequest, logAction } = require('../middlewares/logger');
const multer = require('multer');
const path = require('path');

// ============================================
// CONFIGURATION MULTER POUR L'UPLOAD
// ============================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/engagements/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'engagement_' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ============================================
// Toutes les routes nécessitent une authentification
// ============================================
router.use(authenticate());
router.use(logRequest);

// ============================================
// ✅ ROUTES POUR LE DÉPARTEMENT
// ============================================

// Récupérer les stages du département
router.get(
    '/department',
    authorize(ROLES.DEPARTEMENT),
    internshipController.getDepartmentInternships
);

// ✅ ROUTE : Récupérer un stage par application
router.get(
    '/application/:applicationId',
    authorize(ROLES.ETUDIANT, ROLES.DEPARTEMENT, ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_GET_BY_APPLICATION'),
    internshipController.getInternshipByApplication
);

// Affecter un encadrant (Département)
router.put(
    '/:id/assign-supervisor',
    authorize(ROLES.DEPARTEMENT, ROLES.ADMIN),
    logAction('INTERNSHIP_ASSIGN_SUPERVISOR'),
    internshipController.assignSupervisor
);

// Définir le sujet du stage (Département)
router.put(
    '/:id/define-subject',
    authorize(ROLES.DEPARTEMENT, ROLES.ADMIN),
    logAction('INTERNSHIP_DEFINE_SUBJECT'),
    internshipController.defineSubject
);

// Consulter le rapport de stage (Département, Encadrant, RH, Admin)
router.get(
    '/:id/report',
    authorize(ROLES.DEPARTEMENT, ROLES.ENCADRANT, ROLES.RH, ROLES.ADMIN),
    internshipController.getInternshipReport
);

// ============================================
// Routes pour Encadrant (ses propres stages)
// ============================================
router.get(
    '/my-internships',
    authorize(ROLES.ENCADRANT),
    internshipController.getInternshipsBySupervisor
);

// ============================================
// Routes pour Étudiant (ses propres stages)
// ============================================
router.get(
    '/student-internships',
    authorize(ROLES.ETUDIANT),
    internshipController.getInternshipsByStudent
);

// ============================================
// Routes pour Encadrant - Actions sur ses stages
// ============================================
router.post(
    '/:id/remarks',
    authorize(ROLES.ENCADRANT),
    logAction('INTERNSHIP_ADD_REMARK'),
    internshipController.addRemark
);

router.put(
    '/:id/evaluate',
    authorize(ROLES.ENCADRANT),
    logAction('INTERNSHIP_EVALUATE'),
    internshipController.evaluateIntern
);

router.put(
    '/:id/close',
    authorize(ROLES.ENCADRANT),
    logAction('INTERNSHIP_CLOSE'),
    internshipController.closeInternship
);

router.put(
    '/:id/validate-deliverable',
    authorize(ROLES.ENCADRANT),
    logAction('INTERNSHIP_VALIDATE_DELIVERABLE'),
    internshipController.validateDeliverable
);

// ============================================
// Routes pour Admin + RH + Encadrant
// ============================================
router.get(
    '/',
    authorize(ROLES.ADMIN, ROLES.RH, ROLES.ENCADRANT),
    internshipController.getAllInternships
);

router.get(
    '/:id',
    authorize(ROLES.ADMIN, ROLES.RH, ROLES.ENCADRANT, ROLES.ETUDIANT),
    internshipController.getInternshipById
);

// ============================================
// ✅ Routes pour Admin + RH + DEPARTEMENT
// ============================================
router.post(
    '/',
    authorize(ROLES.ADMIN, ROLES.RH, ROLES.DEPARTEMENT),
    logAction('INTERNSHIP_CREATE'),
    internshipController.createInternship
);

router.post(
    '/:id/deliverable',
    authorize(ROLES.ETUDIANT),
    logAction('INTERNSHIP_ADD_DELIVERABLE'),
    internshipController.addDeliverable
);

// ============================================
// ✅ ROUTES RH - GESTION DES CANDIDATURES ET STAGES
// ============================================

// Valider les documents de candidature
router.post(
    '/applications/:applicationId/validate',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_VALIDATE_APPLICATION'),
    internshipController.validateApplicationDocuments
);

// Envoyer la demande au Directeur
router.post(
    '/:id/send-to-directeur',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_SEND_TO_DIRECTEUR'),
    internshipController.sendToDirecteur
);

// Envoyer la fiche signée à l'étudiant
router.post(
    '/:id/send-fiche-signee',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_SEND_FICHE_SIGNEE'),
    internshipController.sendFicheSigneeToStudent
);

// Générer l'attestation
router.post(
    '/:id/generate-attestation',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_GENERATE_ATTESTATION'),
    internshipController.generateAttestation
);

// ✅ AJOUT : Mettre à jour le statut d'un stage (RH, Admin)
router.patch(
    '/:id/status',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_UPDATE_STATUS'),
    internshipController.updateInternshipStatus
);

// ============================================
// ✅ ROUTES RH - GÉNÉRATION ET ENVOI DE DOCUMENTS
// ============================================

// Générer l'engagement de confidentialité (téléchargement)
router.get(
    '/:id/generate-engagement',
    authorize(ROLES.ETUDIANT, ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_GENERATE_ENGAGEMENT'),
    internshipController.generateEngagementConfidentialite
);

// Envoyer l'engagement à l'étudiant par email
router.post(
    '/:id/send-engagement',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_SEND_ENGAGEMENT'),
    internshipController.sendEngagementToStudent
);

// Générer la demande de stage pour le Directeur (téléchargement)
router.get(
    '/:id/generate-demande-stage',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_GENERATE_DEMANDE_STAGE'),
    internshipController.generateDemandeStage
);

// ✅ AJOUTER : Envoyer la demande de stage à l'étudiant (RH)
router.post(
    '/:id/send-demande-stage',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_SEND_DEMANDE_STAGE'),
    internshipController.sendDemandeStageToStudent
);

// ✅ NOUVEAU : Télécharger la demande de stage existante (pour l'étudiant)
router.get(
    '/:id/download-demande-stage',
    authorize(ROLES.ETUDIANT, ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_DOWNLOAD_DEMANDE_STAGE'),
    internshipController.downloadDemandeStage
);

// ============================================
// ✅ ROUTES ÉTUDIANT - DÉPOT DES DOCUMENTS
// ============================================

// Déposer l'engagement de confidentialité signé
router.post(
    '/:id/upload-engagement',
    authorize(ROLES.ETUDIANT, ROLES.RH, ROLES.ADMIN),
    upload.single('document'),
    logAction('INTERNSHIP_UPLOAD_ENGAGEMENT'),
    internshipController.uploadEngagementConfidentialite
);

module.exports = router;
// src/routes/internshipRoutes.js
// ✅ CORRECTION : Routes convention avec ajout signature sur PDF

const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const conventionController = require('../controllers/conventionController');
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

const conventionStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/conventions/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'convention_' + uniqueSuffix + path.extname(file.originalname));
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
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadConvention = multer({
    storage: conventionStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ============================================
// Toutes les routes nécessitent une authentification
// ============================================
router.use(authenticate());
router.use(logRequest);

// ============================================
// ✅ ROUTES SPÉCIFIQUES - CONVENTION (PLACÉES AVANT /:id)
// ============================================

// Routes Convention - Étudiant
router.post(
    '/convention/deposer',
    authorize(ROLES.ETUDIANT),
    uploadConvention.single('convention'),
    logAction('CONVENTION_DEPOSER'),
    conventionController.deposerConvention
);

router.get(
    '/convention/status',
    authorize(ROLES.ETUDIANT),
    logAction('CONVENTION_STATUS'),
    conventionController.getConventionStatus
);

router.get(
    '/convention/download',
    authorize(ROLES.ETUDIANT),
    logAction('CONVENTION_DOWNLOAD'),
    conventionController.downloadConvention
);

// Routes Convention - RH
router.get(
    '/conventions/deposees',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_LIST'),
    conventionController.getConventionsDeposees
);

// ✅ Signer la convention (stockage signature en base64)
router.put(
    '/convention/:id/signer',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_SIGNER'),
    conventionController.signerConvention
);

// ✅ Ajouter la signature sur le PDF original
router.get(
    '/convention/:id/sign-pdf',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_SIGN_PDF'),
    conventionController.ajouterSignatureSurPDF
);

// Envoyer la convention signée à l'étudiant
router.put(
    '/convention/:id/envoyer-etudiant',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_ENVOYER_ETUDIANT'),
    conventionController.envoyerConventionEtudiant
);

// Télécharger une convention spécifique (RH)
router.get(
    '/convention/:id/download',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_DOWNLOAD_RH'),
    conventionController.downloadConventionRH
);

// ============================================
// ✅ ROUTES SPÉCIFIQUES - APPLICATION
// ============================================

router.get(
    '/application/:applicationId',
    authorize(ROLES.ETUDIANT, ROLES.DEPARTEMENT, ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_GET_BY_APPLICATION'),
    internshipController.getInternshipByApplication
);

router.post(
    '/applications/:applicationId/validate',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_VALIDATE_APPLICATION'),
    internshipController.validateApplicationDocuments
);

// ============================================
// ✅ ROUTES SPÉCIFIQUES - ENCADRANT
// ============================================

router.get(
    '/my-internships',
    authorize(ROLES.ENCADRANT),
    internshipController.getInternshipsBySupervisor
);

router.get(
    '/student-internships',
    authorize(ROLES.ETUDIANT),
    internshipController.getInternshipsByStudent
);

// ============================================
// ✅ ROUTES DÉPARTEMENT
// ============================================

router.get(
    '/department',
    authorize(ROLES.DEPARTEMENT),
    internshipController.getDepartmentInternships
);

// ============================================
// ✅ ROUTES GÉNÉRIQUES AVEC /:id (PLACÉES EN DERNIER)
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

router.post(
    '/',
    authorize(ROLES.ADMIN, ROLES.RH, ROLES.DEPARTEMENT),
    logAction('INTERNSHIP_CREATE'),
    internshipController.createInternship
);

router.put(
    '/:id/assign-supervisor',
    authorize(ROLES.DEPARTEMENT, ROLES.ADMIN),
    logAction('INTERNSHIP_ASSIGN_SUPERVISOR'),
    internshipController.assignSupervisor
);

router.put(
    '/:id/define-subject',
    authorize(ROLES.DEPARTEMENT, ROLES.ADMIN),
    logAction('INTERNSHIP_DEFINE_SUBJECT'),
    internshipController.defineSubject
);

router.get(
    '/:id/report',
    authorize(ROLES.DEPARTEMENT, ROLES.ENCADRANT, ROLES.RH, ROLES.ADMIN),
    internshipController.getInternshipReport
);

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

router.post(
    '/:id/deliverable',
    authorize(ROLES.ETUDIANT),
    logAction('INTERNSHIP_ADD_DELIVERABLE'),
    internshipController.addDeliverable
);

router.post(
    '/:id/send-to-directeur',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_SEND_TO_DIRECTEUR'),
    internshipController.sendToDirecteur
);

router.post(
    '/:id/send-fiche-signee',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_SEND_FICHE_SIGNEE'),
    internshipController.sendFicheSigneeToStudent
);

router.post(
    '/:id/generate-attestation',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_GENERATE_ATTESTATION'),
    internshipController.generateAttestation
);

router.patch(
    '/:id/status',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_UPDATE_STATUS'),
    internshipController.updateInternshipStatus
);

router.get(
    '/:id/generate-engagement',
    authorize(ROLES.ETUDIANT, ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_GENERATE_ENGAGEMENT'),
    internshipController.generateEngagementConfidentialite
);

router.post(
    '/:id/send-engagement',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_SEND_ENGAGEMENT'),
    internshipController.sendEngagementToStudent
);

router.get(
    '/:id/generate-demande-stage',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_GENERATE_DEMANDE_STAGE'),
    internshipController.generateDemandeStage
);

router.post(
    '/:id/send-demande-stage',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_SEND_DEMANDE_STAGE'),
    internshipController.sendDemandeStageToStudent
);

router.get(
    '/:id/download-demande-stage',
    authorize(ROLES.ETUDIANT, ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_DOWNLOAD_DEMANDE_STAGE'),
    internshipController.downloadDemandeStage
);

router.post(
    '/:id/upload-engagement',
    authorize(ROLES.ETUDIANT, ROLES.RH, ROLES.ADMIN),
    upload.single('document'),
    logAction('INTERNSHIP_UPLOAD_ENGAGEMENT'),
    internshipController.uploadEngagementConfidentialite
);

module.exports = router;
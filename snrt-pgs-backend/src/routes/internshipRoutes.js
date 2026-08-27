// src/routes/internshipRoutes.js
// ✅ ORDRE CORRIGÉ : Routes spécifiques AVANT /:id
// ✅ TOUTES LES ROUTES AVEC PARAMÈTRES SONT AVANT /:id
// ✅ CHEMINS AVEC EXTENSIONS .js POUR ÉVITER LES ERREURS

const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController.js');
const conventionController = require('../controllers/conventionController.js');
const { authenticate, authorize } = require('../middlewares/auth.js');
const { ROLES } = require('../config/constants.js');
const { logRequest, logAction } = require('../middlewares/logger.js');
const multer = require('multer');
const path = require('path');

// ============================================
// CONFIGURATION MULTER
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

const timelineStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/timeline/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'timeline_' + uniqueSuffix + path.extname(file.originalname));
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

const timelineFileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non accepté'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadTimeline = multer({
    storage: timelineStorage,
    fileFilter: timelineFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadConvention = multer({
    storage: conventionStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ============================================
// AUTHENTIFICATION
// ============================================
router.use(authenticate());
router.use(logRequest);

// ============================================
// ✅ ROUTES SANS PARAMÈTRES (SPÉCIFIQUES)
// ============================================

// 📌 ROUTES ÉTUDIANT
router.get(
    '/student/has-active',
    authorize(ROLES.ETUDIANT),
    logAction('STUDENT_HAS_ACTIVE_INTERNSHIP'),
    internshipController.hasActiveInternship
);

router.get(
    '/student',
    authorize(ROLES.ETUDIANT),
    logAction('STUDENT_GET_INTERNSHIPS'),
    internshipController.getStudentInternships
);

// 📌 ROUTES ENCADRANT
router.get(
    '/supervisor',
    authorize(ROLES.ENCADRANT),
    logAction('SUPERVISOR_GET_INTERNSHIPS'),
    internshipController.getSupervisorInternships
);

// 📌 ROUTES APPLICATION
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

// 📌 ROUTES DÉPARTEMENT
router.get(
    '/department',
    authorize(ROLES.DEPARTEMENT),
    internshipController.getDepartmentInternships
);

// 📌 ROUTES ENCADRANT (DEPRECATED)
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

// 📌 ROUTES CONVENTION (ANCIENNES - SANS ID)
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

router.get(
    '/conventions/deposees',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_LIST'),
    conventionController.getConventionsDeposees
);

router.put(
    '/convention/:id/signer',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_SIGNER'),
    conventionController.signerConvention
);

router.get(
    '/convention/:id/sign-pdf',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_SIGN_PDF'),
    conventionController.ajouterSignatureSurPDF
);

router.put(
    '/convention/:id/envoyer-etudiant',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_ENVOYER_ETUDIANT'),
    conventionController.envoyerConventionEtudiant
);

router.get(
    '/convention/:id/download',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_DOWNLOAD_RH'),
    conventionController.downloadConventionRH
);

// ============================================
// ✅ ROUTES AVEC PARAMÈTRES :id (AVANT /:id)
// ============================================

// 📌 TIMELINE
router.get(
    '/:id/timeline',
    authorize(ROLES.ETUDIANT, ROLES.ENCADRANT, ROLES.DEPARTEMENT, ROLES.RH, ROLES.ADMIN),
    logAction('TIMELINE_GET'),
    internshipController.getTimeline
);

router.post(
    '/:id/timeline',
    authorize(ROLES.ETUDIANT, ROLES.ENCADRANT, ROLES.DEPARTEMENT, ROLES.RH, ROLES.ADMIN),
    uploadTimeline.single('file'),
    logAction('TIMELINE_POST'),
    internshipController.postTimelineMessage
);

router.delete(
    '/:id/timeline/:messageId',
    authorize(ROLES.ETUDIANT, ROLES.ENCADRANT, ROLES.ADMIN),
    logAction('TIMELINE_DELETE'),
    internshipController.deleteTimelineMessage
);

// 📌 CONVENTION
router.get(
    '/:id/convention',
    authorize(ROLES.ETUDIANT, ROLES.ENCADRANT, ROLES.DEPARTEMENT, ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_GET'),
    conventionController.getConventionStatus
);

router.post(
    '/:id/convention',
    authorize(ROLES.ETUDIANT),
    uploadConvention.single('convention'),
    logAction('CONVENTION_UPLOAD'),
    conventionController.uploadConvention
);

router.get(
    '/:id/convention/download',
    authorize(ROLES.ETUDIANT, ROLES.ENCADRANT, ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_DOWNLOAD'),
    conventionController.downloadConvention
);

router.put(
    '/:id/convention/sign',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('CONVENTION_SIGN'),
    conventionController.signConvention
);

// 📌 LIVRABLES
router.get(
    '/:id/livrables',
    authorize(ROLES.ETUDIANT, ROLES.ENCADRANT, ROLES.DEPARTEMENT, ROLES.RH, ROLES.ADMIN),
    logAction('LIVRABLES_GET'),
    internshipController.getLivrables
);

router.post(
    '/:id/livrables',
    authorize(ROLES.ETUDIANT),
    upload.single('livrable'),
    logAction('LIVRABLES_POST'),
    internshipController.addDeliverable
);

router.put(
    '/:id/livrables/:livrableId/validate',
    authorize(ROLES.ENCADRANT),
    logAction('LIVRABLES_VALIDATE'),
    internshipController.validateDeliverable
);

// 📌 ÉVALUATION
router.get(
    '/:id/evaluation',
    authorize(ROLES.ETUDIANT, ROLES.ENCADRANT, ROLES.DEPARTEMENT, ROLES.RH, ROLES.ADMIN),
    logAction('EVALUATION_GET'),
    internshipController.getEvaluation
);

router.put(
    '/:id/evaluation',
    authorize(ROLES.ENCADRANT),
    logAction('EVALUATION_PUT'),
    internshipController.updateEvaluation
);

// 📌 ENGAGEMENT
router.get(
    '/:id/generate-engagement',
    authorize(ROLES.ETUDIANT, ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_GENERATE_ENGAGEMENT'),
    internshipController.generateEngagementConfidentialite
);

router.post(
    '/:id/upload-engagement',
    authorize(ROLES.ETUDIANT, ROLES.RH, ROLES.ADMIN),
    upload.single('document'),
    logAction('INTERNSHIP_UPLOAD_ENGAGEMENT'),
    internshipController.uploadEngagementConfidentialite
);

router.post(
    '/:id/send-engagement',
    authorize(ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_SEND_ENGAGEMENT'),
    internshipController.sendEngagementToStudent
);

// 📌 DEMANDE DE STAGE
router.get(
    '/:id/download-demande-stage',
    authorize(ROLES.ETUDIANT, ROLES.RH, ROLES.ADMIN),
    logAction('INTERNSHIP_DOWNLOAD_DEMANDE_STAGE'),
    internshipController.downloadDemandeStage
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

// 📌 AUTRES ACTIONS AVEC PARAMÈTRES
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

// ============================================
// ✅ ROUTE GÉNÉRIQUE /:id (PLACÉE EN DERNIER)
// ============================================

// 📌 Récupérer tous les stages
router.get(
    '/',
    authorize(ROLES.ADMIN, ROLES.RH, ROLES.ENCADRANT),
    internshipController.getAllInternships
);

// 📌 Récupérer un stage par ID (EN DERNIER)
router.get(
    '/:id',
    authorize(ROLES.ADMIN, ROLES.RH, ROLES.ENCADRANT, ROLES.ETUDIANT),
    internshipController.getInternshipById
);

// 📌 Créer un stage
router.post(
    '/',
    authorize(ROLES.ADMIN, ROLES.RH, ROLES.DEPARTEMENT),
    logAction('INTERNSHIP_CREATE'),
    internshipController.createInternship
);

module.exports = router;
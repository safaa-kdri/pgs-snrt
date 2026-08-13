// src/routes/applicationRoutes.js
// ✅ CORRECTION : Suppression des routes pour les fonctions de workflow supprimées
// ✅ CONSERVÉ : getWorkflowState pour la consultation des candidatures existantes

const express = require('express');
const router = express.Router();

const applicationController = require('../controllers/applicationController');
const validate = require('../middlewares/validation');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const {
  createApplicationSchema,
  updateApplicationSchema,
  changeApplicationStatusSchema,
  addDocumentToApplicationSchema,
} = require('../utils/validators');

router.use(authenticate());

// ============================================
// ROUTES EXISTANTES
// ============================================

// ✅ ROUTE POUR LE DÉPARTEMENT - Ses candidatures
router.get(
  '/department',
  authorize(ROLES.DEPARTEMENT),
  applicationController.getDepartmentApplications
);

// ✅ Création directe d'une candidature (avec statut "Soumise")
router.post(
  '/',
  validate(createApplicationSchema),
  applicationController.createApplication
);

router.get('/', applicationController.getAllApplications);
router.get('/:id', applicationController.getApplicationById);
router.put('/:id', validate(updateApplicationSchema), applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

// Soumettre une candidature (depuis brouillon)
router.patch('/:id/submit', applicationController.submitApplication);

// Changer le statut d'une candidature (RH / Département / Admin)
router.patch(
  '/:id/status',
  validate(changeApplicationStatusSchema),
  applicationController.changeApplicationStatus
);

router.get('/:id/history', applicationController.getApplicationHistory);
router.patch(
  '/:id/documents',
  validate(addDocumentToApplicationSchema),
  applicationController.addDocumentToApplication
);

// ============================================
// ✅ CONSERVÉE - Récupérer l'état du workflow
// ============================================

// Récupérer l'état du workflow pour une candidature existante
router.get(
  '/:id/workflow/state',
  authorize(ROLES.ETUDIANT, ROLES.RH, ROLES.DEPARTEMENT, ROLES.ADMIN),
  applicationController.getWorkflowState
);



module.exports = router;
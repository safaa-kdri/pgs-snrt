// src/routes/applicationRoutes.js
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

router.post('/', validate(createApplicationSchema), applicationController.createApplication);
router.get('/', applicationController.getAllApplications);
router.get('/:id', applicationController.getApplicationById);
router.put('/:id', validate(updateApplicationSchema), applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

router.patch('/:id/submit', applicationController.submitApplication);
router.patch('/:id/status', validate(changeApplicationStatusSchema), applicationController.changeApplicationStatus);
router.get('/:id/history', applicationController.getApplicationHistory);
router.patch('/:id/documents', validate(addDocumentToApplicationSchema), applicationController.addDocumentToApplication);

// ============================================
// ✅ NOUVELLES ROUTES - WORKFLOW DE CANDIDATURE EN 3 ÉTAPES
// ============================================

// ÉTAPE 1 - Sauvegarder les informations universitaires
router.post(
  '/:id/workflow/etape1',
  authorize(ROLES.ETUDIANT),
  applicationController.saveEtape1
);

// ÉTAPE 2 - Sauvegarder l'acceptation de l'engagement
router.post(
  '/:id/workflow/etape2',
  authorize(ROLES.ETUDIANT),
  applicationController.saveEtape2
);

// ÉTAPE 3 - Soumettre la candidature complète
router.post(
  '/:id/workflow/submit',
  authorize(ROLES.ETUDIANT),
  applicationController.submitWorkflow
);

// Récupérer l'état du workflow
router.get(
  '/:id/workflow/state',
  authorize(ROLES.ETUDIANT, ROLES.RH, ROLES.DEPARTEMENT, ROLES.ADMIN),
  applicationController.getWorkflowState
);

module.exports = router;
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

module.exports = router;
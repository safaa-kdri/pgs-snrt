// src/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();

const applicationController = require('../controllers/applicationController');
const validate = require('../middlewares/validation');
const { authenticate } = require('../middlewares/auth');
const {
  createApplicationSchema,
  updateApplicationSchema,
  changeApplicationStatusSchema,
  addDocumentToApplicationSchema,
} = require('../utils/validators');

router.use(authenticate());

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
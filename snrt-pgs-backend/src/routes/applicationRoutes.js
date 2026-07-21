// src/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();

const applicationController = require('../controllers/applicationController');

router.post('/', applicationController.createApplication);
router.get('/', applicationController.getAllApplications);
router.get('/:id', applicationController.getApplicationById);
router.put('/:id', applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

router.patch('/:id/submit', applicationController.submitApplication);
router.patch('/:id/status', applicationController.changeApplicationStatus);
router.get('/:id/history', applicationController.getApplicationHistory);
router.patch('/:id/documents', applicationController.addDocumentToApplication);

module.exports = router;
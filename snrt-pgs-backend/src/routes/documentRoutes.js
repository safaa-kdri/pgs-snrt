// src/routes/documentRoutes.js
const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate());

router.post(
    '/',
    upload.single('document'),
    documentController.uploadDocument
);

router.post(
    '/applications/:applicationId',
    upload.single('document'),
    documentController.uploadDocumentForApplication
);

router.get('/applications/:applicationId', documentController.getApplicationDocuments);
router.get('/:id', documentController.getDocumentById);
router.delete('/:id', documentController.deleteDocument);
router.patch('/:id/verify', documentController.verifyDocument);

module.exports = router;
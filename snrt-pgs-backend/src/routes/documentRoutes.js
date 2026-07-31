// src/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middlewares/auth');

// Configuration Multer en mémoire
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non autorisé'), false);
        }
    }
});

router.use(authenticate());

// Upload
router.post('/', upload.single('document'), documentController.uploadDocument);

// Téléchargement et prévisualisation
router.get('/file/:fileId', documentController.downloadDocument);
router.get('/file/:fileId/preview', documentController.previewDocument);

// CRUD
router.get('/:id', documentController.getDocumentById);
router.delete('/:id', documentController.deleteDocument);
router.patch('/:id/verify', documentController.verifyDocument);

module.exports = router;
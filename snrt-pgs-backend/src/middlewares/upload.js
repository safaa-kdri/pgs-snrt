// src/middlewares/upload.js
const multer = require('multer');
const path = require('path');
const { createDiskStorage } = require('../utils/diskStorage');

const uploadDir = path.join(__dirname, '../../uploads/documents');

const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
];

const storage = createDiskStorage(uploadDir);

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
        return cb(new Error('Extension de fichier non autorisée'), false);
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Type MIME non autorisé'), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = upload;
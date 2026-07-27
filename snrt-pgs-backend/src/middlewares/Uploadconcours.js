// src/middlewares/uploadConcours.js
const multer = require('multer');
const path = require('path');
const { createDiskStorage } = require('../utils/diskStorage');


const uploadDir = path.join(__dirname, '../../uploads/concours');

const storage = createDiskStorage(uploadDir);

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension !== '.pdf' || file.mimetype !== 'application/pdf') {
        return cb(new Error('Seuls les fichiers PDF sont acceptes pour les documents de concours.'), false);
    }

    cb(null, true);
};

const uploadConcours = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = uploadConcours;
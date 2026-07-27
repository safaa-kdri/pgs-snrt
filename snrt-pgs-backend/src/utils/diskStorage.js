// src/utils/diskStorage.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createDiskStorage = (destinationDir) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
      }
      cb(null, destinationDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]/g, '-');
      cb(null, `${basename}-${uniqueSuffix}${ext}`);
    },
  });
};

module.exports = {
  createDiskStorage,
};
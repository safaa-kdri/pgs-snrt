// src/services/gridfsService.js
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const logger = require('../utils/logger');

let gridfsBucket = null;

// ============================================
// INITIALISER GRIDFS
// ============================================
const initGridFS = () => {
    if (!gridfsBucket) {
        const db = mongoose.connection.db;
        gridfsBucket = new GridFSBucket(db, {
            bucketName: 'documents'
        });
        logger.info('✅ GridFS initialisé');
    }
    return gridfsBucket;
};

// ============================================
// UPLOADER UN FICHIER
// ============================================
const uploadFile = (buffer, filename, contentType) => {
    return new Promise((resolve, reject) => {
        const bucket = initGridFS();
        
        // ✅ CORRECTION : Créer le stream et gérer les événements correctement
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: contentType || 'application/octet-stream',
        });

        // ✅ Gestionnaire d'erreur
        uploadStream.on('error', (error) => {
            logger.error(`Erreur upload GridFS: ${error.message}`);
            reject(error);
        });

        // ✅ Gestionnaire de fin - RÉCUPÉRATION DU FILE CORRECTEMENT
        uploadStream.on('finish', (file) => {
            // file est l'objet retourné par GridFS avec _id
            if (file && file._id) {
                logger.info(`Fichier uploadé: ${filename} (ID: ${file._id})`);
                resolve(file);
            } else {
                // Fallback : récupérer l'ID depuis le stream
                const fileId = uploadStream.id;
                if (fileId) {
                    logger.info(`Fichier uploadé: ${filename} (ID: ${fileId})`);
                    resolve({ _id: fileId, filename: filename });
                } else {
                    reject(new Error('Impossible de récupérer l\'ID du fichier uploadé'));
                }
            }
        });

        // Écrire le buffer
        uploadStream.write(buffer);
        uploadStream.end();
    });
};

// ============================================
// UPLOADER UN BUFFER (ALIAS)
// ============================================
const uploadBuffer = uploadFile;

// ============================================
// TÉLÉCHARGER UN FICHIER
// ============================================
const downloadFile = (fileId) => {
    const bucket = initGridFS();
    return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
};

// ============================================
// SUPPRIMER UN FICHIER
// ============================================
const deleteFile = async (fileId) => {
    const bucket = initGridFS();
    try {
        await bucket.delete(new mongoose.Types.ObjectId(fileId));
        logger.info(`Fichier supprimé: ${fileId}`);
        return true;
    } catch (error) {
        logger.error(`Erreur suppression: ${error.message}`);
        return false;
    }
};

// ============================================
// RÉCUPÉRER UN FICHIER EN BASE64
// ============================================
const getFileAsBase64 = async (fileId) => {
    return new Promise((resolve, reject) => {
        const bucket = initGridFS();
        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
        const chunks = [];

        downloadStream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        downloadStream.on('error', (error) => {
            reject(error);
        });

        downloadStream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve(buffer.toString('base64'));
        });
    });
};

// ============================================
// SUPPRIMER PAR ID (ALIAS)
// ============================================
const deleteById = deleteFile;

module.exports = {
    initGridFS,
    uploadFile,
    uploadBuffer,
    downloadFile,
    deleteFile,
    deleteById,
    getFileAsBase64,
};
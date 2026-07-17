// src/middlewares/errorHandler.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    logger.error(`💥 Error: ${error.message}`);
    logger.error(`📍 Path: ${req.originalUrl}`);
    logger.error(`📋 Stack: ${err.stack}`);

    // Duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        error = { statusCode: 400, message: `Le champ "${field}" existe déjà.` };
    }

    // Validation Error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error = { statusCode: 400, message: messages.join(', ') };
    }

    // Cast Error
    if (err.name === 'CastError') {
        error = { statusCode: 404, message: `ID invalide: ${err.value}` };
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        error = { statusCode: 401, message: 'Token invalide. Veuillez vous reconnecter.' };
    }

    if (err.name === 'TokenExpiredError') {
        error = { statusCode: 401, message: 'Token expiré. Veuillez vous reconnecter.' };
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Erreur interne du serveur';

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.originalUrl
    });
};

module.exports = errorHandler;
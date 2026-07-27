// src/middlewares/errorHandler.js
const logger = require('../utils/logger');
const { CONFIG } = require('../config/constants');


const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode;
    let message = err.message;
    let details = err.details;
    let isOperational = err.isOperational || false;

    // Cle dupliquee (index unique Mongo, ex: email/CIN/nom deja utilise)
    if (err.code === 11000) {
        const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'valeur';
        statusCode = 400;
        message = `Le champ "${field}" existe déjà.`;
        details = undefined;
        isOperational = true;
    }

    // Erreur de validation Mongoose (ex: contrainte de schema violee)
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        statusCode = 400;
        message = messages.join(', ');
        details = messages;
        isOperational = true;
    }

    // ObjectId invalide dans un parametre d'URL
    if (err.name === 'CastError') {
        statusCode = 404;
        message = `ID invalide: ${err.value}`;
        details = undefined;
        isOperational = true;
    }

    // JWT
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token invalide. Veuillez vous reconnecter.';
        isOperational = true;
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expiré. Veuillez vous reconnecter.';
        isOperational = true;
    }

    statusCode = statusCode || 500;

    if (!isOperational) {
        logger.error(`[Unhandled] ${err.message}\nPath: ${req.originalUrl}\n${err.stack}`);
    } else {
        logger.error(`[Operational] ${statusCode} ${req.method} ${req.originalUrl} - ${message}`);
    }

    const response = {
        success: false,
        message: isOperational ? message : 'Erreur interne du serveur.',
    };
    if (isOperational && details) response.details = details;
    if (CONFIG.nodeEnv === 'development' && !isOperational) response.stack = err.stack;

    res.status(statusCode).json(response);
};

module.exports = errorHandler;

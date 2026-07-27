// src/middlewares/logger.js
const logger = require('../utils/logger');

// ============================================
// Middleware de logging des requêtes HTTP
// ============================================
exports.logRequest = (req, res, next) => {
    const start = Date.now();
    
    // Capturer la réponse pour loguer le statut et la durée
    const oldSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        
        // Log de la requête
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent') || 'unknown',
            user: req.user?.email || req.user?.cin || 'anonymous',
            userId: req.user?._id || null
        });
        
        // Si erreur (status >= 400), log plus détaillé
        if (res.statusCode >= 400) {
            logger.warn({
                method: req.method,
                url: req.url,
                status: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip,
                user: req.user?.email || 'anonymous',
                body: req.body,
                query: req.query,
                params: req.params
            });
        }
        
        oldSend.apply(res, arguments);
    };
    
    next();
};

// ============================================
// Log des actions sensibles (CRUD, validation, etc.)
// ============================================
exports.logAction = (action, details = {}) => {
    return (req, res, next) => {
        // Stocker l'action pour le log après la réponse
        req._action = action;
        req._actionDetails = {
            ...details,
            ip: req.ip,
            user: req.user?.email || 'anonymous',
            userId: req.user?._id || null,
            timestamp: new Date().toISOString()
        };
        
        // Capturer la réponse pour loguer le résultat
        const oldSend = res.send;
        res.send = function(data) {
            const success = res.statusCode >= 200 && res.statusCode < 300;
            
            logger.info({
                action: req._action,
                status: res.statusCode,
                success: success,
                ...req._actionDetails,
                response: success ? undefined : data // Ne pas loguer les données sensibles en erreur
            });
            
            oldSend.apply(res, arguments);
        };
        
        next();
    };
};

// ============================================
// Log des actions de sécurité (tentatives de connexion, etc.)
// ============================================
exports.logSecurity = (action, details = {}) => {
    logger.warn({
        type: 'SECURITY',
        action: action,
        ...details,
        timestamp: new Date().toISOString()
    });
};

// ============================================
// Log des accès refusés (403, 401)
// ============================================
exports.logAccessDenied = (req, res, next) => {
    const oldSend = res.send;
    res.send = function(data) {
        if (res.statusCode === 401 || res.statusCode === 403) {
            logger.warn({
                type: 'ACCESS_DENIED',
                status: res.statusCode,
                method: req.method,
                url: req.url,
                ip: req.ip,
                user: req.user?.email || 'anonymous',
                role: req.user?.roleId?.nom || 'none',
                timestamp: new Date().toISOString()
            });
        }
        oldSend.apply(res, arguments);
    };
    next();
};

// ============================================
// Log des requêtes sensibles (avec body complet)
// ============================================
exports.logSensitiveRequest = (req, res, next) => {
    // Ne pas loguer les mots de passe
    const safeBody = { ...req.body };
    if (safeBody.motDePasse) safeBody.motDePasse = '********';
    if (safeBody.password) safeBody.password = '********';
    if (safeBody.confirmationMotDePasse) safeBody.confirmationMotDePasse = '********';
    
    logger.info({
        type: 'SENSITIVE_REQUEST',
        method: req.method,
        url: req.url,
        ip: req.ip,
        user: req.user?.email || 'anonymous',
        body: safeBody
    });
    
    next();
};

// ============================================
// Middleware de logging des erreurs
// ============================================
exports.logError = (err, req, res, next) => {
    logger.error({
        type: 'ERROR',
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        ip: req.ip,
        user: req.user?.email || 'anonymous',
        body: req.body,
        query: req.query,
        params: req.params,
        timestamp: new Date().toISOString()
    });
    next(err);
};
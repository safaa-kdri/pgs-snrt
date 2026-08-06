// src/middlewares/audit.js
const AuditService = require('../services/auditService');

/**
 * Middleware pour logger automatiquement les actions
 */
const auditLog = (options = {}) => {
  return async (req, res, next) => {
    // ✅ Capturer la réponse pour connaître le statut
    const oldSend = res.send;
    res.send = function(data) {
      // Vérifier si l'action a réussi
      const status = res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILED';
      
      // Récupérer les infos utilisateur
      const user = req.user || {};
      const userId = user.id || user._id;
      const userModel = user.userType === 'interne' ? 'UtilisateurInterne' : 'UtilisateurExterne';
      const userEmail = user.email || 'unknown';
      const userNom = user.nom ? `${user.prenom || ''} ${user.nom}`.trim() : 'Utilisateur inconnu';
      const userRole = user.role || user.userType || 'Utilisateur';

      // Logger l'action
      AuditService.log({
        userId,
        userModel,
        userEmail,
        userNom,
        userRole,
        action: options.action || 'API_CALL',
        actionLabel: options.label || 'Action API',
        module: options.module || 'API',
        details: {
          method: req.method,
          url: req.originalUrl,
          params: req.params,
          query: req.query,
          body: req.body,
          responseStatus: res.statusCode
        },
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('user-agent'),
        status
      }).catch(err => console.error('Erreur audit:', err));

      oldSend.apply(res, arguments);
    };

    next();
  };
};

/**
 * Logger spécifique pour les actions CRUD
 */
const auditCRUD = (entity, action) => {
  return async (req, res, next) => {
    const user = req.user || {};
    const userId = user.id || user._id;
    const userModel = user.userType === 'interne' ? 'UtilisateurInterne' : 'UtilisateurExterne';
    const userEmail = user.email || 'unknown';
    const userNom = user.nom ? `${user.prenom || ''} ${user.nom}`.trim() : 'Utilisateur inconnu';
    const userRole = user.role || user.userType || 'Utilisateur';

    const actionMap = {
      create: 'CREATED',
      update: 'UPDATED',
      delete: 'DELETED',
      view: 'VIEWED',
      submit: 'SUBMITTED',
      validate: 'VALIDATED',
      reject: 'REJECTED',
      publish: 'PUBLISHED',
      archive: 'ARCHIVED'
    };

    const actionCode = actionMap[action] || 'ACTION';
    const actionLabel = `${entity} ${actionMap[action] || 'Action'}`;

    // Stocker les infos pour le log
    req._audit = {
      userId,
      userModel,
      userEmail,
      userNom,
      userRole,
      action: `${entity.toUpperCase()}_${actionCode}`,
      actionLabel,
      module: entity,
      targetId: req.params.id || req.body._id || null,
      targetType: entity,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent')
    };

    next();
  };
};

/**
 * Logger pour les actions de connexion
 */
const auditAuth = async (req, res, next) => {
  const user = req.user || {};
  const userId = user.id || user._id || 'anonymous';
  const userModel = user.userType === 'interne' ? 'UtilisateurInterne' : 'UtilisateurExterne';
  const userEmail = user.email || req.body?.email || 'unknown';
  const userNom = user.nom ? `${user.prenom || ''} ${user.nom}`.trim() : 'Utilisateur inconnu';
  const userRole = user.role || user.userType || 'Utilisateur';

  const action = req.path.includes('login') ? 'LOGIN_ATTEMPT' : 'AUTH_ACTION';
  const label = req.path.includes('login') ? 'Tentative de connexion' : 'Action d\'authentification';

  // Log après la réponse
  const oldSend = res.send;
  res.send = function(data) {
    const status = res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILED';
    
    const isLogin = req.path.includes('login');
    const isLogout = req.path.includes('logout');
    let actionCode = 'AUTH_ACTION';
    let actionLabel = 'Action d\'authentification';
    
    if (isLogin) {
      actionCode = status === 'SUCCESS' ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED';
      actionLabel = status === 'SUCCESS' ? 'Connexion réussie' : 'Tentative de connexion échouée';
    } else if (isLogout) {
      actionCode = 'LOGOUT';
      actionLabel = 'Déconnexion';
    }

    AuditService.log({
      userId: userId !== 'anonymous' ? userId : null,
      userModel,
      userEmail,
      userNom,
      userRole,
      action: actionCode,
      actionLabel,
      module: 'Auth',
      details: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        status: res.statusCode
      },
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
      status
    }).catch(err => console.error('Erreur audit:', err));

    oldSend.apply(res, arguments);
  };

  next();
};

module.exports = {
  auditLog,
  auditCRUD,
  auditAuth
};
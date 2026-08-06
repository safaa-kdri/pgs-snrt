// src/services/auditService.js
const Log = require('../models/Log');
const logger = require('../utils/logger');

// ✅ MAP DES ACTIONS VERS DES LIBELLÉS
const ACTION_LABELS = {
  'LOGIN_SUCCESS': 'Connexion réussie',
  'LOGIN_FAILED': 'Tentative de connexion échouée',
  'LOGOUT': 'Déconnexion',
  'REGISTER': 'Inscription',
  'PASSWORD_CHANGED': 'Mot de passe modifié',
  'PASSWORD_RESET': 'Mot de passe réinitialisé',
  '2FA_VERIFIED': 'Vérification 2FA réussie',
  'OFFER_CREATED': 'Offre créée',
  'OFFER_UPDATED': 'Offre modifiée',
  'OFFER_SUBMITTED': 'Offre soumise',
  'OFFER_VALIDATED': 'Offre validée',
  'OFFER_PUBLISHED': 'Offre publiée',
  'OFFER_REJECTED': 'Offre refusée',
  'OFFER_ARCHIVED': 'Offre archivée',
  'OFFER_DELETED': 'Offre supprimée',
  'APPLICATION_CREATED': 'Candidature créée',
  'APPLICATION_SUBMITTED': 'Candidature soumise',
  'APPLICATION_STATUS_CHANGED': 'Statut modifié',
  'APPLICATION_DELETED': 'Candidature supprimée',
  'INTERVIEW_CREATED': 'Entretien planifié',
  'INTERVIEW_UPDATED': 'Entretien modifié',
  'INTERVIEW_CANCELLED': 'Entretien annulé',
  'INTERNSHIP_CREATED': 'Stage créé',
  'INTERNSHIP_CLOSED': 'Stage clôturé',
  'INTERNSHIP_EVALUATED': 'Stagiaire évalué',
  'USER_CREATED': 'Utilisateur créé',
  'USER_UPDATED': 'Utilisateur modifié',
  'USER_DELETED': 'Utilisateur supprimé',
  'USER_STATUS_CHANGED': 'Statut modifié',
  'USER_ROLE_CHANGED': 'Rôle modifié',
  'DOCUMENT_UPLOADED': 'Document uploadé',
  'DOCUMENT_DELETED': 'Document supprimé',
  'DOCUMENT_VERIFIED': 'Document vérifié',
  'ADMIN_ACTION': 'Action administrateur',
  'SYSTEM_ACTION': 'Action système',
};

class AuditService {
  static getActionLabel(action) {
    return ACTION_LABELS[action] || action || 'Action';
  }

  static async log({
    userId,
    userModel,
    userEmail,
    userNom,
    userRole,
    action,
    actionLabel = null,
    module,
    details = {},
    targetId = null,
    targetType = null,
    ip = null,
    userAgent = null,
    status = 'SUCCESS'
  }) {
    try {
      const finalLabel = actionLabel || AuditService.getActionLabel(action);

      const log = await Log.create({
        userId,
        userModel,
        userEmail,
        userNom,
        userRole,
        action,
        actionLabel: finalLabel,
        module,
        details,
        targetId,
        targetType,
        ip,
        userAgent,
        status
      });

      logger.audit(`[${module}] ${finalLabel} - ${userEmail}`, {
        action,
        userId: userId?.toString(),
        status
      });

      return log;
    } catch (error) {
      logger.error(`[AuditService] Erreur: ${error.message}`);
      return null;
    }
  }

  static async getLogs({ page = 1, limit = 20, userId, action, module, startDate, endDate, search } = {}) {
    const filter = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (module) filter.module = module;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { userNom: { $regex: search, $options: 'i' } },
        { actionLabel: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      Log.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Log.countDocuments(filter)
    ]);

    return { data: logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  static async getRecentLogs(limit = 10) {
    return Log.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  }
}

module.exports = AuditService;
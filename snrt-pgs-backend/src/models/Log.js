// src/models/Log.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  // ✅ Qui a fait l'action
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'userModel',
    required: true 
  },
  userModel: { 
    type: String, 
    enum: ['UtilisateurInterne', 'UtilisateurExterne'],
    required: true 
  },
  userEmail: { type: String, required: true },
  userNom: { type: String, required: true },
  userRole: { type: String, default: 'Utilisateur' },

  // ✅ Quoi
  action: { 
    type: String, 
    required: true,
    enum: [
      // Auth
      'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'REGISTER',
      'PASSWORD_CHANGED', 'PASSWORD_RESET', '2FA_VERIFIED',
      
      // Offres
      'OFFER_CREATED', 'OFFER_UPDATED', 'OFFER_SUBMITTED', 
      'OFFER_VALIDATED', 'OFFER_PUBLISHED', 'OFFER_REJECTED', 
      'OFFER_ARCHIVED', 'OFFER_DELETED',
      
      // Candidatures
      'APPLICATION_CREATED', 'APPLICATION_SUBMITTED', 
      'APPLICATION_STATUS_CHANGED', 'APPLICATION_DELETED',
      
      // Entretiens
      'INTERVIEW_CREATED', 'INTERVIEW_UPDATED', 'INTERVIEW_CANCELLED',
      
      // Stages
      'INTERNSHIP_CREATED', 'INTERNSHIP_CLOSED', 'INTERNSHIP_EVALUATED',
      
      // Utilisateurs
      'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 
      'USER_STATUS_CHANGED', 'USER_ROLE_CHANGED',
      
      // Documents
      'DOCUMENT_UPLOADED', 'DOCUMENT_DELETED', 'DOCUMENT_VERIFIED',
      
      // Autres
      'ADMIN_ACTION', 'SYSTEM_ACTION'
    ]
  },
  actionLabel: { type: String, required: true }, // Description lisible
  module: { 
    type: String, 
    required: true,
    enum: ['Auth', 'Offres', 'Candidatures', 'Entretiens', 'Stages', 'Utilisateurs', 'Documents', 'Systeme', 'Admin']
  },

  // ✅ Détails
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  targetId: { type: String, default: null }, // ID de l'entité concernée
  targetType: { type: String, default: null }, // Type de l'entité (Offer, Application, etc.)

  // ✅ Contexte
  ip: { type: String, default: null },
  userAgent: { type: String, default: null },

  // ✅ Statut
  status: { 
    type: String, 
    enum: ['SUCCESS', 'FAILED', 'WARNING'],
    default: 'SUCCESS'
  },

  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ✅ Index pour les recherches rapides
logSchema.index({ userId: 1 });
logSchema.index({ action: 1 });
logSchema.index({ module: 1 });
logSchema.index({ createdAt: -1 });
logSchema.index({ userEmail: 1 });

module.exports = mongoose.model('Log', logSchema);
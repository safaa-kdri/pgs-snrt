// src/middlewares/auth.js
// ✅ CORRECTION : Ajout des logs pour déboguer + support amélioré

const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');
const userLookup = require('../utils/userLookup');
const { ROLES } = require('../config/constants');

// ============================================
// AUTHENTIFICATION - Vérifie le token JWT
// ============================================
function authenticate() {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.accessToken;
      
      console.log('🔍 [authenticate] Token présent:', !!token);
      
      if (!token) {
        console.log('❌ [authenticate] Token manquant');
        throw ApiError.unauthorized('Authentification requise.');
      }

      const payload = verifyAccessToken(token);
      if (!payload) {
        console.log('❌ [authenticate] Payload invalide');
        throw ApiError.unauthorized('Session invalide ou expiree.');
      }

      console.log('🔍 [authenticate] Payload:', {
        sub: payload.sub,
        userType: payload.userType,
        role: payload.role,
        departementId: payload.departementId
      });

      const user = await userLookup.findById(payload.sub, payload.userType);
      
      console.log('🔍 [authenticate] Utilisateur trouvé:', !!user);
      
      if (!user || !user.actif) {
        console.log('❌ [authenticate] Utilisateur introuvable ou désactivé');
        throw ApiError.unauthorized('Compte introuvable ou desactive.');
      }

      req.user = {
        id: user._id.toString(),
        _id: user._id.toString(),
        userType: payload.userType,
        role: payload.role,
        departementId: payload.departementId || null,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      };

      console.log('✅ [authenticate] Utilisateur authentifié:', {
        id: req.user.id,
        role: req.user.role,
        departementId: req.user.departementId
      });

      return next();
    } catch (err) {
      console.log('❌ [authenticate] Erreur:', err.message);
      return next(err);
    }
  };
}

// ============================================
// AUTORISATION - Vérifie les rôles
// ============================================
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      console.log('❌ [authorize] Utilisateur non authentifié');
      return next(ApiError.unauthorized());
    }

    const userRole = req.user.role;
    
    console.log('🔍 [authorize] Rôle utilisateur:', userRole);
    console.log('🔍 [authorize] Rôles autorisés:', allowedRoles);
    console.log('🔍 [authorize] Rôle utilisateur exact:', JSON.stringify(userRole));

    // ✅ Si aucun rôle n'est spécifié, autoriser tout le monde
    if (allowedRoles.length === 0) {
      console.log('✅ [authorize] Aucun rôle requis, accès autorisé');
      return next();
    }

    // ✅ Vérifier si l'utilisateur a un rôle
    if (!userRole) {
      console.log('❌ [authorize] Utilisateur sans rôle');
      return next(ApiError.forbidden('Aucun rôle associé à cet utilisateur'));
    }

    // ✅ Vérifier si le rôle de l'utilisateur est dans la liste autorisée
    const hasRole = allowedRoles.some(role => role === userRole);
    
    if (!hasRole) {
      console.log(`❌ [authorize] Rôle ${userRole} non autorisé. Rôles acceptés: ${allowedRoles.join(', ')}`);
      return next(ApiError.forbidden(`Vous n'avez pas les droits necessaires pour cette action. Rôle requis: ${allowedRoles.join(', ')}`));
    }

    console.log(`✅ [authorize] Rôle ${userRole} autorisé`);
    return next();
  };
}

// ============================================
// AUTHENTIFICATION OPTIONNELLE
// ============================================
function optionalAuthenticate() {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) return next();

      const payload = verifyAccessToken(token);
      if (!payload) return next();

      const user = await userLookup.findById(payload.sub, payload.userType);
      if (!user || !user.actif) return next();

      req.user = {
        id: user._id.toString(),
        _id: user._id.toString(),
        userType: payload.userType,
        role: payload.role,
        departementId: payload.departementId || null,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      };

      console.log('✅ [optionalAuthenticate] Utilisateur authentifié optionnellement:', {
        id: req.user.id,
        role: req.user.role
      });

      return next();
    } catch (err) {
      return next();
    }
  };
}

// ============================================
// VÉRIFIER QUE L'UTILISATEUR EST LE PROPRIÉTAIRE
// ============================================
function isOwner(req, resourceUserId) {
  if (!req.user) return false;
  
  // ✅ Les admins, RH et départements ont accès à tout
  const adminRoles = [ROLES.ADMIN, ROLES.RH, ROLES.DEPARTEMENT];
  if (adminRoles.includes(req.user.role)) return true;
  
  const userId = req.user.id || req.user._id;
  return userId.toString() === resourceUserId.toString();
}

// ============================================
// ALIAS POUR COMPATIBILITÉ AVEC periodRoutes ET internshipRoutes
// ============================================
const requireAuth = authenticate;
const requireRole = authorize;

// ============================================
// RATE LIMITERS
// ============================================
const rateLimitHandler = (req, res, next) => next(ApiError.tooManyRequests());

const loginLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  limit: 10, 
  standardHeaders: true, 
  legacyHeaders: false, 
  handler: rateLimitHandler 
});

const registerLimiter = rateLimit({ 
  windowMs: 60 * 60 * 1000, 
  limit: 10, 
  standardHeaders: true, 
  legacyHeaders: false, 
  handler: rateLimitHandler 
});

const twoFactorLimiter = rateLimit({ 
  windowMs: 10 * 60 * 1000, 
  limit: 10, 
  standardHeaders: true, 
  legacyHeaders: false, 
  handler: rateLimitHandler 
});

const forgotPasswordLimiter = rateLimit({ 
  windowMs: 60 * 60 * 1000, 
  limit: 5, 
  standardHeaders: true, 
  legacyHeaders: false, 
  handler: rateLimitHandler 
});

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  requireAuth,
  requireRole,
  isOwner, // ✅ EXPORTÉ
  loginLimiter,
  registerLimiter,
  twoFactorLimiter,
  forgotPasswordLimiter,
};
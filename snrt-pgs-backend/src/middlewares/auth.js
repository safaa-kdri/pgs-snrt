// src/middlewares/auth.js
//  CORRECTION : Accepter le token depuis le cookie OU le header Authorization

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
      //  1. Essayer depuis le cookie
      let token = req.cookies?.accessToken;
      
      //  2. Si pas dans le cookie, essayer depuis le header Authorization
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
      
      if (!token) {
        throw ApiError.unauthorized('Authentification requise.');
      }

      const payload = verifyAccessToken(token);
      if (!payload) {
        throw ApiError.unauthorized('Session invalide ou expiree.');
      }

      const user = await userLookup.findById(payload.sub, payload.userType);
      
      if (!user || !user.actif) {
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

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

// ============================================
// AUTHENTIFICATION OPTIONNELLE
// ============================================
function optionalAuthenticate() {
  return async (req, res, next) => {
    try {
      //  1. Essayer depuis le cookie
      let token = req.cookies?.accessToken;
      
      //  2. Si pas dans le cookie, essayer depuis le header Authorization
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
      
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

      return next();
    } catch (err) {
      return next();
    }
  };
}

// ============================================
// AUTORISATION - Vérifie les rôles
// ============================================
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const userRole = req.user.role;

    //  Si aucun rôle n'est spécifié, autoriser tout le monde
    if (allowedRoles.length === 0) {
      return next();
    }

    //  Vérifier si l'utilisateur a un rôle
    if (!userRole) {
      return next(ApiError.forbidden('Aucun rôle associé à cet utilisateur'));
    }

    //  Vérifier si le rôle de l'utilisateur est dans la liste autorisée
    const hasRole = allowedRoles.some(role => role === userRole);
    
    if (!hasRole) {
      return next(ApiError.forbidden(`Vous n'avez pas les droits necessaires pour cette action. Rôle requis: ${allowedRoles.join(', ')}`));
    }

    return next();
  };
}

// ============================================
// VÉRIFIER QUE L'UTILISATEUR EST LE PROPRIÉTAIRE
// ============================================
function isOwner(req, resourceUserId) {
  if (!req.user) return false;
  
  //  Les admins, RH et départements ont accès à tout
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
  isOwner,
  loginLimiter,
  registerLimiter,
  twoFactorLimiter,
  forgotPasswordLimiter,
};
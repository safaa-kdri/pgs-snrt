const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');
const userLookup = require('../utils/userLookup');


function authenticate() {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) throw ApiError.unauthorized('Authentification requise.');

      const payload = verifyAccessToken(token);
      if (!payload) throw ApiError.unauthorized('Session invalide ou expiree.');

      const user = await userLookup.findById(payload.sub, payload.userType);
      if (!user || !user.actif) throw ApiError.unauthorized('Compte introuvable ou desactive.');

      req.user = {
        id: user._id.toString(),
        // Alias kept for controllers written against Mongoose's usual `_id`
        // convention (applicationController, departmentController,
        // documentController, notificationController, userController).
        _id: user._id.toString(),
        userType: payload.userType,
        role: payload.role,
        departementId: payload.departementId || null,
      };

      return next();
    } catch (err) {
      return next(err);
    }
  };
}


function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("Vous n'avez pas les droits necessaires pour cette action."));
    }
    return next();
  };
}


// Auth optionnelle : utilisee pour les routes publiques qui doivent tout de
// meme adapter leur reponse si un utilisateur est connecte (ex: GET /offers,
// GET /offers/:id - consultation publique d'apres le CDC 2.4.2, mais le
// controleur affine le filtrage si req.user est present). Ne bloque jamais
// la requete : token absent, invalide, expire ou compte inactif => on
// continue simplement sans req.user, comme un visiteur anonyme.
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
      };

      return next();
    } catch (err) {
      return next();
    }
  };
}


const rateLimitHandler = (req, res, next) => next(ApiError.tooManyRequests());

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, handler: rateLimitHandler });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, handler: rateLimitHandler });
const twoFactorLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, handler: rateLimitHandler });
const forgotPasswordLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, handler: rateLimitHandler });

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  loginLimiter,
  registerLimiter,
  twoFactorLimiter,
  forgotPasswordLimiter,
};
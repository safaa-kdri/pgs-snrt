const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');
const userLookup = require('../utils/userLookup');

/**
 * Verifie le JWT d'acces (cookie HttpOnly "accessToken") et attache
 * l'utilisateur authentifie a req.user. A utiliser sur toute route protegee.
 */
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

/**
 * Controle d'acces base sur les roles (RBAC). Usage :
 *   router.post('/offers', authenticate(), authorize('Departement', 'Administrateur'), ...)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("Vous n'avez pas les droits necessaires pour cette action."));
    }
    return next();
  };
}

/**
 * Limitation du nombre de requetes par IP (protection brute force - OWASP).
 * Regroupees ici avec le reste des middlewares de securite d'authentification
 * (pas de fichier dedie dans l'arborescence de l'equipe).
 */
const rateLimitHandler = (req, res, next) => next(ApiError.tooManyRequests());

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, handler: rateLimitHandler });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, handler: rateLimitHandler });
const twoFactorLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, handler: rateLimitHandler });
const forgotPasswordLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, handler: rateLimitHandler });

module.exports = {
  authenticate,
  authorize,
  loginLimiter,
  registerLimiter,
  twoFactorLimiter,
  forgotPasswordLimiter,
};

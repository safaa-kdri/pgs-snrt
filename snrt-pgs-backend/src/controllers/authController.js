const UtilisateurExterne = require('../models/UtilisateurExterne');
const Role = require('../models/Role');
const userLookup = require('../utils/userLookup');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { CONFIG } = require('../config/constants');

const { validatePasswordPolicy } = require('../utils/validators');
const { hashPassword, verifyPassword } = require('../utils/argon2');
const { generateTwoFactorCode, hashCode, isCodeExpired } = require('../utils/twoFactorService');
const { sendTwoFactorCodeEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');
const {
  signAccessToken,
  signRefreshToken,
  signPreAuthToken,
  verifyPreAuthToken,
  verifyRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setPreAuthCookie,
  clearAuthCookies,
  clearPreAuthCookie,
  hashToken,
  generateRandomToken,
} = require('../utils/jwt');

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;


async function resolveRoleName(user, userType) {
  if (userType === 'externe') return 'Etudiant';
  const role = await Role.findById(user.roleId).select('nom');
  return role ? role.nom : null;
}

async function registerFailedAttempt(user) {
  user.security.failedLoginAttempts = (user.security.failedLoginAttempts || 0) + 1;
  if (user.security.failedLoginAttempts >= CONFIG.bruteForce.maxAttempts) {
    user.security.lockUntil = new Date(Date.now() + CONFIG.bruteForce.lockMinutes * 60 * 1000);
  }
  await user.save();
}

function isLocked(user) {
  return user.security?.lockUntil && new Date(user.security.lockUntil).getTime() > Date.now();
}

async function issueSession(res, user, userType, req) {
  const role = await resolveRoleName(user, userType);

  const basePayload = {
    sub: user._id.toString(),
    userType,
    role,
    departementId: userType === 'interne' ? user.departementId : undefined,
  };

  const accessToken = signAccessToken(basePayload);
  const refreshToken = signRefreshToken(basePayload);

  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    userAgent: req.get('user-agent') || null,
    ip: req.ip,
  });
  user.derniereConnexion = new Date();
  await user.save();

  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);

  return role;
}


const register = asyncHandler(async (req, res) => {
  const { motDePasse, email, ...rest } = req.body;

  validatePasswordPolicy(motDePasse, 'externe');

  if (await userLookup.emailExists(email)) {
    throw ApiError.conflict('Un compte existe deja avec cette adresse email.');
  }

  const cinExists = await UtilisateurExterne.exists({ cin: rest.cin.trim().toUpperCase() });
  if (cinExists) {
    throw ApiError.conflict('Un compte existe deja avec ce numero de CIN.');
  }

  const motDePasseHash = await hashPassword(motDePasse);

  const user = await UtilisateurExterne.create({
    ...rest,
    email: email.trim().toLowerCase(),
    motDePasse: motDePasseHash,
  });

  logger.audit('REGISTER_SUCCESS', { userId: user._id.toString(), email: user.email });

  try {
    await sendWelcomeEmail(user.email, user.prenom);
  } catch (err) {
    logger.warn(`[Register] Email de bienvenue non envoye a ${user.email}`);
  }

  return res.status(201).json({
    success: true,
    message: 'Compte cree avec succes. Vous pouvez desormais vous connecter.',
    user,
  });
});


const login = asyncHandler(async (req, res) => {
  const { email, motDePasse } = req.body;
  const genericError = 'Adresse email ou mot de passe incorrect.';

  const found = await userLookup.findByEmail(email, '+motDePasse +security +twoFactor');
  if (!found) {
    logger.audit('LOGIN_FAILED_UNKNOWN_EMAIL', { email });
    throw ApiError.unauthorized(genericError);
  }

  const { user, userType } = found;

  if (isLocked(user)) {
    logger.audit('LOGIN_BLOCKED_LOCKED_ACCOUNT', { userId: user._id.toString() });
    throw ApiError.tooManyRequests(
      `Compte temporairement verrouille suite a plusieurs echecs. Reessayez dans ${CONFIG.bruteForce.lockMinutes} minutes.`
    );
  }

  if (!user.actif) throw ApiError.forbidden('Ce compte est desactive. Contactez un administrateur.');

  const passwordOk = await verifyPassword(user.motDePasse, motDePasse);
  if (!passwordOk) {
    await registerFailedAttempt(user);
    logger.audit('LOGIN_FAILED_BAD_PASSWORD', { userId: user._id.toString() });
    throw ApiError.unauthorized(genericError);
  }

  user.security.failedLoginAttempts = 0;
  user.security.lockUntil = null;

  const { code, codeHash, expiresAt } = generateTwoFactorCode();
  user.twoFactor.codeHash = codeHash;
  user.twoFactor.expiresAt = expiresAt;
  await user.save();

  try {
    await sendTwoFactorCodeEmail(user.email, code);
    logger.info(`[2FA] Email sent successfully to ${user.email}`);
  } catch (err) {
    logger.error(`[2FA Email Failed] SMTP error: ${err.message}`);

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`==================================================`);
      logger.info(`[DEV MODE] 2FA CODE FOR ${user.email}: ${code}`);
      logger.info(`==================================================`);
    } else {
      throw ApiError.internal("Impossible d'envoyer le code de verification. Veuillez reessayer.");
    }
  }

  const preAuthToken = signPreAuthToken({ sub: user._id.toString(), userType });
  setPreAuthCookie(res, preAuthToken);

  logger.audit('LOGIN_PASSWORD_OK_2FA_SENT', { userId: user._id.toString() });

  return res.status(200).json({
    success: true,
    requiresTwoFactor: true,
    message: 'Un code de verification a ete envoye a votre adresse email.',
  });
});


const verifyTwoFactor = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const preAuthToken = req.cookies?.preAuthToken;

  if (!preAuthToken) throw ApiError.unauthorized('Session expiree. Veuillez vous reconnecter.');

  const payload = verifyPreAuthToken(preAuthToken);
  if (!payload) {
    clearPreAuthCookie(res);
    throw ApiError.unauthorized('Session expiree. Veuillez vous reconnecter.');
  }

  const user = await userLookup.findById(payload.sub, payload.userType, '+twoFactor +refreshTokens');
  if (!user) {
    clearPreAuthCookie(res);
    throw ApiError.unauthorized('Compte introuvable.');
  }

  if (!user.twoFactor?.codeHash || isCodeExpired(user.twoFactor.expiresAt)) {
    throw ApiError.unauthorized('Code expire. Veuillez vous reconnecter pour en recevoir un nouveau.');
  }

  if (hashCode(code) !== user.twoFactor.codeHash) {
    logger.audit('LOGIN_2FA_FAILED', { userId: user._id.toString() });
    throw ApiError.unauthorized('Code de verification incorrect.');
  }

  user.twoFactor.codeHash = null;
  user.twoFactor.expiresAt = null;

  const role = await issueSession(res, user, payload.userType, req);
  clearPreAuthCookie(res);

  logger.audit('LOGIN_2FA_OK', { userId: user._id.toString() });

  return res.status(200).json({
    success: true,
    message: 'Connexion reussie.',
    user: { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role, userType: payload.userType },
  });
});


const resendTwoFactorCode = asyncHandler(async (req, res) => {
  const preAuthToken = req.cookies?.preAuthToken;
  if (!preAuthToken) throw ApiError.unauthorized('Session expiree. Veuillez vous reconnecter.');

  const payload = verifyPreAuthToken(preAuthToken);
  if (!payload) throw ApiError.unauthorized('Session expiree. Veuillez vous reconnecter.');

  const user = await userLookup.findById(payload.sub, payload.userType, '+twoFactor');
  if (!user) throw ApiError.unauthorized('Compte introuvable.');

  const { code, codeHash, expiresAt } = generateTwoFactorCode();
  user.twoFactor.codeHash = codeHash;
  user.twoFactor.expiresAt = expiresAt;
  await user.save();

  await sendTwoFactorCodeEmail(user.email, code);

  const newPreAuthToken = signPreAuthToken({ sub: user._id.toString(), userType: payload.userType });
  setPreAuthCookie(res, newPreAuthToken);

  return res.status(200).json({ success: true, message: 'Un nouveau code vous a ete envoye.' });
});


const refresh = asyncHandler(async (req, res) => {
  const refreshTokenCookie = req.cookies?.refreshToken;
  if (!refreshTokenCookie) throw ApiError.unauthorized('Session absente. Veuillez vous reconnecter.');

  const payload = verifyRefreshToken(refreshTokenCookie);
  if (!payload) {
    clearAuthCookies(res);
    throw ApiError.unauthorized('Session invalide. Veuillez vous reconnecter.');
  }

  const user = await userLookup.findById(payload.sub, payload.userType, '+refreshTokens');
  if (!user || !user.actif) {
    clearAuthCookies(res);
    throw ApiError.unauthorized('Compte introuvable ou desactive.');
  }

  const incomingHash = hashToken(refreshTokenCookie);
  const matchIndex = user.refreshTokens.findIndex(
    (rt) => rt.tokenHash === incomingHash && new Date(rt.expiresAt).getTime() > Date.now()
  );

  if (matchIndex === -1) {
    user.refreshTokens = [];
    await user.save();
    clearAuthCookies(res);
    logger.audit('REFRESH_TOKEN_REUSE_DETECTED', { userId: user._id.toString() });
    throw ApiError.unauthorized('Session invalide. Veuillez vous reconnecter.');
  }

  user.refreshTokens.splice(matchIndex, 1);

  const role = await resolveRoleName(user, payload.userType);
  const newPayload = {
    sub: user._id.toString(),
    userType: payload.userType,
    role,
    departementId: payload.userType === 'interne' ? user.departementId : undefined,
  };

  const newAccessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  user.refreshTokens.push({
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    userAgent: req.get('user-agent') || null,
    ip: req.ip,
  });
  await user.save();

  setAccessTokenCookie(res, newAccessToken);
  setRefreshTokenCookie(res, newRefreshToken);

  return res.status(200).json({ success: true, message: 'Session renouvelee.' });
});


const logout = asyncHandler(async (req, res) => {
  const refreshTokenCookie = req.cookies?.refreshToken;

  if (refreshTokenCookie) {
    const payload = verifyRefreshToken(refreshTokenCookie);
    if (payload) {
      const user = await userLookup.findById(payload.sub, payload.userType, '+refreshTokens');
      if (user) {
        const incomingHash = hashToken(refreshTokenCookie);
        user.refreshTokens = user.refreshTokens.filter((rt) => rt.tokenHash !== incomingHash);
        await user.save();
        logger.audit('LOGOUT', { userId: user._id.toString() });
      }
    }
  }

  clearAuthCookies(res);
  return res.status(200).json({ success: true, message: 'Deconnexion reussie.' });
});


const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const genericResponse = {
    success: true,
    message: 'Si un compte existe avec cette adresse, un email de reinitialisation a ete envoye.',
  };

  const found = await userLookup.findByEmail(email);
  if (!found) return res.status(200).json(genericResponse);

  const { user } = found;

  const rawToken = generateRandomToken(32);
  user.passwordReset.tokenHash = hashToken(rawToken);
  user.passwordReset.expiresAt = new Date(Date.now() + CONFIG.resetPassword.ttlMinutes * 60 * 1000);
  await user.save();

  const resetUrl = `${CONFIG.clientUrl}/reset-password/${rawToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
    logger.audit('FORGOT_PASSWORD_EMAIL_SENT', { userId: user._id.toString() });
  } catch (err) {
    logger.error(`[ForgotPassword] Echec envoi email a ${user.email}`);
  }

  return res.status(200).json(genericResponse);
});


const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { motDePasse } = req.body;

  const tokenHash = hashToken(token);
  const found = await userLookup.findByPasswordResetHash(tokenHash);

  if (!found || !found.user.passwordReset?.expiresAt || new Date(found.user.passwordReset.expiresAt) < new Date()) {
    throw ApiError.badRequest('Le lien de reinitialisation est invalide ou a expire.');
  }

  const { user, userType } = found;

  validatePasswordPolicy(motDePasse, userType);

  user.motDePasse = await hashPassword(motDePasse);
  user.passwordReset.tokenHash = null;
  user.passwordReset.expiresAt = null;
  user.refreshTokens = [];
  user.security.failedLoginAttempts = 0;
  user.security.lockUntil = null;

  await user.save();

  logger.audit('PASSWORD_RESET_SUCCESS', { userId: user._id.toString() });

  return res.status(200).json({
    success: true,
    message: 'Mot de passe reinitialise avec succes. Vous pouvez vous connecter.',
  });
});


const me = asyncHandler(async (req, res) => {
  const user = await userLookup.findById(req.user.id, req.user.userType);
  if (!user) throw ApiError.notFound('Utilisateur introuvable.');

  return res.status(200).json({ success: true, user, role: req.user.role, userType: req.user.userType });
});

module.exports = {
  register,
  login,
  verifyTwoFactor,
  resendTwoFactorCode,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  me,
};

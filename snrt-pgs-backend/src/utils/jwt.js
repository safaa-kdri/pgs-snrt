const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { CONFIG } = require('../config/constants');

/**
 * Centralise :
 *  - la creation/verification des JWT (access, refresh, pre-auth 2FA, reset password)
 *  - le depot/suppression des cookies HttpOnly correspondants
 *
 * Conformement au cahier des charges (3.3.2), les jetons ne sont JAMAIS
 * exposes au JavaScript client : ils circulent uniquement via cookies
 * HttpOnly + Secure + SameSite (jamais de Local Storage).
 */

const COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  secure: CONFIG.cookies.secure,
  sameSite: 'strict',
  domain: CONFIG.nodeEnv === 'production' ? CONFIG.cookies.domain : undefined,
  path: '/',
};

// --- Generation des JWT ---
function signAccessToken(payload) {
  return jwt.sign(payload, CONFIG.jwt.accessSecret, { expiresIn: CONFIG.jwt.accessExpires });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, CONFIG.jwt.refreshSecret, { expiresIn: CONFIG.jwt.refreshExpires });
}

function signPreAuthToken(payload) {
  // Jeton temporaire emis apres validation du mot de passe, en attente du code 2FA.
  return jwt.sign(payload, CONFIG.jwt.preAuthSecret, { expiresIn: CONFIG.jwt.preAuthExpires });
}

function signResetToken(payload) {
  return jwt.sign(payload, CONFIG.jwt.resetSecret, { expiresIn: `${CONFIG.resetPassword.ttlMinutes}m` });
}

// --- Verification (renvoie null si invalide/expire) ---
function verifyToken(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}

const verifyAccessToken = (token) => verifyToken(token, CONFIG.jwt.accessSecret);
const verifyRefreshToken = (token) => verifyToken(token, CONFIG.jwt.refreshSecret);
const verifyPreAuthToken = (token) => verifyToken(token, CONFIG.jwt.preAuthSecret);
const verifyResetToken = (token) => verifyToken(token, CONFIG.jwt.resetSecret);

// --- Cookies ---
function setAccessTokenCookie(res, token) {
  res.cookie('accessToken', token, { ...COOKIE_BASE_OPTIONS, maxAge: 15 * 60 * 1000 });
}

function setRefreshTokenCookie(res, token) {
  res.cookie('refreshToken', token, { ...COOKIE_BASE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function setPreAuthCookie(res, token) {
  res.cookie('preAuthToken', token, { ...COOKIE_BASE_OPTIONS, maxAge: 5 * 60 * 1000 });
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken', COOKIE_BASE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_BASE_OPTIONS);
}

function clearPreAuthCookie(res) {
  res.clearCookie('preAuthToken', COOKIE_BASE_OPTIONS);
}

// --- Jeton aleatoire + empreinte SHA-256 (refresh tokens en base, reset password) ---
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  signPreAuthToken,
  signResetToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyPreAuthToken,
  verifyResetToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setPreAuthCookie,
  clearAuthCookies,
  clearPreAuthCookie,
  hashToken,
  generateRandomToken,
};

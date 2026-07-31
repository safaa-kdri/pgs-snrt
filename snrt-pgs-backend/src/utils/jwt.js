// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { CONFIG } = require('../config/constants');


const COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  secure: CONFIG.cookies.secure,
  sameSite: CONFIG.cookies.sameSite,
  domain: CONFIG.nodeEnv === 'production' ? CONFIG.cookies.domain : undefined,
  path: '/',
};

function signAccessToken(payload) {
  return jwt.sign(payload, CONFIG.jwt.accessSecret, { expiresIn: CONFIG.jwt.accessExpires });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, CONFIG.jwt.refreshSecret, { expiresIn: CONFIG.jwt.refreshExpires });
}

function signPreAuthToken(payload) {
  return jwt.sign(payload, CONFIG.jwt.preAuthSecret, { expiresIn: CONFIG.jwt.preAuthExpires });
}

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

function setAccessTokenCookie(res, token) {
  // ✅ AUGMENTER LA DURÉE DU COOKIE ACCESS TOKEN (24h)
  const maxAge = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
  res.cookie('accessToken', token, { ...COOKIE_BASE_OPTIONS, maxAge });
}

function setRefreshTokenCookie(res, token) {
  // ✅ AUGMENTER LA DURÉE DU REFRESH TOKEN (30 jours)
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours en millisecondes
  res.cookie('refreshToken', token, { ...COOKIE_BASE_OPTIONS, maxAge });
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
  verifyAccessToken,
  verifyRefreshToken,
  verifyPreAuthToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setPreAuthCookie,
  clearAuthCookies,
  clearPreAuthCookie,
  hashToken,
  generateRandomToken,
};
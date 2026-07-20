const crypto = require('crypto');
const { CONFIG } = require('../config/constants');

/**
 * Genere un code numerique a usage unique (OTP) pour la double authentification
 * par email. Le code est retourne en clair (pour l'email) + sous forme de hash
 * SHA-256 (pour le stockage en base : jamais le code en clair en base).
 */
function generateTwoFactorCode() {
  const { codeLength } = CONFIG.twoFactor;
  const max = 10 ** codeLength;
  const code = crypto.randomInt(0, max).toString().padStart(codeLength, '0');
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  return { code, codeHash, expiresAt };
}

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function isCodeExpired(expiresAt) {
  return !expiresAt || new Date(expiresAt).getTime() < Date.now();
}

module.exports = { generateTwoFactorCode, hashCode, isCodeExpired };

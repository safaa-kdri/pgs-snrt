const crypto = require('crypto');
const { CONFIG } = require('../config/constants');


function generateTwoFactorCode() {
  const { codeLength } = CONFIG.twoFactor;
  const max = 10 ** codeLength;
  const code = crypto.randomInt(0, max).toString().padStart(codeLength, '0');
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(Date.now() + CONFIG.twoFactor.ttlMinutes * 60 * 1000);
  return { code, codeHash, expiresAt };
}

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function isCodeExpired(expiresAt) {
  return !expiresAt || new Date(expiresAt).getTime() < Date.now();
}

module.exports = { generateTwoFactorCode, hashCode, isCodeExpired };
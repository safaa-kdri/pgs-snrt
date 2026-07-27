const UtilisateurInterne = require('../models/UtilisateurInterne');
const UtilisateurExterne = require('../models/UtilisateurExterne');

/**
 * L'email doit etre unique tous comptes confondus (RG-001), mais les
 * comptes internes et externes vivent dans deux collections distinctes.
 * Ces helpers centralisent la recherche cross-collection.
 */
const MODELS_BY_TYPE = { interne: UtilisateurInterne, externe: UtilisateurExterne };

function getModel(userType) {
  const model = MODELS_BY_TYPE[userType];
  if (!model) throw new Error(`Type d'utilisateur inconnu: ${userType}`);
  return model;
}

async function findByEmail(email, selectExtra = '') {
  const normalizedEmail = email.trim().toLowerCase();

  const interne = await UtilisateurInterne.findOne({ email: normalizedEmail }).select(selectExtra);
  if (interne) return { user: interne, userType: 'interne' };

  const externe = await UtilisateurExterne.findOne({ email: normalizedEmail }).select(selectExtra);
  if (externe) return { user: externe, userType: 'externe' };

  return null;
}

async function emailExists(email) {
  return Boolean(await findByEmail(email));
}

async function findByCin(cin, selectExtra = '') {
  const normalizedCin = cin.trim().toUpperCase();

  const interne = await UtilisateurInterne.findOne({ cin: normalizedCin }).select(selectExtra);
  if (interne) return { user: interne, userType: 'interne' };

  const externe = await UtilisateurExterne.findOne({ cin: normalizedCin }).select(selectExtra);
  if (externe) return { user: externe, userType: 'externe' };

  return null;
}

async function cinExists(cin) {
  return Boolean(await findByCin(cin));
}

async function findById(userId, userType, selectExtra = '') {
  const Model = getModel(userType);
  return Model.findById(userId).select(selectExtra);
}

async function findByPasswordResetHash(tokenHash) {
  const selectFields =
    '+passwordReset.tokenHash +passwordReset.expiresAt +security.failedLoginAttempts +security.lockUntil';

  const interne = await UtilisateurInterne.findOne({ 'passwordReset.tokenHash': tokenHash }).select(selectFields);
  if (interne) return { user: interne, userType: 'interne' };

  const externe = await UtilisateurExterne.findOne({ 'passwordReset.tokenHash': tokenHash }).select(selectFields);
  if (externe) return { user: externe, userType: 'externe' };

  return null;
}

module.exports = { getModel, findByEmail, emailExists, findByCin, cinExists, findById, findByPasswordResetHash };
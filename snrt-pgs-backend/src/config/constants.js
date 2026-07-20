require('dotenv').config();

/**
 * Point unique de verite pour :
 *  - les enumerations metier partagees entre modules (statuts, types...)
 *    afin d'eviter les chaines "magiques" dupliquees dans chaque fichier
 *    ecrit par des developpeurs differents ;
 *  - la configuration derivee des variables d'environnement.
 *
 * NB: ce projet n'utilise pas Passport.js (pas de config/passport.js) :
 * l'authentification est geree "maison" via JWT + cookies HttpOnly + 2FA
 * (voir utils/jwt.js et controllers/authController.js), ce qui est plus
 * adapte a un flux de connexion en 2 etapes (mot de passe puis code email).
 */

const ROLES = Object.freeze({
  ADMIN: 'Administrateur',
  RH: 'RH',
  DEPARTEMENT: 'Departement',
  ENCADRANT: 'Encadrant',
  ETUDIANT: 'Etudiant',
});

const OFFER_STATUS = Object.freeze({
  BROUILLON: 'Brouillon',
  EN_ATTENTE: 'EnAttente',
  PUBLIEE: 'Publiee',
  REFUSEE: 'Refusee',
  ARCHIVEE: 'Archivee',
});

const OFFER_TYPES = ['PFE', 'PFA', 'Initiation', 'Ete', 'Master', 'Licence', 'Technicien'];

const INTERVIEW_TYPES = ['Presentiel', 'Visio', 'Telephonique'];
const INTERVIEW_RESULTS = ['EnAttente', 'Positive', 'Negative'];

const SKILL_CATEGORIES = ['Technique', 'Langue', 'Autre'];

// Rappel des statuts de candidature (source de verite : modele Application, module Mohammed).
// Duplique ici uniquement en lecture seule pour que les controleurs de Badr
// (interviewController) puissent reagir aux changements de statut sans
// dependre du fichier models/Application.js.
const APPLICATION_STATUS = Object.freeze({
  BROUILLON: 'Brouillon',
  SOUMISE: 'Soumise',
  EN_ANALYSE: 'EnAnalyse',
  ENTRETIEN: 'Entretien',
  ACCEPTEE: 'Acceptee',
  REFUSEE: 'Refusee',
});

const PASSWORD_MIN_LENGTH = Object.freeze({
  externe: 16,
  interne: 20,
});

const CONFIG = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/pgs_snrt',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
    preAuthSecret: process.env.JWT_PREAUTH_SECRET,
    preAuthExpires: process.env.JWT_PREAUTH_EXPIRES || '5m',
    resetSecret: process.env.JWT_RESET_SECRET,
  },

  cookies: {
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    secure: process.env.COOKIE_SECURE === 'true',
  },

  twoFactor: {
    codeLength: parseInt(process.env.TWO_FA_CODE_LENGTH, 10) || 6,
    ttlMinutes: parseInt(process.env.TWO_FA_CODE_TTL_MINUTES, 10) || 5,
  },

  resetPassword: {
    ttlMinutes: parseInt(process.env.RESET_PASSWORD_TTL_MINUTES, 10) || 60,
  },

  bruteForce: {
    maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    lockMinutes: parseInt(process.env.LOCK_DURATION_MINUTES, 10) || 15,
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.MAIL_FROM || 'PGS - SNRT <no-reply@snrt.ma>',
  },
});

const REQUIRED_ENV = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'JWT_PREAUTH_SECRET', 'JWT_RESET_SECRET'];

function assertRequiredEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`[CONFIG] Variables d'environnement manquantes: ${missing.join(', ')}`);
    process.exit(1);
  }
}

module.exports = {
  ROLES,
  OFFER_STATUS,
  OFFER_TYPES,
  INTERVIEW_TYPES,
  INTERVIEW_RESULTS,
  SKILL_CATEGORIES,
  APPLICATION_STATUS,
  PASSWORD_MIN_LENGTH,
  CONFIG,
  assertRequiredEnv,
};

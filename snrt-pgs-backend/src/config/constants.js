// src/config/constants.js
// AJOUTER LA CONSTANTE DOCUMENT_TYPES
// AJOUTER EN_COURS_CREATION
// AJOUTER RESULTATS_PUBLIES

require('dotenv').config();

const ROLES = Object.freeze({
  ADMIN: 'Administrateur',
  RH: 'RH',
  DEPARTEMENT: 'Departement',
  ENCADRANT: 'Encadrant',
  ETUDIANT: 'Etudiant',
});


const STAFF_TREATMENT_ROLES = Object.freeze([ROLES.RH, ROLES.DEPARTEMENT, ROLES.ADMIN]);


const HR_ADMIN_ROLES = Object.freeze([ROLES.RH, ROLES.ADMIN]);

const OFFER_STATUS = Object.freeze({
  BROUILLON: 'Brouillon',
  EN_ATTENTE: 'EnAttente',
  PUBLIEE: 'Publiee',
  REFUSEE: 'Refusee',
  ARCHIVEE: 'Archivee',
  RESULTATS_PUBLIES: 'ResultatsPublies', // NOUVEAU
});

const OFFER_TYPES = ['PFE', 'PFA', 'Initiation', 'Ete', 'Master', 'Licence', 'Technicien'];

const INTERVIEW_TYPES = ['Presentiel', 'Visio', 'Telephonique'];
const INTERVIEW_RESULTS = ['EnAttente', 'Positive', 'Negative'];

const SKILL_CATEGORIES = ['Technique', 'Langue', 'Autre'];


const CONCOURS_DOCUMENT_TYPES = [
  'ArreteOuverture',
  'ListeConvoquesEcrit',
  'ListeConvoquesPratique',
  'ResultatConcours',
];


// AJOUTER EN_COURS_CREATION
const APPLICATION_STATUS = Object.freeze({
  EN_COURS_CREATION: 'EnCoursCreation',
  BROUILLON: 'Brouillon',
  SOUMISE: 'Soumise',
  EN_ANALYSE: 'EnAnalyse',
  ENTRETIEN: 'Entretien',
  ACCEPTEE: 'Acceptee',
  REFUSEE: 'Refusee',
});

// AJOUT : MOTIFS DE REFUS
const REFUSAL_REASONS = Object.freeze([
  'Profil non adapté',
  'Plus de places disponibles',
  'Dossier insuffisant',
  'Dates incompatibles',
  'Autre',
]);

const PASSWORD_MIN_LENGTH = Object.freeze({
  externe: 16,
  interne: 20,
});

// AJOUT : TYPES DE DOCUMENTS
const DOCUMENT_TYPES = Object.freeze([
    'CV',
    'LettreMotivation',
    'LettreRecommandation',
    'AttestationScolarite',
    'Attestation',
    'ReleveNotes',
    'Convention',
    'Photo',
    'CIN',
    'Assurance',
    'FicheEngagement',
    'Autre'
]);

const CONFIG = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/pgs_snrt',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
    preAuthSecret: process.env.JWT_PREAUTH_SECRET,
    preAuthExpires: process.env.JWT_PREAUTH_EXPIRES || '5m',
  },

  cookies: {
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAMESITE || 'strict',
  },

  twoFactor: {
    codeLength: parseInt(process.env.TWO_FA_CODE_LENGTH, 10) || 6,
    ttlMinutes: parseInt(process.env.TWO_FA_CODE_TTL_MINUTES, 10) || 5,
  },

  resetPassword: {
    ttlMinutes: parseInt(process.env.RESET_PASSWORD_TTL_MINUTES, 10) || 60,
  },

  bruteForce: {
    maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 3,
    lockMinutes: parseInt(process.env.LOCK_DURATION_MINUTES, 10) || 60,
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

const REQUIRED_ENV = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'JWT_PREAUTH_SECRET'];

function assertRequiredEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[CONFIG] Variables d'environnement manquantes: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (CONFIG.cookies.sameSite.toLowerCase() === 'none' && !CONFIG.cookies.secure) {
    console.error(
      "[CONFIG] COOKIE_SAMESITE=none exige COOKIE_SECURE=true (et HTTPS), sinon les navigateurs refusent le cookie."
    );
    process.exit(1);
  }
}

module.exports = {
  ROLES,
  STAFF_TREATMENT_ROLES,
  HR_ADMIN_ROLES,
  OFFER_STATUS,
  OFFER_TYPES,
  INTERVIEW_TYPES,
  INTERVIEW_RESULTS,
  SKILL_CATEGORIES,
  CONCOURS_DOCUMENT_TYPES,
  APPLICATION_STATUS,
  REFUSAL_REASONS,
  PASSWORD_MIN_LENGTH,
  DOCUMENT_TYPES,
  CONFIG,
  assertRequiredEnv,
};
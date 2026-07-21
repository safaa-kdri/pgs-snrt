const Joi = require('joi');
const ApiError = require('./ApiError');
const { PASSWORD_MIN_LENGTH, OFFER_TYPES, INTERVIEW_TYPES } = require('../config/constants');

/**
 * Regroupe :
 *  - la validation fine de la politique de mot de passe (RG-003)
 *  - tous les schemas Joi utilises par middlewares/validation.js
 * pour les modules dont Badr a la charge (auth, offres, entretiens).
 */

// ---------------------------------------------------------------------------
// Politique de mots de passe
//   Etudiants (externe) : 16 caracteres minimum
//   Personnel (interne)  : 20 caracteres minimum
//   Dans les deux cas : majuscule + minuscule + chiffre + caractere special
// ---------------------------------------------------------------------------
const UPPERCASE_RE = /[A-Z]/;
const LOWERCASE_RE = /[a-z]/;
const DIGIT_RE = /[0-9]/;
const SPECIAL_RE = /[^A-Za-z0-9]/;

function validatePasswordPolicy(password, userType) {
  const minLength = PASSWORD_MIN_LENGTH[userType];
  const errors = [];

  if (typeof password !== 'string' || password.length < minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${minLength} caracteres.`);
  }
  if (!UPPERCASE_RE.test(password || '')) errors.push('Le mot de passe doit contenir au moins une lettre majuscule.');
  if (!LOWERCASE_RE.test(password || '')) errors.push('Le mot de passe doit contenir au moins une lettre minuscule.');
  if (!DIGIT_RE.test(password || '')) errors.push('Le mot de passe doit contenir au moins un chiffre.');
  if (!SPECIAL_RE.test(password || '')) errors.push('Le mot de passe doit contenir au moins un caractere special.');

  if (errors.length > 0) {
    throw ApiError.badRequest('Le mot de passe ne respecte pas la politique de securite.', errors);
  }
}

// ---------------------------------------------------------------------------
// Schemas Joi - Authentification
// ---------------------------------------------------------------------------
const registerSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(60).required(),
  prenom: Joi.string().trim().min(2).max(60).required(),
  email: Joi.string().trim().email().required(),
  motDePasse: Joi.string().min(16).max(128).required(),
  telephone: Joi.string()
    .pattern(/^[0-9+()\s-]{8,20}$/)
    .required()
    .messages({ 'string.pattern.base': 'Numero de telephone invalide.' }),
  cin: Joi.string().trim().min(4).max(20).required(),
  civilite: Joi.string().valid('Mme', 'Mr').required(),
  dateNaissance: Joi.date().less('now').required(),
  adresse: Joi.string().trim().min(2).max(200).required(),
  ville: Joi.string().trim().min(2).max(100).required(),
  pays: Joi.string().trim().min(2).max(100).required(),
  universite: Joi.string().trim().max(150).allow('', null),
  filiere: Joi.string().trim().max(150).allow('', null),
  niveau: Joi.string().trim().max(50).allow('', null),
  annee: Joi.string().trim().max(20).allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  motDePasse: Joi.string().required(),
});

const verifyTwoFactorSchema = Joi.object({
  code: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({ 'string.pattern.base': 'Le code doit contenir exactement 6 chiffres.' }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});

const resetPasswordSchema = Joi.object({
  motDePasse: Joi.string().min(16).max(128).required(),
});

// ---------------------------------------------------------------------------
// Schemas Joi - Offres de stage
// ---------------------------------------------------------------------------
const subjectSchema = Joi.object({
  titre: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().min(10).max(3000).required(),
  missions: Joi.array().items(Joi.string().trim().max(300)).default([]),
  profilRecherche: Joi.string().trim().max(1000).allow('', null),
  competences: Joi.array()
    .items(
      Joi.object({
        nom: Joi.string().trim().required(),
        niveau: Joi.string().valid('Debutant', 'Intermediaire', 'Avance', 'Expert').required(),
      })
    )
    .default([]),
});

const documentRequisSchema = Joi.object({
  type: Joi.string().trim().required(),
  obligatoire: Joi.boolean().default(true),
});

const createOfferSchema = Joi.object({
  titre: Joi.string().trim().min(3).max(150).required(),
  description: Joi.string().trim().min(10).max(5000).required(),
  nbPostes: Joi.number().integer().min(1).required(),
  typeStage: Joi.string()
    .valid(...OFFER_TYPES)
    .required(),
  dateDebut: Joi.date().required(),
  dateFin: Joi.date().greater(Joi.ref('dateDebut')).required(),
  dateLimiteCandidature: Joi.date().less(Joi.ref('dateDebut')).required().messages({
    'date.less': 'La date limite de candidature doit etre anterieure a la date de debut du stage.',
  }),
  periodeId: Joi.string().hex().length(24).required(),
  sujets: Joi.array().items(subjectSchema).min(1).required().messages({
    'array.min': 'Une offre doit comporter au moins un sujet (RG-007).',
  }),
  documentsRequis: Joi.array().items(documentRequisSchema).default([]),
});

const updateOfferSchema = createOfferSchema.fork(
  ['titre', 'description', 'nbPostes', 'typeStage', 'dateDebut', 'dateFin', 'dateLimiteCandidature', 'periodeId', 'sujets'],
  (field) => field.optional()
);

const validateOfferSchema = Joi.object({
  decision: Joi.string().valid('Publiee', 'Refusee').required(),
  motifRefus: Joi.string().trim().max(500).when('decision', { is: 'Refusee', then: Joi.required() }),
});

// ---------------------------------------------------------------------------
// Schemas Joi - Entretiens
// ---------------------------------------------------------------------------
const createInterviewSchema = Joi.object({
  applicationId: Joi.string().hex().length(24).required(),
  date: Joi.date().greater('now').required(),
  heure: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .messages({ 'string.pattern.base': "Heure invalide (format attendu HH:mm)." }),
  duree: Joi.number().integer().min(10).max(240).default(30),
  lieu: Joi.string().trim().max(200).allow('', null),
  lienVisio: Joi.string().uri().allow('', null),
  type: Joi.string()
    .valid(...INTERVIEW_TYPES)
    .required(),
}).custom((value, helpers) => {
  if (value.type === 'Visio' && !value.lienVisio) {
    return helpers.message('Un lien de visioconference est requis pour un entretien de type Visio.');
  }
  if (value.type === 'Presentiel' && !value.lieu) {
    return helpers.message('Un lieu est requis pour un entretien presentiel.');
  }
  return value;
}, 'Coherence type/lieu-lien');

const updateInterviewSchema = Joi.object({
  date: Joi.date(),
  heure: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/),
  duree: Joi.number().integer().min(10).max(240),
  lieu: Joi.string().trim().max(200).allow('', null),
  lienVisio: Joi.string().uri().allow('', null),
  type: Joi.string().valid(...INTERVIEW_TYPES),
  commentaires: Joi.string().trim().max(2000).allow('', null),
  resultat: Joi.string().valid('EnAttente', 'Positive', 'Negative'),
}).min(1);

// ---------------------------------------------------------------------------
// Schemas Joi - Candidatures (applications)
// ---------------------------------------------------------------------------
const createApplicationSchema = Joi.object({
  etudiantId: Joi.string().hex().length(24).required(),
  offreId: Joi.string().hex().length(24).required(),
  commentaire: Joi.string().trim().max(1000).allow('', null),
  documents: Joi.array().items(Joi.string().hex().length(24)).default([]),
});

const updateApplicationSchema = Joi.object({
  commentaire: Joi.string().trim().max(1000).allow('', null),
  documents: Joi.array().items(Joi.string().hex().length(24)),
}).min(1);

const changeApplicationStatusSchema = Joi.object({
  statut: Joi.string()
    .valid('Brouillon', 'Soumise', 'EnAnalyse', 'Entretien', 'Acceptee', 'Refusee')
    .required(),
  commentaire: Joi.string().trim().max(1000).allow('', null),
});

const addDocumentToApplicationSchema = Joi.object({
  documentId: Joi.string().hex().length(24).required(),
});

// ---------------------------------------------------------------------------
// Schemas Joi - Departements
// ---------------------------------------------------------------------------
const createDepartmentSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(150).required(),
  description: Joi.string().trim().max(1000).allow('', null),
  responsableId: Joi.string().hex().length(24).allow(null),
  membres: Joi.array().items(Joi.string().hex().length(24)).default([]),
  actif: Joi.boolean().default(true),
});

const updateDepartmentSchema = createDepartmentSchema.fork(['nom'], (field) => field.optional()).min(1);

const assignResponsableSchema = Joi.object({
  responsableId: Joi.string().hex().length(24).required(),
});

const departmentMemberSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

// ---------------------------------------------------------------------------
// Schemas Joi - Utilisateurs (creation/administration par un Administrateur)
// ---------------------------------------------------------------------------
const createInternalUserSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(60).required(),
  prenom: Joi.string().trim().min(2).max(60).required(),
  email: Joi.string().trim().email().required(),
  motDePasse: Joi.string().min(PASSWORD_MIN_LENGTH.interne).max(128).required(),
  telephone: Joi.string()
    .pattern(/^[0-9+()\s-]{8,20}$/)
    .allow(null, ''),
  roleId: Joi.string().hex().length(24).required(),
  departementId: Joi.string().hex().length(24).allow(null),
  actif: Joi.boolean().default(true),
});

const changeUserRoleSchema = Joi.object({
  roleId: Joi.string().hex().length(24).required(),
});

const assignDepartmentToUserSchema = Joi.object({
  departementId: Joi.string().hex().length(24).required(),
});

const changeUserStatusSchema = Joi.object({
  actif: Joi.boolean().required(),
});

module.exports = {
  validatePasswordPolicy,
  registerSchema,
  loginSchema,
  verifyTwoFactorSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createOfferSchema,
  updateOfferSchema,
  validateOfferSchema,
  createInterviewSchema,
  updateInterviewSchema,
  createApplicationSchema,
  updateApplicationSchema,
  changeApplicationStatusSchema,
  addDocumentToApplicationSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  assignResponsableSchema,
  departmentMemberSchema,
  createInternalUserSchema,
  changeUserRoleSchema,
  assignDepartmentToUserSchema,
  changeUserStatusSchema,
};
// src/utils/validators.js
// CORRECTION : Utiliser les mêmes valeurs que le modèle MongoDB (sans accents)

const Joi = require('joi');
const ApiError = require('./ApiError');
const { PASSWORD_MIN_LENGTH, OFFER_TYPES, INTERVIEW_TYPES } = require('../config/constants');
const { CIN_REGEX, PHONE_REGEX } = require('./regex');


const UPPERCASE_RE = /[A-Z]/;
const LOWERCASE_RE = /[a-z]/;
const DIGIT_RE = /[0-9]/;
const SPECIAL_RE = /[^A-Za-z0-9]/;

const CIN_RE = CIN_REGEX;
const CIN_MESSAGE = 'CIN invalide (format attendu : 1 ou 2 lettres suivies de 6 chiffres, ex: AB123456).';


const PHONE_RE = PHONE_REGEX;
const PHONE_MESSAGE = 'Numero de telephone invalide (format attendu : 06XXXXXXXX, 07XXXXXXXX ou +212XXXXXXXXX).';

function validatePasswordPolicy(password, userType) {
  const minLength = PASSWORD_MIN_LENGTH[userType];
  const errors = [];

  const userTypeLabel = userType === 'externe' ? 'étudiant' : 'interne (admin, RH, département, encadrant)';

  if (typeof password !== 'string' || password.length < minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${minLength} caractères (${userTypeLabel}).`);
  }
  if (!UPPERCASE_RE.test(password || '')) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule (A-Z).');
  }
  if (!LOWERCASE_RE.test(password || '')) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule (a-z).');
  }
  if (!DIGIT_RE.test(password || '')) {
    errors.push('Le mot de passe doit contenir au moins un chiffre (0-9).');
  }
  if (!SPECIAL_RE.test(password || '')) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&* etc.).');
  }

  if (errors.length > 0) {
    throw ApiError.badRequest(errors.join(' '), errors);
  }
}

const registerSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(60).required(),
  prenom: Joi.string().trim().min(2).max(60).required(),
  email: Joi.string().trim().email().required(),
  emailConfirmation: Joi.string().trim().email().required(),
  motDePasse: Joi.string().min(16).max(128).required(),
  telephone: Joi.string()
    .trim()
    .pattern(PHONE_RE)
    .required()
    .messages({ 'string.pattern.base': PHONE_MESSAGE }),
  cin: Joi.string().trim().uppercase().pattern(CIN_RE).required().messages({ 'string.pattern.base': CIN_MESSAGE }),
  civilite: Joi.string().valid('Mme', 'Mr').required(),
  dateNaissance: Joi.date().less('now').required(),
  adresse: Joi.string().trim().min(2).max(200).required(),
  ville: Joi.string().trim().min(2).max(100).required(),
  pays: Joi.string().trim().min(2).max(100).required(),
  universite: Joi.string().trim().max(150).allow('', null),
  filiere: Joi.string().trim().max(150).allow('', null),
  niveau: Joi.string().trim().max(50).allow('', null),
  annee: Joi.string().trim().max(20).allow('', null),
  acceptTerms: Joi.boolean().valid(true).required().messages({
    'any.only': 'Vous devez accepter les conditions d\'utilisation.',
    'any.required': 'Vous devez accepter les conditions d\'utilisation.',
  }),
}).custom((value, helpers) => {
  if (value.email !== value.emailConfirmation) {
    return helpers.message('Les adresses email ne correspondent pas.');
  }
  return value;
}, 'Email confirmation');

const loginSchema = Joi.object({
  cin: Joi.string().trim().uppercase().pattern(CIN_RE).required().messages({ 'string.pattern.base': CIN_MESSAGE }),
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

const changePasswordSchema = Joi.object({
  ancienMotDePasse: Joi.string().required().messages({
    'string.empty': 'Le mot de passe actuel est requis',
    'any.required': 'Le mot de passe actuel est requis',
  }),
  nouveauMotDePasse: Joi.string().required().messages({
    'string.empty': 'Le nouveau mot de passe est requis',
    'any.required': 'Le nouveau mot de passe est requis',
  }),
});

// CORRECTION : Utiliser les valeurs sans accents pour correspondre au modèle MongoDB
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
    'array.min': 'Une offre doit comporter au moins un sujet (RG-010).',
  }),
  documentsRequis: Joi.array().items(documentRequisSchema).default([]),
  departementId: Joi.string().hex().length(24).optional().allow(null, ''),
});

const updateOfferSchema = createOfferSchema.fork(
  ['titre', 'description', 'nbPostes', 'typeStage', 'dateDebut', 'dateFin', 'dateLimiteCandidature', 'periodeId', 'sujets'],
  (field) => field.optional()
);

const validateOfferSchema = Joi.object({
  decision: Joi.string().valid('Publiee', 'Refusee').required(),
  motifRefus: Joi.string().trim().max(500).when('decision', { is: 'Refusee', then: Joi.required() }),
});


// MODIFICATION : createInterviewSchema (avec offreId et cins)
const createInterviewSchema = Joi.object({
  offreId: Joi.string().required().messages({
    'any.required': 'Veuillez sélectionner une offre'
  }),
  cins: Joi.array()
    .items(Joi.string().pattern(/^[A-Z]{1,2}[0-9]{5,8}$/))
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.min': 'Veuillez fournir au moins un CIN',
      'array.max': 'Vous ne pouvez pas sélectionner plus de 20 candidats',
      'string.pattern.base': 'Format de CIN invalide (ex: AB123456)'
    }),
  date: Joi.date().min('now').required().messages({
    'date.min': 'La date doit être dans le futur'
  }),
  heure: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Format d\'heure invalide (HH:mm)'
  }),
  duree: Joi.number().min(15).max(180).default(30),
  type: Joi.string().valid('presentiel', 'visio', 'telephonique').required(),
  lieu: Joi.when('type', {
    is: 'presentiel',
    then: Joi.string().required().messages({
      'any.required': 'Le lieu est requis pour un entretien présentiel'
    }),
    otherwise: Joi.string().allow('', null)
  }),
  lienVisio: Joi.when('type', {
    is: 'visio',
    then: Joi.string().uri().required().messages({
      'any.required': 'Le lien visio est requis',
      'string.uri': 'URL invalide'
    }),
    otherwise: Joi.string().allow('', null)
  }),
  commentaires: Joi.string().allow('', null).max(1000)
});

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


const createApplicationSchema = Joi.object({
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


// NOUVEAU SCHEMA : Accepte role (nom) ET departementNom
const createInternalUserSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(60).required(),
  prenom: Joi.string().trim().min(2).max(60).required(),
  email: Joi.string().trim().email().required(),
  cin: Joi.string().trim().uppercase().pattern(CIN_RE).required().messages({ 'string.pattern.base': CIN_MESSAGE }),
  motDePasse: Joi.string().min(PASSWORD_MIN_LENGTH.interne).max(128).required(),
  telephone: Joi.string()
    .trim()
    .pattern(PHONE_RE)
    .allow(null, '')
    .messages({ 'string.pattern.base': PHONE_MESSAGE }),
  role: Joi.string().trim().optional(),
  roleId: Joi.string().hex().length(24).optional(),
  departementNom: Joi.string().trim().optional().allow(null, ''),
  departementId: Joi.string().hex().length(24).allow(null).optional(),
  actif: Joi.boolean().default(true),
}).custom((value, helpers) => {
  if (!value.role && !value.roleId) {
    return helpers.message('Le champ "role" est requis (ex: "Encadrant")');
  }
  return value;
}, 'Role validation');


const createExternalUserSchema = registerSchema.keys({
  actif: Joi.boolean().default(true),
});


const updateInternalUserSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(60),
  prenom: Joi.string().trim().min(2).max(60),
  telephone: Joi.string()
    .trim()
    .pattern(PHONE_RE)
    .allow(null, '')
    .messages({ 'string.pattern.base': PHONE_MESSAGE }),
}).min(1);

const updateExternalUserSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(60),
  prenom: Joi.string().trim().min(2).max(60),
  telephone: Joi.string()
    .trim()
    .pattern(PHONE_RE)
    .messages({ 'string.pattern.base': PHONE_MESSAGE }),
  adresse: Joi.string().trim().min(2).max(200),
  ville: Joi.string().trim().min(2).max(100),
  pays: Joi.string().trim().min(2).max(100),
  universite: Joi.string().trim().max(150).allow('', null),
  filiere: Joi.string().trim().max(150).allow('', null),
  niveau: Joi.string().trim().max(50).allow('', null),
  annee: Joi.string().trim().max(20).allow('', null),
}).min(1);

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
  changePasswordSchema,
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
  createExternalUserSchema,
  updateInternalUserSchema,
  updateExternalUserSchema,
  changeUserRoleSchema,
  assignDepartmentToUserSchema,
  changeUserStatusSchema,
};
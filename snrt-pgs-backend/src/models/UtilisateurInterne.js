const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

const { CIN_REGEX, PHONE_REGEX } = require('../utils/regex');

const utilisateurInterneSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Adresse email invalide.'],
    },
    motDePasse: { type: String, required: true, select: false }, // hash Argon2id
    telephone: {
      type: String,
      default: null,
      match: [PHONE_REGEX, 'Numero de telephone invalide.'],
    },
    dateInscription: { type: Date, default: Date.now },
    actif: { type: Boolean, default: true },

  
    cin: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: [CIN_REGEX, 'CIN invalide.'],
    },

    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    departementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },

    twoFactor: {
      codeHash: { type: String, default: null, select: false },
      expiresAt: { type: Date, default: null, select: false },
    },

    refreshTokens: {
      type: [
        {
          tokenHash: { type: String, required: true },
          expiresAt: { type: Date, required: true },
          createdAt: { type: Date, default: Date.now },
          userAgent: { type: String, default: null },
          ip: { type: String, default: null },
        },
      ],
      default: [],
      select: false,
    },

    passwordReset: {
      tokenHash: { type: String, default: null, select: false },
      expiresAt: { type: Date, default: null, select: false },
    },

    security: {
      failedLoginAttempts: { type: Number, default: 0, select: false },
      lockUntil: { type: Date, default: null, select: false },
    },

    derniereConnexion: { type: Date, default: null },
    signature: { type: String, default: null },
  },
  { timestamps: true, collection: 'utilisateurs_internes' }
);


utilisateurInterneSchema.add(BaseSchema);

utilisateurInterneSchema.index({ roleId: 1 });
utilisateurInterneSchema.index({ departementId: 1 });

utilisateurInterneSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.motDePasse;
    delete ret.twoFactor;
    delete ret.refreshTokens;
    delete ret.passwordReset;
    delete ret.security;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model(
  'UtilisateurInterne',
  utilisateurInterneSchema, 
  'utilisateurs_internes'
);
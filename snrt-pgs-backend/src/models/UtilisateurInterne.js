const mongoose = require('mongoose');

/**
 * Collection "utilisateurs_internes" (Dossier de Conception - 3.1).
 * Personnel SNRT : Administrateur, RH, Departement, Encadrant.
 * Ces comptes sont crees par un Administrateur (module Administration,
 * hors perimetre du module Authentification) - pas d'auto-inscription.
 */
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
      match: [/^(?:\+212|0)[5-7][0-9]{8}$/, 'Numero de telephone invalide.'],
    },
    dateInscription: { type: Date, default: Date.now },
    actif: { type: Boolean, default: true },

    // Ajoute pour permettre la connexion par CIN (comme utilisateurs_externes) :
    // desormais tous les comptes (internes et externes) se connectent avec
    // leur CIN + mot de passe, l'email restant utilise pour les notifications
    // et la reinitialisation de mot de passe. RG-002 : unique dans la base de
    // donnees, donc verifie cote applicatif a travers les deux collections
    // (voir utils/userLookup.js) puisque Mongoose ne peut pas imposer une
    // contrainte unique cross-collection.
    cin: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{1,2}[0-9]{6}$/, 'CIN invalide.'],
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
  },
  { timestamps: true, collection: 'utilisateurs_internes' }
);

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

module.exports = mongoose.model('UtilisateurInterne', utilisateurInterneSchema);
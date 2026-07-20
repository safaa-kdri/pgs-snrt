const mongoose = require('mongoose');

/**
 * Collection "utilisateurs_externes" (Dossier de Conception - 3.2).
 * Etudiants / candidats. Seul type de compte pouvant s'auto-inscrire
 * via POST /api/v1/auth/register.
 */
const documentSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    type: { type: String, required: true },
    chemin: { type: String, required: true },
    dateUpload: { type: Date, default: Date.now },
  },
  { _id: true }
);

const utilisateurExterneSchema = new mongoose.Schema(
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
    motDePasse: { type: String, required: true, select: false }, 
    telephone: { type: String, required: true },
    dateInscription: { type: Date, default: Date.now },
    actif: { type: Boolean, default: true },

    cin: { type: String, required: true, unique: true, trim: true, uppercase: true },
    civilite: { type: String, required: true, enum: ['Mme', 'Mr'] },
    dateNaissance: { type: Date, required: true },
    adresse: { type: String, required: true },
    ville: { type: String, required: true },
    pays: { type: String, required: true },
    universite: { type: String, default: null },
    filiere: { type: String, default: null },
    niveau: { type: String, default: null },
    annee: { type: String, default: null },

    documents: { type: [documentSchema], default: [] },

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
  { timestamps: true, collection: 'utilisateurs_externes' }
);

utilisateurExterneSchema.set('toJSON', {
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

module.exports = mongoose.model('UtilisateurExterne', utilisateurExterneSchema);

const mongoose = require('mongoose');
const subjectSchema = require('./Subject');
const { OFFER_STATUS, OFFER_TYPES } = require('../config/constants');

/**
 * Collection "offers" (Dossier de Conception - 3.6).
 * Regles de gestion appliquees (Cahier des charges, section 6.2 / RG-006 a RG-011) :
 *  - RG-006 : rattachee a un seul departement (departementId)
 *  - RG-007 : au moins un sujet (validation ci-dessous)
 *  - RG-008 : publication uniquement apres validation RH (workflow statut,
 *             voir controllers/offerController.js)
 *  - RG-009 : dateDebut > dateLimiteCandidature
 *  - RG-010 : archivage automatique si dateDebut depassee (voir static
 *             Offer.archiveExpiredOffers(), a brancher sur un job planifie)
 *  - RG-011 : suppression interdite pour une offre validee (hook ci-dessous),
 *             seule la desactivation/archivage est autorisee
 */
const documentRequisSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    obligatoire: { type: Boolean, default: true },
  },
  { _id: false }
);

const offerSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    nbPostes: { type: Number, required: true, min: 1 },
    typeStage: { type: String, enum: OFFER_TYPES, required: true },
    statut: {
      type: String,
      enum: Object.values(OFFER_STATUS),
      default: OFFER_STATUS.BROUILLON,
    },
    datePublication: { type: Date, default: null },
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },
    dateLimiteCandidature: { type: Date, required: true },

    // --- References ---
    departementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    createurId: { type: mongoose.Schema.Types.ObjectId, ref: 'UtilisateurInterne', required: true },
    validateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'UtilisateurInterne', default: null },
    periodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Period', required: true },

    // --- Embarque : sujets (RG-007 : au moins un) ---
    sujets: {
      type: [subjectSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: 'Une offre doit comporter au moins un sujet (RG-007).',
      },
    },

    // --- Embarque : documents requis pour candidater ---
    documentsRequis: { type: [documentRequisSchema], default: [] },

    motifRefus: { type: String, default: null },
  },
  { timestamps: true, collection: 'offers' }
);

offerSchema.index({ departementId: 1 });
offerSchema.index({ periodeId: 1 });
offerSchema.index({ statut: 1 });
offerSchema.index({ typeStage: 1 });
offerSchema.index({ datePublication: -1 });
// Recherche texte simple (titre/description) pour le filtrage cote etudiant.
offerSchema.index({ titre: 'text', description: 'text' });

// RG-009 : la date de debut de stage doit etre posterieure a la date limite de candidature.
offerSchema.pre('validate', function preValidate(next) {
  if (this.dateDebut && this.dateLimiteCandidature && this.dateDebut <= this.dateLimiteCandidature) {
    return next(new Error('La date de debut de stage doit etre posterieure a la date limite de candidature (RG-009).'));
  }
  if (this.dateFin && this.dateDebut && this.dateFin <= this.dateDebut) {
    return next(new Error('La date de fin de stage doit etre posterieure a la date de debut.'));
  }
  return next();
});

// RG-011 : une offre publiee ne peut pas etre supprimee definitivement, uniquement archivee.
function blockDeleteIfPublished(next) {
  const statut = this.statut || this.getUpdate?.()?.statut;
  if (statut === OFFER_STATUS.PUBLIEE) {
    return next(new Error('Une offre publiee ne peut pas etre supprimee (RG-011). Utilisez l\'archivage.'));
  }
  return next();
}
offerSchema.pre('deleteOne', { document: true, query: false }, blockDeleteIfPublished);
offerSchema.pre('findOneAndDelete', blockDeleteIfPublished);

/**
 * RG-010 : archive automatiquement toute offre publiee dont la date de debut
 * est depassee. A appeler depuis un job planifie (cron) au demarrage du
 * serveur ou via un scheduler externe - non declenche automatiquement ici
 * pour eviter tout effet de bord a l'import du modele.
 */
offerSchema.statics.archiveExpiredOffers = async function archiveExpiredOffers() {
  const result = await this.updateMany(
    { statut: OFFER_STATUS.PUBLIEE, dateDebut: { $lt: new Date() } },
    { $set: { statut: OFFER_STATUS.ARCHIVEE } }
  );
  return result.modifiedCount;
};

module.exports = mongoose.model('Offer', offerSchema);

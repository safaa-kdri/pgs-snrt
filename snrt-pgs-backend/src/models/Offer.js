const mongoose = require('mongoose');
const subjectSchema = require('./Subject');
const { OFFER_STATUS, OFFER_TYPES, CONCOURS_DOCUMENT_TYPES } = require('../config/constants');


const documentRequisSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    obligatoire: { type: Boolean, default: true },
  },
  { _id: false }
);

const concoursDocumentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: CONCOURS_DOCUMENT_TYPES, required: true },
    nomOriginal: { type: String, required: true, trim: true },
    nomStocke: { type: String, required: true, trim: true },
    chemin: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    taille: { type: Number, required: true },
    datePublication: { type: Date, default: Date.now },
    publieParId: { type: mongoose.Schema.Types.ObjectId, ref: 'UtilisateurInterne' },
  },
  { _id: true, timestamps: false }
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

    
    departementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    createurId: { type: mongoose.Schema.Types.ObjectId, ref: 'UtilisateurInterne', required: true },
    validateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'UtilisateurInterne', default: null },
    periodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Period', required: true },

    
    sujets: {
      type: [subjectSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,

        message: 'Une offre doit comporter au moins un sujet (RG-010).',
      },
    },

    documentsRequis: { type: [documentRequisSchema], default: [] },

    documentsConcours: { type: [concoursDocumentSchema], default: [] },

    motifRefus: { type: String, default: null },
  },
  { timestamps: true, collection: 'offers' }
);

offerSchema.index({ departementId: 1 });
offerSchema.index({ periodeId: 1 });
offerSchema.index({ statut: 1 });
offerSchema.index({ typeStage: 1 });
offerSchema.index({ datePublication: -1 });

offerSchema.index({ titre: 'text', description: 'text' });

offerSchema.pre('validate', function preValidate(next) {
  if (this.dateDebut && this.dateLimiteCandidature && this.dateDebut <= this.dateLimiteCandidature) {
 
    return next(new Error('La date de debut de stage doit etre posterieure a la date limite de candidature (RG-012).'));
  }
  if (this.dateFin && this.dateDebut && this.dateFin <= this.dateDebut) {
    return next(new Error('La date de fin de stage doit etre posterieure a la date de debut.'));
  }
  return next();
});

function blockDeleteIfPublished(next) {
  const statut = this.statut || this.getUpdate?.()?.statut;
  if (statut === OFFER_STATUS.PUBLIEE) {
 
    return next(new Error('Une offre publiee ne peut pas etre supprimee (RG-014). Utilisez l\'archivage.'));
  }
  return next();
}
offerSchema.pre('deleteOne', { document: true, query: false }, blockDeleteIfPublished);
offerSchema.pre('findOneAndDelete', blockDeleteIfPublished);


offerSchema.statics.archiveExpiredOffers = async function archiveExpiredOffers() {
  const result = await this.updateMany(
    { statut: OFFER_STATUS.PUBLIEE, dateDebut: { $lt: new Date() } },
    { $set: { statut: OFFER_STATUS.ARCHIVEE } }
  );
  return result.modifiedCount;
};

module.exports = mongoose.model('Offer', offerSchema);

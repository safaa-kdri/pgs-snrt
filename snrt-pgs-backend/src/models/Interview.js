const mongoose = require('mongoose');
const { INTERVIEW_TYPES, INTERVIEW_RESULTS } = require('../config/constants');

const interviewSchema = new mongoose.Schema(
  {
    // Tableau de candidatures (remplace applicationId)
    applicationIds: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Application', 
      required: true 
    }],
    
    planificateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'UtilisateurInterne', required: true },

    date: { type: Date, required: true },
    heure: { type: String, required: true }, // format HH:mm
    duree: { type: Number, default: 30 }, // minutes
    lieu: { type: String, default: null },
    lienVisio: { type: String, default: null },
    type: { type: String, enum: INTERVIEW_TYPES, required: true },

    commentaires: { type: String, default: null },
    resultat: { type: String, enum: INTERVIEW_RESULTS, default: 'EnAttente' },

    statut: {
      type: String,
      enum: ['Planifie', 'Realise', 'Annule'],
      default: 'Planifie',
    },
  },
  { timestamps: true, collection: 'interviews' }
);

interviewSchema.index({ applicationIds: 1 });

interviewSchema.index({ date: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
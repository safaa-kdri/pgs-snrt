const mongoose = require('mongoose');
const { INTERVIEW_TYPES, INTERVIEW_RESULTS } = require('../config/constants');

/**
 * Collection "interviews".
 *
 * NOTE DE CONCEPTION : le Dossier de Conception (MLD, section 3.8) decrit
 * "entretien" comme un sous-document embarque dans "applications". Cette
 * implementation en fait une collection a part entiere, referencant
 * applicationId, car le cahier des charges expose des endpoints dedies
 * (POST /api/v1/interviews - Table 3.8) et un controleur/route dedies
 * (interviewController.js / interviewRoutes.js). Une collection independante
 * facilite en outre les vues "planning des entretiens" transverses a
 * plusieurs candidatures, sans avoir a agreger toutes les candidatures.
 */
const interviewSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    planificateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'UtilisateurInterne', required: true },

    date: { type: Date, required: true },
    heure: { type: String, required: true }, // format HH:mm
    duree: { type: Number, default: 30 }, // minutes
    lieu: { type: String, default: null },
    lienVisio: { type: String, default: null },
    type: { type: String, enum: INTERVIEW_TYPES, required: true },

    // Commentaires confidentiels : RH et Departement uniquement (regle metier
    // du cahier des charges, section 7.5) - jamais exposes a l'etudiant,
    // filtrage applicatif effectue dans interviewController.js.
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

interviewSchema.index({ applicationId: 1 });
interviewSchema.index({ date: 1 });

module.exports = mongoose.model('Interview', interviewSchema);

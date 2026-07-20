const mongoose = require('mongoose');

/**
 * Collection "favorites" (Dossier de Conception - 3.11).
 * Permet a un etudiant de sauvegarder une offre pour la retrouver plus tard.
 * RG-022 : un etudiant ne peut sauvegarder une offre en favori qu'une seule
 * fois -> index compose unique (etudiantId, offreId).
 */
const favoriteSchema = new mongoose.Schema(
  {
    etudiantId: { type: mongoose.Schema.Types.ObjectId, ref: 'UtilisateurExterne', required: true },
    offreId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
    dateAjout: { type: Date, default: Date.now },
    notes: { type: String, default: null },
  },
  { timestamps: true, collection: 'favorites' }
);

favoriteSchema.index({ etudiantId: 1, offreId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);

const mongoose = require('mongoose');


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

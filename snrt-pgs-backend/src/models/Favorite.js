// src/models/Favorite.js
const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    etudiantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurExterne',
        required: true
    },
    offreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    },
    dateAjout: {
        type: Date,
        default: Date.now
    },
    notes: String
}, {
    timestamps: true
});

// Index composite unique pour éviter les doublons
FavoriteSchema.index({ etudiantId: 1, offreId: 1 }, { unique: true });
FavoriteSchema.index({ etudiantId: 1 });
FavoriteSchema.index({ offreId: 1 });

module.exports = mongoose.model('Favorite', FavoriteSchema);
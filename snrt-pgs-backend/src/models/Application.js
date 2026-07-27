// src/models/Application.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

const ApplicationSchema = new mongoose.Schema({
    dateSoumission: {
        type: Date,
        default: Date.now
    },
    statut: {
        type: String,
        enum: ['Brouillon', 'Soumise', 'EnAnalyse', 'Entretien', 'Acceptee', 'Refusee'],
        default: 'Brouillon'
    },
    commentaire: String,
    
    // Références
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
    traiteurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurInterne'
    },
    
    // Embedded
documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
}],
    
    entretien: {
        date: Date,
        heure: String,
        duree: Number,
        lieu: String,
        lienVisio: String,
        type: {
            type: String,
            enum: ['Presentiel', 'Visio', 'Telephonique']
        },
        commentaires: String,
        resultat: {
            type: String,
            enum: ['EnAttente', 'Positive', 'Negative'],
            default: 'EnAttente'
        }
    },
    
    historique: [{
    date: { type: Date, default: Date.now },
    ancienStatut: String,
    nouveauStatut: {
        type: String,
        enum: ['Brouillon', 'Soumise', 'EnAnalyse', 'Entretien', 'Acceptee', 'Refusee']
    },
    commentaire: String,
    auteurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurInterne'
    }
}]
}, {
    timestamps: true
});

ApplicationSchema.add(BaseSchema);

ApplicationSchema.index({ etudiantId: 1 });
ApplicationSchema.index({ offreId: 1 });
ApplicationSchema.index({ statut: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
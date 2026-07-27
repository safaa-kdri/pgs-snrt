// src/models/Application.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');
const { APPLICATION_STATUS, INTERVIEW_TYPES, INTERVIEW_RESULTS } = require('../config/constants');

const ApplicationSchema = new mongoose.Schema({
    dateSoumission: {
        type: Date,
        default: Date.now
    },
    statut: {
        type: String,
        // BUGFIX (mineur, coherence) : enum recopiee a la main auparavant
        // ('Brouillon', 'Soumise', ...), desormais alignee sur
        // APPLICATION_STATUS (config/constants.js) - la meme source de
        // verite deja utilisee par applicationController.js et
        // validators.js, pour eviter tout desalignement si la liste des
        // statuts venait a changer.
        enum: Object.values(APPLICATION_STATUS),
        default: APPLICATION_STATUS.BROUILLON
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
            enum: INTERVIEW_TYPES
        },
        commentaires: String,
        resultat: {
            type: String,
            enum: INTERVIEW_RESULTS,
            default: 'EnAttente'
        }
    },
    
    historique: [{
    date: { type: Date, default: Date.now },
    ancienStatut: String,
    nouveauStatut: {
        type: String,
        enum: Object.values(APPLICATION_STATUS)
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


ApplicationSchema.index(
    { etudiantId: 1, offreId: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false } }
);

module.exports = mongoose.model('Application', ApplicationSchema);

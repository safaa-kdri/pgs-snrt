// src/models/Internship.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

const InternshipSchema = new mongoose.Schema({
    dateDebut: {
        type: Date,
        required: true
    },
    dateFin: {
        type: Date,
        required: true
    },
    statut: {
        type: String,
        enum: ['EnCours', 'Termine', 'Annule'],
        default: 'EnCours'
    },
    noteFinale: {
        type: Number,
        min: 0,
        max: 20
    },
    remarques: String,
    
    // Références
    etudiantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurExterne',
        required: true
    },
    encadrantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurInterne',
        required: true
    },
    offreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    
    // Embedded
    livrables: [{
        nom: String,
        type: {
            type: String,
            enum: ['Rapport', 'Presentation', 'Autre']
        },
        chemin: String,
        dateDepot: Date,
        valide: { type: Boolean, default: false },
        commentaire: String
    }],
    
    remarquesEncadrant: [{
        date: { type: Date, default: Date.now },
        message: String,
        auteurId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UtilisateurInterne'
        }
    }],
    
    evaluation: {
        dateEvaluation: Date,
        note: Number,
        commentaires: String,
        competencesEvaluees: [{
            nom: String,
            niveau: {
                type: String,
                enum: ['Debutant', 'Intermediaire', 'Avance', 'Expert']
            },
            note: Number
        }]
    }
}, {
    timestamps: true
});

InternshipSchema.add(BaseSchema);

InternshipSchema.index({ etudiantId: 1 });
InternshipSchema.index({ encadrantId: 1 });
InternshipSchema.index({ statut: 1 });

module.exports = mongoose.model('Internship', InternshipSchema);
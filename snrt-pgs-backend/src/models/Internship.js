// src/models/Internship.js
// ✅ CORRECTION : encadrantId devient optionnel
// ✅ AJOUT : Statuts supplémentaires pour le workflow (EngagementValide, EngagementRejete)

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
        enum: [
            'EnCours', 
            'Termine', 
            'Annule',
            'EngagementEnvoye',
            'EngagementRecu',
            'EngagementValide',
            'EngagementRejete',
            'EnAttenteValidationDirecteur',
            'ValideParDirecteur',
            'DemandeEnvoyee'
        ],
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
        required: false
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
    
    // CHAMPS DU SUJET DE L'OFFRE (copiés depuis l'offre)
    sujetTitre: {
        type: String,
        default: null
    },
    sujetDescription: {
        type: String,
        default: null
    },
    sujetObjectifs: {
        type: String,
        default: null
    },
    sujetTechnologies: {
        type: String,
        default: null
    },
    sujetLivrables: {
        type: String,
        default: null
    },
    
    // Livrables
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
    // src/models/Internship.js

convention: {
    nomOriginal: {
        type: String,
        trim: true
    },
    chemin: {
        type: String
    },
    statut: {
        type: String,
        enum: ['NonGeneree', 'DeposeeEtudiant', 'SigneeRH', 'EnvoyeeEtudiant', 'Cloturee'],
        default: 'NonGeneree'
    },
    dateDepot: {
        type: Date
    },
    dateSignatureRH: {
        type: Date
    },
    dateEnvoi: {
        type: Date
    },
    signatureRH: {
        type: String,
        trim: true
    },
    signedByRH: {
        type: Boolean,
        default: false
    },
    signeePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurInterne'
    }
},
    
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
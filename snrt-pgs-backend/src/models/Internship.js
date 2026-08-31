// src/models/Internship.js
// CORRECTION : Ajout du champ convention pour la gestion des conventions
// CORRECTION : encadrantId devient optionnel
// AJOUT : Statuts supplémentaires pour le workflow (EngagementValide, EngagementRejete)
// AJOUT : Sous-document convention avec tous les champs nécessaires
// AJOUT : gridFsId dans le schéma livrables

const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

// ============================================
// SCHEMA DE LA CONVENTION
// ============================================
const ConventionSchema = new mongoose.Schema({
    nomOriginal: {
        type: String,
        required: true
    },
    nomStocke: {
        type: String,
        required: true
    },
    chemin: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        default: 'application/pdf'
    },
    taille: {
        type: Number
    },
    gridFsId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    cheminSignee: {
        type: String,
        default: null
    },
    urlSignee: {
        type: String,
        default: null
    },
    url: {
        type: String,
        default: null
    },
    dateDepot: {
        type: Date,
        default: Date.now
    },
    statut: {
        type: String,
        enum: ['DeposeeEtudiant', 'SigneeRH', 'EnvoyeeEtudiant', 'Cloturee'],
        default: 'DeposeeEtudiant'
    },
    dateSignature: {
        type: Date
    },
    dateEnvoi: {
        type: Date
    },
    signedByRH: {
        type: Boolean,
        default: false
    },
    signatureRH: {
        date: {
            type: Date,
            default: Date.now
        },
        rhId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UtilisateurInterne'
        },
        rhNom: {
            type: String
        },
        signatureData: {
            type: String
        },
        position: {
            x: { type: Number, default: 50 },
            y: { type: Number, default: 280 },
            width: { type: Number, default: 150 },
            height: { type: Number, default: 60 },
            page: { type: Number, default: 0 }
        }
    }
}, {
    _id: false
});

// ============================================
// SCHEMA PRINCIPAL INTERNSHIP
// ============================================
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
    
    // Livrables avec gridFsId
    livrables: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true
        },
        nom: {
            type: String
        },
        type: {
            type: String,
            enum: ['Rapport', 'Presentation', 'Autre']
        },
        chemin: {
            type: String
        },
        gridFsId: {
            type: mongoose.Schema.Types.ObjectId
        },
        dateDepot: {
            type: Date
        },
        valide: {
            type: Boolean,
            default: false
        },
        commentaire: {
            type: String
        }
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
    },

    // AJOUT : CHAMP CONVENTION
    convention: {
        type: ConventionSchema,
        default: null
    }
}, {
    timestamps: true
});

// ============================================
// INDEX POUR LES RECHERCHES
// ============================================
InternshipSchema.add(BaseSchema);

InternshipSchema.index({ etudiantId: 1 });
InternshipSchema.index({ encadrantId: 1 });
InternshipSchema.index({ statut: 1 });
InternshipSchema.index({ 'convention.statut': 1 });
InternshipSchema.index({ 'convention.dateDepot': -1 });

module.exports = mongoose.model('Internship', InternshipSchema);
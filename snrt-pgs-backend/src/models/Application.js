// src/models/Application.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');
const { APPLICATION_STATUS, INTERVIEW_TYPES, INTERVIEW_RESULTS } = require('../config/constants');

const ApplicationSchema = new mongoose.Schema({
    // ============================================
    // CHAMPS EXISTANTS
    // ============================================
    
    dateSoumission: {
        type: Date,
        default: Date.now
    },
    statut: {
        type: String,
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
    
    // Documents (références vers Document)
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }],
    
    // Entretien
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
    
    // Historique
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
    }],
    
    // ============================================
    // ✅ NOUVEAUX CHAMPS POUR LE WORKFLOW DE CANDIDATURE
    // ============================================
    
    // 📚 ÉTAPE 1 - INFORMATIONS UNIVERSITAIRES
    universite: {
        type: String,
        default: '',
        trim: true
    },
    etablissement: {
        type: String,
        default: '',
        trim: true
    },
    filiere: {
        type: String,
        default: '',
        trim: true
    },
    niveau: {
        type: String,
        default: '',
        trim: true
    },
    anneeUniversitaire: {
        type: String,
        default: '',
        trim: true
    },
    typeStageDemande: {
        type: String,
        default: '',
        trim: true
    },
    dureeStage: {
        type: String,
        default: '',
        trim: true
    },
    dateDebutPrevue: {
        type: Date,
        default: null
    },
    dateFinPrevue: {
        type: Date,
        default: null
    },
    
    // ✅ ÉTAPE 2 - FICHE DE DEMANDE DE STAGE (CORRIGÉ)
    ficheAccepte: {
        type: Boolean,
        default: false
    },
    ficheDateAccepte: {
        type: Date,
        default: null
    },
    ficheFichierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    },
    
    // 🚀 ÉTAPE 3 - SUIVI DU WORKFLOW
    workflowEtape: {
        type: Number,
        default: 1,
        min: 1,
        max: 3
    },
    workflowComplete: {
        type: Boolean,
        default: false
    },
    dateDebutReelle: {
        type: Date,
        default: null
    },
    dateFinReelle: {
        type: Date,
        default: null
    },

}, {
    timestamps: true
});

// ============================================
// INDEX
// ============================================

ApplicationSchema.add(BaseSchema);

ApplicationSchema.index({ etudiantId: 1 });
ApplicationSchema.index({ offreId: 1 });
ApplicationSchema.index({ statut: 1 });
ApplicationSchema.index({ workflowEtape: 1 });
ApplicationSchema.index({ workflowComplete: 1 });

ApplicationSchema.index(
    { etudiantId: 1, offreId: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false } }
);

// ============================================
// VIRTUAL - Vérifier si l'étudiant a accepté la fiche
// ============================================
ApplicationSchema.virtual('isFicheAccepted').get(function() {
    return this.ficheAccepte === true;
});

// ============================================
// VIRTUAL - Vérifier si toutes les étapes sont complètes
// ============================================
ApplicationSchema.virtual('isWorkflowComplete').get(function() {
    return this.workflowEtape === 3 && this.workflowComplete === true;
});

// ============================================
// METHOD - Passer à l'étape suivante
// ============================================
ApplicationSchema.methods.nextEtape = function() {
    if (this.workflowEtape < 3) {
        this.workflowEtape += 1;
        return true;
    }
    return false;
};

// ============================================
// METHOD - Revenir à l'étape précédente
// ============================================
ApplicationSchema.methods.previousEtape = function() {
    if (this.workflowEtape > 1) {
        this.workflowEtape -= 1;
        return true;
    }
    return false;
};

// ============================================
// METHOD - Finaliser le workflow
// ============================================
ApplicationSchema.methods.completeWorkflow = function() {
    this.workflowEtape = 3;
    this.workflowComplete = true;
    this.statut = APPLICATION_STATUS.SOUMISE;
    this.dateSoumission = new Date();
};

// ============================================
// EXPORT
// ============================================
module.exports = mongoose.model('Application', ApplicationSchema);
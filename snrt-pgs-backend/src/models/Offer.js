// src/models/Offer.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

const OfferSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: [true, 'Le titre est obligatoire'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire']
    },
    nbPostes: {
        type: Number,
        required: true,
        min: 1
    },
    typeStage: {
        type: String,
        required: true,
        enum: ['PFE', 'PFA', 'Initiation', 'Ete', 'Master', 'Licence', 'Technicien']
    },
    statut: {
        type: String,
        enum: ['Brouillon', 'EnAttente', 'Publiee', 'Refusee', 'Archivee'],
        default: 'Brouillon'
    },
    datePublication: Date,
    dateDebut: {
        type: Date,
        required: true
    },
    dateFin: {
        type: Date,
        required: true
    },
    dateLimiteCandidature: {
        type: Date,
        required: true
    },
    
    // Références
    departementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    createurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurInterne',
        required: true
    },
    validateurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurInterne'
    },
    periodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Period',
        required: true
    },
    
    // Embedded
    sujets: [{
        titre: { type: String, required: true },
        description: { type: String, required: true },
        missions: [String],
        profilRecherche: String,
        competences: [{
            nom: String,
            niveau: {
                type: String,
                enum: ['Debutant', 'Intermediaire', 'Avance', 'Expert']
            }
        }]
    }],
    
    documentsRequis: [{
        type: {
            type: String,
            enum: ['CV', 'Lettre Motivation', 'Releve Notes', 'Attestation', 'Autre']
        },
        obligatoire: { type: Boolean, default: true }
    }]
}, {
    timestamps: true
});

OfferSchema.add(BaseSchema);

OfferSchema.index({ departementId: 1 });
OfferSchema.index({ periodeId: 1 });
OfferSchema.index({ statut: 1 });
OfferSchema.index({ typeStage: 1 });
OfferSchema.index({ datePublication: -1 });
OfferSchema.index({ titre: 'text', description: 'text' });

module.exports = mongoose.model('Offer', OfferSchema);
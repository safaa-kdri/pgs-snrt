// src/models/Document.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

const DocumentSchema = new mongoose.Schema({
    nomOriginal: {
        type: String,
        required: true,
        trim: true
    },
    nomStocke: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: [
            'CV',
            'LettreMotivation',
            'LettreRecommandation',
            'AttestationScolarite',
            'Attestation',
            'ReleveNotes',
            'Convention',
            'Photo',
            'CIN',
            'Assurance',
            'FicheEngagement',
            'FicheDemandeStage',
            'Autre'
        ],
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    taille: {
        type: Number,
        required: true
    },
    chemin: {
        type: String,
        required: false,
        default: null
    },
    url: {
        type: String
    },
    gridFsId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    candidatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurExterne',
        required: true
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    },
    statut: {
        type: String,
        enum: ['EnAttente', 'Valide', 'Refuse'],
        default: 'EnAttente'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'uploadedByModel'
    },
    uploadedByModel: {
        type: String,
        enum: ['UtilisateurInterne', 'UtilisateurExterne']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurInterne'
    },
    verifiedAt: {
        type: Date
    },
    commentaire: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

DocumentSchema.add(BaseSchema);

DocumentSchema.index({ candidatId: 1 });
DocumentSchema.index({ applicationId: 1 });
DocumentSchema.index({ type: 1 });
DocumentSchema.index({ statut: 1 });

module.exports = mongoose.model('Document', DocumentSchema);
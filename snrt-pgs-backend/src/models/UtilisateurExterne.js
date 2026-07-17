// src/models/UtilisateurExterne.js
const mongoose = require('mongoose');
const argon2 = require('argon2');
const BaseSchema = require('./BaseModel');

const UtilisateurExterneSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true,
        maxlength: 100
    },
    prenom: {
        type: String,
        required: [true, 'Le prénom est obligatoire'],
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: [true, 'L\'email est obligatoire'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
    },
    motDePasse: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire'],
        minlength: 16,
        select: false
    },
    telephone: {
        type: String,
        required: [true, 'Le téléphone est obligatoire'],
        trim: true
    },
    cin: {
        type: String,
        required: [true, 'Le CIN est obligatoire'],
        unique: true,
        trim: true
    },
    civilite: {
        type: String,
        enum: ['M.', 'Mme', 'Mlle'],
        required: true
    },
    dateNaissance: {
        type: Date,
        required: true
    },
    adresse: {
        type: String,
        required: true
    },
    ville: {
        type: String,
        required: true
    },
    pays: {
        type: String,
        required: true,
        default: 'Maroc'
    },
    universite: String,
    filiere: String,
    niveau: {
        type: String,
        enum: ['Bac', 'Bac+1', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Doctorat']
    },
    annee: String,
    documents: [{
        nom: { type: String, required: true },
        type: { type: String, enum: ['CV', 'Lettre Motivation', 'Releve Notes', 'Attestation', 'Autre'] },
        chemin: { type: String, required: true },
        dateUpload: { type: Date, default: Date.now },
        taille: Number
    }],
    dateInscription: {
        type: Date,
        default: Date.now
    },
    actif: {
        type: Boolean,
        default: true
    },
    // Sécurité
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockedUntil: {
        type: Date,
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
    }
});

UtilisateurExterneSchema.add(BaseSchema);

// Hashage du mot de passe
UtilisateurExterneSchema.pre('save', async function(next) {
    if (!this.isModified('motDePasse')) return next();

    try {
        this.motDePasse = await argon2.hash(this.motDePasse, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });
        next();
    } catch (error) {
        next(error);
    }
});

// Vérification du mot de passe
UtilisateurExterneSchema.methods.verifyPassword = async function(password) {
    try {
        return await argon2.verify(this.motDePasse, password);
    } catch (error) {
        return false;
    }
};

UtilisateurExterneSchema.methods.isLocked = function() {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
};

UtilisateurExterneSchema.methods.incrementFailedAttempts = async function() {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= 3) {
        this.lockedUntil = new Date(Date.now() + 60 * 60 * 1000);
    }
    await this.save();
};

UtilisateurExterneSchema.methods.resetFailedAttempts = async function() {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
    this.lastLogin = new Date();
    await this.save();
};

UtilisateurExterneSchema.virtual('fullName').get(function() {
    return `${this.prenom} ${this.nom}`;
});

UtilisateurExterneSchema.index({ email: 1 });
UtilisateurExterneSchema.index({ cin: 1 });
UtilisateurExterneSchema.index({ actif: 1 });

module.exports = mongoose.model('UtilisateurExterne', UtilisateurExterneSchema);
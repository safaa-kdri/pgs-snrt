// src/models/UtilisateurInterne.js
const mongoose = require('mongoose');
const argon2 = require('argon2');
const BaseSchema = require('./BaseModel');

const UtilisateurInterneSchema = new mongoose.Schema({
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
        minlength: 20,
        select: false
    },
    telephone: {
        type: String,
        trim: true
    },
    dateInscription: {
        type: Date,
        default: Date.now
    },
    actif: {
        type: Boolean,
        default: true
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: [true, 'Le rôle est obligatoire']
    },
    departementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
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

UtilisateurInterneSchema.add(BaseSchema);

UtilisateurInterneSchema.pre('save', async function(next) {
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

UtilisateurInterneSchema.methods.verifyPassword = async function(password) {
    try {
        return await argon2.verify(this.motDePasse, password);
    } catch (error) {
        return false;
    }
};

UtilisateurInterneSchema.methods.isLocked = function() {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
};

UtilisateurInterneSchema.methods.incrementFailedAttempts = async function() {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= 3) {
        this.lockedUntil = new Date(Date.now() + 60 * 60 * 1000);
    }
    await this.save();
};

UtilisateurInterneSchema.methods.resetFailedAttempts = async function() {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
    this.lastLogin = new Date();
    await this.save();
};

UtilisateurInterneSchema.virtual('fullName').get(function() {
    return `${this.prenom} ${this.nom}`;
});

UtilisateurInterneSchema.index({ email: 1 });
UtilisateurInterneSchema.index({ roleId: 1 });
UtilisateurInterneSchema.index({ actif: 1 });

module.exports = mongoose.model('UtilisateurInterne', UtilisateurInterneSchema);
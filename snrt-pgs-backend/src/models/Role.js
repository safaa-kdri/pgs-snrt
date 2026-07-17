// src/models/Role.js
const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom du rôle est obligatoire'],
        unique: true,
        enum: ['Administrateur', 'RH', 'Departement', 'Encadrant', 'Etudiant'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire'],
        trim: true
    },
    permissions: {
        type: [String],
        default: []
    },
    actif: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

RoleSchema.index({ nom: 1 });

RoleSchema.methods.hasPermission = function(permission) {
    if (this.nom === 'Administrateur') return true;
    return this.permissions.includes(permission) || this.permissions.includes('*');
};

module.exports = mongoose.model('Role', RoleSchema);
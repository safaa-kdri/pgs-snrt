// src/models/Notification.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Email', 'InApp', 'InApp'],
        required: true
    },
    titre: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    dateEnvoi: {
        type: Date,
        default: Date.now
    },
    lue: {
        type: Boolean,
        default: false
    },
    // Champ pour la date de lecture
    luAt: {
        type: Date,
        default: null
    },
    lien: {
        type: String,
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        enum: ['UtilisateurInterne', 'UtilisateurExterne'],
        required: true
    },
    // Champs pour la référence
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'referenceType'
    },
    referenceType: {
        type: String,
        enum: ['Internship', 'Application', 'Offer', 'Document'],
        default: null
    },
    // Priorité de la notification
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    // Statut de la notification
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    }
}, {
    timestamps: true
});

// Ajout du BaseSchema
NotificationSchema.add(BaseSchema);

// Index pour les recherches
NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ lue: 1 });
NotificationSchema.index({ dateEnvoi: -1 });
NotificationSchema.index({ referenceId: 1 });
NotificationSchema.index({ priority: 1 });
NotificationSchema.index({ status: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
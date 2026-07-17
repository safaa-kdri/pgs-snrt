// src/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Email', 'InApp'],
        required: true
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
    lien: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        enum: ['UtilisateurInterne', 'UtilisateurExterne'],
        required: true
    }
}, {
    timestamps: true
});

NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ lue: 1 });
NotificationSchema.index({ dateEnvoi: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
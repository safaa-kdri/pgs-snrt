// src/models/BaseModel.js
const mongoose = require('mongoose');

const BaseSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UtilisateurInterne' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UtilisateurInterne' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UtilisateurInterne' }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

BaseSchema.methods.softDelete = async function(userId) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
    return this.save();
};

BaseSchema.methods.restore = async function() {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
};

BaseSchema.query.notDeleted = function() {
    return this.where({ isDeleted: false });
};

BaseSchema.pre('find', function() {
    this.where({ isDeleted: false });
});
BaseSchema.pre('findOne', function() {
    this.where({ isDeleted: false });
});

module.exports = BaseSchema;
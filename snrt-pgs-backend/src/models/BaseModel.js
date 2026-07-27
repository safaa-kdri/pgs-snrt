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


function excludeDeletedUnlessIncluded() {
    const opts = typeof this.getOptions === 'function' ? this.getOptions() : {};
    if (opts.includeDeleted) return;
    this.where({ isDeleted: false });
}

BaseSchema.pre('find', excludeDeletedUnlessIncluded);
BaseSchema.pre('findOne', excludeDeletedUnlessIncluded);
BaseSchema.pre('count', excludeDeletedUnlessIncluded);
BaseSchema.pre('countDocuments', excludeDeletedUnlessIncluded);
BaseSchema.pre('updateMany', excludeDeletedUnlessIncluded);
BaseSchema.pre('findOneAndUpdate', excludeDeletedUnlessIncluded);


BaseSchema.query.includingDeleted = function () {
    return this.setOptions({ includeDeleted: true });
};


BaseSchema.statics.findByIdIncludingDeleted = function (id) {
    return this.findOne({ _id: id }).includingDeleted();
};

module.exports = BaseSchema;

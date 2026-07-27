// src/models/Department.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

const DepartmentSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom du département est obligatoire'],
   
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    responsableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurInterne'
    },
    membres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UtilisateurInterne'
   }],
    nbStagiaires: {
        type: Number,
        default: 0
    },
    actif: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

DepartmentSchema.add(BaseSchema);

DepartmentSchema.index({ actif: 1 });


DepartmentSchema.index(
    { nom: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false } }
);

module.exports = mongoose.model('Department', DepartmentSchema);

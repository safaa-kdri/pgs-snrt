// src/models/Period.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

const PeriodSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom de la période est obligatoire'],
        unique: true,
        trim: true
    },
    dateDebut: {
        type: Date,
        required: true
    },
    dateFin: {
        type: Date,
        required: true
    },
    dateOuvertureCandidatures: {
        type: Date,
        required: true
    },
    dateFermetureCandidatures: {
        type: Date,
        required: true
    },
    actif: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

PeriodSchema.add(BaseSchema);

PeriodSchema.pre('validate', function(next) {
    if (this.dateFin <= this.dateDebut) {
        next(new Error('...'));
    }
    if (this.dateFermetureCandidatures <= this.dateOuvertureCandidatures) {
        next(new Error('...'));
    }
    if (this.dateDebut <= this.dateFermetureCandidatures) {
        next(new Error('...'));
    }
    next();
});

PeriodSchema.index({ nom: 1 });
PeriodSchema.index({ actif: 1 });

module.exports = mongoose.model('Period', PeriodSchema);
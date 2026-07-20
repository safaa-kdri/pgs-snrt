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
        next(new Error('La date de fin doit être postérieure à la date de début'));
    }
    if (this.dateFermetureCandidatures <= this.dateOuvertureCandidatures) {
        next(new Error('La date de fermeture doit être postérieure à la date d\'ouverture'));
    }
    if (this.dateDebut <= this.dateFermetureCandidatures) {
        next(new Error('Le stage doit commencer après la fin des candidatures'));
    }
    next();
});

PeriodSchema.index({ nom: 1 });
PeriodSchema.index({ actif: 1 });

module.exports = mongoose.model('Period', PeriodSchema);
// src/models/Period.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

const PeriodSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom de la période est obligatoire'],
        // BUGFIX (important) : meme defaut que Department.js - "unique: true"
        // ici ignore isDeleted et empeche de recreer une periode avec un nom
        // deja utilise par une periode archivee. Retire au profit de l'index
        // partiel ci-dessous (meme pattern que Application.js/Department.js).
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
        return next(new Error('La date de fin de la periode doit etre posterieure a la date de debut.'));
    }
    if (this.dateFermetureCandidatures <= this.dateOuvertureCandidatures) {
        return next(new Error("La date de fermeture des candidatures doit etre posterieure a la date d'ouverture des candidatures."));
    }
    if (this.dateDebut <= this.dateFermetureCandidatures) {
        return next(new Error('La date de debut de la periode de stage doit etre posterieure a la date de fermeture des candidatures.'));
    }
    return next();
});

PeriodSchema.index({ actif: 1 });

// BUGFIX (important) : index unique scope aux periodes non supprimees.
// ATTENTION AU DEPLOIEMENT : supprimer l'ancien index global si present :
//   db.periods.dropIndex('nom_1')
PeriodSchema.index(
    { nom: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false } }
);

module.exports = mongoose.model('Period', PeriodSchema);

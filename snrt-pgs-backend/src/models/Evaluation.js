// src/models/Evaluation.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

const EvaluationSchema = new mongoose.Schema({
    // ============ RÉFÉRENCES ============
    stageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
        required: [true, 'Le stage est obligatoire']
    },
    stagiaireId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurExterne',
        required: [true, 'Le stagiaire est obligatoire']
    },
    encadrantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurInterne',
        required: [true, 'L\'encadrant est obligatoire']
    },

    // ============ ÉVALUATION GLOBALE ============
    dateEvaluation: {
        type: Date,
        default: Date.now
    },
    note: {
        type: Number,
        required: [true, 'La note est obligatoire'],
        min: [0, 'La note ne peut pas être inférieure à 0'],
        max: [20, 'La note ne peut pas dépasser 20']
    },
    commentaires: {
        type: String,
        trim: true,
        maxlength: [2000, 'Les commentaires ne peuvent pas dépasser 2000 caractères']
    },

    // ============ COMPÉTENCES ÉVALUÉES ============
    competencesEvaluees: [{
        nom: {
            type: String,
            required: [true, 'Le nom de la compétence est obligatoire'],
            trim: true
        },
        niveau: {
            type: String,
            enum: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'],
            required: [true, 'Le niveau est obligatoire']
        },
        note: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        }
    }],

    // ============ CRITÈRES D'ÉVALUATION ============
    criteres: {
        autonomie: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        qualiteTravail: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        respectDelais: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        communication: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        integration: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        initiative: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        }
    },

    // ============ SYNTHÈSE ============
    pointsForts: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    pointsFaibles: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    recommandations: {
        type: String,
        trim: true,
        maxlength: 1000
    },

    // ============ STATUT ============
    statut: {
        type: String,
        enum: ['Brouillon', 'Soumise', 'Validee'],
        default: 'Brouillon'
    },
    dateSoumission: {
        type: Date
    },
    dateValidation: {
        type: Date
    }
}, {
    timestamps: true
});

// ============ HÉRITAGE DE BASESCHEMA ============
EvaluationSchema.add(BaseSchema);

// ============ MIDDLEWARES ============

// Mise à jour de la date de soumission
EvaluationSchema.pre('save', function(next) {
    if (this.isModified('statut') && this.statut === 'Soumise' && !this.dateSoumission) {
        this.dateSoumission = new Date();
    }
    if (this.isModified('statut') && this.statut === 'Validee' && !this.dateValidation) {
        this.dateValidation = new Date();
    }
    next();
});

// ============ MÉTHODES ============

// Calculer la note moyenne des compétences
EvaluationSchema.methods.calculateAverageCompetenceNote = function() {
    if (!this.competencesEvaluees || this.competencesEvaluees.length === 0) {
        return 0;
    }
    const sum = this.competencesEvaluees.reduce((acc, comp) => acc + (comp.note || 0), 0);
    return Math.round((sum / this.competencesEvaluees.length) * 10) / 10;
};

// Calculer la note moyenne des critères
EvaluationSchema.methods.calculateAverageCriteresNote = function() {
    const criteres = this.criteres || {};
    const values = [
        criteres.autonomie,
        criteres.qualiteTravail,
        criteres.respectDelais,
        criteres.communication,
        criteres.integration,
        criteres.initiative
    ].filter(v => v !== undefined && v !== null);
    
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, v) => acc + v, 0);
    return Math.round((sum / values.length) * 10) / 10;
};

// Calculer la note finale (moyenne des compétences + critères)
EvaluationSchema.methods.calculateFinalNote = function() {
    const compNote = this.calculateAverageCompetenceNote();
    const critNote = this.calculateAverageCriteresNote();
    // Moyenne pondérée: compétences 60%, critères 40%
    const final = (compNote * 0.6 + critNote * 0.4) / 5 * 20;
    return Math.round(final * 10) / 10;
};

// Vérifier si l'évaluation est complète
EvaluationSchema.methods.isComplete = function() {
    return this.note !== undefined && 
           this.note !== null &&
           this.competencesEvaluees.length > 0 &&
           this.criteres !== undefined;
};

// ============ VIRTUAL ============

// Note finale virtuelle
EvaluationSchema.virtual('noteFinale').get(function() {
    return this.calculateFinalNote();
});

// ============ INDEX ============

EvaluationSchema.index({ stageId: 1 });
EvaluationSchema.index({ stagiaireId: 1 });
EvaluationSchema.index({ encadrantId: 1 });
EvaluationSchema.index({ statut: 1 });
EvaluationSchema.index({ dateEvaluation: -1 });

// ============ EXPORT ============
module.exports = mongoose.model('Evaluation', EvaluationSchema);
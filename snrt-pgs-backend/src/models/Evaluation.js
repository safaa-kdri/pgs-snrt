// src/models/Evaluation.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

const EvaluationSchema = new mongoose.Schema({
  
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

    
    competencesEvaluees: [{
        nom: {
            type: String,
            required: [true, 'Le nom de la compétence est obligatoire'],
            trim: true
        },
        niveau: {
            type: String,
            enum: ['Debutant', 'Intermediaire', 'Avance', 'Expert'],
            required: [true, 'Le niveau est obligatoire']
        },
        note: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        }
    }],

    
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


EvaluationSchema.add(BaseSchema);




EvaluationSchema.pre('save', function(next) {
    if (this.isModified('statut') && this.statut === 'Soumise' && !this.dateSoumission) {
        this.dateSoumission = new Date();
    }
    if (this.isModified('statut') && this.statut === 'Validee' && !this.dateValidation) {
        this.dateValidation = new Date();
    }
    next();
});



EvaluationSchema.methods.calculateAverageCompetenceNote = function() {
    if (!this.competencesEvaluees || this.competencesEvaluees.length === 0) {
        return 0;
    }
    const sum = this.competencesEvaluees.reduce((acc, comp) => acc + (comp.note || 0), 0);
    return Math.round((sum / this.competencesEvaluees.length) * 10) / 10;
};


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


EvaluationSchema.methods.calculateFinalNote = function() {
    const compNote = this.calculateAverageCompetenceNote();
    const critNote = this.calculateAverageCriteresNote();
    
    const final = (compNote * 0.6 + critNote * 0.4) / 5 * 20;
    return Math.round(final * 10) / 10;
};


EvaluationSchema.methods.isComplete = function() {
    return this.note !== undefined && 
           this.note !== null &&
           this.competencesEvaluees.length > 0 &&
           this.criteres !== undefined;
};



EvaluationSchema.virtual('noteFinale').get(function() {
    return this.calculateFinalNote();
});



EvaluationSchema.index({ stageId: 1 });
EvaluationSchema.index({ stagiaireId: 1 });
EvaluationSchema.index({ encadrantId: 1 });
EvaluationSchema.index({ statut: 1 });
EvaluationSchema.index({ dateEvaluation: -1 });


module.exports = mongoose.model('Evaluation', EvaluationSchema);
// src/models/Skill.js
const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom de la compétence est obligatoire'],
        unique: true,
        trim: true
    },
    categorie: {
        type: String,
        enum: ['Technique', 'Langue', 'Autre'],
        default: 'Technique'
    },
    description: String
}, {
    timestamps: true
});

SkillSchema.index({ nom: 1 });
SkillSchema.index({ categorie: 1 });

module.exports = mongoose.model('Skill', SkillSchema);
const mongoose = require('mongoose');
const { SKILL_CATEGORIES } = require('../config/constants');


const skillSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, unique: true, trim: true },

    categorie: { type: String, enum: SKILL_CATEGORIES, required: true },
    description: { type: String, default: null },
  },
  { timestamps: true, collection: 'skills' }
);

skillSchema.index({ categorie: 1 });

module.exports = mongoose.model('Skill', skillSchema);

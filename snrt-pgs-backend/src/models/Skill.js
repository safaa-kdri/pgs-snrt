const mongoose = require('mongoose');

/**
 * Collection "skills" (Dossier de Conception - 3.7).
 * Catalogue de reference des competences, independant, partage par
 * plusieurs offres (utilise pour la recherche/autocompletion cote UI ;
 * les sujets d'offre stockent leur propre instantane, voir models/Subject.js).
 */
const skillSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, unique: true, trim: true },
    categorie: { type: String, enum: ['Technique', 'Langue', 'Autre'], required: true },
    description: { type: String, default: null },
  },
  { timestamps: true, collection: 'skills' }
);

skillSchema.index({ categorie: 1 });

module.exports = mongoose.model('Skill', skillSchema);

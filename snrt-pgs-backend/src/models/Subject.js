// src/models/Subject.js
// ✅ CORRECT - valeurs sans accents

const mongoose = require('mongoose');

const competenceRequiseSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    niveau: {
      type: String,
      enum: ['Debutant', 'Intermediaire', 'Avance', 'Expert'],
      required: true,
    },
  },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    missions: { type: [String], default: [] },
    profilRecherche: { type: String, default: null },
    competences: { type: [competenceRequiseSchema], default: [] },
  },
  { timestamps: false }
);

module.exports = subjectSchema;
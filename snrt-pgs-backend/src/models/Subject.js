const mongoose = require('mongoose');

/**
 * "SujetStage" (Dossier de Conception 2.1 / 3.6). D'apres le Modele Logique
 * de Donnees, un sujet est TOUJOURS embarque dans une offre (jamais lu
 * seul), il n'a donc pas sa propre collection MongoDB. Ce fichier expose
 * uniquement le sous-schema Mongoose, reutilise par models/Offer.js.
 *
 * Les competences requises sont stockees ici sous forme de nom + niveau
 * (pas de reference vers la collection "skills") : ce sont deux usages
 * distincts d'une meme notion - le "skills" est un catalogue de reference
 * pour l'UI de recherche/autocompletion, tandis que ce tableau est un
 * instantane fige des exigences du sujet au moment de sa creation.
 */
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

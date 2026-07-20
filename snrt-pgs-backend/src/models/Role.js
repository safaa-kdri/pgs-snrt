const mongoose = require('mongoose');

/**
 * Collection "roles" (Dossier de Conception - 3.3).
 * Entite de reference, independante, partagee par les utilisateurs internes.
 */
const roleSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    permissions: { type: [String], required: true, default: [] },
    actif: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'roles' }
);

module.exports = mongoose.model('Role', roleSchema);

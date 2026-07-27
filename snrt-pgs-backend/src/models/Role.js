const mongoose = require('mongoose');


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

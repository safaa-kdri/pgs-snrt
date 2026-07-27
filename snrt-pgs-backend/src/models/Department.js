// src/models/Department.js
const mongoose = require('mongoose');
const BaseSchema = require('./BaseModel');

const DepartmentSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom du département est obligatoire'],
        // BUGFIX (important) : "unique: true" ici cree un index unique GLOBAL
        // sur "nom", sans tenir compte de isDeleted. Consequence : une fois
        // qu'un departement est soft-delete (deleteDepartment), impossible
        // d'en recreer un avec le meme nom - Mongo rejette l'insertion avec
        // une erreur E11000, alors que departmentController.createDepartment
        // (qui fait un findOne({ nom }) filtre par le hook isDeleted) ne
        // voit aucun conflit et pense pouvoir creer le document. Meme classe
        // de bug que celle deja identifiee et corrigee sur Application.js
        // (voir l'index partiel plus bas) : on retire "unique" du champ et on
        // le redeclare en index partiel qui ignore les documents supprimes.
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    responsableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UtilisateurInterne'
    },
    membres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UtilisateurInterne'
   }],
    nbStagiaires: {
        type: Number,
        default: 0
    },
    actif: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

DepartmentSchema.add(BaseSchema);

DepartmentSchema.index({ actif: 1 });


DepartmentSchema.index(
    { nom: 1 },
    { unique: true, partialFilterExpression: { isDeleted: false } }
);

module.exports = mongoose.model('Department', DepartmentSchema);

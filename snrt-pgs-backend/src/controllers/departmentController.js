// src/controllers/departmentController.js
const Department = require('../models/Department');

/**
 * Créer un département
 */
exports.createDepartment = async (req, res) => {
    try {
        const { nom, description, responsableId, membres, actif } = req.body;

        const existingDepartment = await Department.findOne({ nom });

        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: 'Un département avec ce nom existe déjà'
            });
        }

        const department = await Department.create({
            nom,
            description,
            responsableId,
            membres,
            actif,
            createdBy: req.user?._id
        });

        return res.status(201).json({
            success: true,
            message: 'Département créé avec succès',
            data: department
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du département',
            error: error.message
        });
    }
};

/**
 * Lister tous les départements non supprimés
 */
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .populate('responsableId', 'nom prenom email')
            .populate('membres', 'nom prenom email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des départements',
            error: error.message
        });
    }
};

/**
 * Récupérer un département par ID
 */
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('responsableId', 'nom prenom email')
            .populate('membres', 'nom prenom email');

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du département',
            error: error.message
        });
    }
};

/**
 * Modifier un département
 */
exports.updateDepartment = async (req, res) => {
    try {
        const { nom, description, responsableId, membres, actif, nbStagiaires } = req.body;

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        if (nom && nom !== department.nom) {
            const existingDepartment = await Department.findOne({ nom });

            if (existingDepartment) {
                return res.status(400).json({
                    success: false,
                    message: 'Un département avec ce nom existe déjà'
                });
            }

            department.nom = nom;
        }

        if (description !== undefined) department.description = description;
        if (responsableId !== undefined) department.responsableId = responsableId;
        if (membres !== undefined) department.membres = membres;
        if (actif !== undefined) department.actif = actif;
        if (nbStagiaires !== undefined) department.nbStagiaires = nbStagiaires;

        department.updatedBy = req.user?._id;

        await department.save();

        return res.status(200).json({
            success: true,
            message: 'Département modifié avec succès',
            data: department
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification du département',
            error: error.message
        });
    }
};

/**
 * Supprimer un département avec soft delete
 */
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        await department.softDelete(req.user?._id);

        return res.status(200).json({
            success: true,
            message: 'Département supprimé avec succès'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du département',
            error: error.message
        });
    }
};

/**
 * Associer ou changer le responsable d'un département
 */
exports.assignResponsable = async (req, res) => {
    try {
        const { responsableId } = req.body;

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        department.responsableId = responsableId;
        department.updatedBy = req.user?._id;

        await department.save();

        return res.status(200).json({
            success: true,
            message: 'Responsable associé avec succès',
            data: department
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l’association du responsable',
            error: error.message
        });
    }
};

/**
 * Ajouter un membre au département
 */
exports.addMember = async (req, res) => {
    try {
        const { userId } = req.body;

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        if (department.membres.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Cet utilisateur est déjà membre du département'
            });
        }

        department.membres.push(userId);
        department.updatedBy = req.user?._id;

        await department.save();

        return res.status(200).json({
            success: true,
            message: 'Membre ajouté avec succès',
            data: department
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l’ajout du membre',
            error: error.message
        });
    }
};

/**
 * Retirer un membre du département
 */
exports.removeMember = async (req, res) => {
    try {
        const { userId } = req.body;

        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        department.membres = department.membres.filter(
            memberId => memberId.toString() !== userId
        );

        department.updatedBy = req.user?._id;

        await department.save();

        return res.status(200).json({
            success: true,
            message: 'Membre retiré avec succès',
            data: department
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du retrait du membre',
            error: error.message
        });
    }
};
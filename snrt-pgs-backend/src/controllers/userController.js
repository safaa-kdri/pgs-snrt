// src/controllers/userController.js
const UtilisateurInterne = require('../models/UtilisateurInterne');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const Role = require('../models/Role');
const Department = require('../models/Department');

const getUserModel = (type) => {
    if (type === 'interne') return UtilisateurInterne;
    if (type === 'externe') return UtilisateurExterne;
    return null;
};

exports.createInternalUser = async (req, res) => {
    try {
        const user = await UtilisateurInterne.create({
            ...req.body,
            createdBy: req.user?._id
        });

        const userResponse = await UtilisateurInterne.findById(user._id)
            .select('-motDePasse')
            .populate('roleId')
            .populate('departmentId');

        return res.status(201).json({
            success: true,
            message: 'Utilisateur interne créé avec succès',
            data: userResponse
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l’utilisateur interne',
            error: error.message
        });
    }
};

exports.createExternalUser = async (req, res) => {
    try {
        const user = await UtilisateurExterne.create({
            ...req.body,
            createdBy: req.user?._id
        });

        const userResponse = await UtilisateurExterne.findById(user._id)
            .select('-motDePasse')
            .populate('roleId');

        return res.status(201).json({
            success: true,
            message: 'Utilisateur externe créé avec succès',
            data: userResponse
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l’utilisateur externe',
            error: error.message
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { type } = req.query;

        if (type === 'interne') {
            const users = await UtilisateurInterne.find()
                .select('-motDePasse')
                .populate('roleId')
                .populate('departmentId')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                type: 'interne',
                count: users.length,
                data: users
            });
        }

        if (type === 'externe') {
            const users = await UtilisateurExterne.find()
                .select('-motDePasse')
                .populate('roleId')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                type: 'externe',
                count: users.length,
                data: users
            });
        }

        const internalUsers = await UtilisateurInterne.find()
            .select('-motDePasse')
            .populate('roleId')
            .populate('departmentId')
            .sort({ createdAt: -1 });

        const externalUsers = await UtilisateurExterne.find()
            .select('-motDePasse')
            .populate('roleId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: internalUsers.length + externalUsers.length,
            data: {
                internes: internalUsers,
                externes: externalUsers
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs',
            error: error.message
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { type, id } = req.params;
        const UserModel = getUserModel(type);

        if (!UserModel) {
            return res.status(400).json({
                success: false,
                message: 'Type utilisateur invalide'
            });
        }

        const user = await UserModel.findById(id)
            .select('-motDePasse')
            .populate('roleId')
            .populate('departmentId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l’utilisateur',
            error: error.message
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { type, id } = req.params;
        const UserModel = getUserModel(type);

        if (!UserModel) {
            return res.status(400).json({
                success: false,
                message: 'Type utilisateur invalide'
            });
        }

        const updateData = { ...req.body, updatedBy: req.user?._id };
        delete updateData.motDePasse;

        const user = await UserModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        })
            .select('-motDePasse')
            .populate('roleId')
            .populate('departmentId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Utilisateur modifié avec succès',
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de l’utilisateur',
            error: error.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { type, id } = req.params;
        const UserModel = getUserModel(type);

        if (!UserModel) {
            return res.status(400).json({
                success: false,
                message: 'Type utilisateur invalide'
            });
        }

        const user = await UserModel.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        await user.softDelete(req.user?._id);

        return res.status(200).json({
            success: true,
            message: 'Utilisateur supprimé avec succès'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l’utilisateur',
            error: error.message
        });
    }
};

exports.changeUserRole = async (req, res) => {
    try {
        const { type, id } = req.params;
        const { roleId } = req.body;
        const UserModel = getUserModel(type);

        if (!UserModel) {
            return res.status(400).json({
                success: false,
                message: 'Type utilisateur invalide'
            });
        }

        const role = await Role.findById(roleId);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Rôle non trouvé'
            });
        }

        const user = await UserModel.findByIdAndUpdate(
            id,
            { roleId, updatedBy: req.user?._id },
            { new: true, runValidators: true }
        )
            .select('-motDePasse')
            .populate('roleId')
            .populate('departmentId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Rôle modifié avec succès',
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de rôle',
            error: error.message
        });
    }
};

exports.assignDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { departmentId } = req.body;

        const department = await Department.findById(departmentId);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        const user = await UtilisateurInterne.findByIdAndUpdate(
            id,
            { departmentId, updatedBy: req.user?._id },
            { new: true, runValidators: true }
        )
            .select('-motDePasse')
            .populate('roleId')
            .populate('departmentId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur interne non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Département assigné avec succès',
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l’assignation du département',
            error: error.message
        });
    }
};

exports.changeUserStatus = async (req, res) => {
    try {
        const { type, id } = req.params;
        const { actif } = req.body;
        const UserModel = getUserModel(type);

        if (!UserModel) {
            return res.status(400).json({
                success: false,
                message: 'Type utilisateur invalide'
            });
        }

        const user = await UserModel.findByIdAndUpdate(
            id,
            { actif, updatedBy: req.user?._id },
            { new: true, runValidators: true }
        )
            .select('-motDePasse')
            .populate('roleId')
            .populate('departmentId');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: actif ? 'Utilisateur activé avec succès' : 'Utilisateur désactivé avec succès',
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de statut',
            error: error.message
        });
    }
};
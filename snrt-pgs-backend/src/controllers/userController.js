// src/controllers/userController.js
const UtilisateurInterne = require('../models/UtilisateurInterne');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const Role = require('../models/Role');
const Department = require('../models/Department');
const { hashPassword } = require('../utils/argon2');
const { validatePasswordPolicy } = require('../utils/validators');
const userLookup = require('../utils/userLookup');

const getUserModel = (type) => {
    try {
        return userLookup.getModel(type);
    } catch (err) {
        return null;
    }
};

// ============================================
// CREATE
// ============================================

exports.createInternalUser = async (req, res) => {
    try {
        validatePasswordPolicy(req.body.motDePasse, 'interne');

        const motDePasseHash = await hashPassword(req.body.motDePasse);
        const user = await UtilisateurInterne.create({
            ...req.body,
            motDePasse: motDePasseHash,
            createdBy: req.user?._id
        });

        const userResponse = await UtilisateurInterne.findById(user._id)
            .select('-motDePasse')
            .populate('roleId')
            .populate('departementId');

        return res.status(201).json({
            success: true,
            message: 'Utilisateur interne créé avec succès',
            data: userResponse
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Erreur lors de la création de l\'utilisateur interne' : error.message,
            details: error.details,
            error: statusCode === 500 ? error.message : undefined
        });
    }
};

exports.createExternalUser = async (req, res) => {
    try {
        validatePasswordPolicy(req.body.motDePasse, 'externe');

        const motDePasseHash = await hashPassword(req.body.motDePasse);
        const user = await UtilisateurExterne.create({
            ...req.body,
            motDePasse: motDePasseHash,
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
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Erreur lors de la création de l\'utilisateur externe' : error.message,
            details: error.details,
            error: statusCode === 500 ? error.message : undefined
        });
    }
};

// ============================================
// GET ALL
// ============================================

exports.getAllUsers = async (req, res) => {
    try {
        const { type } = req.query;

        if (type === 'interne') {
            const users = await UtilisateurInterne.find()
                .select('-motDePasse')
                .populate({ path: 'roleId', select: 'nom' })
                .populate({ path: 'departementId', select: 'nom description' })
                .sort({ createdAt: -1 })
                .lean();

            const formatted = users.map(u => ({
                ...u,
                userType: 'interne',
                role: u.roleId?.nom || 'Inconnu'
            }));

            return res.status(200).json({
                success: true,
                type: 'interne',
                count: formatted.length,
                data: formatted
            });
        }

        if (type === 'externe') {
            const users = await UtilisateurExterne.find()
                .select('-motDePasse')
                .sort({ createdAt: -1 })
                .lean();

            const formatted = users.map(u => ({
                ...u,
                userType: 'externe',
                role: 'Etudiant',
                roleId: null,
                departementId: null
            }));

            return res.status(200).json({
                success: true,
                type: 'externe',
                count: formatted.length,
                data: formatted
            });
        }

        // Tous les utilisateurs
        const [internalUsers, externalUsers] = await Promise.all([
            UtilisateurInterne.find()
                .select('-motDePasse')
                .populate({ path: 'roleId', select: 'nom' })
                .populate({ path: 'departementId', select: 'nom description' })
                .sort({ createdAt: -1 })
                .lean(),
            UtilisateurExterne.find()
                .select('-motDePasse')
                .sort({ createdAt: -1 })
                .lean()
        ]);

        const internes = internalUsers.map(u => ({
            ...u,
            userType: 'interne',
            role: u.roleId?.nom || 'Inconnu'
        }));

        const externes = externalUsers.map(u => ({
            ...u,
            userType: 'externe',
            role: 'Etudiant',
            roleId: null,
            departementId: null
        }));

        const allUsers = [...internes, ...externes];

        return res.status(200).json({
            success: true,
            count: allUsers.length,
            data: allUsers
        });
    } catch (error) {
        console.error('❌ [getAllUsers] Erreur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs',
            error: error.message
        });
    }
};

// ============================================
// GET BY ID
// ============================================

exports.getUserById = async (req, res) => {
    try {
        const { type, id } = req.params;

        if (type === 'interne') {
            const user = await UtilisateurInterne.findById(id)
                .select('-motDePasse')
                .populate({ path: 'roleId', select: 'nom' })
                .populate({ path: 'departementId', select: 'nom description' })
                .lean();

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur interne non trouvé'
                });
            }

            return res.status(200).json({
                success: true,
                data: { ...user, userType: 'interne', role: user.roleId?.nom || 'Inconnu' }
            });
        }

        if (type === 'externe') {
            const user = await UtilisateurExterne.findById(id)
                .select('-motDePasse')
                .lean();

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur externe non trouvé'
                });
            }

            return res.status(200).json({
                success: true,
                data: { ...user, userType: 'externe', role: 'Etudiant', roleId: null, departementId: null }
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Type utilisateur invalide'
        });
    } catch (error) {
        console.error('❌ [getUserById] Erreur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'utilisateur',
            error: error.message
        });
    }
};

// ============================================
// UPDATE
// ============================================

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
        delete updateData.roleId;
        delete updateData.departementId;
        delete updateData.actif;
        delete updateData.email;
        delete updateData.cin;

        let query = UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .select('-motDePasse');

        if (type === 'interne') {
            query = query.populate('roleId').populate('departementId');
        }

        const user = await query.lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Utilisateur modifié avec succès',
            data: { ...user, userType: type }
        });
    } catch (error) {
        console.error('❌ [updateUser] Erreur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification de l\'utilisateur',
            error: error.message
        });
    }
};

// ============================================
// DELETE (soft delete)
// ============================================

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

        user.actif = false;
        await user.softDelete(req.user?._id);

        return res.status(200).json({
            success: true,
            message: 'Utilisateur supprimé avec succès'
        });
    } catch (error) {
        console.error('❌ [deleteUser] Erreur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'utilisateur',
            error: error.message
        });
    }
};

// ============================================
// RESTORE
// ============================================

exports.restoreUser = async (req, res) => {
    try {
        const { type, id } = req.params;
        const UserModel = getUserModel(type);

        if (!UserModel) {
            return res.status(400).json({
                success: false,
                message: 'Type utilisateur invalide'
            });
        }

        const user = await UserModel.findByIdIncludingDeleted(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        if (!user.isDeleted) {
            return res.status(400).json({
                success: false,
                message: "Cet utilisateur n'est pas supprimé."
            });
        }

        await user.restore();
        user.actif = true;
        user.updatedBy = req.user?._id;
        await user.save();

        const userResponse = await UserModel.findById(id)
            .select('-motDePasse')
            .populate('roleId')
            .lean();

        return res.status(200).json({
            success: true,
            message: 'Utilisateur restauré avec succès',
            data: { ...userResponse, userType: type }
        });
    } catch (error) {
        console.error('❌ [restoreUser] Erreur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la restauration de l\'utilisateur',
            error: error.message
        });
    }
};

// ============================================
// CHANGE ROLE
// ============================================

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

        // Externe n'a pas de rôle
        if (type === 'externe') {
            return res.status(400).json({
                success: false,
                message: 'Les utilisateurs externes n\'ont pas de rôle modifiable'
            });
        }

        const role = await Role.findById(roleId);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Rôle non trouvé'
            });
        }

        const user = await UtilisateurInterne.findByIdAndUpdate(
            id,
            { roleId, updatedBy: req.user?._id },
            { new: true, runValidators: true }
        )
            .select('-motDePasse')
            .populate('roleId')
            .populate('departementId')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Rôle modifié avec succès',
            data: { ...user, userType: type }
        });
    } catch (error) {
        console.error('❌ [changeUserRole] Erreur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de rôle',
            error: error.message
        });
    }
};

// ============================================
// ASSIGN DEPARTMENT
// ============================================

exports.assignDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { departementId } = req.body;

        const department = await Department.findById(departementId);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        const user = await UtilisateurInterne.findByIdAndUpdate(
            id,
            { departementId, updatedBy: req.user?._id },
            { new: true, runValidators: true }
        )
            .select('-motDePasse')
            .populate('roleId')
            .populate('departementId')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur interne non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Département assigné avec succès',
            data: { ...user, userType: 'interne' }
        });
    } catch (error) {
        console.error('❌ [assignDepartment] Erreur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'assignation du département',
            error: error.message
        });
    }
};

// ============================================
// CHANGE STATUS
// ============================================

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

        let query = UserModel.findByIdAndUpdate(
            id,
            { actif, updatedBy: req.user?._id },
            { new: true, runValidators: true }
        )
            .select('-motDePasse');

        if (type === 'interne') {
            query = query.populate('roleId').populate('departementId');
        }

        const user = await query.lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: actif ? 'Utilisateur activé avec succès' : 'Utilisateur désactivé avec succès',
            data: { ...user, userType: type }
        });
    } catch (error) {
        console.error('❌ [changeUserStatus] Erreur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du changement de statut',
            error: error.message
        });
    }
};
// src/controllers/userController.js
// ✅ CORRECTION : Restreindre ce que le département peut créer + fonction getEncadrantsByDepartment

const UtilisateurInterne = require('../models/UtilisateurInterne');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const Role = require('../models/Role');
const Department = require('../models/Department');
const { hashPassword } = require('../utils/argon2');
const { validatePasswordPolicy } = require('../utils/validators');
const userLookup = require('../utils/userLookup');
const { ROLES } = require('../config/constants');

const getUserModel = (type) => {
    try {
        return userLookup.getModel(type);
    } catch (err) {
        return null;
    }
};

// ============================================
// CREATE INTERNAL USER - AVEC RESTRICTIONS
// ============================================

exports.createInternalUser = async (req, res) => {
    try {
        // ✅ Vérifier que l'utilisateur a le droit
        const userRole = req.user?.role;
        const isAdmin = userRole === ROLES.ADMIN;
        const isDepartment = userRole === ROLES.DEPARTEMENT;

        console.log('🔍 [createInternalUser] Rôle utilisateur:', userRole);
        console.log('🔍 [createInternalUser] isAdmin:', isAdmin);
        console.log('🔍 [createInternalUser] isDepartment:', isDepartment);

        if (!isAdmin && !isDepartment) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas les droits necessaires pour cette action."
            });
        }

        validatePasswordPolicy(req.body.motDePasse, 'interne');

        // ✅ Vérifier que le rôle existe
        const role = await Role.findById(req.body.roleId);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Rôle non trouvé'
            });
        }

        console.log('🔍 [createInternalUser] Rôle demandé:', role.nom);

        // ✅ Si c'est un département qui crée, il ne peut créer que des Encadrants
        if (isDepartment && role.nom !== 'Encadrant') {
            return res.status(403).json({
                success: false,
                message: 'Vous ne pouvez créer que des utilisateurs avec le rôle "Encadrant"'
            });
        }

        // ✅ Si c'est un département, le département est forcé
        let departementId = req.body.departementId;
        if (isDepartment) {
            // Forcer le département de l'utilisateur connecté
            departementId = req.user.departementId;
            if (!departementId) {
                return res.status(403).json({
                    success: false,
                    message: 'Votre compte n\'est rattaché à aucun département'
                });
            }
            console.log('🔍 [createInternalUser] Département forcé:', departementId);
        }

        const motDePasseHash = await hashPassword(req.body.motDePasse);
        const user = await UtilisateurInterne.create({
            ...req.body,
            motDePasse: motDePasseHash,
            departementId: departementId,
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
        console.error('❌ [createInternalUser] Erreur:', error);
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Erreur lors de la création de l\'utilisateur interne' : error.message,
            details: error.details,
            error: statusCode === 500 ? error.message : undefined
        });
    }
};

// ============================================
// CREATE EXTERNAL USER
// ============================================

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
// RÉCUPÉRER LES ENCADRANTS DU DÉPARTEMENT
// ============================================

exports.getEncadrantsByDepartment = async (req, res) => {
    try {
        const { departementId } = req.user;

        console.log('🔍 [getEncadrantsByDepartment] departementId:', departementId);

        if (!departementId) {
            return res.status(400).json({
                success: false,
                message: "Votre compte n'est rattaché à aucun département."
            });
        }

        // ✅ Récupérer le rôle "Encadrant"
        const role = await Role.findOne({ nom: 'Encadrant' });
        if (!role) {
            console.log('❌ [getEncadrantsByDepartment] Rôle "Encadrant" non trouvé');
            return res.status(404).json({
                success: false,
                message: 'Rôle "Encadrant" non trouvé'
            });
        }

        console.log('🔍 [getEncadrantsByDepartment] roleId:', role._id);

        // ✅ Récupérer les encadrants du département (sans vérifier le type)
        const encadrants = await UtilisateurInterne.find({
            roleId: role._id,
            departementId: departementId,
            actif: true,
            isDeleted: { $ne: true }
        })
        .select('-motDePasse')
        .populate('roleId', 'nom')
        .populate('departementId', 'nom')
        .sort({ createdAt: -1 });

        console.log(`📥 [getEncadrantsByDepartment] ${encadrants.length} encadrants trouvés`);

        return res.status(200).json({
            success: true,
            count: encadrants.length,
            data: encadrants
        });
    } catch (error) {
        console.error('❌ [getEncadrantsByDepartment] Erreur:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des encadrants',
            error: error.message
        });
    }
};

// ============================================
// GET ALL
// ============================================

exports.getAllUsers = async (req, res) => {
    try {
        const { type, role, departementId } = req.query;

        // ✅ Si le département demande uniquement ses encadrants
        if (departementId && role === 'Encadrant') {
            const users = await UtilisateurInterne.find({
                departementId: departementId,
                roleId: { $ne: null }
            })
            .select('-motDePasse')
            .populate({ path: 'roleId', select: 'nom' })
            .populate({ path: 'departementId', select: 'nom description' })
            .sort({ createdAt: -1 })
            .lean();

            // Filtrer pour ne garder que ceux avec le rôle "Encadrant"
            const filteredUsers = users.filter(u => 
                u.roleId?.nom === 'Encadrant'
            );

            const formatted = filteredUsers.map(u => ({
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

        // ✅ Si on demande spécifiquement les utilisateurs internes
        if (type === 'interne') {
            // Construire le filtre
            const filter = {};
            if (role) {
                // Si un rôle est spécifié, on doit filtrer par le nom du rôle
                const roleDoc = await Role.findOne({ nom: role });
                if (roleDoc) {
                    filter.roleId = roleDoc._id;
                } else {
                    // Rôle non trouvé → retourner tableau vide
                    return res.status(200).json({
                        success: true,
                        type: 'interne',
                        count: 0,
                        data: []
                    });
                }
            }
            if (departementId) {
                filter.departementId = departementId;
            }

            const users = await UtilisateurInterne.find(filter)
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

        // ✅ Si on demande spécifiquement les utilisateurs externes
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

        // ✅ Tous les utilisateurs (sans filtre)
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
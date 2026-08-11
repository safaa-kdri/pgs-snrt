// src/controllers/userController.js
const UtilisateurInterne = require('../models/UtilisateurInterne');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const Role = require('../models/Role');
const Department = require('../models/Department');
const { hashPassword } = require('../utils/argon2');
const { validatePasswordPolicy } = require('../utils/validators');
const userLookup = require('../utils/userLookup');
const { ROLES } = require('../config/constants');
const logger = require('../utils/logger');

const getUserModel = (type) => {
    try {
        return userLookup.getModel(type);
    } catch (err) {
        return null;
    }
};

// ============================================
// CREATE INTERNAL USER
// ============================================

exports.createInternalUser = async (req, res) => {
    try {
        console.log('📥 [createInternalUser] Données reçues:', req.body);

        const {
            nom, prenom, email, telephone, cin,
            motDePasse, role, actif, departementNom, departementId
        } = req.body;

        const userRole = req.user?.role;
        const isAdmin = userRole === ROLES.ADMIN;
        const isDepartment = userRole === ROLES.DEPARTEMENT;

        if (!isAdmin && !isDepartment) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas les droits necessaires pour cette action."
            });
        }

        // ✅ Vérifier les champs OBLIGATOIRES
        if (!nom || !prenom || !email || !cin || !motDePasse) {
            return res.status(400).json({
                success: false,
                message: 'Champs obligatoires manquants: nom, prenom, email, cin, motDePasse'
            });
        }

        // ✅ Rôle OBLIGATOIRE
        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Le champ "role" est requis (ex: "Encadrant")'
            });
        }

        // ✅ Récupérer l'ID du rôle par son NOM
        const roleDoc = await Role.findOne({ nom: role });
        if (!roleDoc) {
            return res.status(404).json({
                success: false,
                message: `Rôle "${role}" non trouvé. Vérifiez que ce rôle existe dans la base.`
            });
        }
        const finalRoleId = roleDoc._id;

        // ✅ Si c'est un département, il ne peut créer que des Encadrants
        if (isDepartment) {
            if (roleDoc.nom !== 'Encadrant') {
                return res.status(403).json({
                    success: false,
                    message: 'Vous ne pouvez créer que des utilisateurs avec le rôle "Encadrant"'
                });
            }
        }

        // ✅ Vérifier l'unicité
        const existingEmail = await UtilisateurInterne.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        const existingCIN = await UtilisateurInterne.findOne({ cin });
        if (existingCIN) {
            return res.status(400).json({
                success: false,
                message: 'Ce CIN est déjà utilisé'
            });
        }

        // ✅ Valider le mot de passe (20 caractères minimum pour interne)
        validatePasswordPolicy(motDePasse, 'interne');

        // ✅ Hasher le mot de passe
        const hashedPassword = await hashPassword(motDePasse);

        // ✅ Trouver le département par son NOM (ce que le front envoie)
        let finalDepartementId = null;

        if (isDepartment) {
            // Si c'est un département, utiliser son propre département
            finalDepartementId = req.user.departementId;
            if (!finalDepartementId) {
                return res.status(403).json({
                    success: false,
                    message: 'Votre compte n\'est rattaché à aucun département'
                });
            }
        } else if (departementNom) {
            // 🔥 LE BACKEND CHERCHE LE DÉPARTEMENT PAR SON NOM
            const department = await Department.findOne({ nom: departementNom });
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: `Département "${departementNom}" non trouvé. Vérifiez que ce département existe dans la base.`
                });
            }
            finalDepartementId = department._id;
        } else if (departementId) {
            // Fallback: accepter aussi l'ID si fourni (pour compatibilité)
            const department = await Department.findById(departementId);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: `Département avec l'ID "${departementId}" non trouvé`
                });
            }
            finalDepartementId = department._id;
        } else {
            // Si aucun département n'est fourni, créer sans département
            // (utile pour les admins qui peuvent être sans département)
            if (isAdmin) {
                finalDepartementId = null;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Le champ "departementNom" est requis (ex: "Direction Technique")'
                });
            }
        }

        // ✅ Créer l'utilisateur
        const user = await UtilisateurInterne.create({
            nom,
            prenom,
            email,
            telephone: telephone || '0612345678',
            cin,
            motDePasse: hashedPassword,
            roleId: finalRoleId,
            departementId: finalDepartementId || null,
            actif: actif !== undefined ? actif : true,
            dateInscription: new Date(),
            createdBy: req.user?._id,
            isDeleted: false
        });

        logger.info(`✅ Utilisateur interne créé: ${email} par ${req.user?.email}`);

        const userResponse = await UtilisateurInterne.findById(user._id)
            .select('-motDePasse')
            .populate('roleId')
            .populate('departementId');

        res.status(201).json({
            success: true,
            message: 'Utilisateur interne créé avec succès',
            data: userResponse
        });

    } catch (error) {
        console.error('❌ [createInternalUser] Erreur:', error);
        logger.error(`Erreur createInternalUser: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la création de l\'utilisateur'
        });
    }
};

// ============================================
// CREATE EXTERNAL USER (Étudiant) - VIA ADMIN
// ============================================

exports.createExterne = async (req, res) => {
    try {
        console.log('📥 [createExterne] Données reçues:', req.body);

        const {
            nom, prenom, email, telephone, cin, civilite,
            dateNaissance, adresse, ville, pays,
            universite, filiere, niveau, annee,
            motDePasse, actif
        } = req.body;

        // ✅ Vérifier UNIQUEMENT les champs OBLIGATOIRES
        if (!nom || !prenom || !email || !cin || !motDePasse) {
            return res.status(400).json({
                success: false,
                message: 'Champs obligatoires manquants: nom, prenom, email, cin, motDePasse'
            });
        }

        // ✅ Vérifier l'unicité
        const existingEmail = await UtilisateurExterne.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        const existingCIN = await UtilisateurExterne.findOne({ cin });
        if (existingCIN) {
            return res.status(400).json({
                success: false,
                message: 'Ce CIN est déjà utilisé'
            });
        }

        // ✅ Valider le mot de passe (16 caractères minimum pour étudiant)
        validatePasswordPolicy(motDePasse, 'externe');

        // ✅ Hasher le mot de passe
        const hashedPassword = await hashPassword(motDePasse);

        // ✅ Créer l'utilisateur avec des valeurs par défaut
        const user = await UtilisateurExterne.create({
            nom,
            prenom,
            email,
            telephone: telephone || '0612345678',
            cin,
            civilite: civilite || 'Mr',
            dateNaissance: dateNaissance ? new Date(dateNaissance) : new Date('2000-01-01'),
            adresse: adresse || 'Non renseignée',
            ville: ville || 'Non renseignée',
            pays: pays || 'Maroc',
            universite: universite || null,
            filiere: filiere || null,
            niveau: niveau || null,
            annee: annee || null,
            motDePasse: hashedPassword,
            actif: actif !== undefined ? actif : true,
            dateInscription: new Date(),
            acceptTerms: true,
            confirmEmail: true,
            createdBy: req.user?._id
        });

        logger.info(`✅ Étudiant créé: ${email} par ${req.user?.email}`);

        const userResponse = await UtilisateurExterne.findById(user._id).select('-motDePasse');

        res.status(201).json({
            success: true,
            message: 'Étudiant créé avec succès',
            data: {
                _id: userResponse._id,
                nom: userResponse.nom,
                prenom: userResponse.prenom,
                email: userResponse.email,
                cin: userResponse.cin,
                telephone: userResponse.telephone,
                universite: userResponse.universite,
                filiere: userResponse.filiere,
                actif: userResponse.actif
            }
        });

    } catch (error) {
        console.error('❌ [createExterne] Erreur:', error);
        logger.error(`Erreur createExterne: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la création de l\'étudiant'
        });
    }
};

// ============================================
// CREATE EXTERNAL USER (via formulaire)
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
            .select('-motDePasse');

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

        if (!departementId) {
            return res.status(400).json({
                success: false,
                message: "Votre compte n'est rattaché à aucun département."
            });
        }

        const role = await Role.findOne({ nom: 'Encadrant' });
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Rôle "Encadrant" non trouvé'
            });
        }

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
// GET ALL USERS
// ============================================

exports.getAllUsers = async (req, res) => {
    try {
        const { type, role, departementId } = req.query;

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

        if (type === 'interne') {
            const filter = {};
            if (role) {
                const roleDoc = await Role.findOne({ nom: role });
                if (roleDoc) {
                    filter.roleId = roleDoc._id;
                } else {
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
// GET USER BY ID
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
// UPDATE USER
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
// DELETE USER (soft delete)
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
// RESTORE USER
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
// CHANGE USER ROLE
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
// CHANGE USER STATUS
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
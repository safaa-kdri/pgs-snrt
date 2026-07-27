// src/controllers/userController.js
const UtilisateurInterne = require('../models/UtilisateurInterne');
const UtilisateurExterne = require('../models/UtilisateurExterne');
const Role = require('../models/Role');
const Department = require('../models/Department');
const { hashPassword } = require('../utils/argon2');
const { validatePasswordPolicy } = require('../utils/validators');
const userLookup = require('../utils/userLookup');

// BUGFIX (duplication) : ce fichier recopiait sa propre table de
// correspondance type -> Modele ('interne'/'externe'), strictement
// identique a celle deja definie et exportee par utils/userLookup.js
// (MODELS_BY_TYPE) mais jamais reutilisee ailleurs. On delegue desormais a
// userLookup.getModel pour n'avoir qu'une seule source de verite ; le
// comportement observable est inchange (null pour un type inconnu, comme
// avant, au lieu de laisser remonter l'exception levee par
// userLookup.getModel).
const getUserModel = (type) => {
    try {
        return userLookup.getModel(type);
    } catch (err) {
        return null;
    }
};

exports.createInternalUser = async (req, res) => {
    try {
        // BUGFIX (critique) : cette fonction hachait directement
        // req.body.motDePasse sans jamais appeler validatePasswordPolicy(),
        // contrairement a authController.register() qui le fait pour les
        // etudiants. createInternalUserSchema (Joi) ne verifie que la
        // LONGUEUR minimale (20 caracteres) - un mot de passe de 20
        // minuscules passait le schema puis etait haches tel quel. On
        // applique maintenant le meme controle de complexite que pour les
        // etudiants, adapte au seuil "interne" (20 caracteres).
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
        // Les erreurs de politique de mot de passe (ApiError.badRequest,
        // levees par validatePasswordPolicy) portent leur propre statusCode ;
        // on les relaie plutot que de toujours repondre 500.
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Erreur lors de la création de l’utilisateur interne' : error.message,
            details: error.details,
            error: statusCode === 500 ? error.message : undefined
        });
    }
};

exports.createExternalUser = async (req, res) => {
    try {
        // BUGFIX (critique) : idem createInternalUser - aucune verification
        // de la politique de mot de passe n'etait faite ici (et la route
        // POST /users/external n'avait meme aucun schema Joi avant ce
        // correctif, voir routes/userRoutes.js et utils/validators.js).
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
            message: statusCode === 500 ? 'Erreur lors de la création de l’utilisateur externe' : error.message,
            details: error.details,
            error: statusCode === 500 ? error.message : undefined
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
                .populate('departementId')
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
            .populate('departementId')
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

        let query = UserModel.findById(id).select('-motDePasse').populate('roleId');
        if (type === 'interne') query = query.populate('departementId');
        const user = await query;

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

        // BUGFIX (critique - mass assignment) : cette route n'avait aucun
        // schema Joi avant ce correctif (voir routes/userRoutes.js), et
        // `{ ...req.body, updatedBy }` + un simple
        // `delete updateData.motDePasse` laissaient passer roleId,
        // departementId, actif, cin, email... directement, en
        // court-circuitant changeUserRole/assignDepartment/changeUserStatus
        // qui, eux, verifient l'existence du role/departement cible.
        //
        // La route est desormais protegee par updateInternalUserSchema /
        // updateExternalUserSchema (middlewares/validation.js, avec
        // stripUnknown: true) : req.body ne peut plus contenir que les
        // champs de profil explicitement autorises (nom, prenom, telephone,
        // adresse...). On garde le `delete motDePasse` ci-dessous en
        // defense en profondeur, au cas ou la route serait un jour appelee
        // sans passer par le middleware de validation.
        const updateData = { ...req.body, updatedBy: req.user?._id };
        delete updateData.motDePasse;
        delete updateData.roleId;
        delete updateData.departementId;
        delete updateData.actif;
        delete updateData.email;
        delete updateData.cin;

        let query = UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .select('-motDePasse')
            .populate('roleId');
        if (type === 'interne') query = query.populate('departementId');
        const user = await query;

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

        // BUGFIX (critique) : user.softDelete() plantait avant car
        // UtilisateurInterne/UtilisateurExterne n'etendaient pas BaseSchema
        // (voir models/UtilisateurInterne.js et UtilisateurExterne.js).
        // RG-006 / CU-07 : la "suppression" d'un utilisateur est en realite
        // une desactivation + archivage, jamais une suppression definitive.
        user.actif = false;
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

// NOUVEAU : contrepartie de deleteUser (soft delete). Aucune route de
// restauration n'existait jusqu'ici - une fois un utilisateur "supprime",
// il etait invisible de toutes les requetes filtrees (find/findOne) et,
// avec le correctif du filtre isDeleted sur findOneAndUpdate (voir
// models/BaseModel.js), il n'y avait plus non plus aucun moyen indirect de
// le retrouver. Reservee a l'Administrateur (meme regle que le reste de ce
// controleur).
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

        // findByIdIncludingDeleted (ajoute dans models/BaseModel.js) est le
        // seul point d'entree qui bypass volontairement le filtre isDeleted.
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

        const userResponse = await UserModel.findById(id).select('-motDePasse').populate('roleId');

        return res.status(200).json({
            success: true,
            message: 'Utilisateur restauré avec succès',
            data: userResponse
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la restauration de l’utilisateur',
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

        let query = UserModel.findByIdAndUpdate(
            id,
            { roleId, updatedBy: req.user?._id },
            { new: true, runValidators: true }
        )
            .select('-motDePasse')
            .populate('roleId');
        if (type === 'interne') query = query.populate('departementId');
        const user = await query;

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
            .populate('departementId');

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

        let query = UserModel.findByIdAndUpdate(
            id,
            { actif, updatedBy: req.user?._id },
            { new: true, runValidators: true }
        )
            .select('-motDePasse')
            .populate('roleId');
        if (type === 'interne') query = query.populate('departementId');
        const user = await query;

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
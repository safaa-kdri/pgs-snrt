// src/routes/userRoutes.js
// ✅ CORRECTION : Autoriser le département à créer des encadrants + route dédiée + LOGS

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const validate = require('../middlewares/validation');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const {
  createInternalUserSchema,
  createExternalUserSchema,
  updateInternalUserSchema,
  updateExternalUserSchema,
  changeUserRoleSchema,
  assignDepartmentToUserSchema,
  changeUserStatusSchema,
} = require('../utils/validators');

// ============================================
// ✅ Authentification requise pour toutes les routes
// ============================================
router.use(authenticate());

// ============================================
// ✅ Routes GET
// ============================================
router.get('/', userController.getAllUsers);
router.get('/:type/:id', userController.getUserById);

// ✅ NOUVELLE ROUTE : Récupérer les encadrants du département
router.get(
    '/encadrants/department',
    (req, res, next) => {
        console.log('🔍 [ROUTE] GET /users/encadrants/department appelée');
        console.log('🔍 [ROUTE] User:', req.user);
        console.log('🔍 [ROUTE] User.departementId:', req.user?.departementId);
        next();
    },
    authorize(ROLES.DEPARTEMENT),
    userController.getEncadrantsByDepartment
);

// ============================================
// ✅ Routes de modification
// ============================================

// ✅ Création d'utilisateurs internes - Autoriser ADMIN et DEPARTEMENT
router.post(
    '/internal', 
    authorize(ROLES.ADMIN, ROLES.DEPARTEMENT),
    validate(createInternalUserSchema), 
    userController.createInternalUser
);

router.post(
    '/external', 
    authorize(ROLES.ADMIN), 
    validate(createExternalUserSchema), 
    userController.createExternalUser
);

// Mise à jour (Admin uniquement)
function validateUpdateUser(req, res, next) {
  const schema = req.params.type === 'interne' ? updateInternalUserSchema : updateExternalUserSchema;
  return validate(schema)(req, res, next);
}
router.put('/:type/:id', authorize(ROLES.ADMIN), validateUpdateUser, userController.updateUser);

// Suppression (Admin uniquement)
router.delete('/:type/:id', authorize(ROLES.ADMIN), userController.deleteUser);

// Restauration (Admin uniquement)
router.patch('/:type/:id/restore', authorize(ROLES.ADMIN), userController.restoreUser);

// Changement de rôle (Admin uniquement)
router.patch('/:type/:id/role', authorize(ROLES.ADMIN), validate(changeUserRoleSchema), userController.changeUserRole);

// Assignation de département (Admin uniquement)
router.patch('/internal/:id/department', authorize(ROLES.ADMIN), validate(assignDepartmentToUserSchema), userController.assignDepartment);

// Changement de statut (Admin uniquement)
router.patch('/:type/:id/status', authorize(ROLES.ADMIN), validate(changeUserStatusSchema), userController.changeUserStatus);

module.exports = router;
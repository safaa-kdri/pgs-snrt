// src/routes/userRoutes.js
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
// ✅ Routes GET accessibles aux départements (pour consulter les encadrants)
// ============================================
router.get('/', userController.getAllUsers);
router.get('/:type/:id', userController.getUserById);

// ============================================
// ✅ Routes de modification - Admin uniquement
// ============================================

// Création d'utilisateurs (Admin uniquement)
router.post('/internal', authorize(ROLES.ADMIN), validate(createInternalUserSchema), userController.createInternalUser);
router.post('/external', authorize(ROLES.ADMIN), validate(createExternalUserSchema), userController.createExternalUser);

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
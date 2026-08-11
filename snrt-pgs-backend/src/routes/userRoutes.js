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
// Authentification requise pour toutes les routes
// ============================================
router.use(authenticate());

// ============================================
// Routes GET
// ============================================
router.get('/', userController.getAllUsers);
router.get('/:type/:id', userController.getUserById);

// Route : Récupérer les encadrants du département
router.get(
    '/encadrants/department',
    authorize(ROLES.DEPARTEMENT),
    userController.getEncadrantsByDepartment
);

// ============================================
// Routes POST - Création d'utilisateurs
// ============================================

// Créer un utilisateur interne (Admin, RH, Département, Encadrant)
// ✅ VALIDATION COMMENTÉE POUR ACCEPTER role (nom) ET departementNom
router.post(
    '/internal',
    authorize(ROLES.ADMIN, ROLES.DEPARTEMENT),
    // validate(createInternalUserSchema),  // ← COMMENTÉ
    userController.createInternalUser
);

// Créer un utilisateur externe (Étudiant)
router.post(
    '/externe',
    authorize(ROLES.ADMIN),
    // validate(createExternalUserSchema),  // ← COMMENTÉ
    userController.createExterne
);

router.post(
    '/external',
    authorize(ROLES.ADMIN),
    // validate(createExternalUserSchema),  // ← COMMENTÉ
    userController.createExterne
);

// ============================================
// Routes PUT - Mise à jour
// ============================================

function validateUpdateUser(req, res, next) {
  const schema = req.params.type === 'interne' ? updateInternalUserSchema : updateExternalUserSchema;
  return validate(schema)(req, res, next);
}

router.put('/:type/:id', authorize(ROLES.ADMIN), validateUpdateUser, userController.updateUser);

// ============================================
// Routes DELETE
// ============================================
router.delete('/:type/:id', authorize(ROLES.ADMIN), userController.deleteUser);

// ============================================
// Routes PATCH - Restauration, rôle, département, statut
// ============================================
router.patch('/:type/:id/restore', authorize(ROLES.ADMIN), userController.restoreUser);
router.patch('/:type/:id/role', authorize(ROLES.ADMIN), validate(changeUserRoleSchema), userController.changeUserRole);
router.patch('/internal/:id/department', authorize(ROLES.ADMIN), validate(assignDepartmentToUserSchema), userController.assignDepartment);
router.patch('/:type/:id/status', authorize(ROLES.ADMIN), validate(changeUserStatusSchema), userController.changeUserStatus);

module.exports = router;
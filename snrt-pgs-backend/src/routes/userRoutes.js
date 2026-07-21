// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const validate = require('../middlewares/validation');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const {
  createInternalUserSchema,
  changeUserRoleSchema,
  assignDepartmentToUserSchema,
  changeUserStatusSchema,
} = require('../utils/validators');

// Gestion des utilisateurs reservee a l'Administrateur (cahier des charges, 7.2).
router.use(authenticate(), authorize(ROLES.ADMIN));

router.post('/internal', validate(createInternalUserSchema), userController.createInternalUser);
// NB : les etudiants s'auto-inscrivent via POST /api/v1/auth/register (cahier 3.1) ;
// cette route reste disponible pour la creation manuelle par un administrateur.
router.post('/external', userController.createExternalUser);

router.get('/', userController.getAllUsers);
router.get('/:type/:id', userController.getUserById);

router.put('/:type/:id', userController.updateUser);
router.delete('/:type/:id', userController.deleteUser);

router.patch('/:type/:id/role', validate(changeUserRoleSchema), userController.changeUserRole);
router.patch('/internal/:id/department', validate(assignDepartmentToUserSchema), userController.assignDepartment);
router.patch('/:type/:id/status', validate(changeUserStatusSchema), userController.changeUserStatus);

module.exports = router;
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

// Gestion des utilisateurs reservee a l'Administrateur (cahier des charges, 7.2).
router.use(authenticate(), authorize(ROLES.ADMIN));

router.post('/internal', validate(createInternalUserSchema), userController.createInternalUser);

router.post('/external', validate(createExternalUserSchema), userController.createExternalUser);

router.get('/', userController.getAllUsers);
router.get('/:type/:id', userController.getUserById);


function validateUpdateUser(req, res, next) {
  const schema = req.params.type === 'interne' ? updateInternalUserSchema : updateExternalUserSchema;
  return validate(schema)(req, res, next);
}
router.put('/:type/:id', validateUpdateUser, userController.updateUser);

router.delete('/:type/:id', userController.deleteUser);


router.patch('/:type/:id/restore', userController.restoreUser);

router.patch('/:type/:id/role', validate(changeUserRoleSchema), userController.changeUserRole);
router.patch('/internal/:id/department', validate(assignDepartmentToUserSchema), userController.assignDepartment);
router.patch('/:type/:id/status', validate(changeUserStatusSchema), userController.changeUserStatus);

module.exports = router;

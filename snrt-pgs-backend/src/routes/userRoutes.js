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
// NB : les etudiants s'auto-inscrivent via POST /api/v1/auth/register (cahier 3.1) ;
// cette route reste disponible pour la creation manuelle par un administrateur.
// BUGFIX (critique) : cette route n'avait aucune validation Joi avant ce
// correctif - voir createExternalUserSchema dans utils/validators.js.
router.post('/external', validate(createExternalUserSchema), userController.createExternalUser);

router.get('/', userController.getAllUsers);
router.get('/:type/:id', userController.getUserById);

// BUGFIX (critique - mass assignment) : PUT /:type/:id n'avait aucune
// validation avant ce correctif. On applique desormais un schema different
// selon :type, qui n'autorise que les champs de profil "auto-administrables"
// (roleId/departementId/actif/motDePasse/email/cin restent reserves a
// leurs routes dediees ci-dessous). :type n'etant connu qu'au moment de la
// requete, on choisit le schema dans un petit middleware plutot que de
// dupliquer la route.
function validateUpdateUser(req, res, next) {
  const schema = req.params.type === 'interne' ? updateInternalUserSchema : updateExternalUserSchema;
  return validate(schema)(req, res, next);
}
router.put('/:type/:id', validateUpdateUser, userController.updateUser);

router.delete('/:type/:id', userController.deleteUser);

// NOUVEAU : contrepartie de DELETE (soft delete) - voir
// userController.restoreUser et le mecanisme includingDeleted() ajoute
// dans models/BaseModel.js.
router.patch('/:type/:id/restore', userController.restoreUser);

router.patch('/:type/:id/role', validate(changeUserRoleSchema), userController.changeUserRole);
router.patch('/internal/:id/department', validate(assignDepartmentToUserSchema), userController.assignDepartment);
router.patch('/:type/:id/status', validate(changeUserStatusSchema), userController.changeUserStatus);

module.exports = router;

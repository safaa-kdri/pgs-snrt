// src/routes/departmentRoutes.js
const express = require('express');
const router = express.Router();

const departmentController = require('../controllers/departmentController');
const validate = require('../middlewares/validation');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const {
  createDepartmentSchema,
  updateDepartmentSchema,
  assignResponsableSchema,
  departmentMemberSchema,
} = require('../utils/validators');

// Routes publiques (consultation)
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Routes mutantes protégées (nécessitent authentification + autorisation)
router.post('/', authenticate(), authorize(ROLES.ADMIN), validate(createDepartmentSchema), departmentController.createDepartment);
router.put('/:id', authenticate(), authorize(ROLES.ADMIN), validate(updateDepartmentSchema), departmentController.updateDepartment);
router.delete('/:id', authenticate(), authorize(ROLES.ADMIN), departmentController.deleteDepartment);

router.patch(
  '/:id/responsable',
  authenticate(),
  authorize(ROLES.ADMIN),
  validate(assignResponsableSchema),
  departmentController.assignResponsable
);
router.patch(
  '/:id/members/add',
  authenticate(),
  authorize(ROLES.ADMIN),
  validate(departmentMemberSchema),
  departmentController.addMember
);
router.patch(
  '/:id/members/remove',
  authenticate(),
  authorize(ROLES.ADMIN),
  validate(departmentMemberSchema),
  departmentController.removeMember
);

module.exports = router;
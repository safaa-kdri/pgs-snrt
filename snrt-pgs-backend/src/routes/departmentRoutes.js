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

router.use(authenticate());

// Gestion des departements reservee a l'Administrateur (cahier des charges, 7.2).
router.post('/', authorize(ROLES.ADMIN), validate(createDepartmentSchema), departmentController.createDepartment);
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.put('/:id', authorize(ROLES.ADMIN), validate(updateDepartmentSchema), departmentController.updateDepartment);
router.delete('/:id', authorize(ROLES.ADMIN), departmentController.deleteDepartment);

router.patch(
  '/:id/responsable',
  authorize(ROLES.ADMIN),
  validate(assignResponsableSchema),
  departmentController.assignResponsable
);
router.patch(
  '/:id/members/add',
  authorize(ROLES.ADMIN),
  validate(departmentMemberSchema),
  departmentController.addMember
);
router.patch(
  '/:id/members/remove',
  authorize(ROLES.ADMIN),
  validate(departmentMemberSchema),
  departmentController.removeMember
);

module.exports = router;
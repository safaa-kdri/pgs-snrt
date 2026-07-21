// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.post('/internal', userController.createInternalUser);
router.post('/external', userController.createExternalUser);

router.get('/', userController.getAllUsers);
router.get('/:type/:id', userController.getUserById);

router.put('/:type/:id', userController.updateUser);
router.delete('/:type/:id', userController.deleteUser);

router.patch('/:type/:id/role', userController.changeUserRole);
router.patch('/internal/:id/department', userController.assignDepartment);
router.patch('/:type/:id/status', userController.changeUserStatus);

module.exports = router;
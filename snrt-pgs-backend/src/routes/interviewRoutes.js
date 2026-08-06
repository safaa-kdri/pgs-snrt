// src/routes/interviewRoutes.js
const express = require('express');
const interviewController = require('../controllers/interviewController');
const validate = require('../middlewares/validation');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');
const { createInterviewSchema, updateInterviewSchema } = require('../utils/validators');

const router = express.Router();

// ============================================
// Authentification requise pour toutes les routes
// ============================================
router.use(authenticate());

// ============================================
// ✅ ROUTES POUR LE DÉPARTEMENT
// ============================================
router.get(
    '/department',
    authorize(ROLES.DEPARTEMENT),
    interviewController.listDepartmentInterviews
);

// ============================================
// ROUTES EXISTANTES
// ============================================
router.post('/', validate(createInterviewSchema), interviewController.createInterview);
router.get('/', interviewController.listInterviews);
router.get('/:id', interviewController.getInterviewById);
router.put('/:id', validate(updateInterviewSchema), interviewController.updateInterview);
router.put('/:id/cancel', interviewController.cancelInterview);

module.exports = router;
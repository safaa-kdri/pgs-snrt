// src/routes/internshipRoutes.js
const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { logRequest, logAction } = require('../middlewares/logger');

// ============================================
// Toutes les routes nécessitent une authentification
// ============================================
router.use(requireAuth);
router.use(logRequest);

// ============================================
// Routes pour Encadrant (ses propres stages)
// ============================================
router.get('/my-internships', internshipController.getInternshipsBySupervisor);

// ============================================
// Routes pour Étudiant (ses propres stages)
// ============================================
router.get('/student-internships', internshipController.getInternshipsByStudent);

// ============================================
// Routes pour Encadrant - Actions sur ses stages
// ============================================
router.post('/:id/remarks', logAction('INTERNSHIP_ADD_REMARK'), internshipController.addRemark);
router.put('/:id/evaluate', logAction('INTERNSHIP_EVALUATE'), internshipController.evaluateIntern);
router.put('/:id/close', logAction('INTERNSHIP_CLOSE'), internshipController.closeInternship);
router.put('/:id/validate-deliverable', logAction('INTERNSHIP_VALIDATE_DELIVERABLE'), internshipController.validateDeliverable);

// ============================================
// Routes pour Admin + RH + Encadrant
// ============================================
router.get('/', requireRole(['Administrateur', 'RH', 'Encadrant']), internshipController.getAllInternships);
router.get('/:id', internshipController.getInternshipById);

// ============================================
// Routes pour Admin + RH uniquement
// ============================================
router.post('/', 
    requireRole(['Administrateur', 'RH']), 
    logAction('INTERNSHIP_CREATE'), 
    internshipController.createInternship
);

router.post('/:id/deliverable', 
    logAction('INTERNSHIP_ADD_DELIVERABLE'), 
    internshipController.addDeliverable
);

module.exports = router;
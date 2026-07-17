// src/routes/periodRoutes.js
const express = require('express');
const router = express.Router();
const periodController = require('../controllers/periodController');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { logRequest, logAction } = require('../middlewares/logger');

// ============================================
// Routes publiques (authentification requise)
// ============================================
router.get('/', requireAuth, logRequest, periodController.getAllPeriods);
router.get('/active', requireAuth, logRequest, periodController.getActivePeriods);
router.get('/:id', requireAuth, logRequest, periodController.getPeriodById);

// ============================================
// Routes Admin uniquement
// ============================================
router.post(
    '/', 
    requireAuth, 
    requireRole(['Administrateur']), 
    logRequest,
    logAction('PERIOD_CREATE'),
    periodController.createPeriod
);

router.put(
    '/:id', 
    requireAuth, 
    requireRole(['Administrateur']), 
    logRequest,
    logAction('PERIOD_UPDATE'),
    periodController.updatePeriod
);

router.delete(
    '/:id', 
    requireAuth, 
    requireRole(['Administrateur']), 
    logRequest,
    logAction('PERIOD_DELETE'),
    periodController.deletePeriod
);

module.exports = router;
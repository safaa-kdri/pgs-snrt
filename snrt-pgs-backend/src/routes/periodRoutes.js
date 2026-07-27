// src/routes/periodRoutes.js
const express = require('express');
const router = express.Router();
const periodController = require('../controllers/periodController');
const { authenticate, authorize } = require('../middlewares/auth');
const { logRequest, logAction } = require('../middlewares/logger');

// ============================================
// Routes publiques (authentification requise)
// ============================================
router.get('/', authenticate(), logRequest, periodController.getAllPeriods);
router.get('/active', authenticate(), logRequest, periodController.getActivePeriods);
router.get('/:id', authenticate(), logRequest, periodController.getPeriodById);

// ============================================
// Routes Admin uniquement
// ============================================
router.post(
    '/',
    authenticate(),
    authorize('Administrateur'),
    logRequest,
    logAction('PERIOD_CREATE'),
    periodController.createPeriod
);

router.put(
    '/:id',
    authenticate(),
    authorize('Administrateur'),
    logRequest,
    logAction('PERIOD_UPDATE'),
    periodController.updatePeriod
);

router.delete(
    '/:id',
    authenticate(),
    authorize('Administrateur'),
    logRequest,
    logAction('PERIOD_DELETE'),
    periodController.deletePeriod
);

module.exports = router;
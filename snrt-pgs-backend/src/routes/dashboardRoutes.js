const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const statsController = require('../controllers/statsController');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.use(authenticate());


router.get('/', dashboardController.getDashboard);

router.get('/student', authorize(ROLES.ETUDIANT), dashboardController.getStudentDashboard);
router.get('/admin', authorize(ROLES.ADMIN), dashboardController.getAdminDashboard);
router.get('/rh', authorize(ROLES.RH), dashboardController.getRhDashboard);
router.get('/supervisor', authorize(ROLES.ENCADRANT), dashboardController.getSupervisorDashboard);
router.get('/department', authorize(ROLES.DEPARTEMENT), dashboardController.getDepartmentDashboard);

router.get('/stats/global', statsController.getGlobalStats);
router.get('/stats/export', statsController.exportOfferStats);

module.exports = router;
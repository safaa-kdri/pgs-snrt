const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const statsController = require('../controllers/statsController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate());

router.get('/', dashboardController.getDashboard);

router.get('/stats/global', statsController.getGlobalStats);
router.get('/stats/export', statsController.exportOfferStats);

module.exports = router;
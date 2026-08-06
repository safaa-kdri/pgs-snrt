// src/routes/logRoutes.js
const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate());
router.use(authorize(ROLES.ADMIN));

router.get('/', logController.getLogs);
router.get('/recent', logController.getRecentLogs);

module.exports = router;
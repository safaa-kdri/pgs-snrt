// src/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const studentController = require('../controllers/studentController');

router.use(authenticate());

// ============================================
// NOTIFICATIONS
// ============================================
router.get('/notifications', studentController.getNotifications);
router.put('/notifications/:id/read', studentController.markNotificationAsRead);
router.put('/notifications/read-all', studentController.markAllNotificationsAsRead);

// ============================================
// PROFIL
// ============================================
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

module.exports = router;
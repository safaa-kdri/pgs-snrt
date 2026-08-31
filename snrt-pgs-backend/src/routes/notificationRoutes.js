// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate());

router.post('/', notificationController.createNotification);

// Routes pour l'utilisateur authentifie (le frontend n'a pas besoin de connaitre son ID).
router.get('/', notificationController.getCurrentUserNotifications);
router.get('/unread/count', notificationController.getCurrentUserUnreadCount);
router.patch('/read-all', notificationController.markCurrentUserNotificationsAsRead);

router.get('/user/:userId', notificationController.getUserNotifications);
router.get('/user/:userId/unread-count', notificationController.getUnreadCount);

router.patch('/:id/read', notificationController.markAsRead);
router.patch('/user/:userId/read-all', notificationController.markAllAsRead);

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
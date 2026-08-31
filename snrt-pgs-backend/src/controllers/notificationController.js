// src/controllers/notificationController.js
const Notification = require('../models/Notification');
const { ROLES } = require('../config/constants');

const STAFF_ROLES = [ROLES.ADMIN, ROLES.RH, ROLES.DEPARTEMENT, ROLES.ENCADRANT];

exports.createNotification = async (req, res) => {
    try {
   
        if (!STAFF_ROLES.includes(req.user?.role)) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas les droits pour créer une notification"
            });
        }

        const { type, titre, message, lien, userId, userModel } = req.body;

        const notification = await Notification.create({
            type,
            titre,
            message,
            lien,
            userId,
            userModel,
            createdBy: req.user?._id
        });

        return res.status(201).json({
            success: true,
            message: 'Notification créée avec succès',
            data: notification
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la notification',
            error: error.message
        });
    }
};

exports.getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

 
        if (req.user?.id !== userId && req.user?.role !== ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas accès aux notifications de cet utilisateur"
            });
        }

        const { lue, type } = req.query;

        const filter = { userId };

        if (lue !== undefined) {
            filter.lue = lue === 'true';
        }

        if (type) {
            filter.type = type;
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des notifications',
            error: error.message
        });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user?.id !== userId && req.user?.role !== ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas accès aux notifications de cet utilisateur"
            });
        }

        const count = await Notification.countDocuments({
            userId,
            lue: false
        });

        return res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du comptage des notifications non lues',
            error: error.message
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification non trouvée'
            });
        }

      
        if (req.user?.id !== notification.userId.toString() && req.user?.role !== ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas accès à cette notification"
            });
        }

        notification.lue = true;
        notification.updatedBy = req.user?._id;

        await notification.save();

        return res.status(200).json({
            success: true,
            message: 'Notification marquée comme lue',
            data: notification
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la notification',
            error: error.message
        });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user?.id !== userId && req.user?.role !== ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas accès aux notifications de cet utilisateur"
            });
        }

        const result = await Notification.updateMany(
            { userId, lue: false },
            {
                lue: true,
                updatedBy: req.user?._id
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Toutes les notifications ont été marquées comme lues',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour des notifications',
            error: error.message
        });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification non trouvée'
            });
        }

        
        if (req.user?.id !== notification.userId.toString() && req.user?.role !== ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: "Vous n'avez pas accès à cette notification"
            });
        }

        await notification.softDelete(req.user?._id);

        return res.status(200).json({
            success: true,
            message: 'Notification supprimée avec succès'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la notification',
            error: error.message
        });
    }
};

exports.getCurrentUserNotifications = (req, res) => {
    req.params.userId = req.user.id;
    return exports.getUserNotifications(req, res);
};

exports.getCurrentUserUnreadCount = (req, res) => {
    req.params.userId = req.user.id;
    return exports.getUnreadCount(req, res);
};

exports.markCurrentUserNotificationsAsRead = (req, res) => {
    req.params.userId = req.user.id;
    return exports.markAllAsRead(req, res);
};
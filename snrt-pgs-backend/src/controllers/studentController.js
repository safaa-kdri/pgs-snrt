// src/controllers/studentController.js
const UtilisateurExterne = require('../models/UtilisateurExterne');
const Notification = require('../models/Notification');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const logger = require('../utils/logger');

// ============================================
// RÉCUPÉRER LES NOTIFICATIONS
// ============================================
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user._id,
            userModel: 'UtilisateurExterne',
        })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = notifications.filter(n => !n.lue).length;

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount: unreadCount,
            data: notifications
        });
    } catch (error) {
        logger.error(`Erreur getNotifications: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// MARQUER UNE NOTIFICATION COMME LUE
// ============================================
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification non trouvée'
            });
        }

        if (notification.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'êtes pas autorisé'
            });
        }

        notification.lue = true;
        await notification.save();

        res.status(200).json({
            success: true,
            message: 'Notification marquée comme lue'
        });
    } catch (error) {
        logger.error(`Erreur markNotificationAsRead: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// MARQUER TOUTES LES NOTIFICATIONS COMME LUES
// ============================================
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                userId: req.user._id,
                userModel: 'UtilisateurExterne',
                lue: false
            },
            { lue: true }
        );

        res.status(200).json({
            success: true,
            message: 'Toutes les notifications ont été marquées comme lues'
        });
    } catch (error) {
        logger.error(`Erreur markAllNotificationsAsRead: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// RÉCUPÉRER LE PROFIL DE L'ÉTUDIANT
// ============================================
exports.getProfile = async (req, res) => {
    try {
        const student = await UtilisateurExterne.findById(req.user._id)
            .select('-motDePasse -__v');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        logger.error(`Erreur getProfile: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// METTRE À JOUR LE PROFIL DE L'ÉTUDIANT
// ============================================
exports.updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        delete updates.motDePasse;
        delete updates.roleId;

        const student = await UtilisateurExterne.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-motDePasse -__v');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: student
        });
    } catch (error) {
        logger.error(`Erreur updateProfile: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// RÉCUPÉRER LE TABLEAU DE BORD ÉTUDIANT
// ============================================
exports.getDashboard = async (req, res) => {
    try {
        const [applications, internships, notifications] = await Promise.all([
            Application.find({ etudiantId: req.user._id }).sort({ createdAt: -1 }),
            Internship.find({ etudiantId: req.user._id }).sort({ dateDebut: -1 }),
            Notification.find({
                userId: req.user._id,
                userModel: 'UtilisateurExterne',
                lue: false
            }).countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: {
                applications: applications.length,
                internships: internships.length,
                unreadNotifications: notifications,
                lastApplication: applications[0] || null,
                currentInternship: internships.find(i => i.statut === 'EnCours') || null,
            }
        });
    } catch (error) {
        logger.error(`Erreur getDashboard: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// src/routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

// ============================================
// GET /api/v1/roles - Récupérer tous les rôles
// ============================================
router.get(
    '/',
    authenticate(),
    authorize(ROLES.ADMIN, ROLES.RH, ROLES.DEPARTEMENT),
    async (req, res) => {
        try {
            const roles = await Role.find({ isDeleted: false })
                .select('_id nom description')
                .sort({ nom: 1 });

            return res.status(200).json({
                success: true,
                data: roles
            });
        } catch (error) {
            console.error('❌ Erreur récupération rôles:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des rôles',
                error: error.message
            });
        }
    }
);

// ============================================
// GET /api/v1/roles/:id - Récupérer un rôle par ID
// ============================================
router.get(
    '/:id',
    authenticate(),
    authorize(ROLES.ADMIN, ROLES.RH, ROLES.DEPARTEMENT),
    async (req, res) => {
        try {
            const role = await Role.findById(req.params.id)
                .select('_id nom description');

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Rôle non trouvé'
                });
            }

            return res.status(200).json({
                success: true,
                data: role
            });
        } catch (error) {
            console.error('❌ Erreur récupération rôle:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du rôle',
                error: error.message
            });
        }
    }
);

module.exports = router;
// src/routes/aiRecommendationRoutes.js
// ✅ ROUTES POUR LES RECOMMANDATIONS IA

const express = require('express');
const router = express.Router();
const aiRecommendationController = require('../controllers/aiRecommendationController');
const AIRecommendationService = require('../services/aiRecommendationService');
const { authenticate, authorize } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

// ============================================
// TOUTES LES ROUTES NÉCESSITENT AUTHENTIFICATION
// ============================================

router.use(authenticate());

// ============================================
// ROUTES POUR LES ÉTUDIANTS
// ============================================

// Recommander des offres pour l'étudiant connecté
router.get(
    '/recommendations',
    authorize(ROLES.ETUDIANT),
    aiRecommendationController.recommendOffers
);

// Recommander des offres avec filtres
router.get(
    '/recommendations/filtered',
    authorize(ROLES.ETUDIANT),
    aiRecommendationController.recommendOffersWithFilters
);

// Analyser le profil de l'étudiant
router.get(
    '/profile/analyze',
    authorize(ROLES.ETUDIANT),
    aiRecommendationController.analyzeProfile
);

// ============================================
// ROUTE POUR LE RH (analyser un étudiant spécifique)
// ============================================

router.get(
    '/student/:studentId/analyze',
    authorize(ROLES.RH, ROLES.ADMIN, ROLES.DEPARTEMENT),
    async (req, res) => {
        // Réutiliser l'analyse mais pour un étudiant spécifique
        const result = await AIRecommendationService.analyzeProfile(req.params.studentId);
        return res.status(200).json({
            success: result.success,
            data: result.data,
        });
    }
);

module.exports = router;
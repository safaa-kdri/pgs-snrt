// src/controllers/aiRecommendationController.js
// ✅ CONTROLEUR POUR LES RECOMMANDATIONS IA

const AIRecommendationService = require('../services/aiRecommendationService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// ============================================
// RECOMMANDER DES OFFRES
// ============================================

const recommendOffers = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const { limit = 10 } = req.query;
    
    logger.info(`[AIRecommendation] Demande de recommandations pour l'étudiant ${studentId}`);
    
    const result = await AIRecommendationService.recommendOffers(
        studentId,
        parseInt(limit, 10)
    );
    
    if (!result.success) {
        throw ApiError.internal(result.error || 'Erreur lors de la recommandation');
    }
    
    return res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        studentSkills: result.studentSkills,
        cvAnalysis: result.cvAnalysis,
        message: 'Recommandations générées avec succès',
    });
});

// ============================================
// ANALYSER LE PROFIL DE L'ÉTUDIANT
// ============================================

const analyzeProfile = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    
    logger.info(`[AIRecommendation] Analyse du profil pour l'étudiant ${studentId}`);
    
    const result = await AIRecommendationService.analyzeProfile(studentId);
    
    if (!result.success) {
        throw ApiError.internal(result.error || 'Erreur lors de l\'analyse du profil');
    }
    
    return res.status(200).json({
        success: true,
        data: result.data,
        message: 'Profil analysé avec succès',
    });
});

// ============================================
// RECOMMANDER DES OFFRES (avec filtres supplémentaires)
// ============================================

const recommendOffersWithFilters = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const { 
        limit = 10, 
        typeStage, 
        departementId,
        minScore = 30,
    } = req.query;
    
    logger.info(`[AIRecommendation] Demande de recommandations filtrées pour l'étudiant ${studentId}`);
    
    const result = await AIRecommendationService.recommendOffers(
        studentId,
        parseInt(limit, 10) * 2 // Récupérer plus pour filtrer
    );
    
    if (!result.success) {
        throw ApiError.internal(result.error || 'Erreur lors de la recommandation');
    }
    
    // Appliquer les filtres
    let filteredData = result.data;
    
    if (typeStage) {
        filteredData = filteredData.filter(item => 
            item.offer.typeStage === typeStage
        );
    }
    
    if (departementId) {
        filteredData = filteredData.filter(item => 
            item.offer.departementId === departementId
        );
    }
    
    if (minScore) {
        filteredData = filteredData.filter(item => 
            item.score >= parseInt(minScore, 10)
        );
    }
    
    // Limiter le résultat final
    filteredData = filteredData.slice(0, parseInt(limit, 10));
    
    return res.status(200).json({
        success: true,
        data: filteredData,
        total: filteredData.length,
        studentSkills: result.studentSkills,
        filters: { typeStage, departementId, minScore },
        message: 'Recommandations filtrées générées avec succès',
    });
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
    recommendOffers,
    analyzeProfile,
    recommendOffersWithFilters,
};
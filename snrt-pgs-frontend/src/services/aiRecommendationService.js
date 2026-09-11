// src/services/aiRecommendationService.js
// ✅ SERVICE POUR LES RECOMMANDATIONS IA

import api from './api';

// ============================================
// RECOMMANDATIONS
// ============================================

export const getRecommendations = async (params = {}) => {
    try {
        const response = await api.get('/ai/recommendations', { params });
        return response.data;
    } catch (error) {
        console.error('❌ Erreur getRecommendations:', error);
        throw error;
    }
};

export const getFilteredRecommendations = async (params = {}) => {
    try {
        const response = await api.get('/ai/recommendations/filtered', { params });
        return response.data;
    } catch (error) {
        console.error('❌ Erreur getFilteredRecommendations:', error);
        throw error;
    }
};

export const analyzeProfile = async () => {
    try {
        const response = await api.get('/ai/profile/analyze');
        return response.data;
    } catch (error) {
        console.error('❌ Erreur analyzeProfile:', error);
        throw error;
    }
};

export default {
    getRecommendations,
    getFilteredRecommendations,
    analyzeProfile,
};
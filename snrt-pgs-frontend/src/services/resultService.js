// src/services/resultService.js
import api from './api';

export const resultService = {
    // Récupérer les résultats
    getResults: async (params = {}) => {
        try {
            const response = await api.get('/results', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getResults:', error);
            throw error;
        }
    },

    // Récupérer un résultat par ID
    getResultById: async (id) => {
        try {
            const response = await api.get(`/results/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erreur getResultById ${id}:`, error);
            throw error;
        }
    },

    // Rechercher des résultats
    searchResults: async (searchParams) => {
        try {
            const response = await api.get('/results/search', { params: searchParams });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur searchResults:', error);
            throw error;
        }
    },

    // Exporter les résultats
    exportResults: async (format = 'csv', params = {}) => {
        try {
            const response = await api.get('/results/export', {
                params: { ...params, format },
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur exportResults:', error);
            throw error;
        }
    },
};
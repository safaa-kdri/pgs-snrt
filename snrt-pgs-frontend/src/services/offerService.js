// src/services/offerService.js
import api from './api';

// ============================================
// SERVICE - APPELS API RÉELS
// ============================================

export const offerService = {
    // ============================================
    // Récupérer les offres (API réelle)
    // ============================================
    getOffers: async (params = {}) => {
        try {
            const response = await api.get('/offers', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getOffers:', error);
            throw error;
        }
    },

    // ============================================
    // Récupérer une offre par ID (API réelle)
    // ============================================
    getOfferById: async (id) => {
        try {
            const response = await api.get(`/offers/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erreur getOfferById ${id}:`, error);
            throw error;
        }
    },

    // ============================================
    // Récupérer les départements (API réelle)
    // ============================================
    getDepartments: async () => {
        try {
            const response = await api.get('/departments');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getDepartments:', error);
            throw error;
        }
    },

    // ============================================
    // Récupérer les types de stage (API réelle)
    // ============================================
    getTypes: async () => {
        try {
            const response = await api.get('/offers/types');
            return response.data;
        } catch (error) {
            console.error('❌ Erreur getTypes:', error);
            return { types: ['PFE', 'PFA', 'Initiation', 'Ete'] };
        }
    },

    // ============================================
    // Créer une offre (Département)
    // ============================================
    createOffer: async (offerData) => {
        try {
            const response = await api.post('/offers', offerData);
            return response.data;
        } catch (error) {
            console.error('❌ Erreur createOffer:', error);
            throw error;
        }
    },

    // ============================================
    // Mettre à jour une offre
    // ============================================
    updateOffer: async (id, offerData) => {
        try {
            const response = await api.put(`/offers/${id}`, offerData);
            return response.data;
        } catch (error) {
            console.error(`❌ Erreur updateOffer ${id}:`, error);
            throw error;
        }
    },

    // ============================================
    // Soumettre une offre pour validation
    // ============================================
    submitOffer: async (id) => {
        try {
            const response = await api.put(`/offers/${id}/submit`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erreur submitOffer ${id}:`, error);
            throw error;
        }
    },

    // ============================================
    // Valider une offre (RH)
    // ============================================
    validateOffer: async (id, decision) => {
        try {
            const response = await api.put(`/offers/${id}/validate`, decision);
            return response.data;
        } catch (error) {
            console.error(`❌ Erreur validateOffer ${id}:`, error);
            throw error;
        }
    },

    // ============================================
    // Archiver une offre
    // ============================================
    archiveOffer: async (id) => {
        try {
            const response = await api.put(`/offers/${id}/archive`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erreur archiveOffer ${id}:`, error);
            throw error;
        }
    },

    // ============================================
    // Supprimer une offre (brouillon uniquement)
    // ============================================
    deleteOffer: async (id) => {
        try {
            const response = await api.delete(`/offers/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erreur deleteOffer ${id}:`, error);
            throw error;
        }
    },

    // ============================================
    // Uploader un document concours
    // ============================================
    uploadConcoursDocument: async (offerId, file, type) => {
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('type', type);
            
            const response = await api.post(`/offers/${offerId}/concours-documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error(`❌ Erreur uploadConcoursDocument ${offerId}:`, error);
            throw error;
        }
    },

    // ============================================
    // Supprimer un document concours
    // ============================================
    deleteConcoursDocument: async (offerId, docId) => {
        try {
            const response = await api.delete(`/offers/${offerId}/concours-documents/${docId}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erreur deleteConcoursDocument ${offerId}:`, error);
            throw error;
        }
    },
};
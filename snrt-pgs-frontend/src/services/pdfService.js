// src/services/pdfService.js
import api from './api';

export const pdfService = {
    /**
     * Générer l'engagement de confidentialité
     */
    generateEngagementConfidentialite: async (internshipId) => {
        try {
            const response = await api.get(`/internships/${internshipId}/generate-engagement`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur génération engagement:', error);
            throw error;
        }
    },

    /**
     * Générer la demande de stage pour le Directeur
     */
    generateDemandeStage: async (internshipId) => {
        try {
            const response = await api.get(`/internships/${internshipId}/generate-demande-stage`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur génération demande stage:', error);
            throw error;
        }
    },

    /**
     * Télécharger un PDF
     */
    downloadPDF: (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
};
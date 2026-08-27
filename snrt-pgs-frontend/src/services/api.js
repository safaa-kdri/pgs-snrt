// src/services/api.js
// ✅ AJOUT : Toutes les fonctions du service internshipService.js
// ✅ Gestion des stages, conventions, livrables, évaluations, etc.

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================
// INTERCEPTEUR RÉPONSE - GESTION DES ERREURS 401
// ============================================
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url;

        // ✅ IGNORER 401 SUR /offers (public)
        if (status === 401 && (requestUrl === '/offers' || requestUrl?.startsWith('/offers?'))) {
            console.log('🔵 [API] Accès public aux offres, ignore 401');
            return Promise.resolve({
                data: {
                    offers: [],
                    pagination: { total: 0, page: 1, limit: 10, pages: 0 }
                }
            });
        }

        // ✅ IGNORER 401 SUR /auth/me
        if (status === 401 && requestUrl === '/auth/me') {
            console.log('🔵 [API] Utilisateur non authentifié, ignore 401 sur /me');
            return Promise.resolve({ data: { authenticated: false } });
        }

        // ✅ IGNORER 401 SUR /auth/verify-2fa
        if (status === 401 && requestUrl === '/auth/verify-2fa') {
            return Promise.reject(error);
        }

        // ✅ IGNORER 401 SUR /auth/resend-2fa
        if (status === 401 && requestUrl === '/auth/resend-2fa') {
            return Promise.reject(error);
        }

        // ✅ IGNORER 401 SUR /departments (public)
        if (status === 401 && (requestUrl === '/departments' || requestUrl?.startsWith('/departments?'))) {
            console.log('🔵 [API] Accès public aux départements, ignore 401');
            return Promise.resolve({ data: { data: [] } });
        }

        // ✅ IGNORER 401 SUR /offers/types (public)
        if (status === 401 && (requestUrl === '/offers/types' || requestUrl?.startsWith('/offers/types?'))) {
            console.log('🔵 [API] Accès public aux types d\'offres, ignore 401');
            return Promise.resolve({ data: { types: [] } });
        }

        // ✅ POUR LES AUTRES ROUTES 401 : rediriger vers login
        if (status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('2faEmail');
            localStorage.removeItem('2faUserId');

            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') &&
                !currentPath.includes('/verify-2fa') &&
                !currentPath.includes('/register') &&
                !currentPath.includes('/forgot-password') &&
                !currentPath.includes('/login-interne')) {
                console.log('🔴 [API] Session expirée, redirection vers login');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// ============================================
// INTERCEPTEUR REQUÊTE - LOGS
// ============================================
api.interceptors.request.use(
    (config) => {
        console.log(`📤 [API] ${config.method?.toUpperCase() || 'GET'} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ============================================
// ============================================
// 🎯 FONCTIONS DU SERVICE internshipService.js
// ============================================
// ============================================

// ============================================
// 1. GESTION DES STAGES (Étudiant)
// ============================================

/**
 * Récupérer tous les stages de l'étudiant connecté
 */
export const getStudentInternships = async () => {
    try {
        const response = await api.get('/internships/student');
        return response.data?.data || [];
    } catch (error) {
        console.error('❌ Erreur getStudentInternships:', error);
        return [];
    }
};

/**
 * Vérifier si l'étudiant a au moins un stage actif/accepté
 */
export const hasActiveInternship = async () => {
    try {
        const response = await api.get('/internships/student/has-active');
        return response.data?.hasActive || false;
    } catch (error) {
        console.error('❌ Erreur hasActiveInternship:', error);
        return false;
    }
};

/**
 * Récupérer les détails d'un stage spécifique
 */
export const getInternshipDetail = async (internshipId) => {
    try {
        const response = await api.get(`/internships/${internshipId}`);
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur getInternshipDetail:', error);
        return null;
    }
};

// ============================================
// 2. GESTION DES STAGES (Encadrant)
// ============================================

/**
 * Récupérer les stages de l'encadrant connecté
 */
export const getSupervisorInternships = async () => {
    try {
        const response = await api.get('/internships/supervisor');
        return response.data?.data || [];
    } catch (error) {
        console.error('❌ Erreur getSupervisorInternships:', error);
        return [];
    }
};

// ============================================
// 3. JOURNAL DE SUIVI (Timeline)
// ============================================

/**
 * Récupérer le journal de suivi d'un stage
 */
export const getTimeline = async (internshipId) => {
    try {
        const response = await api.get(`/internships/${internshipId}/timeline`);
        return response.data?.data || [];
    } catch (error) {
        console.error('❌ Erreur getTimeline:', error);
        return [];
    }
};

/**
 * Publier un message dans le journal de suivi
 */
export const postTimelineMessage = async (internshipId, message, file = null) => {
    try {
        const formData = new FormData();
        formData.append('message', message);
        if (file) {
            formData.append('file', file);
        }
        const response = await api.post(`/internships/${internshipId}/timeline`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur postTimelineMessage:', error);
        throw error;
    }
};

/**
 * Supprimer un message du journal de suivi
 */
export const deleteTimelineMessage = async (internshipId, messageId) => {
    try {
        const response = await api.delete(`/internships/${internshipId}/timeline/${messageId}`);
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur deleteTimelineMessage:', error);
        throw error;
    }
};

// ============================================
// 4. CONVENTION
// ============================================

/**
 * Récupérer le statut de la convention d'un stage
 */
export const getConventionStatus = async (internshipId) => {
    try {
        const response = await api.get(`/internships/${internshipId}/convention`);
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur getConventionStatus:', error);
        return null;
    }
};

/**
 * Déposer la convention signée (Étudiant)
 */
export const uploadConvention = async (internshipId, file) => {
    try {
        const formData = new FormData();
        formData.append('convention', file);
        const response = await api.post(`/internships/${internshipId}/convention`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur uploadConvention:', error);
        throw error;
    }
};

/**
 * Télécharger la convention signée
 */
export const downloadConvention = async (internshipId) => {
    try {
        const response = await api.get(`/internships/${internshipId}/convention/download`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('❌ Erreur downloadConvention:', error);
        throw error;
    }
};

/**
 * Signer la convention (RH)
 */
export const signConvention = async (internshipId, signatureData = {}) => {
    try {
        const response = await api.put(`/internships/${internshipId}/convention/sign`, signatureData);
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur signConvention:', error);
        throw error;
    }
};

// ============================================
// 5. LIVRABLES
// ============================================

/**
 * Récupérer les livrables d'un stage
 */
export const getLivrables = async (internshipId) => {
    try {
        const response = await api.get(`/internships/${internshipId}/livrables`);
        return response.data?.data || [];
    } catch (error) {
        console.error('❌ Erreur getLivrables:', error);
        return [];
    }
};

/**
 * Déposer un livrable (Étudiant)
 */
export const uploadLivrable = async (internshipId, file, type) => {
    try {
        const formData = new FormData();
        formData.append('livrable', file);
        formData.append('type', type);
        const response = await api.post(`/internships/${internshipId}/livrables`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur uploadLivrable:', error);
        throw error;
    }
};

/**
 * Valider ou rejeter un livrable (Encadrant)
 */
export const validateLivrable = async (internshipId, livrableId, valide, commentaire = '') => {
    try {
        const response = await api.put(`/internships/${internshipId}/livrables/${livrableId}/validate`, {
            valide,
            commentaire,
        });
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur validateLivrable:', error);
        throw error;
    }
};

// ============================================
// 6. ÉVALUATION
// ============================================

/**
 * Récupérer l'évaluation d'un stage
 */
export const getEvaluation = async (internshipId) => {
    try {
        const response = await api.get(`/internships/${internshipId}/evaluation`);
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur getEvaluation:', error);
        return null;
    }
};

/**
 * Mettre à jour l'évaluation (Encadrant)
 */
export const updateEvaluation = async (internshipId, evaluationData) => {
    try {
        const response = await api.put(`/internships/${internshipId}/evaluation`, evaluationData);
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur updateEvaluation:', error);
        throw error;
    }
};

// ============================================
// 7. ATTESTATION
// ============================================

/**
 * Télécharger l'attestation de fin de stage
 */
export const downloadAttestation = async (internshipId) => {
    try {
        const response = await api.get(`/internships/${internshipId}/attestation`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('❌ Erreur downloadAttestation:', error);
        throw error;
    }
};

// ============================================
// 8. CLÔTURE
// ============================================

/**
 * Clôturer le stage (Encadrant)
 */
export const closeInternship = async (internshipId, remarques = '') => {
    try {
        const response = await api.put(`/internships/${internshipId}/close`, { remarques });
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur closeInternship:', error);
        throw error;
    }
};

// ============================================
// 9. GESTION DU STAGE ACTIF (Sidebar)
// ============================================

/**
 * Récupérer le stage actif de l'étudiant
 * (Utile pour le Sidebar)
 */
export const getActiveInternship = async () => {
    try {
        const response = await api.get('/internships/student/active');
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur getActiveInternship:', error);
        return null;
    }
};

// ============================================
// 10. NOTIFICATIONS POUR LE SUIVI
// ============================================

/**
 * Marquer les notifications de suivi comme lues
 */
export const markTimelineNotificationsAsRead = async (internshipId) => {
    try {
        const response = await api.put(`/internships/${internshipId}/timeline/read-all`);
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur markTimelineNotificationsAsRead:', error);
        return null;
    }
};

// ============================================
// 11. RÉCUPÉRER UN STAGE PAR APPLICATION ID
// ============================================

/**
 * Récupérer un stage par l'ID de la candidature
 */
export const getInternshipByApplication = async (applicationId) => {
    try {
        const response = await api.get(`/internships/application/${applicationId}`);
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur getInternshipByApplication:', error);
        return null;
    }
};

// ============================================
// 12. ENGAGEMENT DE CONFIDENTIALITÉ
// ============================================

/**
 * Télécharger le modèle d'engagement de confidentialité
 */
export const downloadEngagementTemplate = async (internshipId) => {
    try {
        const response = await api.get(`/internships/${internshipId}/generate-engagement`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('❌ Erreur downloadEngagementTemplate:', error);
        throw error;
    }
};

/**
 * Uploader l'engagement de confidentialité signé (Étudiant)
 */
export const uploadEngagement = async (internshipId, file) => {
    try {
        const formData = new FormData();
        formData.append('document', file);
        const response = await api.post(`/internships/${internshipId}/upload-engagement`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur uploadEngagement:', error);
        throw error;
    }
};

// ============================================
// 13. DEMANDE DE STAGE
// ============================================

/**
 * Télécharger la demande de stage
 */
export const downloadDemandeStage = async (internshipId) => {
    try {
        const response = await api.get(`/internships/${internshipId}/download-demande-stage`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('❌ Erreur downloadDemandeStage:', error);
        throw error;
    }
};

// ============================================
// 14. AFFECTER UN ENCADRANT
// ============================================

/**
 * Affecter un encadrant à un stage (RH/Admin)
 */
export const assignSupervisor = async (internshipId, encadrantId) => {
    try {
        const response = await api.put(`/internships/${internshipId}/assign-supervisor`, { encadrantId });
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur assignSupervisor:', error);
        throw error;
    }
};

// ============================================
// 15. METTRE À JOUR LE STATUT DU STAGE
// ============================================

/**
 * Mettre à jour le statut d'un stage (RH/Admin)
 */
export const updateInternshipStatus = async (internshipId, statut) => {
    try {
        const response = await api.patch(`/internships/${internshipId}/status`, { statut });
        return response.data?.data || null;
    } catch (error) {
        console.error('❌ Erreur updateInternshipStatus:', error);
        throw error;
    }
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default api;
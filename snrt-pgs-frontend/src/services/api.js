// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // ✅ IMPORTANT : envoie les cookies HttpOnly automatiquement
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

        // ✅ IGNORER 401 SUR /auth/me (utilisateur non connecté - normal)
        if (status === 401 && requestUrl === '/auth/me') {
            console.log('🔵 [API] Utilisateur non authentifié, ignore 401 sur /me');
            return Promise.resolve({ data: { authenticated: false } });
        }

        // ✅ IGNORER 401 SUR /auth/verify-2fa (erreur de code 2FA)
        if (status === 401 && requestUrl === '/auth/verify-2fa') {
            return Promise.reject(error);
        }

        // ✅ IGNORER 401 SUR /auth/resend-2fa
        if (status === 401 && requestUrl === '/auth/resend-2fa') {
            return Promise.reject(error);
        }

        // ✅ POUR LES AUTRES ROUTES 401 : rediriger vers login
        if (status === 401) {
            // Nettoyer le localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('2faEmail');
            localStorage.removeItem('2faUserId');
            
            // Éviter les redirections en boucle
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/verify-2fa')) {
                console.log('🔴 [API] Session expirée, redirection vers login');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// ============================================
// INTERCEPTEUR REQUÊTE - AJOUT HEADERS (optionnel)
// ============================================
api.interceptors.request.use(
    (config) => {
        // Les cookies HttpOnly sont envoyés automatiquement via withCredentials
        // Pas besoin d'ajouter manuellement le token
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important pour les cookies HttpOnly
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour gérer les erreurs 401 (session expirée)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url;

        // ✅ Routes à exclure de la redirection automatique
        const publicRoutes = ['/auth/me', '/auth/verify-2fa', '/auth/resend-2fa'];
        
        // Ne pas rediriger pour les routes 2FA ou /me
        if (status === 401 && !publicRoutes.includes(requestUrl)) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
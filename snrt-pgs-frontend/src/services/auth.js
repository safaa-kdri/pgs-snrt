// src/services/auth.js
import api from './api';

const CURRENT_USER_KEY = 'user';

const saveCurrentUser = (user) => {
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
};

export const authService = {
    // === INSCRIPTION ===
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // === CONNEXION ===
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data?.user) {
            saveCurrentUser(response.data.user);
        }
        return response.data;
    },

    // === VÉRIFICATION 2FA ===
    verify2FA: async (data) => {
        const response = await api.post('/auth/verify-2fa', data);
        if (response.data?.user) {
            saveCurrentUser(response.data.user);
        }
        return response.data;
    },

    // === RENVOI DU CODE 2FA ===
    resendTwoFactorCode: async () => {
        const response = await api.post('/auth/resend-2fa');
        return response.data;
    },

    // === MOT DE PASSE OUBLIÉ ===
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    // === RÉINITIALISATION DU MOT DE PASSE ===
    resetPassword: async (token, newPassword) => {
        const response = await api.post(`/auth/reset-password/${token}`, { motDePasse: newPassword });
        return response.data;
    },

    // === DÉCONNEXION ===
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            // ✅ Toujours nettoyer le localStorage, même si l'API échoue
            saveCurrentUser(null);
            localStorage.removeItem('2faEmail');
            localStorage.removeItem('2faUserId');
        }
    },

    // === RÉCUPÉRER L'UTILISATEUR ===
    me: async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data?.user) {
                saveCurrentUser(response.data.user);
                return response.data;
            }
            return null;
        } catch (error) {
            // ✅ SUR 401, NE PAS SUPPRIMER L'UTILISATEUR
            if (error.response?.status === 401) {
                return null;
            }
            console.error('Erreur loadCurrentUser:', error);
            return null;
        }
    },

    // === RÉCUPÉRER L'UTILISATEUR STOCKÉ EN LOCAL ===
    getCurrentUser: () => {
        const user = localStorage.getItem(CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // === VÉRIFIER SI L'UTILISATEUR EST CONNECTÉ ===
    isAuthenticated: () => {
        return !!localStorage.getItem(CURRENT_USER_KEY);
    },

    // === STOCKER UN UTILISATEUR EN LOCAL ===
    setCurrentUser: (user) => {
        saveCurrentUser(user);
    }
};

export default authService;
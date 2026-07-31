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
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data?.user) {
            saveCurrentUser(response.data.user);
        }
        return response.data;
    },

    verify2FA: async (data) => {
        const response = await api.post('/auth/verify-2fa', data);
        if (response.data?.user) {
            saveCurrentUser(response.data.user);
        }
        return response.data;
    },

    resendTwoFactorCode: async () => {
        const response = await api.post('/auth/resend-2fa');
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const response = await api.post(`/auth/reset-password/${token}`, { motDePasse: newPassword });
        return response.data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            saveCurrentUser(null);
            localStorage.removeItem('2faEmail');
            localStorage.removeItem('2faUserId');
        }
    },

    me: async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data?.user) {
                saveCurrentUser(response.data.user);
                return response.data;
            }
            return null;
        } catch (error) {
            if (error.response?.status === 401) {
                return null;
            }
            console.error('Erreur loadCurrentUser:', error);
            return null;
        }
    },

    // ✅ UNIQUEMENT le user - PAS de token
    getCurrentUser: () => {
        const user = localStorage.getItem(CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // ✅ UNIQUEMENT le user - PAS de token
    isAuthenticated: () => {
        const storedUser = localStorage.getItem(CURRENT_USER_KEY);
        return !!storedUser;
    },

    setCurrentUser: (user) => {
        saveCurrentUser(user);
    }
};

export default authService;
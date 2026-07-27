// src/hooks/useAuth.js
import { useDispatch, useSelector } from 'react-redux';
import { login, register, verify2FA, forgotPassword, logout, clearError, clear2FA } from '../store/slices/authSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, loading, error, twoFactorRequired, twoFactorEmail } = useSelector(
        (state) => state.auth
    );

    return {
        // État
        user,
        isAuthenticated,
        loading,
        error,
        twoFactorRequired,
        twoFactorEmail,

        // Actions
        login: (credentials) => dispatch(login(credentials)),
        register: (userData) => dispatch(register(userData)),
        verify2FA: (code) => dispatch(verify2FA(code)),
        forgotPassword: (email) => dispatch(forgotPassword(email)),
        logout: () => dispatch(logout()),
        clearError: () => dispatch(clearError()),
        clear2FA: () => dispatch(clear2FA()),
    };
};
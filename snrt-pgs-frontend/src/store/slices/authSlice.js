// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth';

// === ASYNC THUNKS ===

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Erreur de connexion');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authService.register(userData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Erreur d\'inscription');
        }
    }
);

export const verify2FA = createAsyncThunk(
    'auth/verify2FA',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authService.verify2FA(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Code invalide');
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await authService.forgotPassword(email);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Email invalide');
        }
    }
);

export const loadCurrentUser = createAsyncThunk(
    'auth/loadCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const user = await authService.me();
            if (!user) {
                return rejectWithValue('Utilisateur non authentifié');
            }
            return user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Utilisateur non authentifié');
        }
    }
);

// === SLICE ===

const initialState = {
    user: authService.getCurrentUser(),
    isAuthenticated: authService.isAuthenticated(),
    status: 'idle',
    loading: false,
    error: null,
    twoFactorRequired: false,
    twoFactorEmail: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.twoFactorRequired = false;
            state.twoFactorEmail = null;
            authService.logout();
        },
        clearError: (state) => {
            state.error = null;
        },
        clear2FA: (state) => {
            state.twoFactorRequired = false;
            state.twoFactorEmail = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // === LOGIN ===
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                if (action.payload.requiresTwoFactor || action.payload.twoFactorRequired) {
                    state.isAuthenticated = false;
                    state.twoFactorRequired = true;
                    state.twoFactorEmail = action.payload.email || action.payload.message;
                } else {
                    state.isAuthenticated = true;
                    state.user = action.payload.user || state.user;
                    state.twoFactorRequired = false;
                    state.twoFactorEmail = null;
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // === REGISTER ===
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // === VERIFY 2FA ===
            .addCase(verify2FA.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verify2FA.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.twoFactorRequired = false;
                state.twoFactorEmail = null;
                // ✅ Nettoyer le localStorage
                localStorage.removeItem('2faEmail');
                localStorage.removeItem('2faUserId');
                if (action.payload.token) {
                    localStorage.setItem('token', action.payload.token);
                }
            })
            .addCase(verify2FA.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // === LOAD CURRENT USER ===
            .addCase(loadCurrentUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loadCurrentUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (action.payload) {
                    state.isAuthenticated = true;
                    state.user = action.payload;
                }
            })
            .addCase(loadCurrentUser.rejected, (state) => {
                state.status = 'idle';
                // ✅ NE PAS modifier isAuthenticated - garder l'état actuel
            })
            // === FORGOT PASSWORD ===
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError, clear2FA } = authSlice.actions;
export default authSlice.reducer;
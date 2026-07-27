// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth';

// ============================================
// ASYNC THUNKS
// ============================================

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

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authService.logout();
            return { success: true };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Erreur de déconnexion');
        }
    }
);

export const loadCurrentUser = createAsyncThunk(
    'auth/loadCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const user = await authService.me();
            // ✅ Si l'utilisateur n'est pas connecté, retourner null (pas d'erreur)
            if (!user) {
                return null;
            }
            return user;
        } catch (error) {
            // ✅ Ignorer l'erreur 401 (l'utilisateur n'est pas connecté)
            if (error.response?.status === 401) {
                return null;
            }
            return rejectWithValue(error.response?.data?.message || 'Erreur de chargement');
        }
    }
);

// ============================================
// SLICE
// ============================================

const initialState = {
    user: authService.getCurrentUser(),
    isAuthenticated: authService.isAuthenticated(), // ✅ Flag de connexion
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
        clearError: (state) => {
            state.error = null;
        },
        clear2FA: (state) => {
            state.twoFactorRequired = false;
            state.twoFactorEmail = null;
        },
        // ✅ Action pour mettre à jour isAuthenticated (utilisée après 2FA)
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== LOGIN =====
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                
                if (action.payload.requiresTwoFactor) {
                    // ✅ 2FA requise
                    state.isAuthenticated = false;
                    state.twoFactorRequired = true;
                    state.twoFactorEmail = action.payload.email || action.payload.message;
                } else {
                    // ✅ Connexion réussie (sans 2FA)
                    state.isAuthenticated = true;
                    state.user = action.payload.user || state.user;
                    state.twoFactorRequired = false;
                    state.twoFactorEmail = null;
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            
            // ===== REGISTER =====
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ===== VERIFY 2FA =====
            .addCase(verify2FA.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verify2FA.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true; // ✅ Marquer comme connecté
                state.user = action.payload.user;
                state.twoFactorRequired = false;
                state.twoFactorEmail = null;
                
                // Nettoyer le localStorage
                localStorage.removeItem('2faEmail');
                localStorage.removeItem('2faUserId');
                
                // ✅ Sauvegarder l'utilisateur en localStorage (pour le flag)
                if (action.payload.user) {
                    localStorage.setItem('user', JSON.stringify(action.payload.user));
                }
            })
            .addCase(verify2FA.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            
            // ===== LOAD CURRENT USER =====
            .addCase(loadCurrentUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loadCurrentUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                
                if (action.payload && action.payload.user) {
                    // ✅ Utilisateur connecté
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                } else {
                    // ✅ Utilisateur non connecté (normal, pas d'erreur)
                    state.isAuthenticated = false;
                    state.user = null;
                }
            })
            .addCase(loadCurrentUser.rejected, (state) => {
                state.status = 'idle';
                // ✅ NE PAS modifier isAuthenticated ici
                // L'utilisateur peut être connecté via le cookie
            })
            
            // ===== FORGOT PASSWORD =====
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // ===== LOGOUT =====
            .addCase(logout.fulfilled, (state) => {
                state.isAuthenticated = false; // ✅ Marquer comme déconnecté
                state.user = null;
                state.twoFactorRequired = false;
                state.twoFactorEmail = null;
                // Le localStorage est nettoyé dans authService.logout
            })
            .addCase(logout.rejected, (state) => {
                // Même en cas d'erreur, on déconnecte l'utilisateur
                state.isAuthenticated = false;
                state.user = null;
            });
    },
});

export const { clearError, clear2FA, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
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
            if (!user) {
                return null;
            }
            return user;
        } catch (error) {
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
        clearError: (state) => {
            state.error = null;
        },
        clear2FA: (state) => {
            state.twoFactorRequired = false;
            state.twoFactorEmail = null;
        },
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
                    state.isAuthenticated = false;
                    state.twoFactorRequired = true;
                    state.twoFactorEmail = action.payload.email || action.payload.message;
                } else {
                    state.isAuthenticated = true;
                    state.user = action.payload.user || state.user;
                    state.twoFactorRequired = false;
                    state.twoFactorEmail = null;
                    
                    if (action.payload.user) {
                        localStorage.setItem('user', JSON.stringify(action.payload.user));
                    }
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
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.twoFactorRequired = false;
                state.twoFactorEmail = null;
                
                localStorage.removeItem('2faEmail');
                localStorage.removeItem('2faUserId');
                
                // ✅ UNIQUEMENT le user - PAS de token
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
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                    localStorage.setItem('user', JSON.stringify(action.payload.user));
                } else {
                    // ✅ Vérifier si un user existe en localStorage
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        try {
                            state.user = JSON.parse(storedUser);
                            state.isAuthenticated = true;
                        } catch (e) {
                            state.isAuthenticated = false;
                            state.user = null;
                        }
                    } else {
                        state.isAuthenticated = false;
                        state.user = null;
                    }
                }
            })
            .addCase(loadCurrentUser.rejected, (state) => {
                state.status = 'idle';
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
                state.isAuthenticated = false;
                state.user = null;
                state.twoFactorRequired = false;
                state.twoFactorEmail = null;
            })
            .addCase(logout.rejected, (state) => {
                state.isAuthenticated = false;
                state.user = null;
            });
    },
});

export const { clearError, clear2FA, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
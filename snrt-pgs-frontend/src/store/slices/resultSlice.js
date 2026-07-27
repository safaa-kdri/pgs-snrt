// src/store/slices/resultSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ============================================
// THUNKS - APPELS API RÉELS
// ============================================

// ============================================
// Récupérer la liste des résultats (API réelle)
// ============================================
export const fetchResults = createAsyncThunk(
    'results/fetchResults',
    async ({ page = 1, limit = 10, offreId = '' } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit };
            if (offreId) params.offreId = offreId;
            
            const response = await api.get('/results', { params });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur fetchResults:', error);
            return rejectWithValue(
                error.response?.data?.message || 'Erreur de chargement des résultats'
            );
        }
    }
);

// ============================================
// Récupérer un résultat par ID (API réelle)
// ============================================
export const fetchResultById = createAsyncThunk(
    'results/fetchResultById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/results/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Erreur fetchResultById ${id}:`, error);
            return rejectWithValue(
                error.response?.data?.message || 'Résultat non trouvé'
            );
        }
    }
);

// ============================================
// Rechercher des résultats (API réelle)
// ============================================
export const searchResults = createAsyncThunk(
    'results/searchResults',
    async (searchParams, { rejectWithValue }) => {
        try {
            const response = await api.get('/results/search', { params: searchParams });
            return response.data;
        } catch (error) {
            console.error('❌ Erreur searchResults:', error);
            return rejectWithValue(
                error.response?.data?.message || 'Erreur de recherche'
            );
        }
    }
);

// ============================================
// SLICE
// ============================================

const initialState = {
    results: [],
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
    loading: false,
    error: null,
    selectedResult: null,
    searchLoading: false,
    searchError: null,
    searchResult: null,
    filters: {
        offreId: '',
        statut: '',
        dateDebut: '',
        dateFin: '',
    },
};

const resultSlice = createSlice({
    name: 'results',
    initialState,
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setResultFilter: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
            state.page = 1;
        },
        resetSearch: (state) => {
            state.searchResult = null;
            state.searchError = null;
        },
        resetResultFilters: (state) => {
            state.filters = initialState.filters;
            state.page = 1;
        },
        clearSelectedResult: (state) => {
            state.selectedResult = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== fetchResults =====
            .addCase(fetchResults.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResults.fulfilled, (state, action) => {
                state.loading = false;
                // Adaptation selon la structure de l'API
                const data = action.payload;
                state.results = data.results || data.data || [];
                state.total = data.pagination?.total || data.total || 0;
                state.page = data.pagination?.page || data.page || 1;
                state.pages = data.pagination?.pages || data.pages || 1;
                state.limit = data.pagination?.limit || data.limit || 10;
            })
            .addCase(fetchResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.results = [];
            })
            
            // ===== fetchResultById =====
            .addCase(fetchResultById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResultById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedResult = action.payload.result || action.payload.data || action.payload;
            })
            .addCase(fetchResultById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.selectedResult = null;
            })
            
            // ===== searchResults =====
            .addCase(searchResults.pending, (state) => {
                state.searchLoading = true;
                state.searchError = null;
            })
            .addCase(searchResults.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResult = action.payload;
            })
            .addCase(searchResults.rejected, (state, action) => {
                state.searchLoading = false;
                state.searchError = action.payload;
            });
    },
});

export const {
    setPage,
    setResultFilter,
    resetSearch,
    resetResultFilters,
    clearSelectedResult,
} = resultSlice.actions;

export default resultSlice.reducer;
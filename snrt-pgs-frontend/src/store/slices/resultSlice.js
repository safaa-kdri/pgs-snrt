// src/store/slices/resultSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ============================================
// THUNKS
// ============================================

// Récupère la liste des résultats publiés (paginée)
export const fetchResults = createAsyncThunk(
    'results/fetchResults',
    async ({ page = 1, limit = 10, offreId = '', cin = '' } = {}, { rejectWithValue }) => {
        try {
            const params = { page, limit };
            if (offreId) params.offreId = offreId;
            if (cin) params.cin = cin;

            const response = await api.get('/results', { params });
            return response.data;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || err.message || 'Erreur de chargement des résultats'
            );
        }
    }
);

// Recherche du statut d'un candidat précis par CIN
export const searchResultByCin = createAsyncThunk(
    'results/searchResultByCin',
    async (cin, { rejectWithValue }) => {
        try {
            const response = await api.get('/results/search', { params: { cin } });
            return response.data;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || err.message || 'Aucun résultat trouvé pour ce CIN'
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
    pages: 1,
    loading: false,
    error: null,

    searchLoading: false,
    searchError: null,
    searchResult: null,

    filters: {
        offreId: '',
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
    },
    extraReducers: (builder) => {
        builder
            // fetchResults
            .addCase(fetchResults.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResults.fulfilled, (state, action) => {
                state.loading = false;
                state.results = action.payload.results || action.payload.data || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.pages = action.payload.pages || 1;
            })
            .addCase(fetchResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // searchResultByCin
            .addCase(searchResultByCin.pending, (state) => {
                state.searchLoading = true;
                state.searchError = null;
                state.searchResult = null;
            })
            .addCase(searchResultByCin.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResult = action.payload;
            })
            .addCase(searchResultByCin.rejected, (state, action) => {
                state.searchLoading = false;
                state.searchError = action.payload;
            });
    },
});

export const { setPage, setResultFilter, resetSearch, resetResultFilters } = resultSlice.actions;
export default resultSlice.reducer;
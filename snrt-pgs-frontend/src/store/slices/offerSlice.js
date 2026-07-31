// src/store/slices/offerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { offerService } from '../../services/offerService';

// === ACTIONS ===

export const fetchOffers = createAsyncThunk(
    'offers/fetchOffers',
    async (params = {}, { rejectWithValue }) => {
        try {
            console.log('📤 [fetchOffers] Paramètres:', params);
            const response = await offerService.getOffers(params);
            console.log('📥 [fetchOffers] Réponse reçue:', response);
            return response;
        } catch (error) {
            console.error('❌ Erreur fetchOffers:', error);
            return rejectWithValue(error.response?.data?.message || 'Erreur de chargement');
        }
    }
);

export const fetchOfferById = createAsyncThunk(
    'offers/fetchOfferById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await offerService.getOfferById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Offre non trouvée');
        }
    }
);

export const fetchDepartments = createAsyncThunk(
    'offers/fetchDepartments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await offerService.getDepartments();
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Erreur');
        }
    }
);

// === SLICE ===

// ✅ CORRIGÉ : Types alignés avec le seed (uniquement PFE, PFA, Initiation, Ete)
const OFFER_TYPES = ['PFE', 'PFA', 'Initiation', 'Ete'];

const normalizeListResponse = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.departments)) return payload.departments;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
};

const initialState = {
    offers: [],
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
    selectedOffer: null,
    types: OFFER_TYPES,
    departments: [],
    loading: false,
    error: null,
    filters: {
        statut: 'Publiée',
        typeStage: '',
        departementId: '',
        search: ''
    }
};

const offerSlice = createSlice({
    name: 'offers',
    initialState,
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setFilter: (state, action) => {
            const { key, value } = action.payload;
            state.filters[key] = value;
            state.page = 1;
            console.log(`🔄 [setFilter] ${key} = "${value}"`);
        },
        resetFilters: (state) => {
            state.filters = { statut: 'Publiée', typeStage: '', departementId: '', search: '' };
            state.page = 1;
            console.log('🔄 [resetFilters] Filtres réinitialisés');
        },
        clearSelectedOffer: (state) => {
            state.selectedOffer = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOffers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOffers.fulfilled, (state, action) => {
                state.loading = false;
                state.offers = action.payload.offers || [];
                state.total = action.payload.pagination?.total || 0;
                state.pages = action.payload.pagination?.pages || 0;
                state.page = action.payload.pagination?.page || 1;
                state.limit = action.payload.pagination?.limit || 10;
                console.log(`✅ [fetchOffers] ${state.offers.length} offres chargées`);
            })
            .addCase(fetchOffers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.offers = [];
                console.error('❌ [fetchOffers] Erreur:', action.payload);
            })
            .addCase(fetchOfferById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOfferById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedOffer = action.payload.offer;
            })
            .addCase(fetchOfferById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.selectedOffer = null;
            })
            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.departments = normalizeListResponse(action.payload);
            });
    }
});

export const { setPage, setFilter, resetFilters, clearSelectedOffer } = offerSlice.actions;
export default offerSlice.reducer;
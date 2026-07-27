// src/store/slices/resultSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ============================================
// DONNÉES FICTIVES POUR LES RÉSULTATS
// ============================================

const mockResults = [
    {
        _id: 'r1',
        titreOffre: 'Stage Développeur Full Stack',
        offre: { titre: 'Stage Développeur Full Stack' },
        candidatNom: 'Dupont Jean',
        statut: 'Retenu',
        typeStage: 'PFE',
        nbPostes: 2,
        dateResultat: '2026-07-20',
        dateLimiteCandidature: '2026-08-05',
        commentaires: 'Le candidat a démontré d\'excellentes compétences techniques et une bonne capacité d\'adaptation.'
    },
    {
        _id: 'r2',
        titreOffre: 'Stage en Audiovisuel',
        offre: { titre: 'Stage en Audiovisuel' },
        candidatNom: 'Martin Sophie',
        statut: 'Entretien',
        typeStage: 'Initiation',
        nbPostes: 1,
        dateResultat: '2026-07-18',
        dateLimiteCandidature: '2026-08-05',
        commentaires: 'Le candidat sera reçu en entretien la semaine prochaine.'
    },
    {
        _id: 'r3',
        titreOffre: 'Stage en Communication',
        offre: { titre: 'Stage en Communication' },
        candidatNom: 'Bernard Thomas',
        statut: 'Non retenu',
        typeStage: 'Ete',
        nbPostes: 3,
        dateResultat: '2026-07-15',
        dateLimiteCandidature: '2026-08-05',
        commentaires: 'Le profil ne correspond pas aux attentes du poste.'
    },
    {
        _id: 'r4',
        titreOffre: 'Stage en Gestion de Projet',
        offre: { titre: 'Stage en Gestion de Projet' },
        candidatNom: 'Petit Marie',
        statut: 'Présélection',
        typeStage: 'PFA',
        nbPostes: 1,
        dateResultat: '2026-07-12',
        dateLimiteCandidature: '2026-08-05',
        commentaires: 'Le candidat est présélectionné pour la phase suivante.'
    },
    {
        _id: 'r5',
        titreOffre: 'Stage Data Analyst',
        offre: { titre: 'Stage Data Analyst' },
        candidatNom: 'Moreau Lucas',
        statut: 'Final',
        typeStage: 'Master',
        nbPostes: 1,
        dateResultat: '2026-07-10',
        dateLimiteCandidature: '2026-08-05',
        commentaires: 'Le candidat est en phase finale de recrutement.'
    }
];

// ============================================
// THUNKS
// ============================================

// Récupère la liste des résultats (mock)
export const fetchResults = createAsyncThunk(
    'results/fetchResults',
    async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const start = (page - 1) * limit;
            const paginated = mockResults.slice(start, start + limit);
            
            return {
                success: true,
                results: paginated,
                pagination: {
                    page: page,
                    limit: limit,
                    total: mockResults.length,
                    pages: Math.ceil(mockResults.length / limit)
                }
            };
        } catch (err) {
            return rejectWithValue('Erreur de chargement des résultats');
        }
    }
);

// Récupère un résultat par ID (mock)
export const fetchResultById = createAsyncThunk(
    'results/fetchResultById',
    async (id, { rejectWithValue }) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const result = mockResults.find(r => r._id === id);
            if (result) {
                return result;
            }
            return rejectWithValue('Résultat non trouvé');
        } catch (err) {
            return rejectWithValue('Erreur de chargement');
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
    selectedResult: null,
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
        clearSelectedResult: (state) => {
            state.selectedResult = null;
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
                state.results = action.payload.results || [];
                state.total = action.payload.pagination?.total || 0;
                state.page = action.payload.pagination?.page || 1;
                state.pages = action.payload.pagination?.pages || 1;
            })
            .addCase(fetchResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.results = [];
            })
            // fetchResultById
            .addCase(fetchResultById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResultById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedResult = action.payload;
            })
            .addCase(fetchResultById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.selectedResult = null;
            });
    },
});

export const { 
    setPage, 
    setResultFilter, 
    resetSearch, 
    resetResultFilters,
    clearSelectedResult 
} = resultSlice.actions;

export default resultSlice.reducer;
// src/components/public/OffersList.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Container,
    Grid,
    Button,
    Card,
    TextField,
    MenuItem,
    CircularProgress,
    Pagination,
    Alert,
    InputAdornment,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchOffers, fetchDepartments, setFilter, setPage, resetFilters } from '../../store/slices/offerSlice';
import OfferCard from './OfferCard';

// ============================================
// STYLES
// ============================================

const PageTitle = styled(Typography)({
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 700,
    color: '#252930',
    margin: '0 auto 10px',
});

const TitleLine = styled(Box)({
    height: '2px',
    background: '#cfd5da',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto 10px',
});

const ResultsCount = styled(Typography)({
    textAlign: 'center',
    color: '#6d7884',
    fontSize: '14px',
    marginBottom: '16px',
});

const NoResultsBox = styled(Box)({
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6d7884',
});

const FilterChip = styled(Chip)({
    borderRadius: '6px',
    fontSize: '12px',
    height: '28px',
    backgroundColor: '#eef3f7',
    color: '#2d3748',
    '& .MuiChip-deleteIcon': {
        fontSize: '16px',
        color: '#6d7884',
    },
});

const FilterContainer = styled(Box)({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '16px',
    marginBottom: '16px',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const OffersList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { offers, loading, error, total, page, pages, filters, types, departments } = useSelector(
        (state) => state.offers
    );

    // État local pour les filtres (formulaire)
    const [localFilters, setLocalFilters] = useState({
        statut: 'Publiée',
        typeStage: '',
        departementId: '',
        search: ''
    });

    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;

    // Charger les offres au montage ET quand les filtres changent
    useEffect(() => {
        const params = { ...filters, page, limit: 10 };
        dispatch(fetchOffers(params));
        dispatch(fetchDepartments());
    }, [dispatch, filters, page]);

    // Gérer la soumission du formulaire
    const handleSearch = (e) => {
        e.preventDefault();
        Object.keys(localFilters).forEach(key => {
            dispatch(setFilter({ key, value: localFilters[key] }));
        });
    };

    // Gérer le changement de page
    const handlePageChange = (event, value) => {
        dispatch(setPage(value));
    };

    // Gérer la réinitialisation
    const handleReset = () => {
        setLocalFilters({ statut: 'Publiée', typeStage: '', departementId: '', search: '' });
        dispatch(resetFilters());
    };

    // Supprimer un filtre
    const handleRemoveFilter = (key) => {
        dispatch(setFilter({ key, value: '' }));
        setLocalFilters({ ...localFilters, [key]: '' });
    };

    // Afficher les filtres actifs
    const activeFilters = [];
    if (filters.typeStage) activeFilters.push({ key: 'typeStage', label: `Type: ${filters.typeStage}` });
    if (filters.departementId) {
        const dept = departments.find(d => d._id === filters.departementId);
        if (dept) activeFilters.push({ key: 'departementId', label: `Département: ${dept.nom}` });
    }
    if (filters.search) activeFilters.push({ key: 'search', label: `🔍 ${filters.search}` });

    return (
        <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <PageTitle>Recherche des offres de stage</PageTitle>
            <TitleLine />

            {/* === STATUS : NON CONNECTÉ === */}
            {!isAuthenticated ? (
                <Alert 
                    severity="info" 
                    sx={{ mt: 2, borderRadius: '10px' }}
                    action={
                        <Button 
                            color="inherit" 
                            size="small" 
                            onClick={() => navigate('/')}
                            sx={{ fontWeight: 600 }}
                        >
                            Se connecter
                        </Button>
                    }
                >
                    Connectez-vous pour consulter les offres de stage.
                </Alert>
            ) : (
                <>
                    {/* === FILTRES === */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 2, 
                        mt: 2, 
                        mb: 3,
                        p: 2,
                        backgroundColor: '#f7f7f7',
                        borderRadius: '12px'
                    }}>
                        <TextField
                            size="small"
                            placeholder="🔍 Profil"
                            variant="outlined"
                            value={localFilters.search}
                            onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                            sx={{ flex: 1, minWidth: '150px' }}
                        />

                        <TextField
                            size="small"
                            select
                            value={localFilters.typeStage}
                            onChange={(e) => setLocalFilters({ ...localFilters, typeStage: e.target.value })}
                            variant="outlined"
                            SelectProps={{ displayEmpty: true }}
                            sx={{ flex: 1, minWidth: '150px' }}
                        >
                            <MenuItem value="">Type de stage</MenuItem>
                            {types.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            size="small"
                            select
                            value={localFilters.departementId}
                            onChange={(e) => setLocalFilters({ ...localFilters, departementId: e.target.value })}
                            variant="outlined"
                            SelectProps={{ displayEmpty: true }}
                            sx={{ flex: 1, minWidth: '150px' }}
                        >
                            <MenuItem value="">Département</MenuItem>
                            {departments.map((dept) => (
                                <MenuItem key={dept._id || dept.id} value={dept._id || dept.id}>
                                    {dept.nom}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            sx={{
                                backgroundColor: '#148aa0',
                                borderRadius: '27px',
                                textTransform: 'none',
                                px: 3,
                                '&:hover': { backgroundColor: '#0b7890' }
                            }}
                        >
                            Rechercher
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={handleReset}
                            sx={{
                                borderRadius: '27px',
                                textTransform: 'none',
                                borderColor: '#d1d5db',
                                color: '#6b7280',
                                px: 3,
                            }}
                        >
                            Réinitialiser
                        </Button>
                    </Box>

                    {/* === FILTRES ACTIFS === */}
                    {activeFilters.length > 0 && (
                        <FilterContainer>
                            {activeFilters.map((filter) => (
                                <FilterChip
                                    key={filter.key}
                                    label={filter.label}
                                    onDelete={() => handleRemoveFilter(filter.key)}
                                />
                            ))}
                            <FilterChip
                                label="Réinitialiser tout"
                                onClick={handleReset}
                                sx={{ 
                                    backgroundColor: '#fee2e2', 
                                    color: '#b91c1c',
                                    cursor: 'pointer',
                                    '&:hover': { backgroundColor: '#fecaca' }
                                }}
                            />
                        </FilterContainer>
                    )}

                    {/* === LISTE DES OFFRES === */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: '#148aa0' }} />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                    ) : offers.length === 0 ? (
                        <NoResultsBox>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                🕵️ Aucune offre trouvée
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Essayez de modifier vos critères de recherche.
                            </Typography>
                        </NoResultsBox>
                    ) : (
                        <>
                            <ResultsCount>
                                {total} offre(s) trouvée(s)
                            </ResultsCount>

                            {offers.map((offer) => (
                                <OfferCard key={offer._id} offer={offer} />
                            ))}

                            {pages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    <Pagination
                                        count={pages}
                                        page={page}
                                        onChange={handlePageChange}
                                        sx={{
                                            '& .MuiPaginationItem-root.Mui-selected': {
                                                backgroundColor: '#148aa0',
                                                color: '#fff',
                                            }
                                        }}
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </>
            )}
        </Box>
    );
};

export default OffersList;
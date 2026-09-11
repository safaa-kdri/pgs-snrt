// src/components/public/OffersList.jsx
// CORRECTION FINALE : Chargement des offres public - Indépendant de l'authentification
// CORRECTION : Rechargement après déconnexion sans F5
// AJOUT : Onglet Recommandations IA

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Button,
    CircularProgress,
    Pagination,
    Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchOffers, setPage } from '../../store/slices/offerSlice';
import OfferCard from './OfferCard';
import OfferRecommendations from './OfferRecommendations';
import { Analytics } from '@mui/icons-material';

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

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const OffersList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { offers, loading, error, total, page, pages, filters } = useSelector(
        (state) => state.offers
    );
    const { isAuthenticated: authIsAuthenticated, user } = useSelector((state) => state.auth);

    const initialLoadDone = useRef(false);
    const previousAuthState = useRef(authIsAuthenticated);

    // État pour l'onglet actif
    const [activeTab, setActiveTab] = useState('all'); // 'all' ou 'recommended'

    const isAuthenticated = authIsAuthenticated || !!localStorage.getItem('user') || !!localStorage.getItem('token');

    // FONCTION DE CHARGEMENT DES OFFRES
    const loadOffers = () => {
        const params = { ...filters, page, limit: 10 };
        console.log('[OffersList] Chargement des offres (public)');
        dispatch(fetchOffers(params));
    };

    // CHARGEMENT INITIAL - AU MONTAGE (toujours exécuté)
    useEffect(() => {
        console.log('[OffersList] Montage - Chargement initial');
        loadOffers();
        initialLoadDone.current = true;
    }, [dispatch]);

    // RECHARGEMENT QUAND LES FILTRES OU LA PAGE CHANGENT
    useEffect(() => {
        if (initialLoadDone.current) {
            console.log('[OffersList] Rechargement - Filtres/Page changés');
            loadOffers();
        }
    }, [dispatch, filters, page]);

    // RECHARGEMENT APRÈS CHANGEMENT D'AUTHENTIFICATION (LOGIN/LOGOUT)
    useEffect(() => {
        if (previousAuthState.current !== authIsAuthenticated) {
            console.log('[OffersList] Changement d\'authentification détecté:', {
                avant: previousAuthState.current,
                apres: authIsAuthenticated
            });
            
            if (initialLoadDone.current) {
                console.log('[OffersList] Rechargement après changement d\'auth');
                loadOffers();
            }
            
            previousAuthState.current = authIsAuthenticated;
        }
    }, [authIsAuthenticated]);

    const handlePageChange = (event, value) => {
        dispatch(setPage(value));
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <PageTitle>Recherche des offres de stage</PageTitle>
            <TitleLine />

            {/* ===== ONGLETS ===== */}
            {isAuthenticated && user && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 2 }}>
                    <Button
                        variant={activeTab === 'all' ? 'contained' : 'outlined'}
                        onClick={() => setActiveTab('all')}
                        sx={{
                            borderRadius: '20px',
                            textTransform: 'none',
                            backgroundColor: activeTab === 'all' ? '#148aa0' : 'transparent',
                            borderColor: '#148aa0',
                            color: activeTab === 'all' ? '#fff' : '#148aa0',
                            '&:hover': {
                                backgroundColor: activeTab === 'all' ? '#0b7890' : '#eaf6f8',
                            },
                        }}
                    >
                        Toutes les offres
                    </Button>
                    <Button
                        variant={activeTab === 'recommended' ? 'contained' : 'outlined'}
                        onClick={() => setActiveTab('recommended')}
                        sx={{
                            borderRadius: '20px',
                            textTransform: 'none',
                            backgroundColor: activeTab === 'recommended' ? '#148aa0' : 'transparent',
                            borderColor: '#148aa0',
                            color: activeTab === 'recommended' ? '#fff' : '#148aa0',
                            '&:hover': {
                                backgroundColor: activeTab === 'recommended' ? '#0b7890' : '#eaf6f8',
                            },
                        }}
                        startIcon={<Analytics />}
                    >
                        Recommandations IA
                    </Button>
                </Box>
            )}

            {/* ===== CONTENU ===== */}
            {activeTab === 'recommended' && isAuthenticated ? (
                <OfferRecommendations />
            ) : (
                <>
                    {/* ===== LISTE DES OFFRES ===== */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: '#148aa0' }} />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: '10px' }}>
                            {error}
                        </Alert>
                    ) : offers.length === 0 ? (
                        <NoResultsBox>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Aucune offre trouvée
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Aucune offre de stage n'est disponible pour le moment.
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
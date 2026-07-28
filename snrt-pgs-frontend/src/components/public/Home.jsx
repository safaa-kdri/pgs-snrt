// src/components/public/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography,
    Box,
    Container,
    Grid,
    Button,
    Alert,
    CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchOffers, fetchDepartments, setPage } from '../../store/slices/offerSlice';
import { fetchResults, setPage as setResultPage } from '../../store/slices/resultSlice';
import OfferCard from './OfferCard';
import ResultCard from './ResultCard';

// ============================================
// STYLES
// ============================================

const HeroTitle = styled(Typography)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '38px',
    fontWeight: 700,
    color: '#222',
    lineHeight: 1.2,
    margin: '5px auto 8px',
    maxWidth: '100%',
    fontFamily: '"Inter", sans-serif',
    '& span': {
        color: '#168eb4',
        fontWeight: 700,
        fontStyle: 'italic',
    },
    [theme.breakpoints.down('md')]: { fontSize: '32px' },
    [theme.breakpoints.down('sm')]: { fontSize: '24px' },
}));

const HeroDivider = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    margin: '6px 0 8px',
    width: '100%',
    '& hr': {
        flex: 1,
        maxWidth: '100%',
        border: 'none',
        borderTop: '2px solid #168eb4',
    },
    '& i': {
        color: '#178fb5',
        fontSize: '24px',
    },
});

const HeroSubtitle = styled(Typography)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: '0 0 10px',
    fontSize: '18px',
    color: '#555',
    fontFamily: 'Inter, sans-serif',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // ========================================== //
    // 1️⃣ SELECTORS
    // ========================================== //

    const { offers, loading, error, total, page, pages, filters } = useSelector((state) => state.offers);
    const {
        results,
        loading: resultsLoading,
        error: resultsError,
        total: resultsTotal,
        page: resultsPage,
        pages: resultsPages,
    } = useSelector((state) => state.results);

    // ========================================== //
    // 2️⃣ ÉTATS LOCAUX
    // ========================================== //

    const [activeTab, setActiveTab] = useState('offres');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // ========================================== //
    // 3️⃣ VÉRIFICATION CONNEXION
    // ========================================== //

    useEffect(() => {
        if (location.state?.isAuthenticated) {
            setIsAuthenticated(true);
            return;
        }
        
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [location]);

    // ========================================== //
    // 4️⃣ REDIRECTION PAR RÔLE (SI DÉJÀ CONNECTÉ)
    // ========================================== //

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                const role = userData?.role || userData?.userType;

                if (location.state?.isAuthenticated) {
                    return;
                }

                switch (role) {
                    case 'Administrateur':
                        navigate('/admin', { replace: true });
                        break;
                    case 'RH':
                        navigate('/rh', { replace: true });
                        break;
                    case 'Departement':
                        navigate('/department', { replace: true });
                        break;
                    case 'Encadrant':
                        navigate('/supervisor', { replace: true });
                        break;
                    default:
                        navigate('/dashboard', { replace: true });
                        break;
                }
            } catch (e) {
                console.error('Erreur parsing user:', e);
            }
        }
    }, [navigate, location]);

    // ========================================== //
    // 5️⃣ CHARGEMENT DES OFFRES
    // ========================================== //

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const isAuth = !!(token || user);
        
        if (isAuth) {
            dispatch(fetchOffers({ statut: 'Publiée', page: 1, limit: 10 }));
        }
    }, [dispatch]);

    // ========================================== //
    // 6️⃣ CHARGEMENT DES DÉPARTEMENTS
    // ========================================== //

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const isAuth = !!(token || user);
        
        if (isAuth) {
            dispatch(fetchDepartments());
        }
    }, [dispatch]);

    // ========================================== //
    // 7️⃣ CHARGEMENT DES RÉSULTATS (ONGLET ACTIF)
    // ========================================== //

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const isAuth = !!(token || user);
        
        if (activeTab === 'resultats' && isAuth) {
            dispatch(fetchResults({ page: 1, limit: 10 }));
        }
    }, [activeTab, dispatch]);

    // ========================================== //
    // 8️⃣ RENDU DE LA PAGINATION
    // ========================================== //

    const renderPagination = () => {
        const pageNumbers = [];
        const maxVisible = 5;

        if (pages <= maxVisible) {
            for (let i = 1; i <= pages; i++) {
                pageNumbers.push(i);
            }
        } else if (page <= 3) {
            for (let i = 1; i <= 5; i++) {
                pageNumbers.push(i);
            }
        } else if (page >= pages - 2) {
            for (let i = pages - 4; i <= pages; i++) {
                pageNumbers.push(i);
            }
        } else {
            for (let i = page - 2; i <= page + 2; i++) {
                pageNumbers.push(i);
            }
        }

        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mt: 3,
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D9D9D9',
                    borderRadius: '8px',
                    width: '140px',
                    height: '36px',
                    padding: '0 2px',
                    overflow: 'hidden',
                    '& button': {
                        height: '100%',
                        border: 'none',
                        background: 'transparent !important',
                        color: '#F97316 !important',
                        fontSize: '16px',
                        fontWeight: 400,
                        fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 8px',
                        minWidth: '32px',
                        margin: '0',
                        '&:hover, &:active, &:focus': {
                            backgroundColor: 'transparent !important',
                            color: '#F97316 !important',
                        },
                        '&:disabled': {
                            opacity: 0.4,
                            cursor: 'not-allowed',
                            backgroundColor: 'transparent !important',
                            color: '#F97316 !important',
                        },
                        '&.active': {
                            backgroundColor: '#F97316 !important',
                            color: '#FFFFFF !important',
                            borderRadius: '4px',
                            fontWeight: 500,
                            width: '36px',
                            height: '36px',
                            padding: '0',
                            '&:hover, &:active, &:focus': {
                                backgroundColor: '#F97316 !important',
                                color: '#FFFFFF !important',
                            }
                        }
                    }
                }}>
                    <button
                        onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
                        disabled={page === 1}
                    >
                        &lt;&lt;
                    </button>

                    {pageNumbers.map((num) => (
                        <button
                            key={num}
                            className={num === page ? 'active' : ''}
                            onClick={() => dispatch(setPage(num))}
                        >
                            {num}
                        </button>
                    ))}

                    <button
                        onClick={() => dispatch(setPage(Math.min(pages, page + 1)))}
                        disabled={page === pages}
                    >
                        &gt;&gt;
                    </button>
                </Box>
            </Box>
        );
    };

    // ========================================== //
    // 9️⃣ AFFICHAGE
    // ========================================== //

    return (
        <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            {/* ===== HERO ===== */}
            <HeroTitle>
                Bienvenue sur l'espace
                <br />
                <span>stages</span> de la SNRT
            </HeroTitle>

            <HeroDivider>
                <hr />
                <i className="fa-solid fa-graduation-cap"></i>
                <hr />
            </HeroDivider>

            <HeroSubtitle>
                Votre passerelle vers l'expérience professionnelle
            </HeroSubtitle>

            {/* Trait fin de séparation */}
            <Box sx={{
                width: '100%',
                height: '1px',
                backgroundColor: '#e0e4e8',
                margin: '8px 0 16px 0'
            }} />

            {/* ========================================== */}
            {/* ✅ BOUTONS DE NAVIGATION (UNIQUEMENT SI CONNECTÉ) */}
            {/* ========================================== */}
            {isAuthenticated && (
                <Box sx={{ display: 'flex', gap: '12px', mb: 3, justifyContent: 'center' }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/')}
                        sx={{
                            borderRadius: '30px',
                            padding: '8px 24px',
                            borderColor: '#148aa0',
                            color: '#148aa0',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgba(20, 138, 160, 0.05)',
                                borderColor: '#148aa0',
                            }
                        }}
                    >
                        <i className="fa-solid fa-arrow-left" style={{ marginRight: '8px' }}></i>
                        Accueil
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => {
                            const token = localStorage.getItem('token');
                            const storedUser = localStorage.getItem('user');
                            if (token && storedUser) {
                                try {
                                    const userData = JSON.parse(storedUser);
                                    const role = userData?.role || userData?.userType;
                                    switch (role) {
                                        case 'Administrateur': navigate('/admin'); break;
                                        case 'RH': navigate('/rh'); break;
                                        case 'Departement': navigate('/department'); break;
                                        case 'Encadrant': navigate('/supervisor'); break;
                                        default: navigate('/dashboard'); break;
                                    }
                                } catch (e) { navigate('/dashboard'); }
                            } else {
                                navigate('/dashboard');
                            }
                        }}
                        sx={{
                            borderRadius: '30px',
                            padding: '8px 24px',
                            backgroundColor: '#148aa0',
                            color: '#ffffff',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#0b7890',
                            }
                        }}
                    >
                        Dashboard
                        <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                    </Button>
                </Box>
            )}

            {/* ===== ONGLETS STYLE SNRT ===== */}
            <Box sx={{ display: 'flex', gap: '2px', mb: 3 }}>
                <Button
                    onClick={() => setActiveTab('offres')}
                    sx={{
                        backgroundColor: activeTab === 'offres' ? '#148aa0' : 'transparent',
                        color: activeTab === 'offres' ? '#ffffff' : '#148aa0',
                        border: activeTab === 'offres' ? 'none' : '1px solid #148aa0',
                        borderRadius: '4px',
                        padding: '6px 20px',
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        '&:hover': {
                            backgroundColor: activeTab === 'offres' ? '#0b7890' : 'rgba(20, 138, 160, 0.05)',
                        }
                    }}
                >
                    Offres
                </Button>
                <Button
                    onClick={() => setActiveTab('resultats')}
                    sx={{
                        backgroundColor: activeTab === 'resultats' ? '#148aa0' : 'transparent',
                        color: activeTab === 'resultats' ? '#ffffff' : '#148aa0',
                        border: activeTab === 'resultats' ? 'none' : '1px solid #148aa0',
                        borderRadius: '4px',
                        padding: '6px 20px',
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        '&:hover': {
                            backgroundColor: activeTab === 'resultats' ? '#0b7890' : 'rgba(20, 138, 160, 0.05)',
                        }
                    }}
                >
                    Résultats
                </Button>
            </Box>

            {/* ========================================== */}
            {/* CONTENU CONDITIONNEL SELON L'ONGLET */}
            {/* ========================================== */}

            {activeTab === 'offres' ? (
                // ===== ONGLET OFFRES =====
                loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#148aa0' }} />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                ) : offers.length === 0 ? (
                    <Box sx={{ padding: '20px', textAlign: 'center', background: '#fbf9f9', borderRadius: '19px' }}>
                        <i className="fa-solid fa-circle-info" style={{ fontSize: '24px', color: '#168eb4' }}></i>
                        <h3 style={{ margin: '10px 0 5px', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                            Aucune offre disponible
                        </h3>
                        <p style={{ color: '#555', fontFamily: 'Inter, sans-serif' }}>
                            Restez connecté. Les nouvelles offres seront bientôt publiées.
                        </p>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ mt: 2 }}>
                            {offers.map((offer) => (
                                <OfferCard key={offer._id} offer={offer} />
                            ))}
                        </Box>
                        {renderPagination()}
                    </>
                )
            ) : (
                // ===== ONGLET RÉSULTATS =====
                <>
                    {resultsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: '#148aa0' }} />
                        </Box>
                    ) : resultsError ? (
                        <Alert severity="error" sx={{ mt: 2 }}>{resultsError}</Alert>
                    ) : results.length === 0 ? (
                        <Box sx={{ padding: '20px', textAlign: 'center', background: '#fbf9f9', borderRadius: '19px' }}>
                            <i className="fa-solid fa-circle-info" style={{ fontSize: '24px', color: '#168eb4' }}></i>
                            <h3 style={{ margin: '10px 0 5px', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                                Aucun résultat publié
                            </h3>
                            <p style={{ color: '#555', fontFamily: 'Inter, sans-serif' }}>
                                Les résultats seront publiés ici dès qu'ils seront disponibles.
                            </p>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ border: '1px solid #e8edf0', borderRadius: '8px', overflow: 'hidden' }}>
                                {results.map((result) => (
                                    <ResultCard key={result._id} result={result} />
                                ))}
                            </Box>
                            {resultsPages > 1 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: '4px' }}>
                                    <button
                                        onClick={() => dispatch(setResultPage(Math.max(1, resultsPage - 1)))}
                                        disabled={resultsPage === 1}
                                        style={{
                                            minWidth: '20px',
                                            height: '20px',
                                            border: '1px solid #d9dee3',
                                            borderRadius: '4px',
                                            background: '#ffffff',
                                            color: '#f05f1c',
                                            fontSize: '10px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            fontFamily: 'Inter, sans-serif',
                                            padding: '0 8px',
                                        }}
                                    >
                                        {'<<'}
                                    </button>
                                    <span style={{ padding: '0 10px', fontFamily: 'Inter, sans-serif', color: '#6d7884' }}>
                                        {resultsPage} / {resultsPages}
                                    </span>
                                    <button
                                        onClick={() => dispatch(setResultPage(Math.min(resultsPages, resultsPage + 1)))}
                                        disabled={resultsPage === resultsPages}
                                        style={{
                                            minWidth: '32px',
                                            height: '32px',
                                            border: '1px solid #d9dee3',
                                            borderRadius: '4px',
                                            background: '#ffffff',
                                            color: '#f05f1c',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            fontFamily: 'Inter, sans-serif',
                                            padding: '0 8px',
                                        }}
                                    >
                                        {'>>'}
                                    </button>
                                </Box>
                            )}
                        </>
                    )}
                </>
            )}
        </Box>
    );
};

export default Home;
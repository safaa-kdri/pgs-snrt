// src/components/student/Favorites.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    IconButton,
    CircularProgress,
    Tooltip,
    Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Favorite,
    FavoriteBorder,
    Work,
    LocationOn,
    CalendarToday,
    Delete,
    Refresh,
    ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// ============================================
// STYLES
// ============================================

const PageHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
});

const FavoriteCard = styled(Card)({
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
    },
});

const CardHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
});

const EmptyState = styled(Box)({
    textAlign: 'center',
    padding: '60px 20px',
    '& .MuiSvgIcon-root': {
        fontSize: 80,
        color: '#d1d5db',
        marginBottom: '16px',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Favorites = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockFavorites = [
                {
                    id: '1',
                    offreId: '1',
                    titre: 'Stage Développement Web',
                    typeStage: 'PFE',
                    departement: 'DSI',
                    dateAjout: '2026-07-15',
                    description: 'Développement d\'applications web avec React et Node.js',
                    nbPostes: 2,
                },
                {
                    id: '2',
                    offreId: '2',
                    titre: 'Stage Data Science',
                    typeStage: 'Master',
                    departement: 'DSI',
                    dateAjout: '2026-07-14',
                    description: 'Analyse de données et machine learning',
                    nbPostes: 1,
                },
                {
                    id: '3',
                    offreId: '3',
                    titre: 'Stage Cybersécurité',
                    typeStage: 'PFE',
                    departement: 'DSI',
                    dateAjout: '2026-07-12',
                    description: 'Sécurisation des infrastructures et applications',
                    nbPostes: 2,
                },
            ];

            setFavorites(mockFavorites);

        } catch (error) {
            console.error('Erreur chargement favoris:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = (id) => {
        setFavorites(favorites.filter((f) => f.id !== id));
        setSuccess('✅ Offre retirée des favoris');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleViewOffer = (offreId) => {
        navigate(`/offres/${offreId}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        ⭐ Mes offres favorites
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {favorites.length} offre(s) sauvegardée(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchFavorites}
                        disabled={loading}
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                        Rafraîchir
                    </Button>
                </Box>
            </PageHeader>

            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

            {/* ===== FAVORIS ===== */}
            {favorites.length === 0 ? (
                <Paper sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <EmptyState>
                        <FavoriteBorder />
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a2332' }}>
                            Aucune offre favorite
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Commencez à sauvegarder des offres qui vous intéressent
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ mt: 3, backgroundColor: '#148aa0', textTransform: 'none' }}
                            onClick={() => navigate('/offres')}
                        >
                            Voir les offres
                        </Button>
                    </EmptyState>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {favorites.map((favorite) => (
                        <Grid item xs={12} sm={6} lg={4} key={favorite.id}>
                            <FavoriteCard>
                                <CardContent sx={{ flex: 1 }}>
                                    <CardHeader>
                                        <Chip
                                            label={favorite.typeStage}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#e0e7ff',
                                                color: '#4338ca',
                                                fontWeight: 500,
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveFavorite(favorite.id)}
                                            sx={{ color: '#ef4444' }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </CardHeader>

                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2332', mb: 1 }}>
                                        {favorite.titre}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {favorite.description}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        <Chip
                                            icon={<Work sx={{ fontSize: 14 }} />}
                                            label={favorite.departement}
                                            size="small"
                                            sx={{ backgroundColor: '#f3e8ff', color: '#6b21a8' }}
                                        />
                                        <Chip
                                            icon={<CalendarToday sx={{ fontSize: 14 }} />}
                                            label={`Ajouté le ${new Date(favorite.dateAjout).toLocaleDateString('fr-FR')}`}
                                            size="small"
                                            sx={{ backgroundColor: '#f7f7f7' }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {favorite.nbPostes} poste(s)
                                        </Typography>
                                        <Button
                                            size="small"
                                            endIcon={<ArrowForward />}
                                            onClick={() => handleViewOffer(favorite.offreId)}
                                            sx={{
                                                color: '#148aa0',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Voir l'offre
                                        </Button>
                                    </Box>
                                </CardContent>
                            </FavoriteCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default Favorites;
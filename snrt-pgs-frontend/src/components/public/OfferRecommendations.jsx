// src/components/public/OfferRecommendations.jsx
// Composant d'affichage des recommandations IA

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
    CircularProgress,
    Alert,
    LinearProgress,
    Stack,
    Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Work,
    CalendarToday,
    Refresh,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const RecommendationCard = styled(Card)(({ score }) => ({
    borderRadius: '8px',
    border: '1px solid #dce7eb',
    boxShadow: '0 2px 8px rgba(20, 138, 160, 0.06)',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
    position: 'relative',
    '&:hover': {
        boxShadow: '0 8px 24px rgba(20, 138, 160, 0.12)',
        transform: 'translateY(-2px)',
    },
    '& .score-indicator': {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '4px',
        height: '100%',
        backgroundColor: score >= 80 ? '#148aa0' : score >= 60 ? '#5d9fb0' : '#8a9ca3',
    },
}));

const SkillChip = styled(Chip)({
    margin: '2px 4px 2px 0',
    fontSize: '11px',
    height: '22px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
});

const LoadingContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '16px',
});

const EmptyState = styled(Box)({
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px dashed #b9d7de',
});

const SectionTitle = styled(Typography)({
    fontWeight: 700,
    fontSize: '20px',
    color: '#252930',
    marginBottom: '4px',
});

const MatchLabel = styled(Typography)({
    color: '#52636a',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
});

const MatchDescription = styled(Typography)(({ score }) => ({
    color: score >= 80 ? '#0b6476' : score >= 60 ? '#27758a' : '#52636a',
    fontSize: '13px',
    fontWeight: 600,
    marginTop: '5px',
}));

const getMatchLabel = (score) => {
    if (score >= 80) return 'Très bonne correspondance';
    if (score >= 60) return 'Bonne correspondance';
    if (score >= 40) return 'Correspondance modérée';
    return 'Correspondance faible';
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const OfferRecommendations = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState('');
    const [cvAnalysis, setCvAnalysis] = useState(null);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/ai/recommendations', {
                params: { limit: 10 }
            });
            setRecommendations(response.data?.data || []);
            setCvAnalysis(response.data?.cvAnalysis || null);
        } catch (error) {
            console.error('Erreur chargement recommandations:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchRecommendations();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleViewOffer = (offerId) => {
        navigate(`/offres/${offerId}`);
    };

    if (loading) {
        return (
            <LoadingContainer>
                            <CircularProgress size={40} sx={{ color: '#148aa0' }} />
                <Typography variant="body2" color="text.secondary">
                    Analyse des offres en cours...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    L'intelligence artificielle trouve les meilleurs matchs pour vous
                </Typography>
            </LoadingContainer>
        );
    }

    return (
        <Box>
            {/* ===== EN-TÊTE ===== */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <SectionTitle>Recommandations personnalisées</SectionTitle>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleRefresh}
                    disabled={loading}
                    sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        borderColor: '#e2e8f0',
                        color: '#475569',
                        borderColor: '#148aa0',
                        '&:hover': { borderColor: '#0b7890', color: '#0b7890', backgroundColor: '#eaf6f8' },
                    }}
                >
                    Actualiser
                </Button>
            </Box>

            {cvAnalysis && (
                <Alert
                    severity={cvAnalysis.status === 'extracted' ? 'success' : 'info'}
                    sx={{ mb: 3, borderRadius: '8px' }}
                >
                    <Typography variant="body2" fontWeight={600}>
                        Analyse du CV
                    </Typography>
                    <Typography variant="body2">
                        {cvAnalysis.message}
                    </Typography>
                    {cvAnalysis.status === 'extracted' && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {cvAnalysis.skills.length} compétence(s), {cvAnalysis.experiences.length} expérience(s) et {cvAnalysis.projects.length} projet(s) pris en compte.
                        </Typography>
                    )}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                    {error}
                </Alert>
            )}

            {/* ===== RECOMMANDATIONS ===== */}
            {recommendations.length === 0 ? (
                <EmptyState>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        Aucune recommandation disponible
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {!user ? 'Connectez-vous pour voir les recommandations personnalisées' :
                        'Complétez votre profil avec vos compétences et expériences pour obtenir des recommandations'}
                    </Typography>
                </EmptyState>
            ) : (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
                        <Typography sx={{ color: '#252930', fontSize: '16px', fontWeight: 700 }}>
                            Offres correspondant à votre profil
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {recommendations.length} recommandation{recommendations.length > 1 ? 's' : ''}
                        </Typography>
                    </Box>
                    <Stack spacing={2}>
                        {recommendations.map((item, index) => (
                            <RecommendationCard key={item.offer._id || index} score={item.score}>
                                <Box className="score-indicator" />
                                <CardContent sx={{ p: { xs: 1.75, sm: 2.25 } }}>
                                    <Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ lineHeight: 1.3 }}>
                                        {item.offer.titre}
                                    </Typography>
                                    <Typography variant="body2" color="#52636a" sx={{ mt: 0.75 }}>
                                        {item.offer.departement || 'Département'}
                                    </Typography>
                                    <Typography variant="body2" color="#52636a" sx={{ mt: 0.5 }}>
                                        {item.offer.typeStage || 'Stage'} · {item.offer.nbPostes || 1} poste{item.offer.nbPostes > 1 ? 's' : ''}
                                    </Typography>

                                    <Divider sx={{ my: 1.5 }} />

                                    <Box sx={{ mb: 1.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
                                            <MatchLabel>Correspondance avec votre profil</MatchLabel>
                                            <Typography sx={{ color: '#0b6476', fontSize: '22px', fontWeight: 700 }}>
                                                {item.score} %
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={item.score}
                                            sx={{ height: 8, borderRadius: 4, backgroundColor: '#e6eef0', '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: '#148aa0' } }}
                                        />
                                        <MatchDescription score={item.score}>
                                            {getMatchLabel(item.score)}
                                        </MatchDescription>
                                    </Box>

                                    {item.commonSkills.length > 0 && (
                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography variant="caption" color="#52636a" sx={{ display: 'block', mb: 0.75, fontWeight: 600 }}>
                                                Compétences correspondantes
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                                {item.commonSkills.slice(0, 6).map((skill, idx) => (
                                                    <SkillChip key={idx} label={skill} />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CalendarToday sx={{ fontSize: 14 }} />
                                                {formatDate(item.offer.dateLimiteCandidature)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Work sx={{ fontSize: 14 }} />
                                                Du {formatDate(item.offer.dateDebut)} au {formatDate(item.offer.dateFin)}
                                            </Typography>
                                            {item.alreadyApplied && (
                                                <Chip label="Déjà postulé" size="small" sx={{ backgroundColor: '#e1f1f5', color: '#126d80' }} />
                                            )}
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleViewOffer(item.offer._id)}
                                            sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#148aa0', color: '#148aa0', '&:hover': { borderColor: '#0b7890', color: '#0b7890', backgroundColor: '#eaf6f8' } }}
                                        >
                                            Consulter l'offre
                                        </Button>
                                    </Box>
                                </CardContent>
                            </RecommendationCard>
                        ))}
                    </Stack>
                </Box>
            )}
        </Box>
    );
};

export default OfferRecommendations;
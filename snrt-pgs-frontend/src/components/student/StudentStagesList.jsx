// src/components/student/StudentStagesList.jsx
// ✅ CARTES GRANDES - Titre très lisible - Design aéré

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    WorkOutline,
    CalendarToday,
    PersonOutline,
    SchoolOutlined,
    ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================
// STYLES - CARTES TRÈS GRANDES
// ============================================

const PageContainer = styled(Container)({
    paddingTop: '32px',
    paddingBottom: '48px',
    maxWidth: '1400px !important',
});

const PageHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
});

const PageTitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontWeight: 700,
    fontSize: '32px',
    color: '#1a2332',
    letterSpacing: '-0.01em',
});

const PageSubtitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontSize: '16px',
    color: '#687480',
    marginTop: '4px',
});

// ✅ CARTE TRÈS GRANDE
const StyledCard = styled(Card)({
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    border: '1px solid #eef1f3',
    borderLeft: '8px solid #22c55e',
    cursor: 'pointer',
    height: '100%',
    minHeight: '320px',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
        boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
        transform: 'translateY(-6px)',
        borderColor: '#d0d5da',
    },
});

// ✅ CONTENU AVEC BEAUCOUP D'ESPACE
const StyledCardContent = styled(CardContent)({
    padding: '40px 32px 32px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    '&:last-child': {
        paddingBottom: '32px',
    },
});

// ✅ TITRE TRÈS GRAND ET LISIBLE
const CardTitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontWeight: 700,
    fontSize: '28px',
    color: '#1a2332',
    lineHeight: 1.3,
    marginBottom: '24px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    width: '100%',
    letterSpacing: '-0.01em',
});

const InfoLabel = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontSize: '13px',
    color: '#9aa4ac',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '4px',
});

const InfoText = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontSize: '18px',
    color: '#1a2332',
    fontWeight: 500,
    lineHeight: 1.5,
});

const DividerLine = styled(Box)({
    width: '40px',
    height: '2px',
    backgroundColor: '#d1d5db',
    margin: '4px auto',
});

const InfoBlock = styled(Box)({
    width: '100%',
    marginBottom: '18px',
});

const CardFooter = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid #f0f2f5',
    width: '100%',
});

const ArrowButton = styled(IconButton)({
    color: '#148aa0',
    padding: '8px',
    '&:hover': {
        backgroundColor: 'rgba(20, 138, 160, 0.08)',
    },
});

const EmptyState = styled(Box)({
    textAlign: 'center',
    padding: '80px 20px',
    '& .MuiSvgIcon-root': {
        fontSize: '64px',
        color: '#d1d5db',
        marginBottom: '16px',
    },
});

const EmptyTitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontWeight: 600,
    fontSize: '22px',
    color: '#1a2332',
    marginBottom: '8px',
});

const EmptyText = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontSize: '16px',
    color: '#9aa4ac',
});

const EmptyButton = styled('button')({
    borderRadius: '10px',
    textTransform: 'none',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 500,
    fontSize: '15px',
    padding: '12px 40px',
    marginTop: '24px',
    backgroundColor: '#148aa0',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: '#0b7890',
    },
});

// ============================================
// ✅ FONCTION DE PROGRESSION
// ============================================
const getProgression = (statut) => {
    const map = {
        'Brouillon': 0,
        'EnCoursCreation': 0,
        'Soumise': 20,
        'EnAnalyse': 20,
        'Entretien': 20,
        'Acceptee': 100,
        'Acceptée': 100,
        'EngagementEnvoye': 40,
        'EngagementRecu': 60,
        'EngagementValide': 80,
        'EngagementRejete': 60,
        'DemandeEnvoyee': 100,
        'ValideParDirecteur': 100,
        'Cloturee': 100,
        'Clôturée': 100,
        'Termine': 100,
        'Terminé': 100,
        'EnCours': 100,
        'En cours': 100,
        'Refusee': 0,
        'Refusée': 0,
    };
    return map[statut] || 0;
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const StudentStagesList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stages, setStages] = useState([]);

    useEffect(() => {
        fetchStages();
    }, []);

    const fetchStages = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/internships/student');
            const data = response.data?.data || [];
            
            console.log('[StudentStagesList] Stages reçus:', data.length);
            
            const stages100 = data.filter(stage => {
                const statut = stage.statut || stage.candidature?.statut;
                const progression = getProgression(statut);
                return progression === 100;
            });
            
            console.log('[StudentStagesList] Stages à 100%:', stages100.length);
            setStages(stages100);
            
        } catch (error) {
            console.error('[StudentStagesList] Erreur:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement des stages');
            setStages([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <PageContainer maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress size={44} thickness={4} sx={{ color: '#148aa0' }} />
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="xl">
            <PageHeader>
                <Box>
                    <PageTitle>Mes stages</PageTitle>
                    <PageSubtitle>
                        {stages.length === 0
                            ? 'Vous n\'avez pas encore de stage finalisé'
                            : `${stages.length} stage${stages.length > 1 ? 's' : ''} finalisé${stages.length > 1 ? 's' : ''}`
                        }
                    </PageSubtitle>
                </Box>
            </PageHeader>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3, borderRadius: '10px' }}
                    onClose={() => setError('')}
                >
                    {error}
                </Alert>
            )}

            {stages.length === 0 ? (
                <Paper
                    sx={{
                        borderRadius: '16px',
                        border: '1px solid #eef1f3',
                        boxShadow: 'none',
                        backgroundColor: '#fafbfc',
                    }}
                >
                    <EmptyState>
                        <WorkOutline />
                        <EmptyTitle>Aucun stage finalisé</EmptyTitle>
                        <EmptyText>
                            Les stages que vous aurez finalisés apparaîtront ici.
                        </EmptyText>
                        <EmptyButton onClick={() => navigate('/offres')}>
                            Consulter les offres
                        </EmptyButton>
                    </EmptyState>
                </Paper>
            ) : (
                <Grid container spacing={4}>
                    {stages.map((stage) => (
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4} key={stage._id}>
                            <StyledCard
                                onClick={() => navigate(`/dashboard/stage/${stage._id}`)}
                            >
                                <StyledCardContent>
                                    {/* ✅ Titre très grand et lisible */}
                                    <CardTitle variant="h4" title={stage.sujetTitre || stage.offreId?.titre || 'Stage'}>
                                        {stage.sujetTitre || stage.offreId?.titre || 'Stage'}
                                    </CardTitle>

                                    {/* ✅ Période */}
                                    <InfoBlock>
                                        <InfoLabel>Période</InfoLabel>
                                        <InfoText>
                                            {formatDate(stage.dateDebut)}
                                        </InfoText>
                                        <DividerLine />
                                        <InfoText>
                                            {formatDate(stage.dateFin)}
                                        </InfoText>
                                    </InfoBlock>

                                    {/* ✅ Encadrant */}
                                    {stage.encadrantId && (
                                        <InfoBlock>
                                            <InfoLabel>Encadrant</InfoLabel>
                                            <InfoText>
                                                {stage.encadrantId?.prenom || ''} {stage.encadrantId?.nom || ''}
                                            </InfoText>
                                        </InfoBlock>
                                    )}

                                    {/* ✅ Département */}
                                    {stage.offreId?.departementId?.nom && (
                                        <InfoBlock>
                                            <InfoLabel>Département</InfoLabel>
                                            <InfoText>
                                                {stage.offreId.departementId.nom}
                                            </InfoText>
                                        </InfoBlock>
                                    )}

                                    {/* ✅ Footer avec flèche */}
                                    <CardFooter>
                                        <Tooltip title="Voir le détail">
                                            <ArrowButton
                                                size="medium"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/dashboard/stage/${stage._id}`);
                                                }}
                                            >
                                                <ArrowForward sx={{ fontSize: '28px' }} />
                                            </ArrowButton>
                                        </Tooltip>
                                    </CardFooter>
                                </StyledCardContent>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </PageContainer>
    );
};

export default StudentStagesList;
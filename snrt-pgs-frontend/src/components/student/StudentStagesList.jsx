// src/components/student/StudentStagesList.jsx
// ✅ LOGIQUE : Un stage s'affiche seulement si candidature = Acceptée ET internship existe
// ✅ Suppression du statut "En cours" etc. car l'affichage signifie déjà 100%

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
    Chip,
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
    CheckCircleOutline,
    DescriptionOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { getStudentInternships } from '../../services/api';

// ============================================
// STYLES SNRT - OPTIMISÉS
// ============================================

const PageContainer = styled(Container)({
    paddingTop: '32px',
    paddingBottom: '48px',
    maxWidth: '1200px !important',
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
    fontSize: '28px',
    color: '#1a2332',
    letterSpacing: '-0.01em',
});

const PageSubtitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontSize: '15px',
    color: '#687480',
    marginTop: '4px',
});

// ✅ CARTE - Sans statut car l'affichage signifie déjà 100%
const StyledCard = styled(Card)({
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'all 0.25s ease',
    border: '1px solid #eef1f3',
    borderLeft: '5px solid #22c55e', // Vert pour indiquer "validé"
    cursor: 'pointer',
    height: '100%',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
        boxShadow: '0 8px 32px rgba(0,0,0,0.07)',
        transform: 'translateY(-3px)',
        borderColor: '#d0d5da',
    },
});

const StyledCardContent = styled(CardContent)({
    padding: '24px 28px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    '&:last-child': {
        paddingBottom: '24px',
    },
});

const CardHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '14px',
    minHeight: '32px',
});

const CardTitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontWeight: 600,
    fontSize: '17px',
    color: '#1a2332',
    lineHeight: 1.3,
    flex: 1,
    minWidth: 0,
    wordBreak: 'break-word',
});

// ✅ BADGE "Validé" pour indiquer 100%
const ValidatedChip = styled(Chip)({
    backgroundColor: '#d1fae5',
    color: '#065f46',
    fontWeight: 600,
    fontSize: '12px',
    height: '26px',
    borderRadius: '6px',
    flexShrink: 0,
    '& .MuiChip-label': {
        padding: '0 14px',
        whiteSpace: 'nowrap',
    },
});

const InfoRow = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '3px 0',
    '& .MuiSvgIcon-root': {
        color: '#9aa4ac',
        fontSize: '18px',
        flexShrink: 0,
    },
});

const InfoText = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: 1.4,
});

const InfoLabel = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontSize: '11px',
    color: '#9aa4ac',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    lineHeight: 1.3,
});

const CardFooter = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid #f0f2f5',
});

const TagsContainer = styled(Box)({
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
});

const TagChip = styled(Chip)({
    fontSize: '11px',
    height: '22px',
    borderRadius: '4px',
    '& .MuiChip-label': {
        padding: '0 10px',
    },
});

const ArrowButton = styled(IconButton)({
    color: '#148aa0',
    padding: '4px',
    flexShrink: 0,
    '&:hover': {
        backgroundColor: 'rgba(20, 138, 160, 0.08)',
    },
});

const EmptyState = styled(Box)({
    textAlign: 'center',
    padding: '80px 20px',
    '& .MuiSvgIcon-root': {
        fontSize: '56px',
        color: '#d1d5db',
        marginBottom: '16px',
    },
});

const EmptyTitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontWeight: 600,
    fontSize: '20px',
    color: '#1a2332',
    marginBottom: '8px',
});

const EmptyText = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontSize: '15px',
    color: '#9aa4ac',
});

const EmptyButton = styled('button')({
    borderRadius: '8px',
    textTransform: 'none',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 500,
    fontSize: '14px',
    padding: '10px 32px',
    marginTop: '20px',
    backgroundColor: '#148aa0',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: '#0b7890',
    },
});

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
            const data = await getStudentInternships();
            setStages(data);
        } catch (error) {
            console.error('❌ Erreur chargement stages:', error);
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
            <PageContainer maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress size={40} thickness={4} sx={{ color: '#148aa0' }} />
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="lg">
            <PageHeader>
                <Box>
                    <PageTitle>Mes stages</PageTitle>
                    <PageSubtitle>
                        {stages.length === 0
                            ? 'Vous n\'avez pas encore de stage validé'
                            : `${stages.length} stage${stages.length > 1 ? 's' : ''} validé${stages.length > 1 ? 's' : ''}`
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
                        <EmptyTitle>Aucun stage validé</EmptyTitle>
                        <EmptyText>
                            Les stages que vous aurez validés à 100% apparaîtront ici.
                        </EmptyText>
                        <EmptyButton onClick={() => navigate('/offres')}>
                            Consulter les offres
                        </EmptyButton>
                    </EmptyState>
                </Paper>
            ) : (
                <Grid container spacing={4}>
                    {stages.map((stage) => {
                        const hasLivrables = stage.livrables && stage.livrables.length > 0;
                        const conventionSigned = stage.convention?.status === 'SigneeRH' || stage.convention?.status === 'EnvoyeeEtudiant';

                        return (
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} key={stage._id}>
                                <StyledCard
                                    onClick={() => navigate(`/dashboard/stage/${stage._id}`)}
                                >
                                    <StyledCardContent>
                                        {/* HEADER : Titre + Badge "Validé" */}
                                        <CardHeader>
                                            <CardTitle variant="h6">
                                                {stage.sujetTitre || stage.offreId?.titre || 'Stage'}
                                            </CardTitle>
                                            <ValidatedChip
                                                icon={<CheckCircleOutline sx={{ fontSize: 16 }} />}
                                                label="Validé"
                                                size="small"
                                            />
                                        </CardHeader>

                                        {/* INFORMATIONS */}
                                        <Box sx={{ mb: 2, flex: 1 }}>
                                            <InfoRow>
                                                <CalendarToday />
                                                <Box>
                                                    <InfoLabel>Période</InfoLabel>
                                                    <InfoText>
                                                        {formatDate(stage.dateDebut)} — {formatDate(stage.dateFin)}
                                                    </InfoText>
                                                </Box>
                                            </InfoRow>

                                            {stage.encadrantId && (
                                                <InfoRow>
                                                    <PersonOutline />
                                                    <Box>
                                                        <InfoLabel>Encadrant</InfoLabel>
                                                        <InfoText>
                                                            {stage.encadrantId?.prenom || ''} {stage.encadrantId?.nom || ''}
                                                        </InfoText>
                                                    </Box>
                                                </InfoRow>
                                            )}

                                            {stage.offreId?.departementId?.nom && (
                                                <InfoRow>
                                                    <SchoolOutlined />
                                                    <Box>
                                                        <InfoLabel>Département</InfoLabel>
                                                        <InfoText>
                                                            {stage.offreId.departementId.nom}
                                                        </InfoText>
                                                    </Box>
                                                </InfoRow>
                                            )}
                                        </Box>

                                        {/* FOOTER : Tags + Flèche */}
                                        <CardFooter>
                                            <TagsContainer>
                                                {hasLivrables && (
                                                    <TagChip
                                                        icon={<DescriptionOutlined sx={{ fontSize: 14 }} />}
                                                        label={`${stage.livrables.length} livrable${stage.livrables.length > 1 ? 's' : ''}`}
                                                        sx={{
                                                            backgroundColor: '#f3e8ff',
                                                            color: '#6b21a8',
                                                        }}
                                                    />
                                                )}
                                                {conventionSigned && (
                                                    <TagChip
                                                        label="Convention signée"
                                                        sx={{
                                                            backgroundColor: '#d1fae5',
                                                            color: '#065f46',
                                                        }}
                                                    />
                                                )}
                                            </TagsContainer>

                                            <Tooltip title="Accéder au suivi">
                                                <ArrowButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/dashboard/stage/${stage._id}`);
                                                    }}
                                                >
                                                    <ArrowForward sx={{ fontSize: '20px' }} />
                                                </ArrowButton>
                                            </Tooltip>
                                        </CardFooter>
                                    </StyledCardContent>
                                </StyledCard>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </PageContainer>
    );
};

export default StudentStagesList;
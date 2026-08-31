// src/components/student/StudentStagesList.jsx
// ✅ VERSION LISTE HORIZONTALE COMPACTE - SANS STATUT

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Chip,
    Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    CalendarToday,
    BusinessOutlined,
    ArrowForward,
    WorkOutline,
    PersonOutline,
} from '@mui/icons-material';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const PageContainer = styled(Container)({
    paddingTop: '32px',
    paddingBottom: '48px',
    maxWidth: '1100px !important',
});

const PageHeader = styled(Box)({
    marginBottom: '28px',
});

const PageTitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontWeight: 700,
    fontSize: '28px',
    color: '#0f172a',
    letterSpacing: '-0.04em',
});

const PageSubtitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontSize: '15px',
    color: '#64748b',
    marginTop: '4px',
});

// ✅ STAGE ROW - Une ligne horizontale compacte
const StageRow = styled(Paper)({
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    gap: '24px',
    flexWrap: 'wrap',
    marginBottom: '10px',
    '&:hover': {
        borderColor: '#94a3b8',
        backgroundColor: '#f8fafc',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
});

const StageInfo = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 280px',
    minWidth: '200px',
});

const StageTitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontWeight: 600,
    fontSize: '16px',
    color: '#0f172a',
    lineHeight: 1.3,
});

const StageDepartment = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontSize: '13px',
    color: '#64748b',
});

// ✅ Métadonnées - alignées horizontalement
const MetaGroup = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    flex: '1 1 auto',
});

const MetaItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#475569',
    fontSize: '13px',
    fontFamily: '"Inter", sans-serif',
    whiteSpace: 'nowrap',
    '& .MuiSvgIcon-root': {
        fontSize: '16px',
        color: '#94a3b8',
    },
});

// ✅ TYPE BADGE - Affiche le type de stage (PFA, PFE, etc.)
const TypeBadge = styled(Chip)(({ type }) => {
    const palette = {
        'PFE': { bg: '#dbeafe', text: '#1d4ed8' },
        'PFA': { bg: '#dcfce7', text: '#166534' },
        'Initiation': { bg: '#fef3c7', text: '#d97706' },
        'Ete': { bg: '#fce7f3', text: '#be185d' },
        'Master': { bg: '#ede9fe', text: '#6d28d9' },
        'Licence': { bg: '#cffafe', text: '#0e7490' },
        'Technicien': { bg: '#f1f5f9', text: '#475569' },
        default: { bg: '#f1f5f9', text: '#475569' },
    };

    const selected = palette[type] || palette.default;
    return {
        backgroundColor: selected.bg,
        color: selected.text,
        fontWeight: 600,
        fontSize: '11px',
        height: '26px',
        borderRadius: '999px',
        flexShrink: 0,
        '& .MuiChip-label': {
            padding: '0 12px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
        },
    };
});

const DetailButton = styled(Button)({
    color: '#0f766e',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '13px',
    minWidth: 'unset',
    padding: '4px 8px',
    flexShrink: 0,
    '&:hover': {
        backgroundColor: 'transparent',
        color: '#0d9488',
    },
});

const EmptyState = styled(Box)({
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
});

const EmptyTitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontWeight: 600,
    fontSize: '20px',
    color: '#0f172a',
    marginBottom: '6px',
});

const EmptyText = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontSize: '15px',
    color: '#64748b',
    marginBottom: '18px',
});

// ============================================
// HELPERS
// ============================================

const getProgression = (statut) => {
    const map = {
        Brouillon: 0,
        EnCoursCreation: 0,
        Soumise: 20,
        EnAnalyse: 20,
        Entretien: 20,
        Acceptee: 100,
        Acceptée: 100,
        EngagementEnvoye: 40,
        EngagementRecu: 60,
        EngagementValide: 80,
        EngagementRejete: 60,
        DemandeEnvoyee: 100,
        ValideParDirecteur: 100,
        Cloturee: 100,
        'Clôturée': 100,
        Termine: 100,
        'Terminé': 100,
        EnCours: 100,
        'En cours': 100,
        Refusee: 0,
        'Refusée': 0,
    };
    return map[statut] || 0;
};

// ✅ getStatusLabel - SUPPRIMÉ car plus utilisé

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const StudentStagesList = () => {
    const navigate = useNavigate();
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
            // ✅ Filtrer uniquement les stages finalisés (progression 100%)
            const stages100 = data.filter((stage) => {
                const statut = stage.statut || stage.candidature?.statut;
                return getProgression(statut) === 100;
            });
            setStages(stages100);
        } catch (error) {
            console.error('[StudentStagesList] Erreur:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement des stages');
            setStages([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageContainer maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                    <CircularProgress size={36} sx={{ color: '#0f766e' }} />
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="lg">
            <PageHeader>
                <PageTitle>Mes stages</PageTitle>
                <PageSubtitle>
                    {stages.length === 0
                        ? 'Aucun stage finalisé pour le moment.'
                        : `${stages.length} stage${stages.length > 1 ? 's' : ''} finalisé${stages.length > 1 ? 's' : ''}`}
                </PageSubtitle>
            </PageHeader>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {stages.length === 0 ? (
                <EmptyState>
                    <Box sx={{ fontSize: '40px', mb: 1 }}>📋</Box>
                    <EmptyTitle>Aucun stage finalisé</EmptyTitle>
                    <EmptyText>Les stages validés et finalisés apparaîtront ici.</EmptyText>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/offres')}
                        sx={{
                            backgroundColor: '#0f766e',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4,
                            py: 1,
                            '&:hover': { backgroundColor: '#115e59' },
                        }}
                    >
                        Voir les offres
                    </Button>
                </EmptyState>
            ) : (
                <Box>
                    {stages.map((stage) => {
                        const title = stage.sujetTitre || stage.offreId?.titre || 'Stage';
                        const typeStage = stage.offreId?.typeStage || 'Stage';
                        const deptName = stage.offreId?.departementId?.nom || '';
                        const encadrantName = stage.encadrantId
                            ? `${stage.encadrantId.prenom || ''} ${stage.encadrantId.nom || ''}`.trim()
                            : '';

                        return (
                            <StageRow
                                key={stage._id}
                                onClick={() => navigate(`/dashboard/stage/${stage._id}`)}
                            >
                                {/* === INFOS STAGE === */}
                                <StageInfo>
                                    <StageTitle>{title}</StageTitle>
                                    {deptName && (
                                        <StageDepartment>{deptName}</StageDepartment>
                                    )}
                                </StageInfo>

                                {/* === MÉTADONNÉES === */}
                                <MetaGroup>
                                    {/* Période */}
                                    <MetaItem>
                                        <CalendarToday />
                                        {formatDate(stage.dateDebut)} → {formatDate(stage.dateFin)}
                                    </MetaItem>

                                    {/* ✅ TYPE DE STAGE (PFA, PFE, etc.) - A la place du statut */}
                                    <TypeBadge label={typeStage} type={typeStage} />

                                    {/* Encadrant */}
                                    {encadrantName && (
                                        <MetaItem>
                                            <PersonOutline />
                                            {encadrantName}
                                        </MetaItem>
                                    )}
                                </MetaGroup>

                                {/* === ACTION UNIQUEMENT === */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                    <DetailButton
                                        endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/dashboard/stage/${stage._id}`);
                                        }}
                                    >
                                        Détail
                                    </DetailButton>
                                </Box>
                            </StageRow>
                        );
                    })}
                </Box>
            )}
        </PageContainer>
    );
};

export default StudentStagesList;
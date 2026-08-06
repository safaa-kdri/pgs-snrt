// src/components/department/Dashboard.jsx
// ✅ VERSION 100% API - SANS DONNÉES MOCKÉES

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Card,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    LinearProgress,
    Divider,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    Assignment,
    Pending,
    Work,
    Event,
    CheckCircle,
    People,
    School,
    RateReview,
    ChevronRight,
    TrendingUp,
    Visibility,
    Description,
    CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================
// STYLES - DESIGN ÉPURÉ ET PROFESSIONNEL
// ============================================

const PageContainer = styled(Container)({
    paddingTop: '32px',
    paddingBottom: '32px',
});

const HeaderSection = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
});

const HeaderLeft = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
});

const Greeting = styled(Typography)({
    fontWeight: 700,
    fontSize: '28px',
    color: '#1a2332',
    letterSpacing: '-0.02em',
});

const GreetingSub = styled(Typography)({
    color: '#687480',
    fontSize: '15px',
});

const GreetingDate = styled(Typography)({
    color: '#9aa4ac',
    fontSize: '13px',
    marginTop: '2px',
});

const StatCard = styled(Card)(({ color }) => ({
    borderRadius: '12px',
    padding: '20px 24px',
    height: '100%',
    background: '#ffffff',
    boxShadow: 'none',
    border: '1px solid #eef1f3',
    transition: 'all 0.25s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        transform: 'translateY(-3px)',
        borderColor: color || '#2d3748',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        backgroundColor: color || '#2d3748',
        borderRadius: '12px 0 0 12px',
    },
}));

const StatIconWrapper = styled(Box)(({ color }) => ({
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: alpha(color || '#2d3748', 0.08),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color || '#2d3748',
    flexShrink: 0,
}));

const StatValue = styled(Typography)({
    fontWeight: 700,
    fontSize: '28px',
    color: '#1a2332',
    letterSpacing: '-0.02em',
});

const StatLabel = styled(Typography)({
    color: '#687480',
    fontSize: '14px',
    fontWeight: 500,
});

const StatSub = styled(Typography)({
    color: '#9aa4ac',
    fontSize: '12px',
    marginTop: '4px',
});

const SectionTitle = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a2332',
    marginBottom: '16px',
});

const ActivityCard = styled(Paper)({
    borderRadius: '12px',
    border: '1px solid #eef1f3',
    boxShadow: 'none',
    padding: '24px',
    height: '100%',
    transition: 'all 0.2s ease',
    '&:hover': {
        boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
    },
});

const ActivityItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid #f0f2f5',
    '&:last-child': {
        borderBottom: 'none',
    },
});

const ActivityIcon = styled(Avatar)(({ color }) => ({
    width: 32,
    height: 32,
    backgroundColor: alpha(color || '#2d3748', 0.08),
    color: color || '#2d3748',
    fontSize: 14,
}));

const StyledTableCell = styled(TableCell)({
    fontWeight: 600,
    color: '#1a2332',
    fontSize: '13px',
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #e5e7eb',
});

const StyledTableRow = styled(TableRow)({
    height: '68px',
    '&:hover': {
        backgroundColor: '#f9fcfd',
    },
});

const StyledAvatar = styled(Avatar)({
    width: 32,
    height: 32,
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid #edf0f2',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'Soumise': { bg: '#dbeafe', text: '#1d4ed8' },
        'EnAnalyse': { bg: '#fef3c7', text: '#d97706' },
        'Entretien': { bg: '#f3e8ff', text: '#6b21a8' },
        'Acceptee': { bg: '#d1fae5', text: '#065f46' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
        'EnCours': { bg: '#dbeafe', text: '#1d4ed8' },
        'Termine': { bg: '#d1fae5', text: '#065f46' },
    };
    const color = colors[status] || colors['Soumise'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
    };
});

const ProgressCard = styled(Paper)({
    borderRadius: '12px',
    border: '1px solid #eef1f3',
    boxShadow: 'none',
    padding: '28px 24px',
    marginBottom: '32px',
});

const TeamItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 0',
    borderBottom: '1px solid #f0f2f5',
    '&:last-child': {
        borderBottom: 'none',
    },
});

const TeamIcon = styled(Avatar)(({ color }) => ({
    width: 40,
    height: 40,
    backgroundColor: alpha(color || '#2d3748', 0.08),
    color: color || '#2d3748',
}));

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const DepartmentDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        candidatures: {
            total: 0,
            enAttente: 0,
            acceptees: 0,
            refusees: 0,
        },
        stages: {
            total: 0,
            enCours: 0,
            termines: 0,
        },
        entretiensAVenir: 0,
        encadrants: 0,
        recentActivities: [],
        applicationsList: [],
        progression: { traitees: 0, total: 0 },
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard/department');
            const data = response.data?.data || response.data || {};

            // Calcul des candidatures traitées
            const total = data.candidatures?.total || 0;
            const traitees = (data.candidatures?.acceptees || 0) + (data.candidatures?.refusees || 0);

            setStats({
                candidatures: {
                    total: data.candidatures?.total || 0,
                    enAttente: data.candidatures?.enAttente || 0,
                    acceptees: data.candidatures?.acceptees || 0,
                    refusees: data.candidatures?.refusees || 0,
                },
                stages: {
                    total: data.stages?.total || 0,
                    enCours: data.stages?.enCours || 0,
                    termines: data.stages?.termines || 0,
                },
                entretiensAVenir: data.entretiensAVenir || 0,
                encadrants: data.encadrants || 0,
                recentActivities: data.recentActivities || [],
                applicationsList: data.applicationsList || [],
                progression: { traitees, total },
            });
        } catch (err) {
            console.error('Erreur chargement dashboard Département:', err);
            setError(err.response?.data?.message || 'Erreur de chargement des données');
            // ⚠️ AUCUNE DONNÉE MOCKÉE - On garde les valeurs par défaut à 0
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // UTILITAIRES
    // ============================================

    const getStatusLabel = (status) => {
        const labels = {
            'Soumise': 'Soumise',
            'EnAnalyse': 'En analyse',
            'Entretien': 'Entretien',
            'Acceptee': 'Acceptée',
            'Refusee': 'Refusée',
            'EnCours': 'En cours',
            'Termine': 'Terminé',
        };
        return labels[status] || status;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'Soumise': '#1d4ed8',
            'EnAnalyse': '#d97706',
            'Entretien': '#6b21a8',
            'Acceptee': '#065f46',
            'Refusee': '#991b1b',
            'EnCours': '#1d4ed8',
            'Termine': '#065f46',
        };
        return colors[status] || '#6b7280';
    };

    const getActivityIcon = (type) => {
        const icons = {
            'accept': <CheckCircle sx={{ fontSize: 16 }} />,
            'new': <Assignment sx={{ fontSize: 16 }} />,
            'interview': <Event sx={{ fontSize: 16 }} />,
            'start': <Work sx={{ fontSize: 16 }} />,
            'report': <Description sx={{ fontSize: 16 }} />,
        };
        return icons[type] || <Assignment sx={{ fontSize: 16 }} />;
    };

    const getActivityColor = (type) => {
        const colors = {
            'accept': '#22c55e',
            'new': '#f59e0b',
            'interview': '#8b5cf6',
            'start': '#148aa0',
            'report': '#1d4ed8',
        };
        return colors[type] || '#2d3748';
    };

    // ✅ 3 CARTES UNIQUEMENT - Données 100% API
    const statCards = [
        {
            label: 'Candidatures à analyser',
            value: stats.candidatures.enAttente || 0,
            sub: `Sur ${stats.candidatures.total || 0} reçues`,
            icon: <Pending sx={{ fontSize: 20 }} />,
            color: '#f59e0b',
            path: '/department/candidatures?statut=Soumise',
        },
        {
            label: 'Stages en cours',
            value: stats.stages.enCours || 0,
            sub: `${stats.stages.total || 0} stages au total`,
            icon: <Work sx={{ fontSize: 20 }} />,
            color: '#148aa0',
            path: '/department/interns',
        },
        {
            label: 'Entretiens à planifier',
            value: stats.entretiensAVenir || 0,
            sub: 'À organiser',
            icon: <Event sx={{ fontSize: 20 }} />,
            color: '#8b5cf6',
            path: '/department/interviews',
        },
    ];

    // Calcul du pourcentage de progression
    const progressPercent = stats.progression.total > 0
        ? Math.round((stats.progression.traitees / stats.progression.total) * 100)
        : 0;

    // ============================================
    // RENDU
    // ============================================

    if (loading) {
        return (
            <PageContainer maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={44} sx={{ color: '#2d3748' }} />
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="xl">
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                    {error}
                </Alert>
            )}

            {/* ===== EN-TÊTE ===== */}
            <HeaderSection>
                <HeaderLeft>
                    <Greeting>
                        Bonjour {user?.prenom || 'Chef de Département'}
                    </Greeting>
                    <GreetingSub>
                        {user?.departementId?.nom || 'Votre département'} • Gérez les candidatures et suivez vos stagiaires
                    </GreetingSub>
                    <GreetingDate>
                        {new Date().toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </GreetingDate>
                </HeaderLeft>
            </HeaderSection>

            {/* ===== 3 CARTES STATS ===== */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statCards.map((stat, idx) => (
                    <Grid item xs={12} sm={6} lg={4} key={idx}>
                        <StatCard color={stat.color} onClick={() => navigate(stat.path)}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <StatValue>{stat.value}</StatValue>
                                    <StatLabel>{stat.label}</StatLabel>
                                    <StatSub>{stat.sub}</StatSub>
                                </Box>
                                <StatIconWrapper color={stat.color}>
                                    {stat.icon}
                                </StatIconWrapper>
                            </Box>
                        </StatCard>
                    </Grid>
                ))}
            </Grid>

            {/* ===== BARRE DE PROGRESSION ===== */}
            {stats.progression.total > 0 && (
                <ProgressCard>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <TrendingUp sx={{ fontSize: 20, color: '#148aa0' }} />
                            <Typography variant="subtitle2" fontWeight={600} color="#1a2332">
                                Progression du traitement des candidatures
                            </Typography>
                        </Box>
                        <Chip
                            label={`${progressPercent}% traité`}
                            size="small"
                            sx={{
                                backgroundColor: alpha('#148aa0', 0.08),
                                color: '#148aa0',
                                fontWeight: 600,
                                fontSize: '12px',
                                height: '24px',
                            }}
                        />
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#eef1f3',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: '#148aa0',
                                borderRadius: 5,
                            },
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            {stats.progression.traitees} / {stats.progression.total} candidatures traitées
                        </Typography>
                    </Box>
                </ProgressCard>
            )}

            {/* ===== TABLEAU DES CANDIDATURES ===== */}
            {stats.applicationsList.length > 0 && (
                <Paper
                    sx={{
                        borderRadius: '12px',
                        border: '1px solid #eef1f3',
                        boxShadow: 'none',
                        overflow: 'hidden',
                        mb: 4,
                    }}
                >
                    <Box sx={{ px: 3, pt: 2.5, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={600} color="#1a2332">
                            Candidatures récentes
                        </Typography>
                        <Button
                            size="small"
                            endIcon={<ChevronRight fontSize="small" />}
                            onClick={() => navigate('/department/candidatures')}
                            sx={{
                                textTransform: 'none',
                                color: '#687480',
                                fontSize: '13px',
                                fontWeight: 500,
                                '&:hover': {
                                    color: '#1a2332',
                                },
                            }}
                        >
                            Voir toutes
                        </Button>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>Étudiant</StyledTableCell>
                                    <StyledTableCell>Offre postulée</StyledTableCell>
                                    <StyledTableCell>Date</StyledTableCell>
                                    <StyledTableCell>Statut</StyledTableCell>
                                    <StyledTableCell align="center">Action</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.applicationsList.slice(0, 5).map((app) => {
                                    const statusColor = getStatusColor(app.statut);
                                    return (
                                        <StyledTableRow key={app._id || app.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <StyledAvatar
                                                        sx={{
                                                            bgcolor: alpha(statusColor, 0.12),
                                                            color: statusColor,
                                                        }}
                                                    >
                                                        {app.candidat?.nom?.[0] || app.candidat?.prenom?.[0] || '?'}
                                                    </StyledAvatar>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {`${app.candidat?.prenom || ''} ${app.candidat?.nom || ''}`.trim() || 'Candidat'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {app.offre?.titre || 'Offre sans titre'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(app.date || app.createdAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip
                                                    label={getStatusLabel(app.statut)}
                                                    status={app.statut}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    startIcon={<Visibility sx={{ fontSize: 16 }} />}
                                                    onClick={() => navigate(`/department/candidature/${app._id || app.id}`)}
                                                    sx={{
                                                        textTransform: 'none',
                                                        color: '#687480',
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        '&:hover': {
                                                            color: '#1a2332',
                                                            backgroundColor: 'transparent',
                                                        },
                                                    }}
                                                >
                                                    Consulter
                                                </Button>
                                            </TableCell>
                                        </StyledTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ px: 3, py: 1.5, borderTop: '1px solid #f0f2f5' }}>
                        <Typography variant="caption" color="text.secondary">
                            {stats.applicationsList.length > 5 
                                ? '5 dernières candidatures affichées' 
                                : `${stats.applicationsList.length} candidature${stats.applicationsList.length > 1 ? 's' : ''} affichée${stats.applicationsList.length > 1 ? 's' : ''}`
                            }
                        </Typography>
                    </Box>
                </Paper>
            )}

            {/* ===== DEUX CARTES EN BAS ===== */}
            <Grid container spacing={3}>
                {/* Dernières actions */}
                <Grid item xs={12} md={6}>
                    <ActivityCard>
                        <SectionTitle>
                            <Assignment sx={{ fontSize: 20, color: '#2d3748' }} />
                            Dernières actions
                        </SectionTitle>
                        {stats.recentActivities.length > 0 ? (
                            <Box>
                                {stats.recentActivities.slice(0, 5).map((activity) => {
                                    const iconColor = getActivityColor(activity.type || activity.icon);
                                    return (
                                        <ActivityItem key={activity._id || activity.id}>
                                            <ActivityIcon color={iconColor}>
                                                {getActivityIcon(activity.type || activity.icon)}
                                            </ActivityIcon>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight={500} color="#1a2332">
                                                    {activity.title || activity.action}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="#687480">
                                                    {activity.description || activity.message}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CalendarToday sx={{ fontSize: 12, color: '#9aa4ac' }} />
                                                <Typography variant="caption" color="#9aa4ac">
                                                    {activity.date || formatDate(activity.createdAt)}
                                                </Typography>
                                            </Box>
                                        </ActivityItem>
                                    );
                                })}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 3 }}>
                                Aucune activité récente
                            </Typography>
                        )}
                    </ActivityCard>
                </Grid>

                {/* Équipe du département */}
                <Grid item xs={12} md={6}>
                    <ActivityCard>
                        <SectionTitle>
                            <People sx={{ fontSize: 20, color: '#2d3748' }} />
                            Équipe du département
                        </SectionTitle>

                        <TeamItem>
                            <TeamIcon color="#148aa0">
                                <People />
                            </TeamIcon>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={600} color="#1a2332">
                                    {stats.encadrants || 0} Encadrant(s)
                                </Typography>
                                <Typography variant="caption" color="#687480">
                                    Disponibles pour encadrer des stagiaires
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={() => navigate('/department/encadrants')}
                                sx={{ color: '#9aa4ac' }}
                            >
                                <ChevronRight />
                            </IconButton>
                        </TeamItem>

                        <TeamItem>
                            <TeamIcon color="#f59e0b">
                                <School />
                            </TeamIcon>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={600} color="#1a2332">
                                    {stats.stages.enCours || 0} Stagiaire(s) actif(s)
                                </Typography>
                                <Typography variant="caption" color="#687480">
                                    {stats.stages.termines || 0} stages terminés
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={() => navigate('/department/interns')}
                                sx={{ color: '#9aa4ac' }}
                            >
                                <ChevronRight />
                            </IconButton>
                        </TeamItem>

                        <TeamItem>
                            <TeamIcon color="#8b5cf6">
                                <RateReview />
                            </TeamIcon>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={600} color="#1a2332">
                                    {stats.entretiensAVenir || 0} Entretien(s) à venir
                                </Typography>
                                <Typography variant="caption" color="#687480">
                                    À planifier avec les candidats
                                </Typography>
                            </Box>
                            <IconButton
                                size="small"
                                onClick={() => navigate('/department/interviews')}
                                sx={{ color: '#9aa4ac' }}
                            >
                                <ChevronRight />
                            </IconButton>
                        </TeamItem>
                    </ActivityCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default DepartmentDashboard;
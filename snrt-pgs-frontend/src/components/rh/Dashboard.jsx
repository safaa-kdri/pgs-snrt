// src/components/rh/Dashboard.jsx
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
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    Assignment,
    CheckCircle,
    Pending,
    Cancel,
    People,
    Work,
    CalendarToday,
    Refresh,
    Visibility,
    Description,
    Event,
    TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================
// STYLES
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

const SectionTitle = styled(Typography)({
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

const ActivityIcon = styled(Avatar)({
    width: 32,
    height: 32,
    backgroundColor: '#eaf5f7',
    color: '#2d3748',
    fontSize: 14,
});

const StyledTableCell = styled(TableCell)({
    fontWeight: 600,
    color: '#1a2332',
    fontSize: '13px',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'Soumise': { bg: '#dbeafe', text: '#1d4ed8' },
        'EnAnalyse': { bg: '#fef3c7', text: '#d97706' },
        'Entretien': { bg: '#f3e8ff', text: '#6b21a8' },
        'Acceptee': { bg: '#d1fae5', text: '#065f46' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
        'EngagementEnvoye': { bg: '#dbeafe', text: '#1d4ed8' },
        'EngagementValide': { bg: '#d1fae5', text: '#065f46' },
        'DemandeEnvoyee': { bg: '#fef3c7', text: '#d97706' },
        'ValideParDirecteur': { bg: '#d1fae5', text: '#065f46' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
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
    padding: '20px 24px',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const RhDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        offres: { total: 0, enAttente: 0, publiees: 0 },
        candidatures: { total: 0, enAttente: 0, acceptees: 0, refusees: 0 },
        stages: { total: 0, enCours: 0, termines: 0 },
        entretiens: 0,
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
            const response = await api.get('/dashboard/rh');
            const data = response.data?.data || response.data || {};
            
            const total = data.candidatures?.total || 0;
            const traitees = (data.candidatures?.acceptees || 0) + (data.candidatures?.refusees || 0);
            
            setStats({
                offres: data.offres || { total: 0, enAttente: 0, publiees: 0 },
                candidatures: data.candidatures || { total: 0, enAttente: 0, acceptees: 0, refusees: 0 },
                stages: data.stages || { total: 0, enCours: 0, termines: 0 },
                entretiens: data.entretiens || 0,
                recentActivities: data.recentActivities || [],
                applicationsList: data.applicationsList || [],
                progression: { traitees, total },
            });
        } catch (err) {
            console.error('Erreur chargement dashboard RH:', err);
            setError(err.response?.data?.message || 'Erreur de chargement');
            setStats({
                offres: { total: 24, enAttente: 5, publiees: 15 },
                candidatures: { total: 89, enAttente: 23, acceptees: 42, refusees: 24 },
                stages: { total: 32, enCours: 15, termines: 17 },
                entretiens: 8,
                recentActivities: [
                    { id: '1', title: 'Candidature acceptee', description: 'Youssef EL HASSANI', date: 'Il y a 2h' },
                    { id: '2', title: 'Offre validee', description: 'Stage CyberSecurite', date: 'Il y a 4h' },
                    { id: '3', title: 'Entretien planifie', description: 'Stage Communication', date: 'Il y a 1j' },
                    { id: '4', title: 'Convention generee', description: 'Sofia BENNANI', date: 'Il y a 2j' },
                ],
                applicationsList: [
                    { id: '1', candidat: 'Youssef EL HASSANI', offre: 'Stage Developpement Web', statut: 'EnAnalyse', date: new Date().toISOString() },
                    { id: '2', candidat: 'Fatima BENNANI', offre: 'Stage Data Science', statut: 'Entretien', date: new Date(Date.now() - 86400000).toISOString() },
                    { id: '3', candidat: 'Ahmed ALAMI', offre: 'Stage CyberSecurite', statut: 'Soumise', date: new Date(Date.now() - 172800000).toISOString() },
                    { id: '4', candidat: 'Sofia CHERKAOUI', offre: 'Stage DevOps', statut: 'Acceptee', date: new Date(Date.now() - 259200000).toISOString() },
                ],
                progression: { traitees: 66, total: 93 },
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'Brouillon': 'Brouillon',
            'Soumise': 'Soumise',
            'EnAnalyse': 'En analyse',
            'Entretien': 'Entretien',
            'Acceptee': 'Acceptee',
            'Refusee': 'Refusee',
            'EngagementEnvoye': 'Engagement envoye',
            'EngagementValide': 'Engagement valide',
            'DemandeEnvoyee': 'Demande envoyee',
            'ValideParDirecteur': 'Valide par Directeur',
            'Cloturee': 'Cloturee',
        };
        return labels[status] || status;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
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
            'Brouillon': '#6b7280',
        };
        return colors[status] || '#6b7280';
    };

    const getActivityIcon = (title) => {
        if (title.includes('acceptee')) return '✓';
        if (title.includes('validee')) return '📋';
        if (title.includes('planifie')) return '📅';
        if (title.includes('refus')) return '✗';
        if (title.includes('Convention')) return '📄';
        return '•';
    };

    // ✅ 3 CARTES UNIQUEMENT
    const statCards = [
        {
            label: 'Candidatures à traiter',
            value: stats.candidatures.enAttente || 0,
            sub: `Sur ${stats.candidatures.total || 0} total`,
            icon: <Pending sx={{ fontSize: 20 }} />,
            color: '#f59e0b',
            path: '/rh/applications?statut=Soumise',
        },
        {
            label: 'Offres à valider',
            value: stats.offres.enAttente || 0,
            sub: 'En attente',
            icon: <Work sx={{ fontSize: 20 }} />,
            color: '#8b5cf6',
            path: '/rh/validate-offers',
        },
        {
            label: 'Entretiens à venir',
            value: stats.entretiens || 0,
            sub: 'Planifies',
            icon: <Event sx={{ fontSize: 20 }} />,
            color: '#2d3748',
            path: '/rh/interviews',
        },
    ];

    if (loading) {
        return (
            <PageContainer maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={44} sx={{ color: '#2d3748' }} />
                </Box>
            </PageContainer>
        );
    }

    const progressPercent = stats.progression.total > 0 
        ? Math.round((stats.progression.traitees / stats.progression.total) * 100) 
        : 0;

    return (
        <PageContainer maxWidth="xl">
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                    {error}
                </Alert>
            )}

            {/* ===== EN-TETE AVEC SALUTATION ===== */}
            <HeaderSection>
                <HeaderLeft>
                    <Greeting>
                        Bonjour {user?.prenom || 'Safaa'}
                    </Greeting>
                    <GreetingSub>
                        Voici la situation des stages aujourd'hui.
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

            {/* ===== 3 STATS ===== */}
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
            <ProgressCard sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="#1a2332">
                        Traitement des candidatures
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#1a2332">
                        {stats.progression.traitees} / {stats.progression.total} traitees
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progressPercent}
                    sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: '#eef1f3',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: progressPercent > 70 ? '#22c55e' : progressPercent > 40 ? '#f59e0b' : '#ef4444',
                            borderRadius: 5,
                        },
                    }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                        {progressPercent}% complete
                    </Typography>
                </Box>
            </ProgressCard>

            {/* ===== DERNIERES CANDIDATURES ===== */}
            <Paper
                sx={{
                    borderRadius: '12px',
                    border: '1px solid #eef1f3',
                    boxShadow: 'none',
                    overflow: 'hidden',
                    mb: 3,
                }}
            >
                <Box sx={{ px: 3, pt: 2, pb: 1 }}>
                    <SectionTitle>Dernieres candidatures</SectionTitle>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                                <StyledTableCell>Etudiant</StyledTableCell>
                                <StyledTableCell>Offre</StyledTableCell>
                                <StyledTableCell>Date</StyledTableCell>
                                <StyledTableCell>Statut</StyledTableCell>
                                <StyledTableCell align="center">Action</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats.applicationsList.length > 0 ? (
                                stats.applicationsList.map((app) => {
                                    const statusColor = getStatusColor(app.statut);
                                    return (
                                        <TableRow key={app.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            bgcolor: alpha(statusColor, 0.12),
                                                            color: statusColor,
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {app.candidat?.split(' ').map((n) => n[0]).join('') || '?'}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {app.candidat || 'Candidat'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {app.offre || 'Offre sans titre'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(app.date)}
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
                                                <Tooltip title="Voir le detail">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/rh/application/${app.id}`)}
                                                        sx={{ color: '#2d3748' }}
                                                    >
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Aucune candidature recente
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        size="small"
                        endIcon={<TrendingUp fontSize="small" />}
                        onClick={() => navigate('/rh/applications')}
                        sx={{ textTransform: 'none', color: '#2d3748' }}
                    >
                        Voir toutes les candidatures
                    </Button>
                </Box>
            </Paper>

            {/* ===== ACTIVITES RECENTES ===== */}
            <ActivityCard>
                <SectionTitle>Activites recentes</SectionTitle>
                {stats.recentActivities.length > 0 ? (
                    <Box>
                        {stats.recentActivities.map((activity) => (
                            <ActivityItem key={activity.id}>
                                <ActivityIcon>
                                    {getActivityIcon(activity.title)}
                                </ActivityIcon>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight={500} color="#1a2332">
                                        {activity.title}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="#687480">
                                        {activity.description}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="#9aa4ac">
                                    {activity.date}
                                </Typography>
                            </ActivityItem>
                        ))}
                    </Box>
                ) : (
                    <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 3 }}>
                        Aucune activite recente
                    </Typography>
                )}
            </ActivityCard>

        </PageContainer>
    );
};

export default RhDashboard;
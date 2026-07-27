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
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Work,
    CheckCircle,
    Pending,
    TrendingUp,
    ArrowForward,
    People,
    Assignment,
    CalendarToday,
    Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ChartTooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

// ============================================
// STYLES
// ============================================

const StatCard = styled(Card)({
    borderRadius: '14px',
    padding: '22px 24px',
    height: '100%',
    background: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
    borderLeft: '4px solid #148aa0',
    transition: 'all 0.25s ease',
    '&:hover': {
        boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
        transform: 'translateY(-2px)',
    },
});

const StatIconWrapper = styled(Box)({
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#eaf5f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#148aa0',
    flexShrink: 0,
});

const SectionTitle = styled(Typography)({
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a2332',
    marginBottom: '16px',
    letterSpacing: '0.2px',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
});

const ChartCard = styled(Paper)({
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
    height: '100%',
    background: '#ffffff',
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
        chartData: { labels: [], datasets: [] },
        distribution: { labels: [], datasets: [] },
        recentActivities: [],
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard');
            const data = response.data;
            if (data.role === 'RH') {
                const d = data.dashboard || {};
                setStats({
                    offres: d.offres || { total: 0, enAttente: 0, publiees: 0 },
                    candidatures: d.candidatures || { total: 0, enAttente: 0, acceptees: 0, refusees: 0 },
                    stages: d.stages || { total: 0, enCours: 0, termines: 0 },
                    chartData: d.chartData || { labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], datasets: [{ data: [8, 12, 15, 10, 18, 22], backgroundColor: 'rgba(20,138,160,0.7)' }] },
                    distribution: d.distribution || { labels: ['En attente', 'Acceptées', 'Refusées'], datasets: [{ data: [23, 42, 24], backgroundColor: ['#f59e0b', '#22c55e', '#ef4444'] }] },
                    recentActivities: d.recentActivities || [],
                });
            }
        } catch (err) {
            console.error('Erreur chargement dashboard:', err);
            setError(err.response?.data?.message || 'Erreur de chargement');
            setStats({
                offres: { total: 45, enAttente: 7, publiees: 28 },
                candidatures: { total: 89, enAttente: 23, acceptees: 42, refusees: 24 },
                stages: { total: 32, enCours: 15, termines: 17 },
                chartData: { labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'], datasets: [{ data: [8, 12, 15, 10, 18, 22], backgroundColor: 'rgba(20,138,160,0.7)' }] },
                distribution: { labels: ['En attente', 'Acceptées', 'Refusées'], datasets: [{ data: [23, 42, 24], backgroundColor: ['#f59e0b', '#22c55e', '#ef4444'] }] },
                recentActivities: [
                    { id: 1, title: 'Offre validée', description: 'Stage en Cybersécurité — DSI', date: 'Il y a 2h' },
                    { id: 2, title: 'Candidature acceptée', description: 'Ahmed Benjelloun — Stage Développement', date: 'Il y a 4h' },
                    { id: 3, title: 'Entretien planifié', description: 'Stage Communication — 15/07/2026', date: 'Il y a 1j' },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Offres', value: stats.offres.total, sub: `${stats.offres.enAttente} en attente`, icon: <Assignment sx={{ fontSize: 22 }} /> },
        { label: 'Candidatures', value: stats.candidatures.total, sub: `${stats.candidatures.enAttente} en attente`, icon: <People sx={{ fontSize: 22 }} /> },
        { label: 'Stages en cours', value: stats.stages.enCours, sub: `${stats.stages.total} au total`, icon: <Work sx={{ fontSize: 22 }} /> },
        { label: 'Taux acceptation', value: `${Math.round((stats.candidatures.acceptees / (stats.candidatures.total || 1)) * 100)}%`, sub: `${stats.candidatures.acceptees} acceptées`, icon: <TrendingUp sx={{ fontSize: 22 }} /> },
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 11, family: '"Inter", sans-serif' } } },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f0f2f5' }, ticks: { font: { family: '"Inter", sans-serif', size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { family: '"Inter", sans-serif', size: 11 } } },
        },
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 11, family: '"Inter", sans-serif' } } },
        },
        cutout: '68%',
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={44} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 3 } }}>
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#148aa0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Ressources Humaines
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332', letterSpacing: '-0.02em', mt: 0.5 }}>
                        Tableau de bord
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#687480', mt: 0.5 }}>
                        Vue d'ensemble du recrutement
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchDashboardData}
                    sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        borderColor: '#e0e4e8',
                        color: '#20242b',
                        fontSize: '13px',
                        fontWeight: 500,
                        px: 3,
                        '&:hover': { borderColor: '#148aa0', backgroundColor: '#eaf5f7' },
                    }}
                >
                    Actualiser
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statCards.map((stat, idx) => (
                    <Grid item xs={12} sm={6} lg={3} key={idx}>
                        <StatCard>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a2332', fontSize: '28px' }}>{stat.value}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#687480' }}>{stat.label}</Typography>
                                    <Typography variant="caption" sx={{ color: '#9aa4ac', display: 'block', mt: 0.5 }}>{stat.sub}</Typography>
                                </Box>
                                <StatIconWrapper>{stat.icon}</StatIconWrapper>
                            </Box>
                        </StatCard>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                    <ChartCard>
                        <SectionTitle>Évolution des offres</SectionTitle>
                        <Box sx={{ height: 250 }}>
                            <Bar
                                data={{
                                    labels: stats.chartData.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                                    datasets: [{
                                        label: 'Offres publiées',
                                        data: stats.chartData.datasets?.[0]?.data || [8, 12, 15, 10, 18, 22],
                                        backgroundColor: 'rgba(20,138,160,0.7)',
                                        borderRadius: 4,
                                        maxBarThickness: 32,
                                    }],
                                }}
                                options={chartOptions}
                            />
                        </Box>
                    </ChartCard>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <ChartCard>
                        <SectionTitle>Répartition candidatures</SectionTitle>
                        <Box sx={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Pie
                                data={{
                                    labels: stats.distribution.labels || ['En attente', 'Acceptées', 'Refusées'],
                                    datasets: [{
                                        data: stats.distribution.datasets?.[0]?.data || [23, 42, 24],
                                        backgroundColor: ['#f59e0b', '#22c55e', '#ef4444'],
                                        borderWidth: 0,
                                    }],
                                }}
                                options={pieOptions}
                            />
                        </Box>
                    </ChartCard>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: '14px', border: '1px solid #eef1f3', boxShadow: 'none' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <SectionTitle sx={{ mb: 0 }}>Activités récentes</SectionTitle>
                            <Button size="small" sx={{ color: '#148aa0', textTransform: 'none', fontSize: '13px' }}>
                                Voir tout <ArrowForward sx={{ fontSize: 16, ml: 0.5 }} />
                            </Button>
                        </Box>
                        {stats.recentActivities.length > 0 ? (
                            <List sx={{ p: 0 }}>
                                {stats.recentActivities.map((activity) => (
                                    <ListItem key={activity.id} sx={{ px: 0, py: 1.5, borderBottom: '1px solid #f0f2f5' }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#eaf5f7', color: '#148aa0', fontSize: 16 }}>
                                                {activity.title.includes('validée') && '✅'}
                                                {activity.title.includes('acceptée') && '📋'}
                                                {activity.title.includes('planifié') && '📅'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight={600} color="#1a2332">{activity.title}</Typography>}
                                            secondary={
                                                <>
                                                    <Typography variant="caption" display="block" color="#687480">{activity.description}</Typography>
                                                    <Typography variant="caption" display="block" color="#9aa4ac" sx={{ mt: 0.5 }}>{activity.date}</Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 3 }}>Aucune activité récente</Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default RhDashboard;
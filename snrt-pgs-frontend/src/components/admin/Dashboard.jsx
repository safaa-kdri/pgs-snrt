// src/components/admin/Dashboard.jsx
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
    Avatar,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    CircularProgress,
    Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    People,
    Business,
    Work,
    School,
    TrendingUp,
    Assignment,
    Event,
    NotificationsActive,
    ArrowForward,
    Refresh,
    Download,
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
// STYLES - CHARTE SNRT PROFESSIONNELLE
// ============================================

const StatCard = styled(Card)(({ color }) => ({
    borderRadius: '14px',
    padding: '22px 24px',
    height: '100%',
    background: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
    borderLeft: `4px solid ${color || '#148aa0'}`,
    transition: 'all 0.25s ease',
    '&:hover': {
        boxShadow: '0 6px 20px rgba(0,0,0,0.07)',
        transform: 'translateY(-2px)',
    },
}));

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

const ActivityItem = styled(ListItem)({
    padding: '12px 0',
    borderBottom: '1px solid #f0f2f5',
    '&:last-child': { borderBottom: 'none' },
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

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        users: { total: 0, active: 0, new: 0 },
        departments: { total: 0, active: 0 },
        offres: { total: 0, active: 0, pending: 0 },
        internships: { total: 0, ongoing: 0, completed: 0 },
        applications: { total: 0, pending: 0, accepted: 0, rejected: 0 },
        chartData: { labels: [], datasets: [] },
        distribution: { labels: [], datasets: [] },
    });
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard');
            const data = response.data;
            if (data.role === 'Administrateur' || data.role === 'ADMIN') {
                const d = data.dashboard || {};
                setStats({
                    users: d.users || { total: 0, active: 0, new: 0 },
                    departments: d.departments || { total: 0, active: 0 },
                    offres: d.offres || { total: 0, active: 0, pending: 0 },
                    internships: d.internships || { total: 0, ongoing: 0, completed: 0 },
                    applications: d.applications || { total: 0, pending: 0, accepted: 0, rejected: 0 },
                    chartData: d.chartData || { labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'], datasets: [{ data: [8, 12, 15, 10, 18, 22, 28], backgroundColor: '#148aa0' }] },
                    distribution: d.distribution || { labels: ['En attente', 'Acceptées', 'Refusées', 'En cours'], datasets: [{ data: [23, 42, 24, 15], backgroundColor: ['#f59e0b', '#22c55e', '#ef4444', '#4f46e5'] }] },
                });
                setRecentActivities(d.recentActivities || []);
            }
        } catch (err) {
            console.error('Erreur chargement dashboard:', err);
            setError(err.response?.data?.message || 'Erreur de chargement');
            setStats({
                users: { total: 156, active: 142, new: 8 },
                departments: { total: 12, active: 10 },
                offres: { total: 45, active: 28, pending: 7 },
                internships: { total: 32, ongoing: 15, completed: 17 },
                applications: { total: 89, pending: 23, accepted: 42, rejected: 24 },
                chartData: { labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'], datasets: [{ data: [8, 12, 15, 10, 18, 22, 28], backgroundColor: '#148aa0' }] },
                distribution: { labels: ['En attente', 'Acceptées', 'Refusées', 'En cours'], datasets: [{ data: [23, 42, 24, 15], backgroundColor: ['#f59e0b', '#22c55e', '#ef4444', '#4f46e5'] }] },
            });
            setRecentActivities([
                { id: 1, title: 'Nouvel utilisateur inscrit', description: 'Ahmed Benjelloun — Étudiant', date: 'Il y a 1h', icon: '👤', status: 'new' },
                { id: 2, title: 'Offre publiée', description: 'Stage en Cybersécurité — DSI', date: 'Il y a 3h', icon: '📋', status: 'accepted' },
                { id: 3, title: 'Département créé', description: 'Direction Innovation & Digital', date: 'Il y a 1j', icon: '🏢', status: 'info' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { title: 'Utilisateurs', value: stats.users.total, subtitle: `${stats.users.active} actifs`, icon: <People sx={{ fontSize: 22 }} />, color: '#4f46e5' },
        { title: 'Départements', value: stats.departments.total, subtitle: `${stats.departments.active} actifs`, icon: <Business sx={{ fontSize: 22 }} />, color: '#8b5cf6' },
        { title: 'Offres', value: stats.offres.total, subtitle: `${stats.offres.active} publiées`, icon: <Work sx={{ fontSize: 22 }} />, color: '#f59e0b' },
        { title: 'Stages', value: stats.internships.total, subtitle: `${stats.internships.ongoing} en cours`, icon: <School sx={{ fontSize: 22 }} />, color: '#22c55e' },
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f0f2f5' }, ticks: { font: { family: '"Inter", sans-serif', size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { family: '"Inter", sans-serif', size: 11 } } },
        },
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 16,
                    font: { size: 11, family: '"Inter", sans-serif' },
                },
            },
        },
        cutout: '68%',
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={44} thickness={4} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 3 } }}>
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                    {error}
                </Alert>
            )}

            {/* ===== EN-TÊTE ===== */}
            <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#148aa0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Administration
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332', letterSpacing: '-0.02em', mt: 0.5 }}>
                        Tableau de bord
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#687480', mt: 0.5 }}>
                        Vue d'ensemble de la plateforme
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh sx={{ fontSize: 18 }} />}
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
                    <Button
                        variant="contained"
                        startIcon={<Download sx={{ fontSize: 18 }} />}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '10px',
                            backgroundColor: '#148aa0',
                            fontSize: '13px',
                            fontWeight: 500,
                            px: 3,
                            '&:hover': { backgroundColor: '#0b7890' },
                        }}
                    >
                        Exporter
                    </Button>
                </Box>
            </Box>

            {/* ===== STATISTIQUES ===== */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statCards.map((stat, index) => (
                    <Grid item xs={12} sm={6} lg={3} key={index}>
                        <StatCard color={stat.color}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a2332', fontSize: '28px' }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#687480' }}>
                                        {stat.title}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#9aa4ac', display: 'block', mt: 0.5 }}>
                                        {stat.subtitle}
                                    </Typography>
                                </Box>
                                <StatIconWrapper>{stat.icon}</StatIconWrapper>
                            </Box>
                        </StatCard>
                    </Grid>
                ))}
            </Grid>

            {/* ===== GRAPHIQUES ===== */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} lg={8}>
                    <ChartCard>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <SectionTitle sx={{ mb: 0 }}>
                                <TrendingUp sx={{ color: '#148aa0', mr: 1, fontSize: 20 }} />
                                Évolution des offres
                            </SectionTitle>
                            <Button size="small" sx={{ color: '#148aa0', textTransform: 'none', fontSize: '13px' }}>
                                Voir plus <ArrowForward sx={{ fontSize: 16, ml: 0.5 }} />
                            </Button>
                        </Box>
                        <Box sx={{ height: 250 }}>
                            <Bar
                                data={{
                                    labels: stats.chartData.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
                                    datasets: [{
                                        data: stats.chartData.datasets?.[0]?.data || [8, 12, 15, 10, 18, 22, 28],
                                        backgroundColor: '#148aa0',
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
                        <SectionTitle sx={{ mb: 2 }}>
                            <Assignment sx={{ color: '#f59e0b', mr: 1, fontSize: 20 }} />
                            Répartition
                        </SectionTitle>
                        <Box sx={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Pie
                                data={{
                                    labels: stats.distribution.labels || ['En attente', 'Acceptées', 'Refusées', 'En cours'],
                                    datasets: [{
                                        data: stats.distribution.datasets?.[0]?.data || [23, 42, 24, 15],
                                        backgroundColor: ['#f59e0b', '#22c55e', '#ef4444', '#4f46e5'],
                                        borderWidth: 0,
                                    }],
                                }}
                                options={pieOptions}
                            />
                        </Box>
                    </ChartCard>
                </Grid>
            </Grid>

            {/* ===== ACTIVITÉS ===== */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, borderRadius: '14px', border: '1px solid #eef1f3', boxShadow: 'none' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <SectionTitle sx={{ mb: 0 }}>
                                <TrendingUp sx={{ color: '#148aa0', mr: 1, fontSize: 20 }} />
                                Activités récentes
                            </SectionTitle>
                            <Button size="small" sx={{ color: '#148aa0', textTransform: 'none', fontSize: '13px' }} onClick={() => navigate('/admin/logs')}>
                                Voir tout <ArrowForward sx={{ fontSize: 16, ml: 0.5 }} />
                            </Button>
                        </Box>
                        {recentActivities.length > 0 ? (
                            <List sx={{ p: 0 }}>
                                {recentActivities.map((activity) => (
                                    <ActivityItem key={activity.id}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#eaf5f7', color: '#148aa0', fontSize: 16 }}>
                                                {activity.icon}
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
                                        <Chip
                                            label={activity.status === 'new' ? 'Nouveau' : activity.status === 'accepted' ? 'Approuvé' : 'Info'}
                                            size="small"
                                            sx={{
                                                bgcolor: activity.status === 'new' ? '#dbeafe' : activity.status === 'accepted' ? '#d1fae5' : '#e0e7ff',
                                                color: activity.status === 'new' ? '#1d4ed8' : activity.status === 'accepted' ? '#065f46' : '#4338ca',
                                                fontSize: '11px',
                                                height: '22px',
                                            }}
                                        />
                                    </ActivityItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 3 }}>
                                Aucune activité récente
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, borderRadius: '14px', border: '1px solid #eef1f3', boxShadow: 'none' }}>
                        <SectionTitle>
                            <NotificationsActive sx={{ color: '#148aa0', mr: 1, fontSize: 20 }} />
                            Actions rapides
                        </SectionTitle>
                        <Grid container spacing={1.5}>
                            {[
                                { label: 'Utilisateurs', icon: <People sx={{ fontSize: 18 }} />, path: '/admin/users' },
                                { label: 'Départements', icon: <Business sx={{ fontSize: 18 }} />, path: '/admin/departments' },
                                { label: 'Périodes', icon: <Event sx={{ fontSize: 18 }} />, path: '/admin/periods' },
                                { label: 'Paramètres', icon: <Assignment sx={{ fontSize: 18 }} />, path: '/admin/settings' },
                            ].map((item) => (
                                <Grid item xs={12} key={item.label}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={item.icon}
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            borderRadius: '10px',
                                            py: 1.2,
                                            borderColor: '#e0e4e8',
                                            color: '#20242b',
                                            textTransform: 'none',
                                            justifyContent: 'flex-start',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            '&:hover': { borderColor: '#148aa0', backgroundColor: '#eaf5f7' },
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard;
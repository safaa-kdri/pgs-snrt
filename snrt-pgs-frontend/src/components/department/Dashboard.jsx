// src/components/department/Dashboard.jsx
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

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const DepartmentDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        offres: { total: 0, publiees: 0, enAttente: 0 },
        candidatures: { total: 0, recues: 0 },
        entretiens: { total: 0, aVenir: 0 },
        offresList: [],
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
            if (data.role === 'Departement' || data.role === 'DEPARTEMENT') {
                const d = data.dashboard || {};
                setStats({
                    offres: d.offres || { total: 0, publiees: 0, enAttente: 0 },
                    candidatures: d.candidatures || { total: 0, recues: 0 },
                    entretiens: d.entretiens || { total: 0, aVenir: 0 },
                    offresList: d.offresList || [],
                    recentActivities: d.recentActivities || [],
                });
            }
        } catch (err) {
            console.error('Erreur chargement dashboard:', err);
            setError(err.response?.data?.message || 'Erreur de chargement');
            setStats({
                offres: { total: 12, publiees: 8, enAttente: 4 },
                candidatures: { total: 45, recues: 12 },
                entretiens: { total: 6, aVenir: 3 },
                offresList: [
                    { id: 1, titre: 'Stage en Développement Web', statut: 'Publiee', nbCandidatures: 8 },
                    { id: 2, titre: 'Stage en Data Science', statut: 'EnAttente', nbCandidatures: 0 },
                    { id: 3, titre: 'Stage en Communication', statut: 'Publiee', nbCandidatures: 4 },
                ],
                recentActivities: [
                    { id: 1, title: 'Offre publiée', description: 'Stage en Développement Web', date: 'Il y a 2h' },
                    { id: 2, title: 'Nouvelle candidature', description: 'Ahmed Benjelloun — Stage Data Science', date: 'Il y a 4h' },
                    { id: 3, title: 'Entretien planifié', description: 'Stage Communication — 15/07/2026', date: 'Il y a 1j' },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Offres', value: stats.offres.total, sub: `${stats.offres.publiees} publiées`, icon: <Assignment sx={{ fontSize: 22 }} /> },
        { label: 'En attente', value: stats.offres.enAttente, sub: `${stats.offres.enAttente} en validation`, icon: <Pending sx={{ fontSize: 22 }} /> },
        { label: 'Candidatures', value: stats.candidatures.total, sub: `${stats.candidatures.recues} nouvelles`, icon: <People sx={{ fontSize: 22 }} /> },
        { label: 'Entretiens', value: stats.entretiens.total, sub: `${stats.entretiens.aVenir} à venir`, icon: <CalendarToday sx={{ fontSize: 22 }} /> },
    ];

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
                        Département
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332', letterSpacing: '-0.02em', mt: 0.5 }}>
                        Tableau de bord
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#687480', mt: 0.5 }}>
                        Gestion de vos offres et candidatures
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

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, borderRadius: '14px', border: '1px solid #eef1f3', boxShadow: 'none' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <SectionTitle sx={{ mb: 0 }}>Mes offres</SectionTitle>
                            <Button size="small" sx={{ color: '#148aa0', textTransform: 'none', fontSize: '13px' }} onClick={() => navigate('/department/offers')}>
                                Voir tout <ArrowForward sx={{ fontSize: 16, ml: 0.5 }} />
                            </Button>
                        </Box>
                        {stats.offresList.length > 0 ? (
                            <List sx={{ p: 0 }}>
                                {stats.offresList.map((offre) => (
                                    <ListItem key={offre.id} sx={{ px: 0, py: 1.5, borderBottom: '1px solid #f0f2f5' }}>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight={600} color="#1a2332">{offre.titre}</Typography>}
                                            secondary={<Typography variant="caption" color="#687480">{offre.nbCandidatures || 0} candidature(s)</Typography>}
                                        />
                                        <Chip
                                            label={offre.statut === 'Publiee' ? 'Publiée' : 'En attente'}
                                            size="small"
                                            sx={{
                                                bgcolor: offre.statut === 'Publiee' ? '#d1fae5' : '#fef3c7',
                                                color: offre.statut === 'Publiee' ? '#065f46' : '#d97706',
                                                fontSize: '11px',
                                                height: '22px',
                                            }}
                                        />
                                        <Button size="small" sx={{ color: '#148aa0', ml: 1 }} onClick={() => navigate(`/department/offers/${offre.id}`)}>Voir</Button>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 3 }}>Aucune offre créée</Typography>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, borderRadius: '14px', border: '1px solid #eef1f3', boxShadow: 'none' }}>
                        <SectionTitle>Activités récentes</SectionTitle>
                        {stats.recentActivities.length > 0 ? (
                            <List sx={{ p: 0 }}>
                                {stats.recentActivities.map((activity) => (
                                    <ListItem key={activity.id} sx={{ px: 0, py: 1.5, borderBottom: '1px solid #f0f2f5' }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#eaf5f7', color: '#148aa0', fontSize: 16 }}>
                                                {activity.title.includes('Offre') && '📋'}
                                                {activity.title.includes('Candidature') && '📄'}
                                                {activity.title.includes('Entretien') && '📅'}
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

export default DepartmentDashboard;
// src/components/supervisor/Dashboard.jsx
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
    LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    People,
    School,
    CheckCircle,
    Pending,
    TrendingUp,
    ArrowForward,
    Refresh,
    Assignment,
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

const StagiaireCard = styled(Card)({
    borderRadius: '12px',
    padding: '16px',
    background: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
    transition: 'all 0.2s ease',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const SupervisorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        stagiaires: { total: 0, actifs: 0, termines: 0 },
        evaluations: { total: 0, enAttente: 0, faites: 0 },
        stagiairesList: [],
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
            if (data.role === 'Encadrant' || data.role === 'ENCADRANT') {
                const d = data.dashboard || {};
                setStats({
                    stagiaires: d.stagiaires || { total: 0, actifs: 0, termines: 0 },
                    evaluations: d.evaluations || { total: 0, enAttente: 0, faites: 0 },
                    stagiairesList: d.stagiairesList || [],
                    recentActivities: d.recentActivities || [],
                });
            }
        } catch (err) {
            console.error('Erreur chargement dashboard:', err);
            setError(err.response?.data?.message || 'Erreur de chargement');
            setStats({
                stagiaires: { total: 5, actifs: 3, termines: 2 },
                evaluations: { total: 8, enAttente: 3, faites: 5 },
                stagiairesList: [
                    { id: 1, nom: 'EL HASSANI', prenom: 'Youssef', stage: 'Stage Développement Web', progression: 65 },
                    { id: 2, nom: 'BENNANI', prenom: 'Sofia', stage: 'Stage Cybersécurité', progression: 40 },
                    { id: 3, nom: 'ALAOUI', prenom: 'Hamza', stage: 'Stage Data Science', progression: 80 },
                ],
                recentActivities: [
                    { id: 1, title: 'Rapport validé', description: 'EL HASSANI Youssef — Rapport final', date: 'Il y a 1h' },
                    { id: 2, title: 'Évaluation terminée', description: 'BENNANI Sofia — Évaluation mi-stage', date: 'Il y a 3h' },
                    { id: 3, title: 'Nouveau stagiaire', description: 'ALAOUI Hamza — Stage Data Science', date: 'Il y a 1j' },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Stagiaires', value: stats.stagiaires.total, sub: `${stats.stagiaires.actifs} actifs`, icon: <School sx={{ fontSize: 22 }} /> },
        { label: 'En cours', value: stats.stagiaires.actifs, sub: `${stats.stagiaires.termines} terminés`, icon: <People sx={{ fontSize: 22 }} /> },
        { label: 'Évaluations', value: stats.evaluations.total, sub: `${stats.evaluations.enAttente} en attente`, icon: <Assignment sx={{ fontSize: 22 }} /> },
        { label: 'Taux complétion', value: `${Math.round((stats.evaluations.faites / (stats.evaluations.total || 1)) * 100)}%`, sub: `${stats.evaluations.faites} faites`, icon: <CheckCircle sx={{ fontSize: 22 }} /> },
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
                        Encadrement
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332', letterSpacing: '-0.02em', mt: 0.5 }}>
                        Tableau de bord
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#687480', mt: 0.5 }}>
                        Suivi de vos stagiaires
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
                            <SectionTitle sx={{ mb: 0 }}>Mes stagiaires</SectionTitle>
                            <Button size="small" sx={{ color: '#148aa0', textTransform: 'none', fontSize: '13px' }} onClick={() => navigate('/supervisor/interns')}>
                                Voir tout <ArrowForward sx={{ fontSize: 16, ml: 0.5 }} />
                            </Button>
                        </Box>
                        {stats.stagiairesList.length > 0 ? (
                            <Grid container spacing={2}>
                                {stats.stagiairesList.map((stagiaire) => (
                                    <Grid item xs={12} md={6} key={stagiaire.id}>
                                        <StagiaireCard>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Box>
                                                    <Typography variant="body1" fontWeight={600} color="#1a2332">
                                                        {stagiaire.prenom} {stagiaire.nom}
                                                    </Typography>
                                                    <Typography variant="caption" color="#687480">{stagiaire.stage}</Typography>
                                                </Box>
                                                <Chip
                                                    label={stagiaire.progression >= 70 ? 'Avancé' : stagiaire.progression >= 40 ? 'En cours' : 'Début'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: stagiaire.progression >= 70 ? '#d1fae5' : stagiaire.progression >= 40 ? '#fef3c7' : '#dbeafe',
                                                        color: stagiaire.progression >= 70 ? '#065f46' : stagiaire.progression >= 40 ? '#d97706' : '#1d4ed8',
                                                        fontSize: '11px',
                                                        height: '22px',
                                                    }}
                                                />
                                            </Box>
                                            <Box sx={{ mt: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={stagiaire.progression || 0}
                                                        sx={{ flex: 1, height: 6, borderRadius: 4, backgroundColor: '#eef1f3', '& .MuiLinearProgress-bar': { backgroundColor: '#148aa0', borderRadius: 4 } }}
                                                    />
                                                    <Typography variant="caption" fontWeight={600} color="#148aa0">{stagiaire.progression || 0}%</Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                <Button size="small" variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', fontSize: '12px', borderColor: '#148aa0', color: '#148aa0' }} onClick={() => navigate(`/supervisor/interns/${stagiaire.id}`)}>Voir</Button>
                                                <Button size="small" variant="contained" sx={{ borderRadius: '8px', textTransform: 'none', fontSize: '12px', bgcolor: '#148aa0' }} onClick={() => navigate(`/supervisor/evaluate/${stagiaire.id}`)}>Évaluer</Button>
                                            </Box>
                                        </StagiaireCard>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 3 }}>Aucun stagiaire affecté</Typography>
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
                                                {activity.title.includes('Rapport') && '📄'}
                                                {activity.title.includes('Évaluation') && '📋'}
                                                {activity.title.includes('Nouveau') && '👤'}
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

export default SupervisorDashboard;
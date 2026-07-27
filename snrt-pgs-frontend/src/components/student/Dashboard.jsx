// src/components/student/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
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
    Work,
    CheckCircle,
    Pending,
    TrendingUp,
    ArrowForward,
    School,
    Business,
    CalendarToday,
    Refresh,
    Person,
    Favorite,
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

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        candidatures: { total: 0, enAttente: 0, acceptees: 0, refusees: 0 },
        offres: { total: 0, nouvelles: 0 },
        favoris: 0,
        stageEnCours: null,
        recentActivities: [],
        recommandations: [],
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
            if (data.role === 'Etudiant' || data.role === 'ETUDIANT') {
                const d = data.dashboard || {};
                setStats({
                    candidatures: d.candidatures || { total: 0, enAttente: 0, acceptees: 0, refusees: 0 },
                    offres: d.offres || { total: 0, nouvelles: 0 },
                    favoris: d.favoris || 0,
                    stageEnCours: d.stageEnCours || null,
                    recentActivities: d.recentActivities || [],
                    recommandations: d.recommandations || [],
                });
            }
        } catch (err) {
            console.error('Erreur chargement dashboard:', err);
            setError(err.response?.data?.message || 'Erreur de chargement');
            setStats({
                candidatures: { total: 12, enAttente: 3, acceptees: 7, refusees: 2 },
                offres: { total: 24, nouvelles: 5 },
                favoris: 8,
                stageEnCours: {
                    titre: 'Stage Développement Web',
                    entreprise: 'SNRT — DSI',
                    dateDebut: '01/06/2026',
                    dateFin: '31/08/2026',
                    encadrant: 'M. CHERKAOUI',
                    progression: 65,
                },
                recentActivities: [
                    { id: 1, type: 'candidature', title: 'Candidature envoyée', description: 'Stage en Cybersécurité — DSI', date: 'Il y a 2h' },
                    { id: 2, type: 'entretien', title: 'Entretien planifié', description: 'Stage Développement Web — 15/07/2026', date: 'Il y a 1j' },
                    { id: 3, type: 'document', title: 'Document validé', description: 'Convention de stage signée', date: 'Il y a 3j' },
                ],
                recommandations: [
                    { id: 1, titre: 'Stage en Data Science', departement: 'DSI', nbPostes: 2 },
                    { id: 2, titre: 'Stage en Communication', departement: 'Marketing', nbPostes: 1 },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Candidatures', value: stats.candidatures.total, sub: `${stats.candidatures.enAttente} en attente`, icon: <Work sx={{ fontSize: 22 }} /> },
        { label: 'Acceptées', value: stats.candidatures.acceptees, sub: `${Math.round((stats.candidatures.acceptees / (stats.candidatures.total || 1)) * 100)}% de taux`, icon: <CheckCircle sx={{ fontSize: 22 }} /> },
        { label: 'En attente', value: stats.candidatures.enAttente, sub: `${stats.candidatures.enAttente} en cours`, icon: <Pending sx={{ fontSize: 22 }} /> },
        { label: 'Favoris', value: stats.favoris, sub: `${stats.offres.nouvelles} nouvelles offres`, icon: <Favorite sx={{ fontSize: 22 }} /> },
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
                        Espace étudiant
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332', letterSpacing: '-0.02em', mt: 0.5 }}>
                        Tableau de bord
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#687480', mt: 0.5 }}>
                        Bonjour, {user?.prenom || user?.nom || 'Étudiant'}
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

            {stats.stageEnCours && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12}>
                        <ChartCard>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <SectionTitle sx={{ mb: 0 }}>
                                    <School sx={{ color: '#148aa0', mr: 1, fontSize: 20 }} />
                                    Stage en cours
                                </SectionTitle>
                                <Button size="small" sx={{ color: '#148aa0', textTransform: 'none', fontSize: '13px' }} onClick={() => navigate('/dashboard/stage')}>
                                    Voir plus <ArrowForward sx={{ fontSize: 16, ml: 0.5 }} />
                                </Button>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={8}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2332' }}>
                                        {stats.stageEnCours.titre}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Business sx={{ fontSize: 18, color: '#687480' }} />
                                            <Typography variant="body2" color="#687480">{stats.stageEnCours.entreprise}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarToday sx={{ fontSize: 18, color: '#687480' }} />
                                            <Typography variant="body2" color="#687480">{stats.stageEnCours.dateDebut} — {stats.stageEnCours.dateFin}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Person sx={{ fontSize: 18, color: '#687480' }} />
                                            <Typography variant="body2" color="#687480">Encadrant: {stats.stageEnCours.encadrant}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="body2" color="#687480">Progression</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={stats.stageEnCours.progression || 0}
                                                sx={{ flex: 1, height: 6, borderRadius: 4, backgroundColor: '#eef1f3', '& .MuiLinearProgress-bar': { backgroundColor: '#148aa0', borderRadius: 4 } }}
                                            />
                                            <Typography variant="body2" fontWeight={600} color="#148aa0">{stats.stageEnCours.progression || 0}%</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </ChartCard>
                    </Grid>
                </Grid>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, borderRadius: '14px', border: '1px solid #eef1f3', boxShadow: 'none' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <SectionTitle sx={{ mb: 0 }}>Activités récentes</SectionTitle>
                            <Button size="small" sx={{ color: '#148aa0', textTransform: 'none', fontSize: '13px' }} onClick={() => navigate('/dashboard/activities')}>
                                Voir tout <ArrowForward sx={{ fontSize: 16, ml: 0.5 }} />
                            </Button>
                        </Box>
                        {stats.recentActivities.length > 0 ? (
                            <List sx={{ p: 0 }}>
                                {stats.recentActivities.map((activity) => (
                                    <ListItem key={activity.id} sx={{ px: 0, py: 1.5, borderBottom: '1px solid #f0f2f5' }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#eaf5f7', color: '#148aa0', fontSize: 16 }}>
                                                {activity.type === 'candidature' && '📄'}
                                                {activity.type === 'entretien' && '📅'}
                                                {activity.type === 'document' && '📎'}
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
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, borderRadius: '14px', border: '1px solid #eef1f3', boxShadow: 'none' }}>
                        <SectionTitle>Offres recommandées</SectionTitle>
                        {stats.recommandations.length > 0 ? (
                            stats.recommandations.map((offre, idx) => (
                                <Card key={idx} sx={{ mb: 2, borderRadius: '10px', border: '1px solid #eef1f3', boxShadow: 'none' }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography variant="body2" fontWeight={600} color="#1a2332">{offre.titre}</Typography>
                                        <Typography variant="caption" color="#687480">{offre.departement} • {offre.nbPostes} poste(s)</Typography>
                                        <Button size="small" sx={{ mt: 1, color: '#148aa0', textTransform: 'none', p: 0, fontSize: '13px' }} onClick={() => navigate(`/offres/${offre.id}`)}>
                                            Postuler →
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 3 }}>Aucune recommandation</Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StudentDashboard;
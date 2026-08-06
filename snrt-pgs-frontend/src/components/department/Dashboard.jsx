// src/components/department/Dashboard.jsx
// ✅ VERSION AVEC TITRE STYLE "Candidatures reçues" - SANS ACTIVITÉS RÉCENTES

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
    List,
    ListItem,
    ListItemText,
    Avatar,
    LinearProgress,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    Assignment,
    Pending,
    Work,
    Event,
    Refresh,
    ArrowForward,
    CheckCircle,
    Description,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const PageContainer = styled(Container)({
    paddingTop: '28px',
    paddingBottom: '28px',
});

const HeaderSection = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '12px',
});

// ✅ STYLE IDENTIQUE À "Candidatures reçues"
const HeaderTitle = styled(Typography)({
    fontWeight: 700,
    fontSize: '32px',  // h4 en MUI = 32px
    color: '#1a2332',
});

const HeaderSubtitle = styled(Typography)({
    color: '#687480',
    fontSize: '15px',
    fontWeight: 500,
});

// ✅ Carte
const StatCard = styled(Card)(({ color }) => ({
    borderRadius: '12px',
    padding: '18px 22px',
    height: '100%',
    background: '#ffffff',
    boxShadow: 'none',
    border: '1px solid #eef1f3',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
        borderColor: color || '#2d3748',
        boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
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
    position: 'relative',
}));

const StatIcon = styled(Box)(({ color }) => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: alpha(color || '#2d3748', 0.08),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color || '#2d3748',
    flexShrink: 0,
    '& svg': {
        fontSize: '20px',
    },
}));

const StatValue = styled(Typography)({
    fontWeight: 700,
    fontSize: '24px',
    color: '#1a2332',
    lineHeight: 1.3,
});

const StatLabel = styled(Typography)({
    color: '#687480',
    fontSize: '13px',
    fontWeight: 500,
});

// ✅ Bloc "À traiter"
const ActionCard = styled(Paper)({
    borderRadius: '12px',
    padding: '18px 22px',
    border: '1px solid #eef1f3',
    boxShadow: 'none',
    backgroundColor: '#fafbfc',
    marginBottom: '28px',
});

const ActionItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 0',
});

const ActionIcon = styled(Box)(({ color }) => ({
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: alpha(color || '#2d3748', 0.1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color || '#2d3748',
    fontSize: '16px',
    flexShrink: 0,
}));

// ✅ Liste
const StyledListItem = styled(ListItem)({
    padding: '10px 0',
    borderBottom: '1px solid #f0f2f5',
    cursor: 'pointer',
    '&:last-child': {
        borderBottom: 'none',
    },
    '&:hover': {
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        paddingLeft: '8px',
        paddingRight: '8px',
        marginLeft: '-8px',
        marginRight: '-8px',
    },
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
        candidatures: { total: 0, enAttente: 0 },
        stages: { enCours: 0, total: 0 },
        entretiensAVenir: 0,
        aTraiter: { candidatures: 0, entretiens: 0, conventions: 0 },
        dernieresCandidatures: [],
        recentActivities: [],
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
            
            setStats({
                candidatures: {
                    total: data.candidatures?.total || 0,
                    enAttente: data.candidatures?.enAttente || 0,
                },
                stages: {
                    enCours: data.stages?.enCours || 0,
                    total: data.stages?.total || 0,
                },
                entretiensAVenir: data.entretiensAVenir || 0,
                aTraiter: {
                    candidatures: data.candidatures?.enAttente || 0,
                    entretiens: data.entretiensAVenir || 0,
                    conventions: 0,
                },
                dernieresCandidatures: data.dernieresCandidatures || [],
                recentActivities: data.recentActivities || [],
            });
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.response?.data?.message || 'Erreur de chargement');
            // ✅ Données mockées
            setStats({
                candidatures: { total: 45, enAttente: 12 },
                stages: { enCours: 5, total: 8 },
                entretiensAVenir: 6,
                aTraiter: { candidatures: 12, entretiens: 6, conventions: 2 },
                dernieresCandidatures: [
                    { id: '1', candidat: 'Youssef EL HASSANI', offre: 'Stage Développement Web', statut: 'EnAnalyse', date: new Date().toISOString() },
                    { id: '2', candidat: 'Fatima BENNANI', offre: 'Stage Data Science', statut: 'Soumise', date: new Date(Date.now() - 86400000).toISOString() },
                    { id: '3', candidat: 'Ahmed ALAMI', offre: 'Stage Cybersécurité', statut: 'Entretien', date: new Date(Date.now() - 172800000).toISOString() },
                    { id: '4', candidat: 'Sara LAKHDAR', offre: 'Stage Marketing Digital', statut: 'Soumise', date: new Date(Date.now() - 259200000).toISOString() },
                    { id: '5', candidat: 'Karim BENJELLOUN', offre: 'Stage DevOps', statut: 'EnAnalyse', date: new Date(Date.now() - 345600000).toISOString() },
                ],
                recentActivities: [
                    { id: '1', action: 'Candidature acceptée', date: "Aujourd'hui" },
                    { id: '2', action: 'Nouvelle candidature', date: 'Hier' },
                    { id: '3', action: 'Entretien programmé', date: '04 août' },
                    { id: '4', action: 'Stage clôturé', date: '03 août' },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // UTILITAIRES
    // ============================================

    const getStatusLabel = (s) => {
        const labels = { Soumise: 'Soumise', EnAnalyse: 'En analyse', Entretien: 'Entretien', Acceptee: 'Acceptée', Refusee: 'Refusée', Brouillon: 'Brouillon' };
        return labels[s] || s;
    };

    const getStatusColor = (s) => {
        const colors = { Soumise: '#1d4ed8', EnAnalyse: '#d97706', Entretien: '#6b21a8', Acceptee: '#065f46', Refusee: '#991b1b', Brouillon: '#6b7280' };
        return colors[s] || '#6b7280';
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    // ============================================
    // CARTES - 4 SEULEMENT
    // ============================================

    const cards = [
        { label: 'Candidatures reçues', value: stats.candidatures.total, icon: <Assignment />, color: '#2d3748', path: '/department/candidatures' },
        { label: 'En attente', value: stats.candidatures.enAttente, icon: <Pending />, color: '#f59e0b', path: '/department/candidatures?statut=Soumise' },
        { label: 'Stages en cours', value: stats.stages.enCours, icon: <Work />, color: '#148aa0', path: '/department/interns?statut=EnCours' },
        { label: 'Entretiens', value: stats.entretiensAVenir, icon: <Event />, color: '#8b5cf6', path: '/department/interviews' },
    ];

    const progressValue = stats.stages.total > 0 ? Math.round((stats.stages.enCours / stats.stages.total) * 100) : 0;

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
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

            {/* ===== EN-TÊTE ===== */}
            <HeaderSection>
                <Box>
                    <HeaderTitle>Tableau de bord</HeaderTitle>
                    <HeaderSubtitle>{user?.departementId?.nom || 'Département'}</HeaderSubtitle>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchDashboardData}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        borderColor: '#e0e4e8',
                        color: '#20242b',
                        fontSize: '14px',
                        fontWeight: 500,
                        px: 3,
                        py: 0.8,
                    }}
                >
                    Actualiser
                </Button>
            </HeaderSection>

            {/* ===== 4 CARTES ===== */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {cards.map((card, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                        <StatCard color={card.color} onClick={() => navigate(card.path)}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <StatValue>{card.value}</StatValue>
                                    <StatLabel>{card.label}</StatLabel>
                                </Box>
                                <StatIcon color={card.color}>{card.icon}</StatIcon>
                            </Box>
                        </StatCard>
                    </Grid>
                ))}
            </Grid>

            {/* ===== À TRAITER ===== */}
            <ActionCard>
                <Typography variant="subtitle2" fontWeight={600} color="#1a2332" sx={{ mb: 1.5, fontSize: '14px' }}>
                    À traiter aujourd'hui
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={4}>
                        <ActionItem>
                            <ActionIcon color="#f59e0b"><Assignment sx={{ fontSize: 16 }} /></ActionIcon>
                            <Box>
                                <Typography variant="h6" fontWeight={700} color="#1a2332" sx={{ fontSize: '18px', lineHeight: 1.2 }}>
                                    {stats.aTraiter.candidatures}
                                </Typography>
                                <Typography variant="caption" color="#687480">candidatures à analyser</Typography>
                            </Box>
                        </ActionItem>
                    </Grid>
                    <Grid item xs={4}>
                        <ActionItem>
                            <ActionIcon color="#8b5cf6"><Event sx={{ fontSize: 16 }} /></ActionIcon>
                            <Box>
                                <Typography variant="h6" fontWeight={700} color="#1a2332" sx={{ fontSize: '18px', lineHeight: 1.2 }}>
                                    {stats.aTraiter.entretiens}
                                </Typography>
                                <Typography variant="caption" color="#687480">entretiens à programmer</Typography>
                            </Box>
                        </ActionItem>
                    </Grid>
                    <Grid item xs={4}>
                        <ActionItem>
                            <ActionIcon color="#22c55e"><Description sx={{ fontSize: 16 }} /></ActionIcon>
                            <Box>
                                <Typography variant="h6" fontWeight={700} color="#1a2332" sx={{ fontSize: '18px', lineHeight: 1.2 }}>
                                    {stats.aTraiter.conventions}
                                </Typography>
                                <Typography variant="caption" color="#687480">conventions à signer</Typography>
                            </Box>
                        </ActionItem>
                    </Grid>
                </Grid>
            </ActionCard>

            {/* ===== DERNIÈRES CANDIDATURES ===== */}
            <Paper sx={{ borderRadius: '12px', border: '1px solid #eef1f3', boxShadow: 'none', mb: 3 }}>
                <Box sx={{ px: 3, pt: 2.5, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={600} color="#1a2332" sx={{ fontSize: '14px' }}>
                        Dernières candidatures
                    </Typography>
                    <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 16 }} />} onClick={() => navigate('/department/candidatures')} sx={{ textTransform: 'none', color: '#687480', fontSize: '13px', fontWeight: 500 }}>
                        Voir toutes
                    </Button>
                </Box>
                <Box sx={{ px: 3, pb: 2 }}>
                    {stats.dernieresCandidatures.length > 0 ? (
                        <List sx={{ p: 0 }}>
                            {stats.dernieresCandidatures.slice(0, 5).map((c) => {
                                const color = getStatusColor(c.statut);
                                return (
                                    <StyledListItem key={c.id} onClick={() => navigate(`/department/candidature/${c.id}`)}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(color, 0.12), color, fontSize: 12, fontWeight: 600, mr: 1.5 }}>
                                            {getInitials(c.candidat)}
                                        </Avatar>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight={600} color="#1a2332">{c.candidat}</Typography>}
                                            secondary={<Typography variant="caption" color="#687480">{c.offre} • {formatDate(c.date)}</Typography>}
                                            sx={{ my: 0 }}
                                        />
                                        <Typography variant="caption" fontWeight={600} color={color} sx={{ fontSize: '11px' }}>
                                            {getStatusLabel(c.statut)}
                                        </Typography>
                                    </StyledListItem>
                                );
                            })}
                        </List>
                    ) : (
                        <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 2 }}>
                            Aucune candidature récente
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* ===== STAGES EN COURS - UNIQUEMENT ===== */}
            <Paper sx={{ borderRadius: '12px', border: '1px solid #eef1f3', boxShadow: 'none', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="#1a2332" sx={{ fontSize: '14px' }}>
                        Stages en cours
                    </Typography>
                    <Button size="small" endIcon={<ArrowForward sx={{ fontSize: 16 }} />} onClick={() => navigate('/department/interns')} sx={{ textTransform: 'none', color: '#687480', fontSize: '13px', fontWeight: 500 }}>
                        Voir
                    </Button>
                </Box>
                <Typography variant="body2" color="#687480" sx={{ mb: 1.5, fontSize: '14px' }}>
                    {stats.stages.enCours} stage(s) actuellement
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress variant="determinate" value={progressValue} sx={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#eef1f3', '& .MuiLinearProgress-bar': { backgroundColor: '#22c55e', borderRadius: 3 } }} />
                    <Typography variant="caption" fontWeight={600} color="#22c55e">{progressValue}%</Typography>
                </Box>
            </Paper>
        </PageContainer>
    );
};

export default DepartmentDashboard;
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
    People,
    Description,
    CheckCircle,
    TrendingUp,
    Visibility,
    School,
    Work,
    CalendarToday,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
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
        'EnCours': { bg: '#dbeafe', text: '#1d4ed8' },
        'Termine': { bg: '#d1fae5', text: '#065f46' },
        'Annule': { bg: '#fee2e2', text: '#991b1b' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
        'EnAttente': { bg: '#fef3c7', text: '#d97706' },
        'Valide': { bg: '#d1fae5', text: '#065f46' },
        'Rejete': { bg: '#fee2e2', text: '#991b1b' },
        'EngagementEnvoye': { bg: '#dbeafe', text: '#1d4ed8' },
        'EngagementRecu': { bg: '#d1fae5', text: '#065f46' },
        'EnAttenteValidationDirecteur': { bg: '#fef3c7', text: '#d97706' },
        'ValideParDirecteur': { bg: '#d1fae5', text: '#065f46' },
        'DemandeEnvoyee': { bg: '#fef3c7', text: '#d97706' },
    };
    const color = colors[status] || colors['EnCours'];
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

const SupervisorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalStagiaires: 0,
        enCours: 0,
        termines: 0,
        livrablesEnAttente: 0,
        recentActivities: [],
        stagiairesList: [],
        progression: { valides: 0, total: 0 },
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            // Utiliser la route /my-internships pour récupérer les stages de l'encadrant
            const response = await api.get('/internships/my-internships');
            
            let internships = [];
            if (response.data?.data) {
                internships = response.data.data;
            } else if (Array.isArray(response.data)) {
                internships = response.data;
            }

            // Calculer les statistiques
            const total = internships.length;
            const enCours = internships.filter(i => i.statut === 'EnCours').length;
            const termines = internships.filter(i => i.statut === 'Termine' || i.statut === 'Cloturee').length;
            
            // Compter les livrables en attente de validation
            let livrablesEnAttente = 0;
            let totalLivrables = 0;
            let livrablesValides = 0;
            
            internships.forEach(intern => {
                if (intern.livrables && intern.livrables.length > 0) {
                    intern.livrables.forEach(l => {
                        if (l.type !== 'Rapport' || (!l.gridFsId && !l.chemin)) return;
                        totalLivrables++;
                        if (l.valide === true) livrablesValides++;
                        if (l.statut === 'EnAttente' || (l.valide === false && l.statut !== 'Rejete')) livrablesEnAttente++;
                    });
                }
            });

            // Formater la liste des stagiaires
            const stagiairesList = internships.map(intern => ({
                _id: intern._id,
                nom: intern.etudiantId?.nom || 'Stagiaire',
                prenom: intern.etudiantId?.prenom || '',
                offre: intern.offreId?.titre || 'Stage sans titre',
                statut: intern.statut || 'EnCours',
                dateDebut: intern.dateDebut,
                dateFin: intern.dateFin,
                etudiant: intern.etudiantId,
            }));

            // Activités récentes (remarques)
            const activities = [];
            internships.forEach(intern => {
                if (intern.remarquesEncadrant && intern.remarquesEncadrant.length > 0) {
                    intern.remarquesEncadrant.forEach(rem => {
                        activities.push({
                            id: rem._id || Date.now() + Math.random(),
                            title: 'Remarque ajoutée',
                            description: `${intern.etudiantId?.prenom || ''} ${intern.etudiantId?.nom || ''}: ${rem.message?.substring(0, 50) || ''}${rem.message?.length > 50 ? '...' : ''}`,
                            date: rem.date,
                            createdAt: rem.date,
                        });
                    });
                }
            });
            
            // Trier par date
            activities.sort((a, b) => new Date(b.date) - new Date(a.date));
            const recentActivities = activities.slice(0, 5);

            setStats({
                totalStagiaires: total,
                enCours: enCours,
                termines: termines,
                livrablesEnAttente: livrablesEnAttente,
                recentActivities: recentActivities,
                stagiairesList: stagiairesList,
                progression: { 
                    valides: livrablesValides, 
                    total: totalLivrables || 1 
                },
            });

        } catch (err) {
            console.error('❌ Erreur chargement dashboard:', err);
            setError(err.response?.data?.message || 'Erreur de chargement des données');
            // En cas d'erreur, on garde les valeurs par défaut
            setStats({
                totalStagiaires: 0,
                enCours: 0,
                termines: 0,
                livrablesEnAttente: 0,
                recentActivities: [],
                stagiairesList: [],
                progression: { valides: 0, total: 0 },
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'EnCours': 'En cours',
            'Termine': 'Terminé',
            'Annule': 'Annulé',
            'Cloturee': 'Clôturé',
            'EngagementEnvoye': 'Engagement envoyé',
            'EngagementRecu': 'Engagement reçu',
            'EnAttenteValidationDirecteur': 'En attente validation Directeur',
            'ValideParDirecteur': 'Validé par Directeur',
            'DemandeEnvoyee': 'Demande envoyée',
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
            'EnCours': '#1d4ed8',
            'Termine': '#065f46',
            'Annule': '#991b1b',
            'Cloturee': '#065f46',
            'EngagementEnvoye': '#1d4ed8',
            'EngagementRecu': '#065f46',
            'EnAttenteValidationDirecteur': '#d97706',
            'ValideParDirecteur': '#065f46',
            'DemandeEnvoyee': '#d97706',
        };
        return colors[status] || '#6b7280';
    };

    const getActivityIcon = (title) => {
        if (title?.includes('Rapport') || title?.includes('livrable')) return '📄';
        if (title?.includes('validé')) return '✅';
        if (title?.includes('Évaluation')) return '⭐';
        if (title?.includes('clôturé')) return '🏁';
        if (title?.includes('Remarque')) return '💬';
        return '•';
    };

    const statCards = [
        {
            label: 'Stagiaires en cours',
            value: stats.enCours,
            sub: `Sur ${stats.totalStagiaires} total`,
            icon: <People sx={{ fontSize: 20 }} />,
            color: '#2d3748',
            path: '/supervisor/stagiaires',
        },
        {
            label: 'Livrables en attente',
            value: stats.livrablesEnAttente,
            sub: 'À valider',
            icon: <Description sx={{ fontSize: 20 }} />,
            color: '#f59e0b',
            path: '/supervisor/stagiaires',
        },
        {
            label: 'Stagiaires terminés',
            value: stats.termines,
            sub: 'Clôturés',
            icon: <CheckCircle sx={{ fontSize: 20 }} />,
            color: '#22c55e',
            path: '/supervisor/stagiaires',
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
        ? Math.round((stats.progression.valides / stats.progression.total) * 100) 
        : 0;

    return (
        <PageContainer maxWidth="xl">
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                    {error}
                </Alert>
            )}

            {/* ===== EN-TETE ===== */}
            <HeaderSection>
                <HeaderLeft>
                    <Greeting>
                        Bonjour {user?.prenom || 'Encadrant'}
                    </Greeting>
                    <GreetingSub>
                        Voici le suivi de vos stagiaires aujourd'hui.
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
                        Validation des livrables
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#1a2332">
                        {stats.progression.valides} / {stats.progression.total} validés
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
                        {progressPercent}% complété
                    </Typography>
                </Box>
            </ProgressCard>

            {/* ===== DERNIERS STAGIAIRES ===== */}
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
                    <SectionTitle>Mes stagiaires</SectionTitle>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                                <StyledTableCell>Stagiaire</StyledTableCell>
                                <StyledTableCell>Stage</StyledTableCell>
                                <StyledTableCell>Début</StyledTableCell>
                                <StyledTableCell>Statut</StyledTableCell>
                                <StyledTableCell align="center">Action</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats.stagiairesList && stats.stagiairesList.length > 0 ? (
                                stats.stagiairesList.map((stagiaire) => {
                                    const statusColor = getStatusColor(stagiaire.statut);
                                    return (
                                        <TableRow key={stagiaire._id} hover>
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
                                                        {((stagiaire.prenom || '')[0] || '') + ((stagiaire.nom || '')[0] || '') || '?'}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {stagiaire.prenom || ''} {stagiaire.nom || 'Stagiaire'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {stagiaire.offre || 'Stage sans titre'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(stagiaire.dateDebut)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip
                                                    label={getStatusLabel(stagiaire.statut)}
                                                    status={stagiaire.statut}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Voir le détail">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/supervisor/stagiaire/${stagiaire._id}`)}
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
                                            Aucun stagiaire affecté
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
                        onClick={() => navigate('/supervisor/stagiaires')}
                        sx={{ textTransform: 'none', color: '#2d3748' }}
                    >
                        Voir tous mes stagiaires
                    </Button>
                </Box>
            </Paper>

            {/* ===== ACTIVITES RECENTES ===== */}
            <ActivityCard>
                <SectionTitle>Activités récentes</SectionTitle>
                {stats.recentActivities && stats.recentActivities.length > 0 ? (
                    <Box>
                        {stats.recentActivities.map((activity) => (
                            <ActivityItem key={activity.id}>
                                <ActivityIcon>
                                    {getActivityIcon(activity.title)}
                                </ActivityIcon>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight={500} color="#1a2332">
                                        {activity.title || 'Activité'}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="#687480">
                                        {activity.description || activity.message || ''}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="#9aa4ac">
                                    {activity.date ? formatDate(activity.date) : ''}
                                </Typography>
                            </ActivityItem>
                        ))}
                    </Box>
                ) : (
                    <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 3 }}>
                        Aucune activité récente
                    </Typography>
                )}
            </ActivityCard>
        </PageContainer>
    );
};

export default SupervisorDashboard;
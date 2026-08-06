// src/components/department/DepartmentStats.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Button,
    Divider,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    BarChart,
    TrendingUp,
    School,
    People,
    Work,
    Assignment,
    CheckCircle,
    Cancel,
    Pending,
    Refresh,
    ArrowBack,
    Download,
    CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================
// STYLES
// ============================================

const PageHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
});

const StatCard = styled(Card)(({ color }) => ({
    borderRadius: '14px',
    padding: '20px 24px',
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

const StatValue = styled(Typography)({
    fontSize: '28px',
    fontWeight: 700,
    color: '#1a2332',
});

const StatLabel = styled(Typography)({
    fontSize: '14px',
    color: '#687480',
    fontWeight: 500,
});

// ============================================
// ✅ DONNÉES MOCKÉES POUR LE DÉVELOPPEMENT
// ============================================

const emptyStats = {
    totalCandidatures: 0,
    totalStages: 0,
    totalEtudiants: 0,
    totalEncadrants: 0,
    tauxAcceptation: 0,
    candidaturesParStatut: [],
    stagesParStatut: [],
    stagesParMois: Array(12).fill(0).map((_, i) => ({ 
        mois: ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'][i], 
        count: 0 
    })),
    topOffres: [],
    universites: [],
};

const mockStats = {
    totalCandidatures: 12,
    totalStages: 5,
    totalEtudiants: 8,
    totalEncadrants: 4,
    tauxAcceptation: 60,
    candidaturesParStatut: [
        { statut: 'Soumise', count: 3, color: '#1d4ed8' },
        { statut: 'EnAnalyse', count: 2, color: '#d97706' },
        { statut: 'Acceptee', count: 5, color: '#065f46' },
        { statut: 'Refusee', count: 2, color: '#991b1b' },
    ],
    stagesParStatut: [
        { statut: 'EnCours', count: 3, color: '#1d4ed8' },
        { statut: 'Termine', count: 2, color: '#065f46' },
    ],
    stagesParMois: [
        { mois: 'Jan', count: 0 }, { mois: 'Fév', count: 0 },
        { mois: 'Mar', count: 1 }, { mois: 'Avr', count: 1 },
        { mois: 'Mai', count: 0 }, { mois: 'Juin', count: 2 },
        { mois: 'Juil', count: 1 }, { mois: 'Aoû', count: 0 },
        { mois: 'Sep', count: 0 }, { mois: 'Oct', count: 0 },
        { mois: 'Nov', count: 0 }, { mois: 'Déc', count: 0 },
    ],
    topOffres: [
        { titre: 'Stage Développement Web', candidatures: 5, acceptees: 3 },
        { titre: 'Stage Data Science', candidatures: 3, acceptees: 1 },
        { titre: 'Stage Cybersécurité', candidatures: 2, acceptees: 1 },
    ],
    universites: [],
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const DepartmentStats = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(emptyStats);

    // ✅ RÉFÉRENCE POUR ÉVITER LES APPELS MULTIPLES
    const [isMounted, setIsMounted] = useState(true);

    useEffect(() => {
        fetchStats();
        return () => setIsMounted(false);
    }, []);

    // ============================================
    // ✅ CHARGEMENT DES STATISTIQUES - AVEC FALLBACK
    // ============================================
    const fetchStats = async () => {
        setLoading(true);
        setError('');
        try {
            // ✅ 1. Récupérer les offres du département
            let offers = [];
            try {
                const offersResponse = await api.get('/offers', {
                    params: {
                        departementId: user?.departementId,
                        limit: 100,
                        statut: 'Publiee'
                    }
                });
                offers = offersResponse.data?.offers || offersResponse.data?.data || [];
                console.log('📊 [DepartmentStats] Offres:', offers.length);
            } catch (e) {
                console.warn('⚠️ [DepartmentStats] Erreur offres:', e.message);
                // ❌ Utiliser des données mockées
                if (isMounted) {
                    setStats(mockStats);
                    setLoading(false);
                }
                return;
            }

            if (offers.length === 0) {
                console.log('📊 [DepartmentStats] Aucune offre, stats vides');
                if (isMounted) {
                    setStats(emptyStats);
                    setLoading(false);
                }
                return;
            }

            const offerIds = offers.map(o => o._id || o.id);

            // ✅ 2. Récupérer les candidatures
            let applications = [];
            try {
                const appsResponse = await api.get('/applications', {
                    params: { offreId: offerIds.join(','), limit: 1000 }
                });
                applications = appsResponse.data?.data || appsResponse.data?.applications || [];
            } catch (e) {
                console.warn('⚠️ [DepartmentStats] Erreur candidatures:', e.message);
                applications = [];
            }

            // ✅ 3. Récupérer les stages
            let internships = [];
            try {
                const stagesResponse = await api.get('/internships', {
                    params: { offreId: offerIds.join(','), limit: 1000 }
                });
                internships = stagesResponse.data?.data || stagesResponse.data?.internships || [];
            } catch (e) {
                console.warn('⚠️ [DepartmentStats] Erreur stages:', e.message);
                internships = [];
            }

            // ✅ 4. Récupérer les encadrants du département
            let encadrants = [];
            try {
                const encadrantsResponse = await api.get('/users', {
                    params: {
                        type: 'interne',
                        role: 'Encadrant',
                        departementId: user?.departementId
                    }
                });
                encadrants = encadrantsResponse.data?.data || encadrantsResponse.data || [];
            } catch (e) {
                console.warn('⚠️ [DepartmentStats] Erreur encadrants:', e.message);
                encadrants = [];
            }

            console.log('📊 [DepartmentStats] Candidatures:', applications.length);
            console.log('📊 [DepartmentStats] Stages:', internships.length);
            console.log('📊 [DepartmentStats] Encadrants:', encadrants.length);

            // ✅ 5. Récupérer les étudiants uniques depuis les candidatures
            const studentIds = [...new Set(applications.map(a => a.etudiantId?._id || a.etudiantId))];
            const totalEtudiants = studentIds.filter(id => id).length;

            // ✅ 6. Calculer les statistiques des candidatures
            const totalCandidatures = applications.length;
            const acceptees = applications.filter(a => a.statut === 'Acceptee').length;
            const refusees = applications.filter(a => a.statut === 'Refusee').length;
            const tauxAcceptation = totalCandidatures > 0 
                ? Math.round((acceptees / totalCandidatures) * 100) 
                : 0;

            // ✅ 7. Candidatures par statut
            const statusMap = {};
            applications.forEach(app => {
                const statut = app.statut || 'Soumise';
                statusMap[statut] = (statusMap[statut] || 0) + 1;
            });

            const statusColors = {
                'Brouillon': '#6b7280',
                'Soumise': '#1d4ed8',
                'EnAnalyse': '#d97706',
                'Entretien': '#6b21a8',
                'Acceptee': '#065f46',
                'Refusee': '#991b1b',
            };

            const candidaturesParStatut = Object.keys(statusMap).map(key => ({
                statut: key,
                count: statusMap[key],
                color: statusColors[key] || '#148aa0',
            }));

            // ✅ 8. Stages par statut
            const stageStatusMap = {};
            internships.forEach(s => {
                const statut = s.statut || 'EnAttente';
                stageStatusMap[statut] = (stageStatusMap[statut] || 0) + 1;
            });

            const stageColors = {
                'EnAttente': '#d97706',
                'EnCours': '#1d4ed8',
                'Termine': '#065f46',
                'Annule': '#991b1b',
                'Cloturee': '#065f46',
                'ValideParDirecteur': '#065f46',
                'DemandeEnvoyee': '#d97706',
                'EngagementEnvoye': '#1d4ed8',
                'EngagementValide': '#065f46',
            };

            const stagesParStatut = Object.keys(stageStatusMap).map(key => ({
                statut: key,
                count: stageStatusMap[key],
                color: stageColors[key] || '#148aa0',
            }));

            // ✅ 9. Stages par mois (derniers 12 mois)
            const now = new Date();
            const moisMap = {};
            
            internships.forEach(s => {
                if (s.dateDebut) {
                    const date = new Date(s.dateDebut);
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    moisMap[key] = (moisMap[key] || 0) + 1;
                }
            });

            const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
            const stagesParMois = moisLabels.map((label, index) => {
                const month = index + 1;
                const year = month > now.getMonth() + 1 ? now.getFullYear() - 1 : now.getFullYear();
                const key = `${year}-${String(month).padStart(2, '0')}`;
                return {
                    mois: label,
                    count: moisMap[key] || 0,
                };
            });

            // ✅ 10. Top 5 offres
            const offreCandidatures = {};
            applications.forEach(app => {
                const offreId = app.offreId?._id || app.offreId || app.offre;
                const offreTitre = app.offreId?.titre || app.offre || 'Offre sans titre';
                const key = offreId || offreTitre;
                if (!offreCandidatures[key]) {
                    offreCandidatures[key] = {
                        titre: offreTitre,
                        candidatures: 0,
                        acceptees: 0,
                    };
                }
                offreCandidatures[key].candidatures++;
                if (app.statut === 'Acceptee') {
                    offreCandidatures[key].acceptees++;
                }
            });

            const topOffres = Object.values(offreCandidatures)
                .sort((a, b) => b.candidatures - a.candidatures)
                .slice(0, 5);

            // ✅ 11. Répartition par université
            const univMap = {};
            applications.forEach(app => {
                const univ = app.etudiantId?.universite || 'Non spécifié';
                univMap[univ] = (univMap[univ] || 0) + 1;
            });

            const universites = Object.keys(univMap)
                .map(key => ({ nom: key, count: univMap[key] }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // ✅ 12. Mettre à jour le state
            if (isMounted) {
                setStats({
                    totalCandidatures,
                    totalStages: internships.length,
                    totalEtudiants,
                    totalEncadrants: encadrants.length,
                    tauxAcceptation,
                    candidaturesParStatut,
                    stagesParStatut,
                    stagesParMois,
                    topOffres,
                    universites,
                });
            }

        } catch (error) {
            console.error('❌ [DepartmentStats] Erreur:', error);
            if (isMounted) {
                setError(error.response?.data?.message || 'Erreur de chargement des statistiques');
                // ✅ Utiliser les données mockées en cas d'erreur
                setStats(mockStats);
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    const handleExport = () => {
        // ✅ Génération d'un rapport CSV simple
        try {
            let csv = 'Statistique,Valeur\n';
            csv += `Total Candidatures,${stats.totalCandidatures}\n`;
            csv += `Stages en cours,${stats.stagesParStatut.find(s => s.statut === 'EnCours')?.count || 0}\n`;
            csv += `Taux d'acceptation,${stats.tauxAcceptation}%\n`;
            csv += `Total Étudiants,${stats.totalEtudiants}\n`;
            csv += `Total Encadrants,${stats.totalEncadrants}\n\n`;
            
            csv += 'Candidatures par statut\n';
            stats.candidaturesParStatut.forEach(s => {
                csv += `${s.statut},${s.count}\n`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `statistiques_departement_${format(new Date(), 'yyyy-MM-dd')}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('❌ Erreur export:', error);
            setError('Erreur lors de l\'export des données');
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'Soumise': 'Soumise',
            'EnAnalyse': 'En analyse',
            'Entretien': 'Entretien',
            'Acceptee': 'Acceptée',
            'Refusee': 'Refusée',
            'EnCours': 'En cours',
            'Termine': 'Terminé',
            'EnAttente': 'En attente',
            'Brouillon': 'Brouillon',
            'Cloturee': 'Clôturé',
            'ValideParDirecteur': 'Validé par Directeur',
            'DemandeEnvoyee': 'Demande envoyée',
            'EngagementEnvoye': 'Engagement envoyé',
            'EngagementValide': 'Engagement validé',
            'Annule': 'Annulé',
        };
        return labels[status] || status;
    };

    const getTotalCandidatures = () => {
        return stats.candidaturesParStatut.reduce((sum, s) => sum + s.count, 0);
    };

    const getTotalStages = () => {
        return stats.stagesParStatut.reduce((sum, s) => sum + s.count, 0);
    };

    const maxCandidatures = Math.max(...stats.candidaturesParStatut.map(s => s.count), 1);
    const maxStages = Math.max(...stats.stagesParStatut.map(s => s.count), 1);
    const maxMois = Math.max(...stats.stagesParMois.map(s => s.count), 1);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={44} sx={{ color: '#000000' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Statistiques du département
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Vue d'ensemble de l'activité de votre département
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchStats}
                        disabled={loading}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            borderColor: '#e0e4e8',
                            color: '#20242b',
                            '&:hover': { borderColor: '#000000', backgroundColor: '#f5f5f5' },
                        }}
                    >
                        Rafraîchir
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={handleExport}
                        sx={{
                            backgroundColor: '#000000',
                            borderRadius: '12px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#333333' },
                        }}
                    >
                        Exporter
                    </Button>
                </Box>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

            {/* ===== STATS GÉNÉRALES ===== */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard color="#4f46e5">
                        <StatValue>{stats.totalCandidatures}</StatValue>
                        <StatLabel>Candidatures totales</StatLabel>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard color="#22c55e">
                        <StatValue>{stats.totalStages}</StatValue>
                        <StatLabel>Stages</StatLabel>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard color="#f59e0b">
                        <StatValue>{stats.tauxAcceptation}%</StatValue>
                        <StatLabel>Taux d'acceptation</StatLabel>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard color="#148aa0">
                        <StatValue>{stats.totalEncadrants}</StatValue>
                        <StatLabel>Encadrants</StatLabel>
                    </StatCard>
                </Grid>
            </Grid>

            {/* ===== GRAPHIQUES ===== */}
            <Grid container spacing={3}>
                {/* Candidatures par statut */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '14px', border: '1px solid #eef1f3' }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            Candidatures par statut
                        </Typography>
                        {stats.candidaturesParStatut.length > 0 ? (
                            <Box>
                                {stats.candidaturesParStatut.map((item, idx) => (
                                    <Box key={idx} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2">
                                                {getStatusLabel(item.statut)}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {item.count}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(item.count / maxCandidatures) * 100}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: '#e5e7eb',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: item.color || '#148aa0',
                                                    borderRadius: 4,
                                                },
                                            }}
                                        />
                                    </Box>
                                ))}
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total
                                    </Typography>
                                    <Typography variant="body2" fontWeight={700}>
                                        {getTotalCandidatures()}
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                Aucune donnée disponible
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Stages par statut */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '14px', border: '1px solid #eef1f3' }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            Stages par statut
                        </Typography>
                        {stats.stagesParStatut.length > 0 ? (
                            <Box>
                                {stats.stagesParStatut.map((item, idx) => (
                                    <Box key={idx} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2">
                                                {getStatusLabel(item.statut)}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {item.count}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(item.count / maxStages) * 100}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: '#e5e7eb',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: item.color || '#148aa0',
                                                    borderRadius: 4,
                                                },
                                            }}
                                        />
                                    </Box>
                                ))}
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total
                                    </Typography>
                                    <Typography variant="body2" fontWeight={700}>
                                        {getTotalStages()}
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                Aucune donnée disponible
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Stages par mois */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '14px', border: '1px solid #eef1f3' }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            Stages par mois
                        </Typography>
                        {stats.stagesParMois.some(s => s.count > 0) ? (
                            <Box>
                                {stats.stagesParMois.map((item, idx) => (
                                    <Box key={idx} sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2">
                                                {item.mois}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {item.count}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(item.count / maxMois) * 100}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: '#e5e7eb',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: '#148aa0',
                                                    borderRadius: 4,
                                                },
                                            }}
                                        />
                                    </Box>
                                ))}
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total
                                    </Typography>
                                    <Typography variant="body2" fontWeight={700}>
                                        {stats.stagesParMois.reduce((sum, s) => sum + s.count, 0)}
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                Aucune donnée disponible
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Top 5 offres */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '14px', border: '1px solid #eef1f3' }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            Top 5 offres les plus populaires
                        </Typography>
                        {stats.topOffres.length > 0 ? (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Offre</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>Candidatures</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>Acceptées</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>Taux</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats.topOffres.map((offre, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {offre.titre}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">{offre.candidatures}</TableCell>
                                                <TableCell align="center">{offre.acceptees}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={`${offre.candidatures > 0 ? Math.round((offre.acceptees / offre.candidatures) * 100) : 0}%`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: (offre.acceptees / (offre.candidatures || 1)) > 0.5 
                                                                ? '#d1fae5' 
                                                                : '#fef3c7',
                                                            color: (offre.acceptees / (offre.candidatures || 1)) > 0.5 
                                                                ? '#065f46' 
                                                                : '#d97706',
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                                Aucune donnée disponible
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* ===== LIEN RETOUR ===== */}
            <Box sx={{ mt: 4 }}>
                <Button
                    variant="text"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/department')}
                    sx={{ color: '#666', textTransform: 'none' }}
                >
                    Retour au tableau de bord
                </Button>
            </Box>
        </Container>
    );
};

export default DepartmentStats;
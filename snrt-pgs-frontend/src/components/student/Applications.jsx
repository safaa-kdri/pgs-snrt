// src/components/student/Applications.jsx
// ✅ AJOUT : Bouton "Déposer une candidature" pour accéder au workflow

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Chip,
    IconButton,
    Grid,
    CircularProgress,
    InputAdornment,
    Tooltip,
    LinearProgress,
    Alert,
} from '@mui/material';
import {
    Search,
    Visibility,
    Refresh,
    FilterList,
    Event,
    Description,
    Add,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

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

const StyledTableCell = styled(TableCell)({
    fontWeight: 600,
    color: '#1a2332',
});

// ✅ STATUTS COMPLETS DU WORKFLOW - Libellés professionnels pour l'étudiant
const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'Brouillon': { bg: '#e5e7eb', text: '#6b7280' },
        'Soumise': { bg: '#dbeafe', text: '#1d4ed8' },
        'EnAnalyse': { bg: '#fef3c7', text: '#d97706' },
        'Entretien': { bg: '#f3e8ff', text: '#6b21a8' },
        'Acceptee': { bg: '#d1fae5', text: '#065f46' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
        'EngagementEnvoye': { bg: '#d1fae5', text: '#065f46' },
        'EngagementRecu': { bg: '#d1fae5', text: '#065f46' },
        'EngagementValide': { bg: '#d1fae5', text: '#065f46' },
        'EngagementRejete': { bg: '#fee2e2', text: '#991b1b' },
        'DemandeEnvoyee': { bg: '#d1fae5', text: '#065f46' },
        'ValideParDirecteur': { bg: '#d1fae5', text: '#065f46' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
        'Termine': { bg: '#d1fae5', text: '#065f46' },
        'EnCours': { bg: '#d1fae5', text: '#065f46' },
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

const TypeChip = styled(Chip)(({ type }) => {
    const colors = {
        'PFE': { bg: '#dbeafe', text: '#1d4ed8' },
        'PFA': { bg: '#dcfce7', text: '#15803d' },
        'Initiation': { bg: '#fef3c7', text: '#b45309' },
        'Ete': { bg: '#fce4ec', text: '#b91c1c' },
    };
    const color = colors[type] || { bg: '#e5e7eb', text: '#6b7280' };
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
    };
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Applications = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        filterApplications();
    }, [applications, searchTerm]);

    const fetchApplications = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/applications', {
                params: { etudiantId: user?.id }
            });
            
            const data = response.data?.data || response.data?.applications || [];
            
            const applicationsWithStage = await Promise.all(
                data.map(async (app) => {
                    try {
                        const stageRes = await api.get(`/internships/application/${app._id}`);
                        if (stageRes.data?.data) {
                            return {
                                ...app,
                                stageStatut: stageRes.data.data.statut,
                                stage: stageRes.data.data,
                                hasStage: true
                            };
                        }
                    } catch (e) {
                        // Pas de stage associé
                    }
                    return {
                        ...app,
                        stageStatut: app.statut,
                        stage: null,
                        hasStage: false
                    };
                })
            );
            
            setApplications(applicationsWithStage);
            setFilteredApplications(applicationsWithStage);
        } catch (error) {
            console.error('Erreur chargement candidatures:', error);
            setError(
                error.response?.data?.message || 
                'Erreur lors du chargement des candidatures'
            );
            setApplications([]);
            setFilteredApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const filterApplications = () => {
        let filtered = [...applications];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (a) =>
                    (a.offreId?.titre || a.offre || '').toLowerCase().includes(term) ||
                    (a.typeStage || a.offreId?.typeStage || '').toLowerCase().includes(term)
            );
        }

        setFilteredApplications(filtered);
    };

    const getStatusLabel = (status) => {
        const labels = {
            'Brouillon': 'Brouillon',
            'Soumise': 'Soumise',
            'EnAnalyse': 'En cours d\'analyse',
            'Entretien': 'Entretien planifié',
            'Acceptee': 'Acceptée',
            'Refusee': 'Refusée',
            'EngagementEnvoye': 'Engagement envoyé',
            'EngagementRecu': 'Engagement reçu',
            'EngagementValide': 'Engagement validé',
            'EngagementRejete': 'Engagement rejeté',
            'DemandeEnvoyee': 'Demande envoyée',
            'ValideParDirecteur': 'Validé par le Directeur',
            'Cloturee': 'Stage clôturé',
            'Termine': 'Stage terminé',
            'EnCours': 'Stage en cours',
        };
        return labels[status] || status;
    };

    const getProgression = (statut) => {
        const map = {
            'Brouillon': 0,
            'Soumise': 20,
            'EnAnalyse': 40,
            'Entretien': 60,
            'Acceptee': 100,
            'Refusee': 100,
            'EngagementEnvoye': 100,
            'EngagementRecu': 100,
            'EngagementValide': 100,
            'EngagementRejete': 100,
            'DemandeEnvoyee': 100,
            'ValideParDirecteur': 100,
            'Cloturee': 100,
            'Termine': 100,
            'EnCours': 100,
        };
        return map[statut] || 0;
    };

    const getProgressColor = (progress) => {
        if (progress >= 100) return '#22c55e';
        if (progress >= 80) return '#22c55e';
        if (progress >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const getTypeStage = (app) => {
        if (app.offreId?.typeStage) {
            return app.offreId.typeStage;
        }
        if (app.typeStage) {
            return app.typeStage;
        }
        return 'Stage';
    };

    const handleDeposerCandidature = () => {
        // ✅ Rediriger vers la liste des offres pour choisir une offre
        navigate('/offres');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={44} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Mes candidatures
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredApplications.length} candidature(s) trouvée(s)
                    </Typography>
                </Box>
                {/* ✅ AJOUT : Bouton pour déposer une nouvelle candidature */}
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleDeposerCandidature}
                    sx={{
                        backgroundColor: '#148aa0',
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontFamily: 'Inter, sans-serif',
                        '&:hover': { backgroundColor: '#0b7890' },
                    }}
                >
                    Déposer une candidature
                </Button>
            </PageHeader>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', backgroundColor: '#f7f7f7' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                        <TextField
                            placeholder="Rechercher par titre d'offre ou type de stage..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: '#999', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    backgroundColor: '#fff',
                                },
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer
                component={Paper}
                sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                            <StyledTableCell>Offre</StyledTableCell>
                            <StyledTableCell>Type</StyledTableCell>
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell>Progression</StyledTableCell>
                            <StyledTableCell>Statut</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredApplications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucune candidature trouvée
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Add />}
                                        onClick={handleDeposerCandidature}
                                        sx={{ mt: 2, borderRadius: '10px', textTransform: 'none' }}
                                    >
                                        Déposer une candidature
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredApplications.map((app) => {
                                const displayStatut = app.stageStatut || app.statut;
                                const progress = getProgression(displayStatut);
                                const type = getTypeStage(app);
                                return (
                                    <TableRow key={app._id || app.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {app.offreId?.titre || app.offre || 'Offre sans titre'}
                                            </Typography>
                                            {app.hasStage && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Stage associé
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <TypeChip
                                                label={type}
                                                type={type}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {app.dateSoumission || app.createdAt ? 
                                                    new Date(app.dateSoumission || app.createdAt).toLocaleDateString('fr-FR') : 
                                                    'Non spécifiée'
                                                }
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ minWidth: 120 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={progress}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            backgroundColor: '#e5e7eb',
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: getProgressColor(progress),
                                                                borderRadius: 3,
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                                <Typography variant="caption" fontWeight={500}>
                                                    {progress}%
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip
                                                label={getStatusLabel(displayStatut)}
                                                status={displayStatut}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Voir les détails">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/dashboard/application/${app._id || app.id}`)}
                                                    sx={{ color: '#148aa0' }}
                                                >
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default Applications;
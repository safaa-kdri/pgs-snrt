// src/components/supervisor/SupervisorInternshipDetail.jsx
// ✅ CORRECTION : Imports corrigés
// ✅ SUPPRESSION : SupervisorConvention (l'encadrant n'en a pas besoin)
// ✅ UTILISATION : Evaluation.jsx existant

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Button,
    Divider,
    Chip,
    Grid,
    Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Timeline,
    Description,
    Assessment,
    PictureAsPdf,
    Person,
    CalendarToday,
    Work,
    School,
    CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { getInternshipDetail, closeInternship } from '../../services/api';

// ✅ IMPORTS CORRIGÉS - Utilisation des fichiers existants
import SupervisorTimeline from './SupervisorTimeline';
// ❌ SUPPRIMÉ : import SupervisorConvention from './SupervisorConvention';
// ✅ UTILISATION DU FICHIER EXISTANT
import SupervisorLivrables from './SupervisorLivrables';
import Evaluation from './Evaluation';  // ✅ Fichier existant

// ============================================
// STYLES
// ============================================

const PageContainer = styled(Container)({
    paddingTop: '24px',
    paddingBottom: '32px',
});

const StyledPaper = styled(Paper)({
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    overflow: 'hidden',
});

const HeaderSection = styled(Box)({
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #eef1f3',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'EnCours': { bg: '#dbeafe', text: '#1d4ed8' },
        'Termine': { bg: '#d1fae5', text: '#065f46' },
        'Annule': { bg: '#fee2e2', text: '#991b1b' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
        'EnAttenteValidation': { bg: '#fef3c7', text: '#d97706' },
    };
    const color = colors[status] || colors['EnCours'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 600,
        fontSize: '12px',
        height: '28px',
    };
});

const StyledTabs = styled(Tabs)({
    borderBottom: '1px solid #eef1f3',
    padding: '0 16px',
    '& .MuiTabs-indicator': {
        backgroundColor: '#2d3748',
        height: '3px',
    },
});

const StyledTab = styled(Tab)({
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    minHeight: '48px',
    '&.Mui-selected': {
        color: '#2d3748',
    },
});

const TabContent = styled(Box)({
    padding: '24px 32px',
});

const InfoRow = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& .MuiSvgIcon-root': {
        fontSize: '18px',
        color: '#687480',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const SupervisorInternshipDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [internship, setInternship] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        fetchInternshipDetail();
    }, [id]);

    const fetchInternshipDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getInternshipDetail(id);
            if (data) {
                setInternship(data);
            } else {
                setError('Stage non trouvé');
            }
        } catch (error) {
            console.error('❌ Erreur chargement stage:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseInternship = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir clôturer ce stage ?')) return;
        setClosing(true);
        setError('');
        try {
            await closeInternship(id);
            setSuccess('✅ Stage clôturé avec succès !');
            await fetchInternshipDetail();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('❌ Erreur clôture:', error);
            setError(error.response?.data?.message || 'Erreur lors de la clôture');
        } finally {
            setClosing(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'EnCours': 'En cours',
            'Termine': 'Terminé',
            'Annule': 'Annulé',
            'Cloturee': 'Clôturé',
            'EnAttenteValidation': 'En attente validation',
        };
        return labels[status] || status;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const isActive = internship?.statut === 'EnCours';

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress size={44} sx={{ color: '#2d3748' }} />
                </Box>
            </Container>
        );
    }

    if (error || !internship) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: '10px' }}>
                    {error || 'Stage non trouvé'}
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/supervisor/stages')}
                    sx={{ mt: 2, textTransform: 'none' }}
                >
                    Retour à la liste
                </Button>
            </Container>
        );
    }

    // ✅ TABLES CORRIGÉES - Sans Convention
    const tabs = [
        { label: '📋 Suivi', value: 0, component: <SupervisorTimeline internshipId={id} user={user} /> },
        { label: '📎 Livrables', value: 1, component: <SupervisorLivrables internshipId={id} user={user} /> },
        { label: '⭐ Évaluation', value: 2, component: <Evaluation /> },
    ];

    const canClose = isActive && internship.livrables?.every(l => l.valide === true) && internship.evaluation;

    return (
        <PageContainer maxWidth="lg">
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/supervisor/stages')}
                    sx={{ textTransform: 'none', color: '#666' }}
                >
                    Retour à la liste
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <StyledPaper>
                {/* HEADER */}
                <HeaderSection>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a2332' }}>
                                {internship.sujetTitre || internship.offreId?.titre || 'Stage'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {internship.offreId?.departementId?.nom || 'Département'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <StatusChip label={getStatusLabel(internship.statut)} status={internship.statut} />
                            {canClose && (
                                <Button
                                    variant="contained"
                                    onClick={handleCloseInternship}
                                    disabled={closing}
                                    sx={{
                                        backgroundColor: '#22c55e',
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        '&:hover': { backgroundColor: '#16a34a' },
                                    }}
                                >
                                    {closing ? <CircularProgress size={20} color="inherit" /> : '🏁 Clôturer'}
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <InfoRow>
                                <Person />
                                <Typography variant="body2">
                                    Stagiaire : {internship.etudiantId?.prenom || ''} {internship.etudiantId?.nom || ''}
                                </Typography>
                            </InfoRow>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InfoRow>
                                <CalendarToday />
                                <Typography variant="body2">
                                    {formatDate(internship.dateDebut)} - {formatDate(internship.dateFin)}
                                </Typography>
                            </InfoRow>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InfoRow>
                                <School />
                                <Typography variant="body2">
                                    {internship.etudiantId?.universite || 'Université'}
                                </Typography>
                            </InfoRow>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <InfoRow>
                                <Work />
                                <Typography variant="body2">
                                    {internship.offreId?.typeStage || 'Stage'}
                                </Typography>
                            </InfoRow>
                        </Grid>
                    </Grid>
                </HeaderSection>

                {/* TABS */}
                <StyledTabs value={tabValue} onChange={handleTabChange}>
                    {tabs.map((tab) => (
                        <StyledTab key={tab.value} label={tab.label} />
                    ))}
                </StyledTabs>

                {/* CONTENT */}
                <TabContent>
                    {tabs[tabValue]?.component}
                </TabContent>
            </StyledPaper>
        </PageContainer>
    );
};

export default SupervisorInternshipDetail;
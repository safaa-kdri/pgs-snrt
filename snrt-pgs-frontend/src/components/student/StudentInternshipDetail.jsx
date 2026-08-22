// src/components/student/StudentInternshipDetail.jsx
// ✅ Page : Détail d'un stage avec tous les onglets
// ✅ Accès : /dashboard/stage/:id

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
    Avatar,
    Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Timeline,
    Description,
    Assessment,
    PictureAsPdf,
    School,
    Person,
    CalendarToday,
    Work,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { getInternshipDetail } from '../../services/api';
import StudentTimeline from './StudentTimeline';
import StudentConvention from './StudentConvention';
import StudentLivrables from './StudentLivrables';
import StudentEvaluation from './StudentEvaluation';

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
        backgroundColor: '#148aa0',
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
        color: '#148aa0',
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

const StudentInternshipDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [internship, setInternship] = useState(null);
    const [tabValue, setTabValue] = useState(0);

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

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress size={44} sx={{ color: '#148aa0' }} />
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
                    onClick={() => navigate('/dashboard/stages')}
                    sx={{ mt: 2, textTransform: 'none' }}
                >
                    Retour à mes stages
                </Button>
            </Container>
        );
    }

    const tabs = [
        { label: '📋 Suivi', value: 0, component: <StudentTimeline internshipId={id} user={user} /> },
        { label: '📄 Convention', value: 1, component: <StudentConvention internshipId={id} /> },
        { label: '📎 Livrables', value: 2, component: <StudentLivrables internshipId={id} user={user} /> },
        { label: '⭐ Évaluation', value: 3, component: <StudentEvaluation internshipId={id} /> },
    ];

    // Ajouter Attestation si stage clôturé
    if (internship.statut === 'Cloturee' || internship.statut === 'Termine') {
        tabs.push({
            label: '📜 Attestation',
            value: 4,
            component: (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <PictureAsPdf sx={{ fontSize: 48, color: '#ef4444', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Attestation de stage disponible
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Félicitations ! Votre attestation de stage est prête.
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: '#148aa0', textTransform: 'none' }}
                        onClick={() => {
                            // Fonction de téléchargement à implémenter
                            alert('Téléchargement de l\'attestation...');
                        }}
                    >
                        Télécharger mon attestation
                    </Button>
                </Box>
            ),
        });
    }

    return (
        <PageContainer maxWidth="lg">
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/dashboard/stages')}
                    sx={{ textTransform: 'none', color: '#666' }}
                >
                    Retour à mes stages
                </Button>
            </Box>

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
                        <StatusChip label={getStatusLabel(internship.statut)} status={internship.statut} />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <InfoRow>
                                <Person />
                                <Typography variant="body2">
                                    Encadrant : {internship.encadrantId?.prenom || ''} {internship.encadrantId?.nom || 'Non assigné'}
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
                                <Work />
                                <Typography variant="body2">
                                    {internship.offreId?.typeStage || 'Stage'}
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

export default StudentInternshipDetail;
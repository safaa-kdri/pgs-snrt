// src/components/admin/PeriodDetailPage.jsx
// ✅ VERSION AVEC BOUTON RETOUR STYLE RH (AU-DESSUS)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Edit,
    Delete,
    Event,
    CalendarToday,
    CheckCircle,
    Cancel,
    Archive,
    Restore,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
});

const HeaderLeft = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
});

const HeaderTitle = styled(Typography)({
    fontWeight: 700,
    fontSize: '24px',
    color: '#1a2332',
});

const HeaderSubtitle = styled(Typography)({
    color: '#687480',
    fontSize: '14px',
});

const StatusBadge = styled(Chip)(({ status }) => {
    const colors = {
        active: { bg: '#d1fae5', text: '#065f46' },
        inactive: { bg: '#fee2e2', text: '#991b1b' },
        upcoming: { bg: '#dbeafe', text: '#1d4ed8' },
        past: { bg: '#fef3c7', text: '#d97706' },
    };
    const color = colors[status] || colors.active;
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 600,
        fontSize: '12px',
        height: '26px',
    };
});

const ActionButton = styled(Button)({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 500,
    padding: '6px 16px',
    fontSize: '13px',
});

// ✅ BOUTON RETOUR STYLE RH - POSITIONNÉ AU-DESSUS
const BackButton = styled(Button)({
    textTransform: 'none',
    color: '#666',
    marginBottom: '16px', // Espacement avant le titre
    '&:hover': {
        backgroundColor: 'transparent',
        color: '#1a2332',
    },
});

const DetailCard = styled(Paper)({
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #eef1f3',
    marginBottom: '20px',
});

const SectionTitle = styled(Typography)({
    fontSize: '14px',
    fontWeight: 600,
    color: '#1a2332',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
});

const InfoRow = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid #f0f2f5',
    '&:last-child': {
        borderBottom: 'none',
    },
});

const InfoLabel = styled(Typography)({
    fontSize: '12px',
    color: '#9aa4ac',
    fontWeight: 500,
    textTransform: 'uppercase',
    minWidth: '180px',
});

const InfoValue = styled(Typography)({
    fontSize: '14px',
    color: '#1a2332',
    fontWeight: 500,
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const PeriodDetailPage = () => {
    const navigate = useNavigate();
    const periodId = window.location.pathname.split('/').pop();

    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPeriodDetail();
    }, [periodId]);

    const fetchPeriodDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/periods/${periodId}`);
            const data = response.data?.data || response.data;
            setPeriod(data);
        } catch (error) {
            console.error('Erreur chargement période:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement');
            setPeriod(null);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/periods');
    };

    const handleEdit = () => {
        navigate(`/admin/periods/edit/${periodId}`);
    };

    const handleToggleStatus = async () => {
        if (!period) return;
        const newStatus = period.actif ? false : true;
        const action = newStatus ? 'restaurer' : 'archiver';
        if (!window.confirm(`Voulez-vous vraiment ${action} cette période ?`)) return;

        try {
            await api.put(`/periods/${periodId}`, { actif: newStatus });
            setSuccess(newStatus ? 'Période restaurée avec succès' : 'Période archivée avec succès');
            fetchPeriodDetail();
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors du changement de statut');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Non défini';
        return format(new Date(dateStr), 'dd MMMM yyyy', { locale: fr });
    };

    const getStatusLabel = (periodData) => {
        if (!periodData) return 'Inconnu';
        const now = new Date();
        const debut = new Date(periodData.dateDebut);
        const fin = new Date(periodData.dateFin);

        if (!periodData.actif) return 'Inactif';
        if (now > fin) return 'Passé';
        if (now < debut) return 'À venir';
        return 'Actif';
    };

    const getStatusValue = (periodData) => {
        if (!periodData) return 'inactive';
        const now = new Date();
        const debut = new Date(periodData.dateDebut);
        const fin = new Date(periodData.dateFin);

        if (!periodData.actif) return 'inactive';
        if (now > fin) return 'past';
        if (now < debut) return 'upcoming';
        return 'active';
    };

    if (loading) {
        return (
            <PageContainer maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress size={44} sx={{ color: '#2d3748' }} />
                </Box>
            </PageContainer>
        );
    }

    if (!period) {
        return (
            <PageContainer maxWidth="xl">
                <Alert severity="error" sx={{ borderRadius: '8px' }}>
                    {error || 'Période non trouvée'}
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }}>
                    Retour à la liste
                </Button>
            </PageContainer>
        );
    }

    const isActive = period.actif !== false;
    const statusLabel = getStatusLabel(period);
    const statusValue = getStatusValue(period);

    return (
        <PageContainer maxWidth="xl">
            {/* ===== BOUTON RETOUR - AU-DESSUS DU TITRE (COMME RH) ===== */}
            <BackButton
                startIcon={<ArrowBack />}
                onClick={handleBack}
            >
                Retour à la liste
            </BackButton>

            {/* ===== EN-TÊTE ===== */}
            <HeaderSection>
                <HeaderLeft>
                    <HeaderTitle>{period.nom || 'Période sans nom'}</HeaderTitle>
                    <HeaderSubtitle>
                        Gestion des périodes de stage
                    </HeaderSubtitle>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <StatusBadge status={statusValue} label={statusLabel} />
                        <Chip 
                            label={isActive ? 'Actif' : 'Inactif'} 
                            size="small" 
                            sx={{ 
                                backgroundColor: isActive ? '#d1fae5' : '#fee2e2',
                                color: isActive ? '#065f46' : '#991b1b',
                            }} 
                        />
                    </Stack>
                </HeaderLeft>

            
            </HeaderSection>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{success}</Alert>}

            {/* ===== CONTENU ===== */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <DetailCard>
                        <SectionTitle>
                            <Event sx={{ fontSize: 18, color: '#148aa0' }} />
                            Informations générales
                        </SectionTitle>
                        <InfoRow>
                            <InfoLabel>Nom</InfoLabel>
                            <InfoValue>{period.nom}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>Statut</InfoLabel>
                            <InfoValue>
                                <StatusBadge status={statusValue} label={statusLabel} size="small" />
                            </InfoValue>
                        </InfoRow>
                    </DetailCard>
                </Grid>

                <Grid item xs={12} md={6}>
                    <DetailCard>
                        <SectionTitle>
                            <CalendarToday sx={{ fontSize: 18, color: '#f59e0b' }} />
                            Dates
                        </SectionTitle>
                        <InfoRow>
                            <InfoLabel>Date de début</InfoLabel>
                            <InfoValue>{formatDate(period.dateDebut)}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>Date de fin</InfoLabel>
                            <InfoValue>{formatDate(period.dateFin)}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>Ouverture candidatures</InfoLabel>
                            <InfoValue>{formatDate(period.dateOuvertureCandidatures)}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>Fermeture candidatures</InfoLabel>
                            <InfoValue>{formatDate(period.dateFermetureCandidatures)}</InfoValue>
                        </InfoRow>
                    </DetailCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default PeriodDetailPage;
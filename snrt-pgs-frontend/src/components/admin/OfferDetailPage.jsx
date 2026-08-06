// src/components/admin/OfferDetailPage.jsx
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
    Archive,
    Work,
    CalendarToday,
    People,
    Description,
    Business,
    CheckCircle,
    Cancel,
    Pending,
    School,
} from '@mui/icons-material';
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
        'Publiee': { bg: '#d1fae5', text: '#065f46' },
        'EnAttente': { bg: '#fef3c7', text: '#d97706' },
        'Brouillon': { bg: '#e0e7ff', text: '#4338ca' },
        'Archivee': { bg: '#f3f4f6', text: '#6b7280' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors['EnAttente'];
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
    minWidth: '120px',
});

const InfoValue = styled(Typography)({
    fontSize: '14px',
    color: '#1a2332',
    fontWeight: 500,
});

const SubjectCard = styled(Paper)({
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    border: '1px solid #eef1f3',
    '&:last-child': {
        marginBottom: 0,
    },
});

const CompetenceChip = styled(Chip)(({ niveau }) => {
    const colors = {
        'Débutant': { bg: '#e5e7eb', text: '#6b7280' },
        'Intermédiaire': { bg: '#fef3c7', text: '#d97706' },
        'Avancé': { bg: '#dbeafe', text: '#1d4ed8' },
        'Expert': { bg: '#d1fae5', text: '#065f46' },
    };
    const color = colors[niveau] || colors['Débutant'];
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

const OfferDetailPage = () => {
    const navigate = useNavigate();
    const offerId = window.location.pathname.split('/').pop();

    const [loading, setLoading] = useState(true);
    const [offer, setOffer] = useState(null);
    const [departements, setDepartements] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchOfferDetail();
        fetchDepartements();
    }, [offerId]);

    const fetchDepartements = async () => {
        try {
            const response = await api.get('/departments');
            const data = response.data?.data || response.data || [];
            const map = {};
            data.forEach(d => {
                map[d._id || d.id] = d.nom;
            });
            setDepartements(map);
        } catch (error) {
            console.error('Erreur chargement départements:', error);
        }
    };

    const fetchOfferDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/offers/${offerId}`);
            const data = response.data?.offer || response.data?.data || response.data;
            setOffer(data);
        } catch (error) {
            console.error('Erreur chargement offre:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement');
            setOffer(null);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/offres');
    };

    const handleEdit = () => {
        navigate(`/admin/offres/edit/${offerId}`);
    };

    const handleDelete = async () => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette offre ?')) return;
        try {
            await api.delete(`/offers/${offerId}`);
            setSuccess('Offre supprimée avec succès');
            setTimeout(() => navigate('/admin/offres'), 1500);
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const handleArchive = async () => {
        if (!window.confirm('Voulez-vous vraiment archiver cette offre ?')) return;
        try {
            await api.put(`/offers/${offerId}/archive`);
            setSuccess('Offre archivée avec succès');
            fetchOfferDetail();
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de l\'archivage');
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'Brouillon': 'Brouillon',
            'EnAttente': 'En attente',
            'Publiee': 'Publiée',
            'Archivee': 'Archivée',
            'Refusee': 'Refusée',
        };
        return labels[status] || status;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Non défini';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Publiee': return <CheckCircle sx={{ fontSize: 16, color: '#065f46' }} />;
            case 'EnAttente': return <Pending sx={{ fontSize: 16, color: '#d97706' }} />;
            case 'Brouillon': return <Edit sx={{ fontSize: 16, color: '#4338ca' }} />;
            case 'Archivee': return <Archive sx={{ fontSize: 16, color: '#6b7280' }} />;
            case 'Refusee': return <Cancel sx={{ fontSize: 16, color: '#991b1b' }} />;
            default: return <Pending sx={{ fontSize: 16, color: '#d97706' }} />;
        }
    };

    const getDepartementNom = () => {
        if (!offer) return '-';
        const deptId = offer.departementId;
        if (typeof deptId === 'object' && deptId?.nom) return deptId.nom;
        if (departements[deptId]) return departements[deptId];
        return offer.departement || '-';
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

    if (!offer) {
        return (
            <PageContainer maxWidth="xl">
                <Alert severity="error" sx={{ borderRadius: '8px' }}>
                    {error || 'Offre non trouvée'}
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }}>
                    Retour à la liste
                </Button>
            </PageContainer>
        );
    }

    const canEdit = offer.statut === 'Brouillon' || offer.statut === 'Refusee';
    const canDelete = offer.statut === 'Brouillon';
    const canArchive = offer.statut === 'Publiee' || offer.statut === 'EnAttente';

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
                    <HeaderTitle>{offer.titre || 'Offre sans titre'}</HeaderTitle>
                    <HeaderSubtitle>
                        {getDepartementNom()} • {offer.typeStage || 'Stage'}
                    </HeaderSubtitle>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <StatusBadge status={offer.statut} label={getStatusLabel(offer.statut)} />
                        <Chip label={`${offer.nbPostes || 0} poste(s)`} size="small" />
                        {/* ✅ Icône de statut à droite sans cadre */}
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                            {getStatusIcon(offer.statut)}
                        </Box>
                    </Stack>
                </HeaderLeft>

                {/* ===== BOUTONS D'ACTION - À DROITE ===== */}
                <Stack direction="row" spacing={1}>
                    {canEdit && (
                        <ActionButton variant="outlined" startIcon={<Edit />} onClick={handleEdit}>
                            Modifier
                        </ActionButton>
                    )}
                    {canArchive && (
                        <ActionButton variant="outlined" startIcon={<Archive />} onClick={handleArchive}>
                            Archiver
                        </ActionButton>
                    )}
                    {canDelete && (
                        <ActionButton variant="outlined" startIcon={<Delete />} onClick={handleDelete} color="error">
                            Supprimer
                        </ActionButton>
                    )}
                </Stack>
            </HeaderSection>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{success}</Alert>}

            {/* ===== CONTENU ===== */}
            <Grid container spacing={3}>
                {/* ===== COLONNE GAUCHE ===== */}
                <Grid item xs={12} md={4}>
                    <DetailCard>
                        <SectionTitle>
                            <Business sx={{ fontSize: 18, color: '#148aa0' }} />
                            Informations
                        </SectionTitle>
                        <InfoRow>
                            <InfoLabel>Postes</InfoLabel>
                            <InfoValue>{offer.nbPostes || 0}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>Type</InfoLabel>
                            <InfoValue>{offer.typeStage || '-'}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>Début</InfoLabel>
                            <InfoValue>{formatDate(offer.dateDebut)}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>Fin</InfoLabel>
                            <InfoValue>{formatDate(offer.dateFin)}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>Date limite</InfoLabel>
                            <InfoValue>{formatDate(offer.dateLimiteCandidature)}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                            <InfoLabel>Département</InfoLabel>
                            <InfoValue>{getDepartementNom()}</InfoValue>
                        </InfoRow>
                        {offer.motifRefus && (
                            <InfoRow>
                                <InfoLabel>Motif refus</InfoLabel>
                                <InfoValue sx={{ color: '#ef4444' }}>{offer.motifRefus}</InfoValue>
                            </InfoRow>
                        )}
                    </DetailCard>
                </Grid>

                {/* ===== COLONNE DROITE ===== */}
                <Grid item xs={12} md={8}>
                    {/* Description */}
                    <DetailCard>
                        <SectionTitle>
                            <Description sx={{ fontSize: 18, color: '#8b5cf6' }} />
                            Description
                        </SectionTitle>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#4a5568' }}>
                            {offer.description || 'Aucune description'}
                        </Typography>
                    </DetailCard>

                    {/* Sujets */}
                    {offer.sujets && offer.sujets.length > 0 && (
                        <DetailCard>
                            <SectionTitle>
                                <Work sx={{ fontSize: 18, color: '#f59e0b' }} />
                                Sujets ({offer.sujets.length})
                            </SectionTitle>
                            {offer.sujets.map((sujet, idx) => (
                                <SubjectCard key={idx}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                                        {sujet.titre || `Sujet ${idx + 1}`}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {sujet.description || 'Aucune description'}
                                    </Typography>
                                    {sujet.missions && sujet.missions.length > 0 && (
                                        <Box component="ul" sx={{ pl: 2, m: 0, mb: 1 }}>
                                            {sujet.missions.map((m, i) => (
                                                <Typography component="li" key={i} variant="body2" color="text.secondary">
                                                    {m}
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}
                                    {sujet.profilRecherche && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            <strong>Profil :</strong> {sujet.profilRecherche}
                                        </Typography>
                                    )}
                                    {sujet.competences && sujet.competences.length > 0 && (
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                                            {sujet.competences.map((comp, i) => (
                                                <CompetenceChip
                                                    key={i}
                                                    label={`${comp.nom} - ${comp.niveau}`}
                                                    niveau={comp.niveau}
                                                    size="small"
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </SubjectCard>
                            ))}
                        </DetailCard>
                    )}
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default OfferDetailPage;
// src/components/department/OfferDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Chip,
    Button,
    Avatar,
    Divider,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    ArrowBack,
    Edit,
    Delete,
    Send,
    Work,
    School,
    CalendarToday,
    People,
    Description,
    CheckCircle,
    Pending,
    Cancel,
    Visibility,
    Business,
    Person,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================
// STYLES - MODERNES ET PROFESSIONNELS
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

const SectionIcon = styled(Box)(({ color }) => ({
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: alpha(color || '#148aa0', 0.12),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color || '#148aa0',
    fontSize: '16px',
}));

const StatusBadge = styled(Chip)(({ status }) => {
    const colors = {
        'Brouillon': { bg: '#e5e7eb', text: '#6b7280' },
        'EnAttente': { bg: '#fef3c7', text: '#d97706' },
        'Publiee': { bg: '#d1fae5', text: '#065f46' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
        'Archivee': { bg: '#f3f4f6', text: '#6b7280' },
    };
    const color = colors[status] || colors['Brouillon'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 600,
        fontSize: '12px',
        height: '26px',
        borderRadius: '20px',
    };
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

const InfoIcon = styled(Box)(({ color }) => ({
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: alpha(color || '#148aa0', 0.08),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color || '#148aa0',
    flexShrink: 0,
}));

const InfoLabel = styled(Typography)({
    fontSize: '12px',
    color: '#9aa4ac',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    minWidth: '100px',
});

const InfoValue = styled(Typography)({
    fontSize: '14px',
    color: '#1a2332',
    fontWeight: 500,
});

const ActionButton = styled(Button)({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 500,
    padding: '6px 16px',
    fontSize: '13px',
});

const BackButton = styled(Button)({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 500,
    padding: '6px 16px',
    fontSize: '13px',
    backgroundColor: '#2d3748',
    color: '#ffffff',
    '&:hover': {
        backgroundColor: '#1a2332',
    },
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

const OfferDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [offer, setOffer] = useState(null);
    const [departements, setDepartements] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    useEffect(() => {
        if (id) {
            fetchOfferDetail();
            fetchDepartements();
        }
    }, [id]);

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
            const response = await api.get(`/offers/${id}`);
            let data = response.data?.offer || response.data?.data || response.data;
            
            if (!data) {
                throw new Error('Offre non trouvée');
            }

            setOffer({
                ...data,
                _id: data._id || data.id || id,
                statut: data.statut || 'Brouillon',
                sujets: data.sujets || [],
            });
        } catch (error) {
            console.error('Erreur chargement offre:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement de l\'offre');
            setOffer(null);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // ACTIONS
    // ============================================

    const handleEdit = () => {
        navigate(`/department/offer/edit/${offer._id || offer.id}`);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            await api.put(`/offers/${offer._id || offer.id}/submit`);
            setSuccess('Offre soumise pour validation');
            fetchOfferDetail();
        } catch (error) {
            console.error('Erreur soumission:', error);
            setError(error.response?.data?.message || 'Erreur lors de la soumission');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = () => {
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        setSubmitting(true);
        setError('');
        try {
            await api.delete(`/offers/${offer._id || offer.id}`);
            setSuccess('Offre supprimée avec succès');
            setOpenDeleteDialog(false);
            setTimeout(() => {
                navigate('/department/my-offers');
            }, 1000);
        } catch (error) {
            console.error('Erreur suppression:', error);
            setError(error.response?.data?.message || 'Erreur lors de la suppression');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    };

    const handleViewCandidatures = () => {
        navigate(`/department/candidatures?offreId=${offer._id || offer.id}`);
    };

    // ============================================
    // UTILITAIRES
    // ============================================

    const getStatusLabel = (status) => {
        const labels = {
            'Brouillon': 'Brouillon',
            'EnAttente': 'En attente',
            'Publiee': 'Publiée',
            'Refusee': 'Refusée',
            'Archivee': 'Archivée',
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

    const getInitials = (nom, prenom) => {
        if (!nom && !prenom) return '?';
        return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase() || '?';
    };

    const getDepartementNom = () => {
        if (!offer) return '-';
        const deptId = offer.departementId;
        if (typeof deptId === 'object' && deptId?.nom) return deptId.nom;
        if (departements[deptId]) return departements[deptId];
        return offer.departement || '-';
    };

    const canEdit = () => {
        return offer?.statut === 'Brouillon' || offer?.statut === 'Refusee';
    };

    const canSubmit = () => {
        return offer?.statut === 'Brouillon';
    };

    const canDelete = () => {
        return offer?.statut === 'Brouillon' || offer?.statut === 'Refusee';
    };

    if (loading) {
        return (
            <PageContainer maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={44} sx={{ color: '#2d3748' }} />
                </Box>
            </PageContainer>
        );
    }

    if (!offer) {
        return (
            <PageContainer maxWidth="lg">
                <Alert severity="error" sx={{ borderRadius: '8px' }}>
                    {error || 'Offre non trouvée'}
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/department/my-offers')} sx={{ mt: 2 }}>
                    Retour à la liste
                </Button>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="lg">
            {/* ===== EN-TÊTE ===== */}
            <HeaderSection>
                <HeaderLeft>
                    <HeaderTitle>{offer.titre || 'Offre sans titre'}</HeaderTitle>
                    <HeaderSubtitle>
                        {getDepartementNom()} • {offer.typeStage || 'Stage'}
                    </HeaderSubtitle>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <StatusBadge label={getStatusLabel(offer.statut)} status={offer.statut} />
                        <Chip 
                            label={`${offer.nbPostes || 0} poste(s)`} 
                            size="small" 
                            sx={{ backgroundColor: '#e0e7ff', color: '#4338ca' }} 
                        />
                        <Chip 
                            label={`${offer.candidaturesCount || offer.nbCandidatures || 0} candidature(s)`} 
                            size="small" 
                            sx={{ backgroundColor: '#f3e8ff', color: '#6b21a8' }} 
                        />
                    </Stack>
                </HeaderLeft>

                <Stack direction="row" spacing={1}>
                    {canEdit() && (
                        <ActionButton
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={handleEdit}
                            sx={{ borderColor: '#4f46e5', color: '#4f46e5' }}
                        >
                            Modifier
                        </ActionButton>
                    )}
                    {canSubmit() && (
                        <ActionButton
                            variant="outlined"
                            startIcon={<Send />}
                            onClick={handleSubmit}
                            disabled={submitting}
                            sx={{ borderColor: '#22c55e', color: '#22c55e' }}
                        >
                            {submitting ? <CircularProgress size={16} /> : 'Soumettre'}
                        </ActionButton>
                    )}
                    {offer.statut === 'EnAttente' && (
                        <ActionButton variant="outlined" startIcon={<Pending />} disabled>
                            En attente
                        </ActionButton>
                    )}
                    {offer.statut === 'Publiee' && (
                        <ActionButton
                            variant="contained"
                            startIcon={<Visibility />}
                            onClick={handleViewCandidatures}
                            sx={{ backgroundColor: '#148aa0', '&:hover': { backgroundColor: '#0b7890' } }}
                        >
                            Candidatures
                        </ActionButton>
                    )}
                    {canDelete() && (
                        <ActionButton
                            variant="outlined"
                            startIcon={<Delete />}
                            onClick={handleDelete}
                            sx={{ borderColor: '#ef4444', color: '#ef4444' }}
                        >
                            Supprimer
                        </ActionButton>
                    )}
                    <BackButton startIcon={<ArrowBack />} onClick={() => navigate('/department/my-offers')}>
                        Retour
                    </BackButton>
                </Stack>
            </HeaderSection>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{success}</Alert>}

            {/* ===== CONTENU PRINCIPAL ===== */}
            <Grid container spacing={3}>
                {/* ===== COLONNE GAUCHE ===== */}
                <Grid item xs={12} md={4}>
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#148aa0">
                                <Work sx={{ fontSize: 16 }} />
                            </SectionIcon>
                            Informations
                        </SectionTitle>
                        <InfoRow>
                            <InfoIcon color="#4f46e5">
                                <People sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Postes</InfoLabel>
                                <InfoValue>{offer.nbPostes || 0}</InfoValue>
                            </Box>
                        </InfoRow>
                        <InfoRow>
                            <InfoIcon color="#8b5cf6">
                                <School sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Type</InfoLabel>
                                <InfoValue>{offer.typeStage || '-'}</InfoValue>
                            </Box>
                        </InfoRow>
                        <InfoRow>
                            <InfoIcon color="#f59e0b">
                                <CalendarToday sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Début</InfoLabel>
                                <InfoValue>{formatDate(offer.dateDebut)}</InfoValue>
                            </Box>
                        </InfoRow>
                        <InfoRow>
                            <InfoIcon color="#f59e0b">
                                <CalendarToday sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Fin</InfoLabel>
                                <InfoValue>{formatDate(offer.dateFin)}</InfoValue>
                            </Box>
                        </InfoRow>
                        <InfoRow>
                            <InfoIcon color="#d97706">
                                <Pending sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Date limite</InfoLabel>
                                <InfoValue>{formatDate(offer.dateLimiteCandidature)}</InfoValue>
                            </Box>
                        </InfoRow>
                        <InfoRow>
                            <InfoIcon color="#148aa0">
                                <Business sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Département</InfoLabel>
                                <InfoValue>{getDepartementNom()}</InfoValue>
                            </Box>
                        </InfoRow>
                        {offer.motifRefus && (
                            <InfoRow>
                                <InfoIcon color="#ef4444">
                                    <Cancel sx={{ fontSize: 16 }} />
                                </InfoIcon>
                                <Box>
                                    <InfoLabel>Motif refus</InfoLabel>
                                    <InfoValue sx={{ color: '#ef4444' }}>{offer.motifRefus}</InfoValue>
                                </Box>
                            </InfoRow>
                        )}
                    </DetailCard>

                    {/* Responsables */}
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#4f46e5">
                                <Person sx={{ fontSize: 16 }} />
                            </SectionIcon>
                            Responsables
                        </SectionTitle>
                        <InfoRow>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4f46e5', fontSize: 14, color: '#fff' }}>
                                {getInitials(offer.createurId?.nom || offer.createurNom, offer.createurId?.prenom || offer.createurPrenom)}
                            </Avatar>
                            <Box>
                                <InfoLabel>Créé par</InfoLabel>
                                <InfoValue>
                                    {offer.createurId?.prenom || offer.createurPrenom || ''} {offer.createurId?.nom || offer.createurNom || ''}
                                </InfoValue>
                            </Box>
                        </InfoRow>
                        {offer.validateurId && (
                            <InfoRow>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#22c55e', fontSize: 14, color: '#fff' }}>
                                    {getInitials(offer.validateurId?.nom, offer.validateurId?.prenom)}
                                </Avatar>
                                <Box>
                                    <InfoLabel>Validé par</InfoLabel>
                                    <InfoValue>
                                        {offer.validateurId?.prenom || ''} {offer.validateurId?.nom || ''}
                                    </InfoValue>
                                </Box>
                            </InfoRow>
                        )}
                    </DetailCard>
                </Grid>

                {/* ===== COLONNE DROITE ===== */}
                <Grid item xs={12} md={8}>
                    {/* Description */}
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#8b5cf6">
                                <Description sx={{ fontSize: 16 }} />
                            </SectionIcon>
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
                                <SectionIcon color="#f59e0b">
                                    <Work sx={{ fontSize: 16 }} />
                                </SectionIcon>
                                Sujets ({offer.sujets.length})
                            </SectionTitle>
                            {offer.sujets.map((sujet, idx) => (
                                <SubjectCard key={idx}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, color: '#1a2332' }}>
                                        {sujet.titre || `Sujet ${idx + 1}`}
                                    </Typography>
                                    <Typography variant="body2" color="#4a5568" sx={{ mb: 1 }}>
                                        {sujet.description || 'Aucune description'}
                                    </Typography>
                                    
                                    {sujet.missions && sujet.missions.length > 0 && (
                                        <>
                                            <Typography variant="caption" fontWeight={600} color="#1a2332" sx={{ display: 'block', mb: 0.5 }}>
                                                Missions :
                                            </Typography>
                                            <Box component="ul" sx={{ pl: 2, m: 0, mb: 1 }}>
                                                {sujet.missions.map((mission, i) => (
                                                    <Typography component="li" key={i} variant="body2" color="#4a5568" sx={{ mb: 0.5 }}>
                                                        {mission}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </>
                                    )}
                                    
                                    {sujet.profilRecherche && (
                                        <>
                                            <Typography variant="caption" fontWeight={600} color="#1a2332" sx={{ display: 'block', mb: 0.5 }}>
                                                Profil recherché :
                                            </Typography>
                                            <Typography variant="body2" color="#4a5568" sx={{ mb: 1 }}>
                                                {sujet.profilRecherche}
                                            </Typography>
                                        </>
                                    )}
                                    
                                    {sujet.competences && sujet.competences.length > 0 && (
                                        <>
                                            <Typography variant="caption" fontWeight={600} color="#1a2332" sx={{ display: 'block', mb: 0.5 }}>
                                                Compétences :
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {sujet.competences.map((comp, i) => (
                                                    <CompetenceChip
                                                        key={i}
                                                        label={`${comp.nom} - ${comp.niveau}`}
                                                        niveau={comp.niveau}
                                                        size="small"
                                                    />
                                                ))}
                                            </Box>
                                        </>
                                    )}
                                </SubjectCard>
                            ))}
                        </DetailCard>
                    )}
                </Grid>
            </Grid>

            {/* ===== DIALOG DE CONFIRMATION SUPPRESSION ===== */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '12px', padding: '8px' },
                }}
            >
                <DialogTitle>Supprimer l'offre</DialogTitle>
                <DialogContent>
                    <Typography>
                        Êtes-vous sûr de vouloir supprimer l'offre{' '}
                        <strong>{offer?.titre}</strong> ?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Cette action est irréversible.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} disabled={submitting}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmDelete}
                        disabled={submitting}
                        sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default OfferDetail;
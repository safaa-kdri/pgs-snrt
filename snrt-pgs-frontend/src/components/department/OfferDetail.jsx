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
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Edit,
    Delete,
    Send,
    Work,
    School,
    LocationOn,
    CalendarToday,
    People,
    Description,
    CheckCircle,
    Pending,
    Cancel,
    Visibility,
    Download,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// ============================================
// STYLES
// ============================================

const DetailCard = styled(Paper)({
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    marginBottom: '24px',
});

const SectionTitle = styled(Typography)({
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a2332',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        brouillon: { bg: '#e5e7eb', text: '#6b7280' },
        en_attente: { bg: '#fef3c7', text: '#d97706' },
        publiee: { bg: '#d1fae5', text: '#065f46' },
        refuse: { bg: '#fee2e2', text: '#991b1b' },
        archive: { bg: '#e0e7ff', text: '#4338ca' },
    };
    const color = colors[status] || colors.brouillon;
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 600,
        fontSize: '13px',
        height: '32px',
        padding: '0 16px',
    };
});

const InfoItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    '& .MuiSvgIcon-root': {
        color: '#148aa0',
        fontSize: '20px',
    },
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
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOfferDetail();
    }, [id]);

    const fetchOfferDetail = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockOffer = {
                id: id || '1',
                titre: 'Stage Développement Web',
                description: 'Développement d\'applications web avec React et Node.js. Le stagiaire participera à l\'ensemble du cycle de développement : analyse des besoins, conception, développement, tests et déploiement.',
                typeStage: 'PFE',
                nbPostes: 2,
                statut: 'publiee',
                datePublication: '2026-06-01',
                dateDebut: '2026-06-15',
                dateFin: '2026-09-15',
                dateLimiteCandidature: '2026-07-15',
                departement: 'DSI',
                createur: 'Fatima ALAOUI',
                validateur: 'Karim BENNANI',
                candidatures: 12,
                sujets: [
                    {
                        titre: 'Développement d\'une application de gestion',
                        description: 'Créer une application web fullstack pour la gestion des projets',
                        missions: [
                            'Analyse des besoins fonctionnels',
                            'Développement frontend avec React',
                            'Développement backend avec Node.js',
                            'Mise en place des tests unitaires',
                            'Documentation technique',
                        ],
                        profilRecherche: 'Étudiant en Master informatique avec connaissances en JavaScript',
                        competences: [
                            { nom: 'JavaScript', niveau: 'Avancé' },
                            { nom: 'React', niveau: 'Avancé' },
                            { nom: 'Node.js', niveau: 'Intermédiaire' },
                            { nom: 'MongoDB', niveau: 'Intermédiaire' },
                        ],
                    },
                ],
                documentsRequis: [
                    { type: 'CV', obligatoire: true },
                    { type: 'Lettre de motivation', obligatoire: true },
                    { type: 'Relevé de notes', obligatoire: false },
                ],
            };

            setOffer(mockOffer);

        } catch (error) {
            console.error('Erreur chargement offre:', error);
            setError('Erreur lors du chargement de l\'offre');
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            brouillon: 'Brouillon',
            en_attente: 'En attente',
            publiee: 'Publiée',
            refuse: 'Refusée',
            archive: 'Archivée',
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

    const handleEdit = () => {
        navigate(`/department/edit-offer/${offer.id}`);
    };

    const handleSubmit = () => {
        setOffer({ ...offer, statut: 'en_attente' });
        setSuccess('✅ Offre soumise pour validation');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleDelete = () => {
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        setOpenDeleteDialog(false);
        navigate('/department/my-offers');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    if (!offer) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    Offre non trouvée
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/department/my-offers')}
                    sx={{ mt: 2 }}
                >
                    Retour à la liste
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/department/my-offers')}
                    sx={{ mb: 2, textTransform: 'none', color: '#666' }}
                >
                    Retour à la liste
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                            📋 {offer.titre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {offer.departement} - {offer.typeStage}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <StatusChip label={getStatusLabel(offer.statut)} status={offer.statut} />
                            <Chip label={`${offer.candidatures} candidatures`} size="small" sx={{ backgroundColor: '#e0e7ff', color: '#4338ca' }} />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {(offer.statut === 'brouillon' || offer.statut === 'refuse') && (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<Edit />}
                                    onClick={handleEdit}
                                    sx={{ borderRadius: '12px', textTransform: 'none' }}
                                >
                                    Modifier
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Send />}
                                    onClick={handleSubmit}
                                    sx={{ borderRadius: '12px', textTransform: 'none', borderColor: '#22c55e', color: '#22c55e' }}
                                >
                                    Soumettre
                                </Button>
                            </>
                        )}
                        {offer.statut === 'en_attente' && (
                            <Button
                                variant="outlined"
                                startIcon={<Pending />}
                                disabled
                                sx={{ borderRadius: '12px', textTransform: 'none' }}
                            >
                                En attente de validation
                            </Button>
                        )}
                        {(offer.statut === 'brouillon' || offer.statut === 'refuse') && (
                            <Button
                                variant="outlined"
                                startIcon={<Delete />}
                                onClick={handleDelete}
                                sx={{ borderRadius: '12px', textTransform: 'none', borderColor: '#ef4444', color: '#ef4444' }}
                            >
                                Supprimer
                            </Button>
                        )}
                        {offer.statut === 'publiee' && (
                            <Button
                                variant="contained"
                                startIcon={<Visibility />}
                                sx={{ backgroundColor: '#148aa0', borderRadius: '12px', textTransform: 'none' }}
                            >
                                Voir les candidatures
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

            <Grid container spacing={3}>
                {/* ===== GAUCHE ===== */}
                <Grid item xs={12} md={4}>
                    <DetailCard>
                        <SectionTitle>
                            <Work sx={{ color: '#148aa0' }} />
                            Informations générales
                        </SectionTitle>
                        <InfoItem>
                            <People />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Nombre de postes
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {offer.nbPostes}
                                </Typography>
                            </Box>
                        </InfoItem>
                        <InfoItem>
                            <CalendarToday />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Période
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {formatDate(offer.dateDebut)} - {formatDate(offer.dateFin)}
                                </Typography>
                            </Box>
                        </InfoItem>
                        <InfoItem>
                            <School />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Type de stage
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {offer.typeStage}
                                </Typography>
                            </Box>
                        </InfoItem>
                        <InfoItem>
                            <Pending />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Date limite de candidature
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {formatDate(offer.dateLimiteCandidature)}
                                </Typography>
                            </Box>
                        </InfoItem>
                    </DetailCard>

                    <DetailCard>
                        <SectionTitle>
                            <Person sx={{ color: '#4f46e5' }} />
                            Responsables
                        </SectionTitle>
                        <InfoItem>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4f46e5', fontSize: 14, color: '#fff' }}>
                                FA
                            </Avatar>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Créé par
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {offer.createur}
                                </Typography>
                            </Box>
                        </InfoItem>
                        {offer.validateur && (
                            <InfoItem>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#22c55e', fontSize: 14, color: '#fff' }}>
                                    KB
                                </Avatar>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Validé par
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {offer.validateur}
                                    </Typography>
                                </Box>
                            </InfoItem>
                        )}
                    </DetailCard>
                </Grid>

                {/* ===== DROITE ===== */}
                <Grid item xs={12} md={8}>
                    <DetailCard>
                        <SectionTitle>
                            <Description sx={{ color: '#8b5cf6' }} />
                            Description
                        </SectionTitle>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {offer.description}
                        </Typography>
                    </DetailCard>

                    <DetailCard>
                        <SectionTitle>
                            <Work sx={{ color: '#f59e0b' }} />
                            Sujets de stage
                        </SectionTitle>
                        {offer.sujets.map((sujet, idx) => (
                            <Card key={idx} sx={{ mb: 2, borderRadius: '12px', backgroundColor: '#f7f7f7' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                                        {sujet.titre}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {sujet.description}
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                        Missions :
                                    </Typography>
                                    <List dense>
                                        {sujet.missions.map((mission, i) => (
                                            <ListItem key={i} sx={{ py: 0.5 }}>
                                                <ListItemIcon sx={{ minWidth: 24 }}>
                                                    <CheckCircle sx={{ color: '#22c55e', fontSize: 14 }} />
                                                </ListItemIcon>
                                                <ListItemText primary={mission} primaryTypographyProps={{ variant: 'body2' }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                                        Profil recherché :
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {sujet.profilRecherche}
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                        Compétences :
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {sujet.competences.map((comp, i) => (
                                            <Chip
                                                key={i}
                                                label={`${comp.nom} - ${comp.niveau}`}
                                                size="small"
                                                sx={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
                                            />
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </DetailCard>

                    <DetailCard>
                        <SectionTitle>
                            <Description sx={{ color: '#22c55e' }} />
                            Documents requis
                        </SectionTitle>
                        <List dense>
                            {offer.documentsRequis.map((doc, idx) => (
                                <ListItem key={idx}>
                                    <ListItemIcon>
                                        {doc.obligatoire ? (
                                            <CheckCircle sx={{ color: '#22c55e', fontSize: 18 }} />
                                        ) : (
                                            <Pending sx={{ color: '#f59e0b', fontSize: 18 }} />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={doc.type}
                                        secondary={doc.obligatoire ? 'Obligatoire' : 'Optionnel'}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </DetailCard>
                </Grid>
            </Grid>

            {/* ===== DIALOG DE CONFIRMATION ===== */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle>🗑️ Supprimer l'offre</DialogTitle>
                <DialogContent>
                    <Typography>
                        Êtes-vous sûr de vouloir supprimer l'offre{' '}
                        <strong>{offer.titre}</strong> ?
                        Cette action est irréversible.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmDelete}
                        sx={{
                            backgroundColor: '#ef4444',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#dc2626' },
                        }}
                    >
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default OfferDetail;
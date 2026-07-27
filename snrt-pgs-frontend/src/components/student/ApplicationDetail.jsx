// src/components/rh/ApplicationDetail.jsx
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
    TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Person,
    Email,
    Phone,
    School,
    Work,
    Description,
    CheckCircle,
    Pending,
    Cancel,
    Download,
    Visibility,
    Event,
    Message,
    ThumbUp,
    ThumbDown,
    Assignment,
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
        soumise: { bg: '#dbeafe', text: '#1d4ed8' },
        en_analyse: { bg: '#fef3c7', text: '#d97706' },
        entretien: { bg: '#f3e8ff', text: '#6b21a8' },
        acceptee: { bg: '#d1fae5', text: '#065f46' },
        refuse: { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors.soumise;
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

const ApplicationDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState('');
    const [comment, setComment] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApplicationDetail();
    }, [id]);

    const fetchApplicationDetail = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockApplication = {
                id: id || '1',
                candidat: {
                    nom: 'Youssef EL HASSANI',
                    email: 'youssef@test.ma',
                    telephone: '0612345987',
                    cin: 'AB123456',
                    universite: 'Université Mohammed V',
                    filiere: 'Informatique',
                    niveau: 'Master 2',
                },
                offre: 'Stage Développement Web',
                departement: 'DSI',
                typeStage: 'PFE',
                dateSoumission: '2026-07-15',
                statut: 'en_analyse',
                documents: [
                    { nom: 'CV_Youssef_EL_HASSANI.pdf', type: 'CV', valide: true },
                    { nom: 'Lettre_motivation.pdf', type: 'Lettre de motivation', valide: true },
                    { nom: 'Releve_notes_Master1.pdf', type: 'Relevé de notes', valide: false },
                ],
                competences: [
                    { nom: 'JavaScript', niveau: 'Avancé' },
                    { nom: 'React', niveau: 'Avancé' },
                    { nom: 'Node.js', niveau: 'Intermédiaire' },
                ],
                historique: [
                    { date: '2026-07-15 14:30', action: 'Candidature soumise', commentaire: 'Candidature envoyée avec succès' },
                    { date: '2026-07-16 09:00', action: 'Candidature en analyse', commentaire: 'Début de l\'analyse par le service RH' },
                ],
                remarques: [],
            };

            setApplication(mockApplication);

        } catch (error) {
            console.error('Erreur chargement candidature:', error);
            setError('Erreur lors du chargement de la candidature');
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            soumise: 'Soumise',
            en_analyse: 'En analyse',
            entretien: 'Entretien',
            acceptee: 'Acceptée',
            refuse: 'Refusée',
        };
        return labels[status] || status;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Non défini';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleOpenDialog = (action) => {
        setDialogAction(action);
        setComment('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setComment('');
    };

    const handleConfirmAction = () => {
        if (dialogAction === 'accepter') {
            setApplication({ ...application, statut: 'acceptee' });
            setSuccess('✅ Candidature acceptée avec succès !');
        } else if (dialogAction === 'refuser') {
            setApplication({ ...application, statut: 'refuse' });
            setSuccess('❌ Candidature refusée');
        } else if (dialogAction === 'entretien') {
            setApplication({ ...application, statut: 'entretien' });
            setSuccess('📅 Entretien programmé');
        }
        setOpenDialog(false);
        setTimeout(() => setSuccess(''), 3000);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    if (!application) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    Candidature non trouvée
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/rh/applications')}
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
                    onClick={() => navigate('/rh/applications')}
                    sx={{ mb: 2, textTransform: 'none', color: '#666' }}
                >
                    Retour à la liste
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                backgroundColor: '#148aa0',
                                fontSize: 32,
                                fontWeight: 700,
                                color: '#fff',
                            }}
                        >
                            {application.candidat.nom.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                                {application.candidat.nom}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {application.offre} - {application.departement}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <StatusChip label={getStatusLabel(application.statut)} status={application.statut} />
                                <Chip label={application.typeStage} size="small" sx={{ backgroundColor: '#e0e7ff', color: '#4338ca' }} />
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {application.statut === 'soumise' && (
                            <Button
                                variant="outlined"
                                startIcon={<Pending />}
                                sx={{ borderRadius: '12px', textTransform: 'none', borderColor: '#f59e0b', color: '#f59e0b' }}
                                onClick={() => handleOpenDialog('analyse')}
                            >
                                Analyser
                            </Button>
                        )}
                        {(application.statut === 'en_analyse' || application.statut === 'soumise') && (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<Event />}
                                    sx={{ borderRadius: '12px', textTransform: 'none', borderColor: '#8b5cf6', color: '#8b5cf6' }}
                                    onClick={() => handleOpenDialog('entretien')}
                                >
                                    Entretien
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<ThumbUp />}
                                    sx={{ backgroundColor: '#22c55e', borderRadius: '12px', textTransform: 'none' }}
                                    onClick={() => handleOpenDialog('accepter')}
                                >
                                    Accepter
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<ThumbDown />}
                                    sx={{ backgroundColor: '#ef4444', borderRadius: '12px', textTransform: 'none' }}
                                    onClick={() => handleOpenDialog('refuser')}
                                >
                                    Refuser
                                </Button>
                            </>
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
                            <Person sx={{ color: '#148aa0' }} />
                            Informations candidat
                        </SectionTitle>
                        <InfoItem>
                            <Email />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Email
                                </Typography>
                                <Typography variant="body2">{application.candidat.email}</Typography>
                            </Box>
                        </InfoItem>
                        <InfoItem>
                            <Phone />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Téléphone
                                </Typography>
                                <Typography variant="body2">{application.candidat.telephone}</Typography>
                            </Box>
                        </InfoItem>
                        <InfoItem>
                            <School />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Université
                                </Typography>
                                <Typography variant="body2">{application.candidat.universite}</Typography>
                            </Box>
                        </InfoItem>
                        <InfoItem>
                            <Work />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Filière / Niveau
                                </Typography>
                                <Typography variant="body2">
                                    {application.candidat.filiere} - {application.candidat.niveau}
                                </Typography>
                            </Box>
                        </InfoItem>
                        <InfoItem>
                            <Pending />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Date de soumission
                                </Typography>
                                <Typography variant="body2">
                                    {formatDate(application.dateSoumission)}
                                </Typography>
                            </Box>
                        </InfoItem>
                    </DetailCard>

                    {/* ===== Compétences ===== */}
                    <DetailCard>
                        <SectionTitle>
                            <Work sx={{ color: '#8b5cf6' }} />
                            Compétences
                        </SectionTitle>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {application.competences.map((comp, idx) => (
                                <Chip
                                    key={idx}
                                    label={`${comp.nom} - ${comp.niveau}`}
                                    size="small"
                                    sx={{ backgroundColor: '#f3e8ff', color: '#6b21a8', mb: 1 }}
                                />
                            ))}
                        </Box>
                    </DetailCard>
                </Grid>

                {/* ===== DROITE ===== */}
                <Grid item xs={12} md={8}>
                    {/* ===== Documents ===== */}
                    <DetailCard>
                        <SectionTitle>
                            <Description sx={{ color: '#22c55e' }} />
                            Documents
                        </SectionTitle>
                        <List dense>
                            {application.documents.map((doc, idx) => (
                                <ListItem key={idx} sx={{ borderBottom: idx < application.documents.length - 1 ? '1px solid #f0f2f5' : 'none' }}>
                                    <ListItemIcon>
                                        {doc.valide ? (
                                            <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
                                        ) : (
                                            <Pending sx={{ color: '#f59e0b', fontSize: 20 }} />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={doc.nom}
                                        secondary={doc.type}
                                    />
                                    <Box>
                                        <Tooltip title="Voir">
                                            <IconButton size="small" sx={{ color: '#148aa0' }}>
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Télécharger">
                                            <IconButton size="small" sx={{ color: '#4f46e5' }}>
                                                <Download fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </DetailCard>

                    {/* ===== Historique ===== */}
                    <DetailCard>
                        <SectionTitle>
                            <Assignment sx={{ color: '#f59e0b' }} />
                            Historique
                        </SectionTitle>
                        {application.historique.map((item, idx) => (
                            <Box key={idx} sx={{ display: 'flex', gap: 2, py: 1, borderBottom: idx < application.historique.length - 1 ? '1px solid #f0f2f5' : 'none' }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8f0fe', fontSize: 14 }}>
                                    {idx + 1}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                        {item.action}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {formatDate(item.date)}
                                    </Typography>
                                    {item.commentaire && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {item.commentaire}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </DetailCard>
                </Grid>
            </Grid>

            {/* ===== DIALOG DE CONFIRMATION ===== */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle>
                    {dialogAction === 'accepter' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ThumbUp sx={{ color: '#22c55e' }} /> Accepter la candidature
                        </Box>
                    )}
                    {dialogAction === 'refuser' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ThumbDown sx={{ color: '#ef4444' }} /> Refuser la candidature
                        </Box>
                    )}
                    {dialogAction === 'entretien' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Event sx={{ color: '#8b5cf6' }} /> Programmer un entretien
                        </Box>
                    )}
                    {dialogAction === 'analyse' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Pending sx={{ color: '#f59e0b' }} /> Passer en analyse
                        </Box>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {dialogAction === 'accepter' && `Êtes-vous sûr de vouloir accepter la candidature de ${application.candidat.nom} ?`}
                        {dialogAction === 'refuser' && `Êtes-vous sûr de vouloir refuser la candidature de ${application.candidat.nom} ?`}
                        {dialogAction === 'entretien' && `Voulez-vous programmer un entretien avec ${application.candidat.nom} ?`}
                        {dialogAction === 'analyse' && `Voulez-vous passer la candidature de ${application.candidat.nom} en analyse ?`}
                    </Typography>
                    {(dialogAction === 'refuser' || dialogAction === 'entretien') && (
                        <TextField
                            label={dialogAction === 'refuser' ? "Motif du refus" : "Commentaires"}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder={dialogAction === 'refuser' ? "Expliquez la raison du refus..." : "Ajoutez des commentaires..."}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseDialog}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmAction}
                        sx={{
                            backgroundColor:
                                dialogAction === 'accepter' ? '#22c55e' :
                                dialogAction === 'refuser' ? '#ef4444' :
                                dialogAction === 'entretien' ? '#8b5cf6' : '#f59e0b',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor:
                                    dialogAction === 'accepter' ? '#16a34a' :
                                    dialogAction === 'refuser' ? '#dc2626' :
                                    dialogAction === 'entretien' ? '#7c3aed' : '#d97706',
                            },
                        }}
                    >
                        {dialogAction === 'accepter' ? 'Accepter' :
                         dialogAction === 'refuser' ? 'Refuser' :
                         dialogAction === 'entretien' ? 'Programmer' : 'Analyser'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ApplicationDetail;
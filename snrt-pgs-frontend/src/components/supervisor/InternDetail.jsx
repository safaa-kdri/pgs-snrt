// src/components/supervisor/InternDetail.jsx
// ✅ VERSION FINALE - SANS ÉTABLISSEMENT ET FILIÈRE

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
    Divider,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Collapse,
    LinearProgress,
    Stack,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    ArrowBack,
    Email,
    Phone,
    Description,
    CheckCircle,
    Cancel,
    Visibility,
    ThumbUp,
    ThumbDown,
    PictureAsPdf,
    InsertDriveFile,
    Image,
    History,
    ExpandMore,
    ExpandLess,
    ErrorOutline,
    Work,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const InfoCard = styled(Paper)({
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
    marginBottom: '24px',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'EnCours': { bg: '#dbeafe', text: '#1d4ed8' },
        'Termine': { bg: '#d1fae5', text: '#065f46' },
        'Annule': { bg: '#fee2e2', text: '#991b1b' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
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
        height: '26px',
        borderRadius: '13px',
    };
});

const VersionStatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'EnAttente': { bg: '#fef3c7', text: '#d97706' },
        'Valide': { bg: '#d1fae5', text: '#065f46' },
        'ValideEncadrant': { bg: '#d1fae5', text: '#065f46' },
        'Rejete': { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors['EnAttente'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
        borderRadius: '12px',
    };
});

const InfoRow = styled(Box)({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '6px 0',
});

const InfoIcon = styled(Box)(({ color }) => ({
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: alpha(color || '#1387A7', 0.08),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color || '#1387A7',
    flexShrink: 0,
    fontSize: '16px',
}));

const InfoLabel = styled(Typography)({
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
});

const InfoValue = styled(Typography)({
    fontSize: '14px',
    color: '#1a2332',
    fontWeight: 500,
});

const VersionCard = styled(Paper)(({ status, isLatest }) => ({
    padding: '16px 20px',
    borderRadius: '10px',
    border: isLatest ? '2px solid #1387A7' : '1px solid #eef1f3',
    backgroundColor: status === 'Rejete' ? '#fff7f7' : '#ffffff',
    marginBottom: '12px',
    '&:hover': {
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
}));

const VersionHeader = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
});

const VersionInfo = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
});

const VersionName = styled(Typography)({
    fontSize: '14px',
    fontWeight: 600,
    color: '#1a2332',
});

const VersionMeta = styled(Typography)({
    fontSize: '12px',
    color: '#94a3b8',
});

const VersionActions = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
});

const RejectionBox = styled(Box)({
    backgroundColor: '#fff7f7',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    marginTop: '12px',
});

const RejectionLabel = styled(Typography)({
    fontSize: '11px',
    fontWeight: 600,
    color: '#991b1b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
});

const RejectionText = styled(Typography)({
    fontSize: '13px',
    color: '#991b1b',
    lineHeight: 1.5,
});

const ActionButton = styled(Button)({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '13px',
    padding: '6px 16px',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const InternDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [internship, setInternship] = useState(null);
    const [student, setStudent] = useState(null);
    const [offer, setOffer] = useState(null);
    const [livrables, setLivrables] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showHistory, setShowHistory] = useState(true);

    // Dialog states
    const [openLivrableDialog, setOpenLivrableDialog] = useState(false);
    const [selectedLivrable, setSelectedLivrable] = useState(null);
    const [livrableDecision, setLivrableDecision] = useState('');
    const [livrableComment, setLivrableComment] = useState('');

    useEffect(() => {
        fetchInternshipDetail();
    }, [id]);

    const fetchInternshipDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/internships/${id}`);
            const data = response.data?.data?.internship
                || response.data?.data
                || response.data?.internship
                || response.data;
            
            setInternship(data);
            setStudent(data.etudiantId || data.etudiant || {});
            setOffer(data.offreId || data.offre || {});
            
            const reports = (data.livrables || [])
                .filter((livrable) => livrable.type === 'Rapport')
                .sort((a, b) => new Date(b.dateDepot) - new Date(a.dateDepot));
            setLivrables(reports);

        } catch (error) {
            console.error('Erreur chargement:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // FONCTIONS LIVRABLES
    // ============================================

    const handleOpenLivrableDialog = (livrable, decision) => {
        setSelectedLivrable(livrable);
        setLivrableDecision(decision);
        setLivrableComment('');
        setOpenLivrableDialog(true);
    };

    const handleCloseLivrableDialog = () => {
        setOpenLivrableDialog(false);
        setSelectedLivrable(null);
        setLivrableComment('');
        setLivrableDecision('');
    };

    const handleValidateLivrable = async () => {
        if (livrableDecision === 'Rejete' && !livrableComment.trim()) {
            setError('Veuillez indiquer le motif du rejet');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await api.put(`/internships/${id}/livrables/${selectedLivrable._id}/validate`, {
                valide: livrableDecision === 'Valide',
                commentaire: livrableComment,
            });
            setSuccess(`Rapport ${livrableDecision === 'Valide' ? 'validé' : 'rejeté'} avec succès`);
            handleCloseLivrableDialog();
            fetchInternshipDetail();
        } catch (error) {
            console.error('Erreur validation:', error);
            setError(error.response?.data?.message || 'Erreur lors de la validation');
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================
    // FONCTIONS UTILITAIRES
    // ============================================

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

    const getVersionStatusLabel = (status) => {
        const labels = {
            'EnAttente': 'En attente',
            'Valide': 'Validé',
            'ValideEncadrant': 'Validé',
            'Rejete': 'Rejeté',
        };
        return labels[status] || 'En attente';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getFileIcon = (doc) => {
        if (!doc) return <InsertDriveFile />;
        const name = doc.nom || '';
        const ext = name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') {
            return <PictureAsPdf sx={{ color: '#ef4444', fontSize: 20 }} />;
        }
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return <Image sx={{ color: '#22c55e', fontSize: 20 }} />;
        }
        return <InsertDriveFile sx={{ color: '#4f46e5', fontSize: 20 }} />;
    };

    const buildFileHref = (doc) => {
        if (!doc) return null;
        const apiRoot = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
        if (doc.gridFsId) {
            return `${apiRoot}/api/v1/documents/file/${doc.gridFsId}`;
        }
        if (doc.chemin) {
            if (doc.chemin.startsWith('/')) return `${apiRoot}${doc.chemin}`;
            return doc.chemin;
        }
        return null;
    };

    const isEditable = internship && !['Termine', 'Cloturee', 'Annule'].includes(internship.statut);

    const latestLivrable = livrables.length > 0 ? livrables[0] : null;
    const hasHistory = livrables.length > 1;
    const validCount = livrables.filter(l => l.statut === 'ValideEncadrant' || l.valide === true).length;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#2d3748' }} />
            </Box>
        );
    }

    if (!internship) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    Stage non trouvé
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/supervisor/stagiaires')}
                    sx={{ mt: 2, color: '#2d3748' }}
                >
                    Retour à la liste
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== HEADER ===== */}
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/supervisor/stagiaires')}
                    sx={{ mb: 2, textTransform: 'none', color: '#687480' }}
                >
                    Retour aux stagiaires
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                            {student?.prenom || ''} {student?.nom || ''}
                        </Typography>
                        <Typography variant="body1" color="#687480">
                            {offer?.titre || 'Stage sans titre'} • {offer?.typeStage || 'Stage'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Typography variant="body2" color="#94a3b8">
                                {formatDate(internship?.dateDebut)} → {formatDate(internship?.dateFin)}
                            </Typography>
                            <StatusChip label={getStatusLabel(internship?.statut)} status={internship?.statut} />
                        </Box>
                    </Box>
                </Box>
            </Box>

            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* ===== INFORMATIONS DU STAGE ===== */}
            <InfoCard>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <InfoRow>
                            <InfoIcon color="#1387A7">
                                <Email sx={{ fontSize: 18 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Email</InfoLabel>
                                <InfoValue>{student?.email || 'Non renseigné'}</InfoValue>
                            </Box>
                        </InfoRow>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <InfoRow>
                            <InfoIcon color="#f59e0b">
                                <Phone sx={{ fontSize: 18 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Téléphone</InfoLabel>
                                <InfoValue>{student?.telephone || 'Non renseigné'}</InfoValue>
                            </Box>
                        </InfoRow>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <InfoRow>
                            <InfoIcon color="#4f46e5">
                                <Work sx={{ fontSize: 18 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Type de stage</InfoLabel>
                                <InfoValue>{offer?.typeStage || 'Stage'}</InfoValue>
                            </Box>
                        </InfoRow>
                    </Grid>
                </Grid>
            </InfoCard>

            {/* ===== RAPPORT DE STAGE ===== */}
            <Paper sx={{ borderRadius: '12px', p: 3, border: '1px solid #eef1f3' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: '12px' }}>
                    <Typography variant="h6" fontWeight={600} color="#1a2332">
                        Rapport de stage
                    </Typography>
                    <Chip
                        label={`${livrables.length} version${livrables.length > 1 ? 's' : ''} • ${validCount > 0 ? 'Validé' : 'En attente'}`}
                        sx={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                    />
                </Box>

                {livrables.length === 0 ? (
                    <Typography variant="body2" color="#94a3b8" sx={{ textAlign: 'center', py: 4 }}>
                        Aucun rapport déposé par le stagiaire
                    </Typography>
                ) : (
                    <Box>
                        {/* === VERSION LA PLUS RÉCENTE === */}
                        {latestLivrable && (
                            <VersionCard status={latestLivrable.statut} isLatest>
                                <VersionHeader>
                                    <VersionInfo>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                label={`V${livrables.length}`}
                                                size="small"
                                                sx={{ backgroundColor: '#1387A7', color: '#ffffff', fontWeight: 600 }}
                                            />
                                            <VersionName>
                                                {latestLivrable.nom || 'Rapport_Stage.pdf'}
                                            </VersionName>
                                        </Box>
                                        <VersionMeta>
                                            Déposé le {formatDateTime(latestLivrable.dateDepot)}
                                        </VersionMeta>
                                        <VersionStatusChip
                                            label={getVersionStatusLabel(latestLivrable.statut || 'EnAttente')}
                                            status={latestLivrable.statut || 'EnAttente'}
                                            size="small"
                                        />
                                    </VersionInfo>
                                    <VersionActions>
                                        <Tooltip title="Voir le rapport">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    const href = buildFileHref(latestLivrable);
                                                    if (href) window.open(href, '_blank');
                                                    else setError('Impossible de visualiser ce document');
                                                }}
                                                sx={{ color: '#687480' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {isEditable && (!latestLivrable.statut || latestLivrable.statut === 'EnAttente') && (
                                            <>
                                                <Tooltip title="Valider">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenLivrableDialog(latestLivrable, 'Valide')}
                                                        sx={{ color: '#22c55e' }}
                                                    >
                                                        <ThumbUp fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Demander une correction">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenLivrableDialog(latestLivrable, 'Rejete')}
                                                        sx={{ color: '#ef4444' }}
                                                    >
                                                        <ThumbDown fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                        {latestLivrable.statut === 'ValideEncadrant' && (
                                            <Tooltip title="Validé">
                                                <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
                                            </Tooltip>
                                        )}
                                        {latestLivrable.statut === 'Rejete' && (
                                            <Tooltip title="Correction demandée">
                                                <Cancel sx={{ color: '#ef4444', fontSize: 20 }} />
                                            </Tooltip>
                                        )}
                                    </VersionActions>
                                </VersionHeader>

                                {latestLivrable.statut === 'Rejete' && latestLivrable.commentaire && (
                                    <RejectionBox>
                                        <RejectionLabel>
                                            <ErrorOutline sx={{ fontSize: 14 }} />
                                            Motif de la correction demandée
                                        </RejectionLabel>
                                        <RejectionText>{latestLivrable.commentaire}</RejectionText>
                                    </RejectionBox>
                                )}
                            </VersionCard>
                        )}

                        {/* === HISTORIQUE === */}
                        {hasHistory && (
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    onClick={() => setShowHistory(!showHistory)}
                                    size="small"
                                    startIcon={<History />}
                                    endIcon={showHistory ? <ExpandLess /> : <ExpandMore />}
                                    sx={{ color: '#94a3b8', textTransform: 'none' }}
                                >
                                    {showHistory ? 'Masquer l\'historique' : 'Voir l\'historique'} ({livrables.length - 1} version{livrables.length - 1 > 1 ? 's' : ''})
                                </Button>

                                <Collapse in={showHistory}>
                                    <Box sx={{ mt: 2 }}>
                                        {livrables.slice(1).map((livrable, index) => {
                                            const versionNumber = livrables.length - index - 1;
                                            const isRejected = livrable.statut === 'Rejete';
                                            return (
                                                <VersionCard key={livrable._id} status={livrable.statut} isLatest={false}>
                                                    <VersionHeader>
                                                        <VersionInfo>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Chip
                                                                    label={`V${versionNumber}`}
                                                                    size="small"
                                                                    sx={{ 
                                                                        backgroundColor: isRejected ? '#fee2e2' : '#f1f5f9',
                                                                        color: isRejected ? '#991b1b' : '#475569',
                                                                        fontWeight: 500,
                                                                    }}
                                                                />
                                                                <VersionName>
                                                                    {livrable.nom || 'Rapport_Stage.pdf'}
                                                                </VersionName>
                                                            </Box>
                                                            <VersionMeta>
                                                                {formatDate(livrable.dateDepot)}
                                                            </VersionMeta>
                                                            <VersionStatusChip
                                                                label={getVersionStatusLabel(livrable.statut || 'EnAttente')}
                                                                status={livrable.statut || 'EnAttente'}
                                                                size="small"
                                                            />
                                                        </VersionInfo>
                                                        <VersionActions>
                                                            <Tooltip title="Voir le rapport">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        const href = buildFileHref(livrable);
                                                                        if (href) window.open(href, '_blank');
                                                                        else setError('Impossible de visualiser ce document');
                                                                    }}
                                                                    sx={{ color: '#687480' }}
                                                                >
                                                                    <Visibility fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </VersionActions>
                                                    </VersionHeader>

                                                    {isRejected && livrable.commentaire && (
                                                        <RejectionBox>
                                                            <RejectionLabel>
                                                                <ErrorOutline sx={{ fontSize: 14 }} />
                                                                Motif de la correction demandée
                                                            </RejectionLabel>
                                                            <RejectionText>{livrable.commentaire}</RejectionText>
                                                        </RejectionBox>
                                                    )}
                                                </VersionCard>
                                            );
                                        })}
                                    </Box>
                                </Collapse>
                            </Box>
                        )}
                    </Box>
                )}
            </Paper>

            {/* ========================================== */}
            {/* DIALOG VALIDATION / CORRECTION */}
            {/* ========================================== */}
            <Dialog
                open={openLivrableDialog}
                onClose={handleCloseLivrableDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '12px', padding: '8px' } }}
            >
                <DialogTitle>
                    {livrableDecision === 'Valide' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ color: '#22c55e' }} /> Valider le rapport
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ErrorOutline sx={{ color: '#ef4444' }} /> Demander une correction
                        </Box>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {livrableDecision === 'Valide'
                            ? `Vous êtes sur le point de valider le rapport "${selectedLivrable?.nom}"`
                            : `Vous êtes sur le point de demander une correction pour "${selectedLivrable?.nom}". Veuillez indiquer les points à corriger.`}
                    </Typography>
                    {livrableDecision === 'Rejete' && (
                        <TextField
                            label="Motif de la correction *"
                            value={livrableComment}
                            onChange={(e) => setLivrableComment(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Expliquez les corrections à apporter..."
                            helperText="Ce message sera transmis au stagiaire"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleCloseLivrableDialog} sx={{ borderRadius: '10px', textTransform: 'none' }}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleValidateLivrable}
                        disabled={submitting || (livrableDecision === 'Rejete' && !livrableComment.trim())}
                        sx={{
                            backgroundColor: livrableDecision === 'Valide' ? '#22c55e' : '#ef4444',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: livrableDecision === 'Valide' ? '#16a34a' : '#dc2626',
                            },
                        }}
                    >
                        {submitting ? 'Traitement...' : livrableDecision === 'Valide' ? 'Valider' : 'Demander une correction'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default InternDetail;
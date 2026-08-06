// src/components/supervisor/InternDetail.jsx
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
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tab,
    Tabs,
    Rating,
    Stack,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
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
    Visibility,
    Message,
    ThumbUp,
    ThumbDown,
    AddComment,
    Edit,
    Star,
    PictureAsPdf,
    InsertDriveFile,
    Image,
    CalendarToday,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const InfoCard = styled(Paper)({
    borderRadius: '16px',
    padding: '20px 24px',
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
        height: '24px',
    };
});

const LivrableStatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'EnAttente': { bg: '#fef3c7', text: '#d97706' },
        'Valide': { bg: '#d1fae5', text: '#065f46' },
        'Rejete': { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors['EnAttente'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
    };
});

const InfoRow = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 0',
    '& .MuiSvgIcon-root': {
        color: '#687480',
        fontSize: '18px',
    },
});

const StyledTableCell = styled(TableCell)({
    fontWeight: 600,
    color: '#1a2332',
    fontSize: '13px',
});

const ActionButton = styled(Button)({
    borderRadius: '10px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '8px 20px',
});

const RemarkItem = styled(Box)({
    display: 'flex',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f0f2f5',
    '&:last-child': {
        borderBottom: 'none',
    },
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
    const [remarks, setRemarks] = useState([]);
    const [evaluation, setEvaluation] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    // Dialog states
    const [openRemarkDialog, setOpenRemarkDialog] = useState(false);
    const [newRemark, setNewRemark] = useState('');
    const [openLivrableDialog, setOpenLivrableDialog] = useState(false);
    const [selectedLivrable, setSelectedLivrable] = useState(null);
    const [livrableDecision, setLivrableDecision] = useState('');
    const [livrableComment, setLivrableComment] = useState('');
    const [openEvaluationDialog, setOpenEvaluationDialog] = useState(false);
    const [evaluationData, setEvaluationData] = useState({
        note: 0,
        commentaires: '',
        competences: [],
    });

    useEffect(() => {
        fetchInternshipDetail();
    }, [id]);

    const fetchInternshipDetail = async () => {
        setLoading(true);
        setError('');
        try {
            // ✅ Route correcte : /internships/:id
            const response = await api.get(`/internships/${id}`);
            const data = response.data?.data || response.data;
            
            setInternship(data);
            setStudent(data.etudiantId || {});
            setOffer(data.offreId || {});
            setLivrables(data.livrables || []);
            setRemarks(data.remarquesEncadrant || []);
            setEvaluation(data.evaluation || null);

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
        setSubmitting(true);
        try {
            // ✅ Route correcte : /internships/:id/validate-deliverable
            await api.put(`/internships/${id}/validate-deliverable`, {
                livrableId: selectedLivrable._id,
                valide: livrableDecision === 'Valide',
                commentaire: livrableComment,
            });
            setSuccess(`Livrable ${livrableDecision === 'Valide' ? 'validé' : 'rejeté'} avec succès`);
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
    // FONCTIONS REMARQUES
    // ============================================

    const handleOpenRemarkDialog = () => {
        setNewRemark('');
        setOpenRemarkDialog(true);
    };

    const handleCloseRemarkDialog = () => {
        setOpenRemarkDialog(false);
        setNewRemark('');
    };

    const handleAddRemark = async () => {
        if (!newRemark.trim()) {
            setError('Veuillez saisir une remarque');
            return;
        }
        setSubmitting(true);
        try {
            // ✅ Route correcte : /internships/:id/remarks
            await api.post(`/internships/${id}/remarks`, {
                message: newRemark,
            });
            setSuccess('Remarque ajoutée avec succès');
            handleCloseRemarkDialog();
            fetchInternshipDetail();
        } catch (error) {
            console.error('Erreur ajout remarque:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'ajout');
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================
    // FONCTIONS ÉVALUATION
    // ============================================

    const handleOpenEvaluationDialog = () => {
        setEvaluationData({
            note: evaluation?.note || 0,
            commentaires: evaluation?.commentaires || '',
            competences: evaluation?.competencesEvaluees || [
                { nom: 'Autonomie', niveau: 'Intermediaire', note: 0 },
                { nom: 'Qualité du travail', niveau: 'Intermediaire', note: 0 },
                { nom: 'Relationnel', niveau: 'Intermediaire', note: 0 },
                { nom: 'Technique', niveau: 'Intermediaire', note: 0 },
            ],
        });
        setOpenEvaluationDialog(true);
    };

    const handleCloseEvaluationDialog = () => {
        setOpenEvaluationDialog(false);
    };

    const handleEvaluationChange = (field, value) => {
        setEvaluationData({ ...evaluationData, [field]: value });
    };

    const handleCompetenceChange = (index, field, value) => {
        const newCompetences = [...evaluationData.competences];
        newCompetences[index][field] = value;
        setEvaluationData({ ...evaluationData, competences: newCompetences });
    };

    const handleSubmitEvaluation = async () => {
        if (evaluationData.note === 0) {
            setError('Veuillez attribuer une note');
            return;
        }
        setSubmitting(true);
        try {
            // ✅ Route correcte : /internships/:id/evaluate
            await api.put(`/internships/${id}/evaluate`, evaluationData);
            setSuccess('Évaluation enregistrée avec succès');
            handleCloseEvaluationDialog();
            fetchInternshipDetail();
        } catch (error) {
            console.error('Erreur évaluation:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'évaluation');
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================
    // FONCTIONS CLÔTURE
    // ============================================

    const handleCloture = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir clôturer ce stage ?')) return;
        setSubmitting(true);
        try {
            // ✅ Route correcte : /internships/:id/close
            await api.put(`/internships/${id}/close`);
            setSuccess('Stage clôturé avec succès');
            fetchInternshipDetail();
        } catch (error) {
            console.error('Erreur clôture:', error);
            setError(error.response?.data?.message || 'Erreur lors de la clôture');
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

    const getLivrableStatusLabel = (status) => {
        const labels = {
            'EnAttente': 'En attente',
            'Valide': 'Validé',
            'Rejete': 'Rejeté',
        };
        return labels[status] || status;
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

    const getInitials = (nom, prenom) => {
        if (!nom && !prenom) return '?';
        return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase() || '?';
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
        if (doc.chemin) {
            if (doc.chemin.startsWith('/')) return `${apiRoot}${doc.chemin}`;
            return doc.chemin;
        }
        return null;
    };

    const isCloturable = () => {
        const tousLivrablesValides = livrables.every(l => l.valide === true);
        return internship?.statut === 'EnCours' && tousLivrablesValides && evaluation;
    };

    const isEditable = internship?.statut === 'EnCours';

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
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/supervisor/stagiaires')}
                    sx={{ mb: 2, textTransform: 'none', color: '#666' }}
                >
                    Retour à la liste
                </Button>
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

            {/* ===== CARTE INFORMATIONS STAGIAIRE ===== */}
            <InfoCard>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                    <Avatar
                        sx={{
                            width: 64,
                            height: 64,
                            backgroundColor: '#2d3748',
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#fff',
                        }}
                    >
                        {getInitials(student?.nom, student?.prenom)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a2332' }}>
                            {student?.prenom || ''} {student?.nom || ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {offer?.titre || 'Stage sans titre'} • {offer?.typeStage || 'Stage'}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <StatusChip label={getStatusLabel(internship?.statut)} status={internship?.statut} />
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            Début: {formatDate(internship?.dateDebut)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Fin: {formatDate(internship?.dateFin)}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <InfoRow>
                            <Email />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Email
                                </Typography>
                                <Typography variant="body2">
                                    {student?.email || 'Non renseigné'}
                                </Typography>
                            </Box>
                        </InfoRow>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <InfoRow>
                            <Phone />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Téléphone
                                </Typography>
                                <Typography variant="body2">
                                    {student?.telephone || 'Non renseigné'}
                                </Typography>
                            </Box>
                        </InfoRow>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <InfoRow>
                            <School />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Université
                                </Typography>
                                <Typography variant="body2">
                                    {student?.universite || 'Non renseignée'}
                                </Typography>
                            </Box>
                        </InfoRow>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <InfoRow>
                            <Work />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Filière
                                </Typography>
                                <Typography variant="body2">
                                    {student?.filiere || 'Non renseignée'}
                                </Typography>
                            </Box>
                        </InfoRow>
                    </Grid>
                </Grid>
            </InfoCard>

            {/* ===== TABS ===== */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                    <Tab label="Livrables" icon={<Description />} iconPosition="start" />
                    <Tab label="Remarques" icon={<Message />} iconPosition="start" />
                    <Tab label="Évaluation" icon={<Star />} iconPosition="start" />
                </Tabs>
            </Box>

            {/* ===== TAB 0 : LIVRABLES ===== */}
            {activeTab === 0 && (
                <Paper sx={{ borderRadius: '16px', p: 3, border: '1px solid #eef1f3' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                            Livrables déposés
                        </Typography>
                        <Chip
                            label={`${livrables.filter(l => l.valide === true).length}/${livrables.length} validés`}
                            sx={{ backgroundColor: '#d1fae5', color: '#065f46' }}
                        />
                    </Box>

                    {livrables.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            Aucun livrable déposé par le stagiaire
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                                        <StyledTableCell>Nom</StyledTableCell>
                                        <StyledTableCell>Type</StyledTableCell>
                                        <StyledTableCell>Date dépôt</StyledTableCell>
                                        <StyledTableCell>Statut</StyledTableCell>
                                        <StyledTableCell align="center">Actions</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {livrables.map((livrable) => (
                                        <TableRow key={livrable._id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getFileIcon(livrable)}
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {livrable.nom || 'Sans nom'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={livrable.type || 'Autre'}
                                                    size="small"
                                                    sx={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(livrable.dateDepot)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <LivrableStatusChip
                                                    label={livrable.valide ? 'Validé' : livrable.statut === 'Rejete' ? 'Rejeté' : 'En attente'}
                                                    status={livrable.valide ? 'Valide' : livrable.statut === 'Rejete' ? 'Rejete' : 'EnAttente'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Tooltip title="Voir">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                const href = buildFileHref(livrable);
                                                                if (href) window.open(href, '_blank');
                                                                else setError('Impossible de visualiser ce document');
                                                            }}
                                                            sx={{ color: '#2d3748' }}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {isEditable && !livrable.valide && livrable.statut !== 'Rejete' && (
                                                        <>
                                                            <Tooltip title="Valider">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleOpenLivrableDialog(livrable, 'Valide')}
                                                                    sx={{ color: '#22c55e' }}
                                                                >
                                                                    <ThumbUp fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Rejeter">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleOpenLivrableDialog(livrable, 'Rejete')}
                                                                    sx={{ color: '#ef4444' }}
                                                                >
                                                                    <ThumbDown fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                    {livrable.valide === true && (
                                                        <Tooltip title="Validé">
                                                            <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
                                                        </Tooltip>
                                                    )}
                                                    {livrable.statut === 'Rejete' && (
                                                        <Tooltip title="Rejeté">
                                                            <Cancel sx={{ color: '#ef4444', fontSize: 20 }} />
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            )}

            {/* ===== TAB 1 : REMARQUES ===== */}
            {activeTab === 1 && (
                <Paper sx={{ borderRadius: '16px', p: 3, border: '1px solid #eef1f3' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                            Remarques
                        </Typography>
                        {isEditable && (
                            <ActionButton
                                variant="contained"
                                startIcon={<AddComment />}
                                onClick={handleOpenRemarkDialog}
                                sx={{ backgroundColor: '#2d3748', '&:hover': { backgroundColor: '#1a202c' } }}
                            >
                                Ajouter une remarque
                            </ActionButton>
                        )}
                    </Box>

                    {remarks.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            Aucune remarque
                        </Typography>
                    ) : (
                        <Box>
                            {remarks.map((remark, index) => (
                                <RemarkItem key={index}>
                                    <Avatar
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            backgroundColor: '#2d3748',
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: '#fff',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {remark.auteurId?.prenom?.[0] || 'E'}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {remark.auteurId?.prenom || 'Encadrant'} {remark.auteurId?.nom || ''}
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                                {formatDateTime(remark.date)}
                                            </Typography>
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {remark.message}
                                        </Typography>
                                    </Box>
                                </RemarkItem>
                            ))}
                        </Box>
                    )}
                </Paper>
            )}

            {/* ===== TAB 2 : ÉVALUATION ===== */}
            {activeTab === 2 && (
                <Paper sx={{ borderRadius: '16px', p: 3, border: '1px solid #eef1f3' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                            Évaluation du stagiaire
                        </Typography>
                        {isEditable && !evaluation && (
                            <ActionButton
                                variant="contained"
                                startIcon={<Star />}
                                onClick={handleOpenEvaluationDialog}
                                sx={{ backgroundColor: '#2d3748', '&:hover': { backgroundColor: '#1a202c' } }}
                            >
                                Évaluer
                            </ActionButton>
                        )}
                        {isEditable && evaluation && (
                            <ActionButton
                                variant="outlined"
                                startIcon={<Edit />}
                                onClick={handleOpenEvaluationDialog}
                                sx={{ borderColor: '#2d3748', color: '#2d3748' }}
                            >
                                Modifier l'évaluation
                            </ActionButton>
                        )}
                    </Box>

                    {evaluation ? (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Card sx={{ borderRadius: '12px', p: 3, textAlign: 'center', backgroundColor: '#f7f8fa' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Note finale
                                        </Typography>
                                        <Typography variant="h2" fontWeight={700} color="#1a2332">
                                            {evaluation.note || 0}/20
                                        </Typography>
                                        <Rating
                                            value={Math.min((evaluation.note || 0) / 4, 5)}
                                            readOnly
                                            precision={0.5}
                                            sx={{ mt: 1 }}
                                        />
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        <strong>Commentaires :</strong>
                                    </Typography>
                                    <Typography variant="body2">
                                        {evaluation.commentaires || 'Aucun commentaire'}
                                    </Typography>
                                </Grid>
                                {evaluation.competencesEvaluees?.length > 0 && (
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                            Compétences évaluées
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {evaluation.competencesEvaluees.map((comp, idx) => (
                                                <Grid item xs={6} md={4} key={idx}>
                                                    <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f7f8fa' }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {comp.nom}
                                                        </Typography>
                                                        <Typography variant="h6" fontWeight={600}>
                                                            {comp.note || 0}/5
                                                        </Typography>
                                                        <Chip
                                                            label={comp.niveau || 'Intermediaire'}
                                                            size="small"
                                                            sx={{ mt: 0.5, backgroundColor: '#e0e7ff', color: '#4338ca' }}
                                                        />
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Grid>
                                )}
                            </Grid>
                            {isEditable && (
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                    <ActionButton
                                        variant="contained"
                                        onClick={handleCloture}
                                        disabled={!isCloturable() || submitting}
                                        sx={{
                                            backgroundColor: isCloturable() ? '#22c55e' : '#999',
                                            '&:hover': { backgroundColor: isCloturable() ? '#16a34a' : '#999' },
                                        }}
                                    >
                                        {submitting ? 'Traitement...' : 'Clôturer le stage'}
                                    </ActionButton>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            Aucune évaluation pour le moment
                        </Typography>
                    )}

                    {!isCloturable() && isEditable && evaluation && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                            {livrables.some(l => !l.valide && l.statut !== 'Rejete') && 'Tous les livrables doivent être validés avant la clôture'}
                        </Typography>
                    )}
                </Paper>
            )}

            {/* ========================================== */}
            {/* DIALOG VALIDATION LIVRABLE */}
            {/* ========================================== */}
            <Dialog
                open={openLivrableDialog}
                onClose={handleCloseLivrableDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', padding: '8px' } }}
            >
                <DialogTitle>
                    {livrableDecision === 'Valide' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ThumbUp sx={{ color: '#22c55e' }} /> Valider le livrable
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ThumbDown sx={{ color: '#ef4444' }} /> Rejeter le livrable
                        </Box>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {livrableDecision === 'Valide'
                            ? `Êtes-vous sûr de vouloir valider le livrable "${selectedLivrable?.nom}" ?`
                            : `Êtes-vous sûr de vouloir rejeter le livrable "${selectedLivrable?.nom}" ?`}
                    </Typography>
                    {livrableDecision === 'Rejete' && (
                        <TextField
                            label="Motif du rejet *"
                            value={livrableComment}
                            onChange={(e) => setLivrableComment(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Expliquez la raison du rejet..."
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
                        {submitting ? 'Traitement...' : livrableDecision === 'Valide' ? 'Valider' : 'Rejeter'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========================================== */}
            {/* DIALOG REMARQUE */}
            {/* ========================================== */}
            <Dialog
                open={openRemarkDialog}
                onClose={handleCloseRemarkDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', padding: '8px' } }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddComment sx={{ color: '#2d3748' }} /> Ajouter une remarque
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Remarque *"
                        value={newRemark}
                        onChange={(e) => setNewRemark(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Saisissez votre remarque..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleCloseRemarkDialog} sx={{ borderRadius: '10px', textTransform: 'none' }}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAddRemark}
                        disabled={submitting || !newRemark.trim()}
                        sx={{
                            backgroundColor: '#2d3748',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#1a202c' },
                        }}
                    >
                        {submitting ? 'Envoi...' : 'Ajouter'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========================================== */}
            {/* DIALOG ÉVALUATION */}
            {/* ========================================== */}
            <Dialog
                open={openEvaluationDialog}
                onClose={handleCloseEvaluationDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', padding: '8px' } }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star sx={{ color: '#f59e0b' }} /> Évaluer le stagiaire
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                Note finale (sur 20)
                            </Typography>
                            <TextField
                                type="number"
                                value={evaluationData.note}
                                onChange={(e) => handleEvaluationChange('note', Math.min(20, Math.max(0, Number(e.target.value))))}
                                fullWidth
                                InputProps={{ inputProps: { min: 0, max: 20, step: 0.5 } }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                Commentaires
                            </Typography>
                            <TextField
                                value={evaluationData.commentaires}
                                onChange={(e) => handleEvaluationChange('commentaires', e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Commentaires sur le stage..."
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                Compétences évaluées (sur 5)
                            </Typography>
                            <Grid container spacing={2}>
                                {evaluationData.competences.map((comp, idx) => (
                                    <Grid item xs={12} sm={6} key={idx}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                            <Typography variant="body2" sx={{ minWidth: 100 }}>
                                                {comp.nom}
                                            </Typography>
                                            <TextField
                                                type="number"
                                                value={comp.note}
                                                onChange={(e) => handleCompetenceChange(idx, 'note', Math.min(5, Math.max(0, Number(e.target.value))))}
                                                size="small"
                                                sx={{ width: 70 }}
                                                InputProps={{ inputProps: { min: 0, max: 5, step: 0.5 } }}
                                            />
                                            <Rating
                                                value={comp.note || 0}
                                                onChange={(e, v) => handleCompetenceChange(idx, 'note', v || 0)}
                                                precision={0.5}
                                                size="small"
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleCloseEvaluationDialog} sx={{ borderRadius: '10px', textTransform: 'none' }}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitEvaluation}
                        disabled={submitting}
                        sx={{
                            backgroundColor: '#2d3748',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#1a202c' },
                        }}
                    >
                        {submitting ? 'Enregistrement...' : 'Enregistrer l\'évaluation'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default InternDetail;
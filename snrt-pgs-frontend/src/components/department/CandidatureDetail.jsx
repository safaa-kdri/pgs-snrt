// src/components/department/CandidatureDetail.jsx
// ✅ VERSION AVEC BOUTON RETOUR POSITIONNÉ COMME LE RH (AU-DESSUS)

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
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    Stack,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    ArrowBack,
    Person,
    Email,
    Phone,
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
    Assessment,
    Schedule,
    LocationOn,
    VideoCall,
    Comment,
    Assignment,
    Edit as EditIcon,
    Business,
    School,
    People,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
    alignItems: 'center',
    gap: '20px',
});

const StyledAvatar = styled(Avatar)({
    width: 80,
    height: 80,
    backgroundColor: '#2d3748',
    fontSize: '32px',
    fontWeight: 700,
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
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
        'Soumise': { bg: '#dbeafe', text: '#1d4ed8' },
        'EnAnalyse': { bg: '#fef3c7', text: '#d97706' },
        'Entretien': { bg: '#f3e8ff', text: '#6b21a8' },
        'Acceptee': { bg: '#d1fae5', text: '#065f46' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors['Soumise'];
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
    minWidth: '80px',
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

// ✅ BOUTON RETOUR STYLE RH - POSITIONNÉ AU-DESSUS
const BackButton = styled(Button)({
    textTransform: 'none',
    color: '#666',
    marginBottom: '16px', // ✅ Espacement avant l'avatar
    '&:hover': {
        backgroundColor: 'transparent',
        color: '#1a2332',
    },
});

const DocumentItem = styled(Box)(({ verified }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: verified ? '#f0fdf4' : '#fafafa',
    borderRadius: '8px',
    border: verified ? '1px solid #22c55e' : '1px solid #e5e7eb',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    '&:hover': {
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
}));

const CompetenceTag = styled(Chip)(({ niveau }) => {
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
// CONSTANTES
// ============================================

const REFUSAL_REASONS = [
    'Profil non adapté',
    'Plus de places disponibles',
    'Dossier insuffisant',
    'Dates incompatibles',
    'Autre',
];

const INTERVIEW_TYPES = [
    { value: 'presentiel', label: 'Présentiel', icon: <LocationOn /> },
    { value: 'visio', label: 'Visio', icon: <VideoCall /> },
    { value: 'telephonique', label: 'Téléphonique', icon: <Schedule /> },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const CandidatureDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const [internship, setInternship] = useState(null);
    const [encadrants, setEncadrants] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Dialog states
    const [openRefuseDialog, setOpenRefuseDialog] = useState(false);
    const [openInterviewDialog, setOpenInterviewDialog] = useState(false);
    const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [openCommentDialog, setOpenCommentDialog] = useState(false);

    // Form states
    const [refusalReason, setRefusalReason] = useState('');
    const [refusalComment, setRefusalComment] = useState('');
    const [selectedEncadrant, setSelectedEncadrant] = useState('');
    const [selectedStageId, setSelectedStageId] = useState(null);
    
    const [interviewForm, setInterviewForm] = useState({
        date: '',
        heure: '',
        duree: 30,
        type: 'presentiel',
        lieu: '',
        lienVisio: '',
        commentaires: '',
    });
    
    const [comment, setComment] = useState('');
    const [internalNote, setInternalNote] = useState('');

    useEffect(() => {
        fetchApplicationDetail();
        fetchEncadrants();
    }, [id]);

    // ============================================
    // CHARGEMENT DES DONNÉES
    // ============================================

    const fetchApplicationDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/applications/${id}`);
            let data = response.data?.data || response.data;
            setApplication(data);

            if (data._id) {
                try {
                    const stageRes = await api.get(`/internships/application/${data._id}`);
                    if (stageRes.data?.data) {
                        setInternship(stageRes.data.data);
                        setSelectedStageId(stageRes.data.data._id);
                    }
                } catch (e) {
                    setInternship(null);
                }
            }

            if (data.commentaireInterne) {
                setInternalNote(data.commentaireInterne);
            }
        } catch (error) {
            console.error('Erreur chargement candidature:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
            setApplication(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchEncadrants = async () => {
        try {
            const response = await api.get('/users/internal', {
                params: { role: 'Encadrant' }
            });
            const data = response.data?.data || [];
            setEncadrants(data);
        } catch (error) {
            console.error('Erreur chargement encadrants:', error);
            setEncadrants([]);
        }
    };

    // ============================================
    // ACTIONS
    // ============================================

    const handleOpenRefuse = () => {
        setRefusalReason('');
        setRefusalComment('');
        setOpenRefuseDialog(true);
    };

    const handleCloseRefuse = () => {
        setOpenRefuseDialog(false);
    };

    const handleConfirmRefuse = async () => {
        if (!refusalReason) {
            setError('Veuillez sélectionner un motif de refus');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await api.patch(`/applications/${application._id}/status`, {
                statut: 'Refusee',
                commentaire: `Motif: ${refusalReason}${refusalComment ? ` - ${refusalComment}` : ''}`,
            });
            setSuccess('Candidature refusée avec succès');
            setOpenRefuseDialog(false);
            fetchApplicationDetail();
        } catch (error) {
            console.error('Erreur refus:', error);
            setError(error.response?.data?.message || 'Erreur lors du refus');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenInterview = () => {
        setInterviewForm({
            date: '',
            heure: '',
            duree: 30,
            type: 'presentiel',
            lieu: '',
            lienVisio: '',
            commentaires: '',
        });
        setOpenInterviewDialog(true);
    };

    const handleCloseInterview = () => {
        setOpenInterviewDialog(false);
    };

    const handleInterviewChange = (field, value) => {
        setInterviewForm({ ...interviewForm, [field]: value });
        setError('');
    };

    const handleConfirmInterview = async () => {
        if (!interviewForm.date) {
            setError('La date est obligatoire');
            return;
        }
        if (!interviewForm.heure) {
            setError('L\'heure est obligatoire');
            return;
        }
        if (interviewForm.type === 'visio' && !interviewForm.lienVisio) {
            setError('Un lien de visioconférence est requis');
            return;
        }
        if (interviewForm.type === 'presentiel' && !interviewForm.lieu) {
            setError('Un lieu est requis pour un entretien présentiel');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await api.post('/interviews', {
                applicationId: application._id,
                date: interviewForm.date,
                heure: interviewForm.heure,
                duree: interviewForm.duree,
                type: interviewForm.type,
                lieu: interviewForm.lieu,
                lienVisio: interviewForm.lienVisio,
                commentaires: interviewForm.commentaires,
            });

            await api.patch(`/applications/${application._id}/status`, {
                statut: 'Entretien',
                commentaire: `Entretien programmé le ${interviewForm.date} à ${interviewForm.heure}`,
            });

            setSuccess('Entretien programmé avec succès');
            setOpenInterviewDialog(false);
            fetchApplicationDetail();
        } catch (error) {
            console.error('Erreur programmation entretien:', error);
            setError(error.response?.data?.message || 'Erreur lors de la programmation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenAccept = () => {
        setOpenAcceptDialog(true);
    };

    const handleCloseAccept = () => {
        setOpenAcceptDialog(false);
    };

    const handleConfirmAccept = async () => {
        setSubmitting(true);
        setError('');
        try {
            await api.patch(`/applications/${application._id}/status`, {
                statut: 'Acceptee',
                commentaire: 'Candidature acceptée par le département',
            });

            setSuccess('Candidature acceptée avec succès');
            setOpenAcceptDialog(false);

            let stageId = internship?._id;

            if (!stageId) {
                const studentId = application.etudiantId?._id || application.etudiantId;
                const offerId = application.offreId?._id || application.offreId;
                
                if (studentId && offerId) {
                    const stageResponse = await api.post('/internships', {
                        etudiantId: studentId,
                        offreId: offerId,
                        applicationId: application._id,
                        dateDebut: application.offreId?.dateDebut || new Date().toISOString().split('T')[0],
                        dateFin: application.offreId?.dateFin || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
                        encadrantId: null,
                    });
                    
                    const newInternship = stageResponse.data?.data || stageResponse.data;
                    if (newInternship?._id) {
                        stageId = newInternship._id;
                        setSelectedStageId(stageId);
                        setInternship(newInternship);
                    }
                }
            }

            if (stageId) {
                setSelectedStageId(stageId);
                await fetchEncadrants();
                setOpenAssignDialog(true);
                setSuccess('Candidature acceptée. Veuillez affecter un encadrant.');
            } else {
                setError('Impossible de créer le stage. Veuillez réessayer.');
            }

            fetchApplicationDetail();
        } catch (error) {
            console.error('Erreur acceptation:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'acceptation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenAssign = () => {
        setSelectedEncadrant(internship?.encadrantId?._id || internship?.encadrantId || '');
        setOpenAssignDialog(true);
    };

    const handleCloseAssign = () => {
        setOpenAssignDialog(false);
    };

    const handleConfirmAssign = async () => {
        if (!selectedEncadrant) {
            setError('Veuillez sélectionner un encadrant');
            return;
        }

        if (!selectedStageId) {
            setError('Aucun stage associé à cette candidature');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await api.put(`/internships/${selectedStageId}/assign-supervisor`, {
                encadrantId: selectedEncadrant,
            });

            setSuccess('Encadrant affecté avec succès');
            setOpenAssignDialog(false);
            fetchApplicationDetail();
        } catch (error) {
            console.error('Erreur affectation:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'affectation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenComment = () => {
        setComment(internalNote);
        setOpenCommentDialog(true);
    };

    const handleCloseComment = () => {
        setOpenCommentDialog(false);
    };

    const handleSaveComment = async () => {
        setSubmitting(true);
        try {
            await api.patch(`/applications/${application._id}`, {
                commentaireInterne: comment,
            });
            setInternalNote(comment);
            setSuccess('Commentaire interne sauvegardé');
            setOpenCommentDialog(false);
        } catch (error) {
            console.error('Erreur sauvegarde commentaire:', error);
            setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================
    // UTILITAIRES
    // ============================================

    const getStatusLabel = (status) => {
        const labels = {
            'Brouillon': 'Brouillon',
            'Soumise': 'Soumise',
            'EnAnalyse': 'En analyse',
            'Entretien': 'Entretien',
            'Acceptee': 'Acceptée',
            'Refusee': 'Refusée',
        };
        return labels[status] || status;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Non défini';
        return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr });
    };

    const getTypeLabel = (type) => {
        const labels = {
            'presentiel': 'Présentiel',
            'visio': 'Visio',
            'telephonique': 'Téléphonique',
        };
        return labels[type] || type;
    };

    const getEncadrantName = (encadrant) => {
        if (!encadrant) return 'Non affecté';
        return `${encadrant.prenom || ''} ${encadrant.nom || ''}`.trim() || 'Encadrant';
    };

    const buildFileHref = (doc) => {
        if (!doc) return null;
        const apiRoot = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
        if (doc.gridFsId) {
            return `${apiRoot}/api/v1/documents/file/${doc.gridFsId}`;
        }
        if (doc.url) {
            if (doc.url.startsWith('/')) {
                return `${apiRoot}${doc.url}`;
            }
            return doc.url;
        }
        if (doc.chemin) {
            if (doc.chemin.startsWith('/')) {
                return `${apiRoot}${doc.chemin}`;
            }
            return doc.chemin;
        }
        return null;
    };

    const handleDownloadDocument = (doc) => {
        if (!doc) return;
        const href = buildFileHref(doc);
        if (href) {
            window.open(href, '_blank');
        } else {
            setError('Impossible de télécharger ce document');
        }
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

    if (!application) {
        return (
            <PageContainer maxWidth="lg">
                <Alert severity="error" sx={{ borderRadius: '8px' }}>
                    Candidature non trouvée
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/department/candidatures')} sx={{ mt: 2 }}>
                    Retour à la liste
                </Button>
            </PageContainer>
        );
    }

    const student = application.etudiantId || {};
    const offer = application.offreId || {};

    const canAct = ['Soumise', 'EnAnalyse', 'Entretien'].includes(application.statut);
    const isAccepted = application.statut === 'Acceptee';
    const isRefused = application.statut === 'Refusee';
    const isInInterview = application.statut === 'Entretien';
    const isAssigned = !!internship?.encadrantId;

    return (
        <PageContainer maxWidth="lg">
            {/* ===== BOUTON RETOUR - AU-DESSUS DE L'AVATAR (COMME RH) ===== */}
            <BackButton
                startIcon={<ArrowBack />}
                onClick={() => navigate('/department/candidatures')}
            >
                Retour à la liste
            </BackButton>

            {/* ===== EN-TÊTE ===== */}
            <HeaderSection>
                <HeaderLeft>
                    <StyledAvatar>
                        {student.prenom?.[0]}{student.nom?.[0]}
                    </StyledAvatar>
                    <Box>
                        <HeaderTitle>{student.prenom} {student.nom}</HeaderTitle>
                        <HeaderSubtitle>
                            {offer.titre || 'Offre sans titre'} • {offer.typeStage || 'Stage'}
                        </HeaderSubtitle>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <StatusBadge label={getStatusLabel(application.statut)} status={application.statut} />
                            <Chip
                                label={`Postulé le ${formatDate(application.dateSoumission || application.createdAt)}`}
                                size="small"
                                sx={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                            />
                        </Stack>
                    </Box>
                </HeaderLeft>

                {/* ===== BOUTONS D'ACTION - À DROITE ===== */}
                <Stack direction="row" spacing={1}>
                    {canAct && (
                        <>
                            <ActionButton
                                variant="outlined"
                                startIcon={<ThumbDown />}
                                onClick={handleOpenRefuse}
                                sx={{ borderColor: '#ef4444', color: '#ef4444' }}
                            >
                                Refuser
                            </ActionButton>
                            <ActionButton
                                variant="outlined"
                                startIcon={<Event />}
                                onClick={handleOpenInterview}
                                sx={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
                            >
                                Entretien
                            </ActionButton>
                            <ActionButton
                                variant="contained"
                                startIcon={<ThumbUp />}
                                onClick={handleOpenAccept}
                                sx={{ backgroundColor: '#22c55e', '&:hover': { backgroundColor: '#16a34a' } }}
                            >
                                Accepter
                            </ActionButton>
                        </>
                    )}
                    {isAccepted && !isAssigned && (
                        <ActionButton
                            variant="contained"
                            startIcon={<Person />}
                            onClick={handleOpenAssign}
                            sx={{ backgroundColor: '#2d3748', '&:hover': { backgroundColor: '#1a2332' } }}
                        >
                            Affecter un encadrant
                        </ActionButton>
                    )}
                </Stack>
            </HeaderSection>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{success}</Alert>}

            {/* ===== CONTENU PRINCIPAL ===== */}
            <Grid container spacing={3}>
                {/* ===== COLONNE GAUCHE ===== */}
                <Grid item xs={12} md={4}>
                    {/* Informations personnelles */}
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#2d3748">
                                <Person sx={{ fontSize: 16 }} />
                            </SectionIcon>
                            Informations
                        </SectionTitle>
                        <InfoRow>
                            <InfoIcon color="#148aa0">
                                <Email sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Email</InfoLabel>
                                <InfoValue>{student.email || 'Non renseigné'}</InfoValue>
                            </Box>
                        </InfoRow>
                        <InfoRow>
                            <InfoIcon color="#f59e0b">
                                <Phone sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Téléphone</InfoLabel>
                                <InfoValue>{student.telephone || 'Non renseigné'}</InfoValue>
                            </Box>
                        </InfoRow>
                        <InfoRow>
                            <InfoIcon color="#8b5cf6">
                                <Description sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>CIN</InfoLabel>
                                <InfoValue>{student.cin || 'Non renseigné'}</InfoValue>
                            </Box>
                        </InfoRow>
                    </DetailCard>

                    {/* Compétences */}
                    {application.competences && application.competences.length > 0 && (
                        <DetailCard>
                            <SectionTitle>
                                <SectionIcon color="#8b5cf6">
                                    <Assessment sx={{ fontSize: 16 }} />
                                </SectionIcon>
                                Compétences
                            </SectionTitle>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {application.competences.map((comp, idx) => (
                                    <CompetenceTag
                                        key={idx}
                                        label={`${comp.nom} - ${comp.niveau}`}
                                        niveau={comp.niveau}
                                    />
                                ))}
                            </Box>
                        </DetailCard>
                    )}

                    {/* Offre */}
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#f59e0b">
                                <Work sx={{ fontSize: 16 }} />
                            </SectionIcon>
                            Offre
                        </SectionTitle>
                        <InfoRow>
                            <InfoIcon color="#f59e0b">
                                <Business sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Titre</InfoLabel>
                                <InfoValue>{offer.titre || 'Offre sans titre'}</InfoValue>
                            </Box>
                        </InfoRow>
                        <InfoRow>
                            <InfoIcon color="#8b5cf6">
                                <School sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Type</InfoLabel>
                                <InfoValue>{offer.typeStage || 'Stage'}</InfoValue>
                            </Box>
                        </InfoRow>
                        <InfoRow>
                            <InfoIcon color="#4f46e5">
                                <People sx={{ fontSize: 16 }} />
                            </InfoIcon>
                            <Box>
                                <InfoLabel>Postes</InfoLabel>
                                <InfoValue>{offer.nbPostes || 'N/A'}</InfoValue>
                            </Box>
                        </InfoRow>
                        {offer.description && (
                            <InfoRow>
                                <Box>
                                    <InfoLabel>Description</InfoLabel>
                                    <InfoValue sx={{ fontWeight: 400, color: '#4a5568' }}>
                                        {offer.description}
                                    </InfoValue>
                                </Box>
                            </InfoRow>
                        )}
                    </DetailCard>

                    {/* Encadrant */}
                    {isAccepted && (
                        <DetailCard>
                            <SectionTitle>
                                <SectionIcon color="#4f46e5">
                                    <Person sx={{ fontSize: 16 }} />
                                </SectionIcon>
                                Encadrant
                            </SectionTitle>
                            {isAssigned ? (
                                <InfoRow>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#4f46e5', color: '#fff', fontSize: 14 }}>
                                        {getEncadrantName(internship?.encadrantId).split(' ').map(n => n[0]).join('') || '?'}
                                    </Avatar>
                                    <Box>
                                        <InfoLabel>Encadrant</InfoLabel>
                                        <InfoValue>{getEncadrantName(internship?.encadrantId)}</InfoValue>
                                    </Box>
                                </InfoRow>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                    <Typography variant="body2" color="#687480">
                                        Aucun encadrant affecté
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Person />}
                                        onClick={handleOpenAssign}
                                        sx={{ mt: 1, borderRadius: '8px', textTransform: 'none' }}
                                    >
                                        Affecter
                                    </Button>
                                </Box>
                            )}
                        </DetailCard>
                    )}
                </Grid>

                {/* ===== COLONNE DROITE ===== */}
                <Grid item xs={12} md={8}>
                    {/* Documents */}
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#22c55e">
                                <Description sx={{ fontSize: 16 }} />
                            </SectionIcon>
                            Documents
                        </SectionTitle>
                        {application.documents && application.documents.length > 0 ? (
                            application.documents.map((doc, idx) => (
                                <DocumentItem key={idx} verified={doc.isVerified}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Description sx={{ color: doc.isVerified ? '#22c55e' : '#f59e0b' }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight={500}>
                                                {doc.nomOriginal || doc.nom || 'Document'}
                                            </Typography>
                                            <Typography variant="caption" display="block" color="#687480">
                                                {doc.type || 'Autre'} • {doc.taille ? `${Math.round(doc.taille / 1024)} KB` : ''}
                                                {doc.isVerified && ' • Validé'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Tooltip title="Télécharger">
                                        <IconButton size="small" onClick={() => handleDownloadDocument(doc)} sx={{ color: '#4f46e5' }}>
                                            <Download fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </DocumentItem>
                            ))
                        ) : (
                            <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 2 }}>
                                Aucun document déposé
                            </Typography>
                        )}
                    </DetailCard>

                    {/* Expériences */}
                    {application.experiences && application.experiences.length > 0 && (
                        <DetailCard>
                            <SectionTitle>
                                <SectionIcon color="#f59e0b">
                                    <Work sx={{ fontSize: 16 }} />
                                </SectionIcon>
                                Expériences
                            </SectionTitle>
                            {application.experiences.map((exp, idx) => (
                                <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx < application.experiences.length - 1 ? '1px solid #f0f2f5' : 'none' }}>
                                    <Typography variant="body2" fontWeight={600} color="#1a2332">
                                        {exp.titre}
                                    </Typography>
                                    <Typography variant="body2" color="#687480">
                                        {exp.entreprise} • {exp.periode || 'Période non spécifiée'}
                                    </Typography>
                                    {exp.description && (
                                        <Typography variant="body2" color="#4a5568" sx={{ mt: 0.5 }}>
                                            {exp.description}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </DetailCard>
                    )}

                    {/* Projets */}
                    {application.projets && application.projets.length > 0 && (
                        <DetailCard>
                            <SectionTitle>
                                <SectionIcon color="#4f46e5">
                                    <Assessment sx={{ fontSize: 16 }} />
                                </SectionIcon>
                                Projets
                            </SectionTitle>
                            {application.projets.map((projet, idx) => (
                                <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx < application.projets.length - 1 ? '1px solid #f0f2f5' : 'none' }}>
                                    <Typography variant="body2" fontWeight={600} color="#1a2332">
                                        {projet.titre}
                                    </Typography>
                                    <Typography variant="body2" color="#687480">
                                        {projet.description}
                                    </Typography>
                                    {projet.technologies && projet.technologies.length > 0 && (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                            {projet.technologies.map((tech, i) => (
                                                <Chip key={i} label={tech} size="small" sx={{ backgroundColor: '#e0e7ff', color: '#4338ca' }} />
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </DetailCard>
                    )}

                    {/* Commentaire interne */}
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#4f46e5">
                                <Comment sx={{ fontSize: 16 }} />
                            </SectionIcon>
                            Commentaire interne
                        </SectionTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                            <Typography variant="body2" color="#687480" sx={{ flex: 1 }}>
                                {internalNote || 'Aucun commentaire interne pour le moment.'}
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={handleOpenComment}
                                size="small"
                                sx={{ borderRadius: '8px', textTransform: 'none' }}
                            >
                                {internalNote ? 'Modifier' : 'Ajouter'}
                            </Button>
                        </Box>
                    </DetailCard>
                </Grid>
            </Grid>

            {/* ========================================== */}
            {/* DIALOGS - SIMPLIFIÉS */}
            {/* ========================================== */}

            {/* --- DIALOG REFUS --- */}
            <Dialog open={openRefuseDialog} onClose={handleCloseRefuse} maxWidth="sm" fullWidth>
                <DialogTitle>Refuser la candidature</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Veuillez sélectionner un motif de refus.
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Motif du refus *</InputLabel>
                        <Select
                            value={refusalReason}
                            onChange={(e) => setRefusalReason(e.target.value)}
                            label="Motif du refus *"
                        >
                            {REFUSAL_REASONS.map((reason) => (
                                <MenuItem key={reason} value={reason}>{reason}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Commentaire (optionnel)"
                        value={refusalComment}
                        onChange={(e) => setRefusalComment(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRefuse}>Annuler</Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmRefuse}
                        disabled={submitting || !refusalReason}
                        sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Confirmer le refus'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- DIALOG ENTRETIEN --- */}
            <Dialog open={openInterviewDialog} onClose={handleCloseInterview} maxWidth="md" fullWidth>
                <DialogTitle>Programmer un entretien</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Date *"
                                type="date"
                                value={interviewForm.date}
                                onChange={(e) => handleInterviewChange('date', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Heure *"
                                type="time"
                                value={interviewForm.heure}
                                onChange={(e) => handleInterviewChange('heure', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Durée (minutes)"
                                type="number"
                                value={interviewForm.duree}
                                onChange={(e) => handleInterviewChange('duree', parseInt(e.target.value))}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type *</InputLabel>
                                <Select
                                    value={interviewForm.type}
                                    onChange={(e) => handleInterviewChange('type', e.target.value)}
                                    label="Type *"
                                >
                                    {INTERVIEW_TYPES.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {interviewForm.type === 'presentiel' && (
                            <Grid item xs={12}>
                                <TextField
                                    label="Lieu *"
                                    value={interviewForm.lieu}
                                    onChange={(e) => handleInterviewChange('lieu', e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                        )}
                        {interviewForm.type === 'visio' && (
                            <Grid item xs={12}>
                                <TextField
                                    label="Lien Visio *"
                                    value={interviewForm.lienVisio}
                                    onChange={(e) => handleInterviewChange('lienVisio', e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                label="Commentaires"
                                value={interviewForm.commentaires}
                                onChange={(e) => handleInterviewChange('commentaires', e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseInterview}>Annuler</Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmInterview}
                        disabled={submitting || !interviewForm.date || !interviewForm.heure}
                        sx={{ backgroundColor: '#8b5cf6', '&:hover': { backgroundColor: '#7c3aed' } }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Programmer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- DIALOG ACCEPTATION --- */}
            <Dialog open={openAcceptDialog} onClose={handleCloseAccept} maxWidth="sm" fullWidth>
                <DialogTitle>Accepter la candidature</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Êtes-vous sûr de vouloir accepter la candidature de{' '}
                        <strong>{student.prenom} {student.nom}</strong> ?
                    </Typography>
                    <Alert severity="info">
                        Une fois acceptée, vous pourrez affecter un encadrant et définir le sujet du stage.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAccept}>Annuler</Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmAccept}
                        disabled={submitting}
                        sx={{ backgroundColor: '#22c55e', '&:hover': { backgroundColor: '#16a34a' } }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Accepter'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- DIALOG AFFECTER ENCADRANT --- */}
            <Dialog open={openAssignDialog} onClose={handleCloseAssign} maxWidth="sm" fullWidth>
                <DialogTitle>Affecter un encadrant</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Sélectionnez un encadrant parmi les collaborateurs du département.
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Encadrant *</InputLabel>
                        <Select
                            value={selectedEncadrant}
                            onChange={(e) => setSelectedEncadrant(e.target.value)}
                            label="Encadrant *"
                        >
                            {encadrants.map((enc) => (
                                <MenuItem key={enc._id || enc.id} value={enc._id || enc.id}>
                                    {enc.prenom || ''} {enc.nom || ''} - {enc.email || ''}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Seuls les utilisateurs avec le rôle "Encadrant" sont affichés</FormHelperText>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAssign}>Annuler</Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmAssign}
                        disabled={submitting || !selectedEncadrant}
                        sx={{ backgroundColor: '#2d3748', '&:hover': { backgroundColor: '#1a2332' } }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Affecter'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- DIALOG COMMENTAIRE INTERNE --- */}
            <Dialog open={openCommentDialog} onClose={handleCloseComment} maxWidth="sm" fullWidth>
                <DialogTitle>Commentaire interne</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Ce commentaire est visible uniquement par le département.
                    </Typography>
                    <TextField
                        label="Commentaire"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseComment}>Annuler</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveComment}
                        disabled={submitting}
                        sx={{ backgroundColor: '#2d3748', '&:hover': { backgroundColor: '#1a2332' } }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Sauvegarder'}
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default CandidatureDetail;
// src/components/department/InternDetail.jsx
// ✅ VERSION AVEC BOUTON RETOUR STYLE RH (AU-DESSUS)

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Avatar,
    Chip,
    Button,
    Card,
    CardContent,
    Divider,
    LinearProgress,
    CircularProgress,
    Alert,
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
    Stepper,
    Step,
    StepLabel,
    StepContent,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    ArrowBack,
    Person,
    Email,
    Phone,
    School,
    Work,
    CalendarToday,
    Assessment,
    Description,
    CheckCircle,
    Pending,
    Cancel,
    Edit,
    Download,
    TrendingUp,
    PersonAdd,
    Assignment,
    Send,
    Save,
    Visibility,
    FilePresent,
    Comment,
    Business,
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
        'EnCours': { bg: '#dbeafe', text: '#1d4ed8' },
        'Termine': { bg: '#d1fae5', text: '#065f46' },
        'Annule': { bg: '#fee2e2', text: '#991b1b' },
        'EnAttente': { bg: '#fef3c7', text: '#d97706' },
        'ValideParDirecteur': { bg: '#d1fae5', text: '#065f46' },
        'DemandeEnvoyee': { bg: '#fef3c7', text: '#d97706' },
        'EngagementEnvoye': { bg: '#dbeafe', text: '#1d4ed8' },
        'EngagementValide': { bg: '#d1fae5', text: '#065f46' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
    };
    const color = colors[status] || colors['EnAttente'];
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
    marginBottom: '16px', // Espacement avant l'avatar
    '&:hover': {
        backgroundColor: 'transparent',
        color: '#1a2332',
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

const ProgressContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const InternDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [internship, setInternship] = useState(null);
    const [encadrants, setEncadrants] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Dialog states
    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [openSubjectDialog, setOpenSubjectDialog] = useState(false);
    const [openReportDialog, setOpenReportDialog] = useState(false);

    // Form states
    const [selectedEncadrant, setSelectedEncadrant] = useState('');
    const [subjectForm, setSubjectForm] = useState({
        titre: '',
        description: '',
        objectifs: '',
        technologies: '',
        livrables: '',
    });

    useEffect(() => {
        fetchInternshipDetail();
        fetchEncadrants();
    }, [id]);

    const fetchInternshipDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/internships/${id}`);
            let data = response.data?.data || response.data;
            setInternship(data);

            if (data.sujetTitre || data.sujetDescription) {
                setSubjectForm({
                    titre: data.sujetTitre || '',
                    description: data.sujetDescription || '',
                    objectifs: data.sujetObjectifs || '',
                    technologies: data.sujetTechnologies || '',
                    livrables: data.sujetLivrables || '',
                });
            }
        } catch (error) {
            console.error('Erreur chargement stage:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
            setInternship({
                _id: id || '1',
                etudiantId: {
                    nom: 'EL HASSANI',
                    prenom: 'Youssef',
                    email: 'youssef@test.ma',
                    telephone: '0612345987',
                },
                offreId: {
                    titre: 'Stage Développement Web',
                    typeStage: 'PFE',
                    description: 'Développement d\'applications web avec React et Node.js',
                },
                encadrantId: null,
                dateDebut: new Date(2026, 5, 1).toISOString(),
                dateFin: new Date(2026, 7, 31).toISOString(),
                statut: 'EnAttente',
                progression: 0,
                sujetTitre: '',
                sujetDescription: '',
                sujetObjectifs: '',
                sujetTechnologies: '',
                sujetLivrables: '',
                livrables: [],
                remarquesEncadrant: [],
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchEncadrants = async () => {
        try {
            const response = await api.get('/users/internal', {
                params: { role: 'Encadrant', departementId: user?.departementId }
            });
            const data = response.data?.data || [];
            setEncadrants(data);
        } catch (error) {
            console.error('Erreur chargement encadrants:', error);
            setEncadrants([
                { _id: 'enc1', nom: 'CHERKAOUI', prenom: 'Mohamed', email: 'mohamed@snrt.ma' },
                { _id: 'enc2', nom: 'ALAOUI', prenom: 'Karim', email: 'karim@snrt.ma' },
                { _id: 'enc3', nom: 'BENNANI', prenom: 'Yassine', email: 'yassine@snrt.ma' },
            ]);
        }
    };

    // ============================================
    // ACTIONS
    // ============================================

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
        if (!internship?._id) {
            setError('Aucun stage associé');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            const response = await api.put(`/internships/${internship._id}/assign-supervisor`, {
                encadrantId: selectedEncadrant,
            });

            if (response.data?.success) {
                setSuccess('Encadrant affecté avec succès');
                setOpenAssignDialog(false);
                fetchInternshipDetail();
            } else {
                setError(response.data?.message || 'Erreur lors de l\'affectation');
            }
        } catch (error) {
            console.error('Erreur affectation:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'affectation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenSubject = () => {
        setOpenSubjectDialog(true);
    };

    const handleCloseSubject = () => {
        setOpenSubjectDialog(false);
    };

    const handleSubjectChange = (field, value) => {
        setSubjectForm({ ...subjectForm, [field]: value });
        setError('');
    };

    const handleConfirmSubject = async () => {
        if (!subjectForm.titre) {
            setError('Le titre du sujet est obligatoire');
            return;
        }
        if (!internship?._id) {
            setError('Aucun stage associé');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            const response = await api.put(`/internships/${internship._id}/define-subject`, subjectForm);
            
            if (response.data?.success) {
                setSuccess('Sujet du stage défini avec succès');
                setOpenSubjectDialog(false);
                fetchInternshipDetail();
            } else {
                setError(response.data?.message || 'Erreur lors de la définition du sujet');
            }
        } catch (error) {
            console.error('Erreur définition sujet:', error);
            setError(error.response?.data?.message || 'Erreur lors de la définition du sujet');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenReport = async () => {
        setOpenReportDialog(true);
    };

    const handleCloseReport = () => {
        setOpenReportDialog(false);
    };

    const handleDownloadReport = async () => {
        if (!internship?._id) {
            setError('ID du stage non disponible');
            return;
        }

        setDownloading(true);
        setError('');
        try {
            const response = await api.get(`/internships/${internship._id}/report`, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Rapport_Stage_${internship.etudiantId?.nom || 'stagiaire'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setSuccess('Rapport téléchargé avec succès');
        } catch (error) {
            console.error('Erreur téléchargement rapport:', error);
            setError(error.response?.data?.message || 'Erreur lors du téléchargement');
        } finally {
            setDownloading(false);
        }
    };

    // ============================================
    // UTILITAIRES
    // ============================================

    const getStatusLabel = (status) => {
        const labels = {
            'EnCours': 'En cours',
            'Termine': 'Terminé',
            'Annule': 'Annulé',
            'EnAttente': 'En attente',
            'ValideParDirecteur': 'Validé par Directeur',
            'DemandeEnvoyee': 'Demande envoyée',
            'EngagementEnvoye': 'Engagement envoyé',
            'EngagementValide': 'Engagement validé',
            'Cloturee': 'Clôturé',
        };
        return labels[status] || status;
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return '#22c55e';
        if (progress >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Non défini';
        return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr });
    };

    const getInitials = (nom, prenom) => {
        if (!nom && !prenom) return '?';
        return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase() || '?';
    };

    const getEncadrantName = () => {
        const enc = internship?.encadrantId;
        if (!enc) return 'Non affecté';
        return `${enc.prenom || ''} ${enc.nom || ''}`.trim() || 'Encadrant';
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

    if (!internship) {
        return (
            <PageContainer maxWidth="lg">
                <Alert severity="error" sx={{ borderRadius: '8px' }}>
                    Stage non trouvé
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/department/interns')} sx={{ mt: 2 }}>
                    Retour à la liste
                </Button>
            </PageContainer>
        );
    }

    const student = internship.etudiantId || {};
    const offer = internship.offreId || {};
    const isAssigned = !!internship.encadrantId;
    const hasSubject = !!internship.sujetTitre;
    const hasReport = internship.livrables?.some(l => l.type === 'Rapport' && l.valide);
    const progress = internship.progression || 0;

    return (
        <PageContainer maxWidth="lg">
            {/* ===== BOUTON RETOUR - AU-DESSUS DE L'AVATAR (COMME RH) ===== */}
            <BackButton
                startIcon={<ArrowBack />}
                onClick={() => navigate('/department/interns')}
            >
                Retour à la liste
            </BackButton>

            {/* ===== EN-TÊTE ===== */}
            <HeaderSection>
                <HeaderLeft>
                    <StyledAvatar>
                        {getInitials(student.nom, student.prenom)}
                    </StyledAvatar>
                    <Box>
                        <HeaderTitle>{student.prenom} {student.nom}</HeaderTitle>
                        <HeaderSubtitle>
                            {offer.titre || 'Offre sans titre'} • {offer.typeStage || 'Stage'}
                        </HeaderSubtitle>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <StatusBadge label={getStatusLabel(internship.statut)} status={internship.statut} />
                            <Chip
                                label={`${progress}%`}
                                size="small"
                                sx={{
                                    backgroundColor: alpha(getProgressColor(progress), 0.12),
                                    color: getProgressColor(progress),
                                    fontWeight: 600,
                                    fontSize: '12px',
                                }}
                            />
                        </Box>
                    </Box>
                </HeaderLeft>

                {/* ===== BOUTONS D'ACTION - À DROITE ===== */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {!isAssigned && (
                        <ActionButton
                            variant="contained"
                            startIcon={<PersonAdd />}
                            onClick={handleOpenAssign}
                            sx={{ backgroundColor: '#2d3748', '&:hover': { backgroundColor: '#1a2332' } }}
                        >
                            Affecter un encadrant
                        </ActionButton>
                    )}
                    <ActionButton
                        variant="outlined"
                        startIcon={<Assignment />}
                        onClick={handleOpenSubject}
                        sx={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
                    >
                        {hasSubject ? 'Modifier le sujet' : 'Définir le sujet'}
                    </ActionButton>
                    {hasReport && (
                        <ActionButton
                            variant="outlined"
                            startIcon={<Description />}
                            onClick={handleOpenReport}
                            sx={{ borderColor: '#22c55e', color: '#22c55e' }}
                        >
                            Consulter le rapport
                        </ActionButton>
                    )}
                </Box>
            </HeaderSection>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{success}</Alert>}

            {/* ===== PROGRESSION ===== */}
            <DetailCard>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} color="#1a2332">
                            Progression du stage
                        </Typography>
                        <Typography variant="caption" color="#687480">
                            {progress}% complété • {formatDate(internship.dateDebut)} - {formatDate(internship.dateFin)}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                width: 150,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#eef1f3',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: getProgressColor(progress),
                                    borderRadius: 4,
                                },
                            }}
                        />
                        <Typography variant="body2" fontWeight={700} color={getProgressColor(progress)}>
                            {progress}%
                        </Typography>
                    </Box>
                </Box>
            </DetailCard>

            {/* ===== CONTENU PRINCIPAL ===== */}
            <Grid container spacing={3}>
                {/* ===== COLONNE GAUCHE ===== */}
                <Grid item xs={12} md={4}>
                    {/* Informations stagiaire */}
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#2d3748">
                                <Person sx={{ fontSize: 16 }} />
                            </SectionIcon>
                            Stagiaire
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
                    </DetailCard>

                    {/* Encadrant */}
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
                                    {getInitials(
                                        internship.encadrantId?.nom,
                                        internship.encadrantId?.prenom
                                    )}
                                </Avatar>
                                <Box>
                                    <InfoLabel>Encadrant</InfoLabel>
                                    <InfoValue>{getEncadrantName()}</InfoValue>
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
                                    startIcon={<PersonAdd />}
                                    onClick={handleOpenAssign}
                                    sx={{ mt: 1, borderRadius: '8px', textTransform: 'none' }}
                                >
                                    Affecter
                                </Button>
                            </Box>
                        )}
                    </DetailCard>

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
                </Grid>

                {/* ===== COLONNE DROITE ===== */}
                <Grid item xs={12} md={8}>
                    {/* Sujet du stage */}
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#8b5cf6">
                                <Assignment sx={{ fontSize: 16 }} />
                            </SectionIcon>
                            Sujet du stage
                        </SectionTitle>
                        {hasSubject ? (
                            <Box>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#1a2332' }}>
                                    {internship.sujetTitre}
                                </Typography>
                                {internship.sujetDescription && (
                                    <Typography variant="body2" color="#4a5568" sx={{ mb: 2 }}>
                                        {internship.sujetDescription}
                                    </Typography>
                                )}
                                {internship.sujetObjectifs && (
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="subtitle2" fontWeight={600} color="#1a2332">
                                            Objectifs :
                                        </Typography>
                                        <Typography variant="body2" color="#4a5568">
                                            {internship.sujetObjectifs}
                                        </Typography>
                                    </Box>
                                )}
                                {internship.sujetTechnologies && (
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="subtitle2" fontWeight={600} color="#1a2332">
                                            Technologies :
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {internship.sujetTechnologies.split(',').map((tech, i) => (
                                                <Chip key={i} label={tech.trim()} size="small" sx={{ backgroundColor: '#e0e7ff', color: '#4338ca' }} />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                                {internship.sujetLivrables && (
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600} color="#1a2332">
                                            Livrables attendus :
                                        </Typography>
                                        <Typography variant="body2" color="#4a5568">
                                            {internship.sujetLivrables}
                                        </Typography>
                                    </Box>
                                )}
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Edit />}
                                    onClick={handleOpenSubject}
                                    sx={{ mt: 2, borderRadius: '8px', textTransform: 'none' }}
                                >
                                    Modifier
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <Typography variant="body2" color="#687480">
                                    Aucun sujet défini pour ce stage
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Assignment />}
                                    onClick={handleOpenSubject}
                                    sx={{ mt: 1, backgroundColor: '#2d3748', borderRadius: '8px', textTransform: 'none' }}
                                >
                                    Définir le sujet
                                </Button>
                            </Box>
                        )}
                    </DetailCard>

                    {/* Livrables */}
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#22c55e">
                                <Description sx={{ fontSize: 16 }} />
                            </SectionIcon>
                            Livrables
                        </SectionTitle>
                        {internship.livrables && internship.livrables.length > 0 ? (
                            <List dense sx={{ p: 0 }}>
                                {internship.livrables.map((livrable, idx) => (
                                    <ListItem key={idx} sx={{ px: 0, py: 1, borderBottom: '1px solid #f0f2f5' }}>
                                        <ListItemIcon>
                                            {livrable.valide ? (
                                                <CheckCircle sx={{ color: '#22c55e', fontSize: 18 }} />
                                            ) : (
                                                <Pending sx={{ color: '#f59e0b', fontSize: 18 }} />
                                            )}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={<Typography variant="body2" fontWeight={500}>{livrable.nom || 'Livrable'}</Typography>}
                                            secondary={livrable.dateDepot ? formatDate(livrable.dateDepot) : 'Non déposé'}
                                        />
                                        <Chip
                                            label={livrable.valide ? 'Validé' : 'En attente'}
                                            size="small"
                                            sx={{
                                                backgroundColor: livrable.valide ? '#d1fae5' : '#fef3c7',
                                                color: livrable.valide ? '#065f46' : '#d97706',
                                                fontWeight: 500,
                                                fontSize: '11px',
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 2 }}>
                                Aucun livrable déposé
                            </Typography>
                        )}
                    </DetailCard>

                    {/* Remarques de l'encadrant */}
                    <DetailCard>
                        <SectionTitle>
                            <SectionIcon color="#4f46e5">
                                <Comment sx={{ fontSize: 16 }} />
                            </SectionIcon>
                            Remarques
                        </SectionTitle>
                        {internship.remarquesEncadrant && internship.remarquesEncadrant.length > 0 ? (
                            <Box>
                                {internship.remarquesEncadrant.map((remarque, idx) => (
                                    <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx < internship.remarquesEncadrant.length - 1 ? '1px solid #f0f2f5' : 'none' }}>
                                        <Typography variant="body2" color="#1a2332">
                                            {remarque.message}
                                        </Typography>
                                        <Typography variant="caption" color="#9aa4ac">
                                            {remarque.auteurId?.prenom || ''} {remarque.auteurId?.nom || ''} • {formatDate(remarque.date)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="#687480" sx={{ textAlign: 'center', py: 2 }}>
                                Aucune remarque pour le moment
                            </Typography>
                        )}
                    </DetailCard>
                </Grid>
            </Grid>

            {/* ========================================== */}
            {/* DIALOGS */}
            {/* ========================================== */}

            {/* --- DIALOG AFFECTER ENCADRANT --- */}
            <Dialog
                open={openAssignDialog}
                onClose={handleCloseAssign}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '12px', padding: '8px' },
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonAdd sx={{ color: '#2d3748' }} />
                    Affecter un encadrant
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="#687480" sx={{ mb: 3 }}>
                        Sélectionnez un encadrant parmi les collaborateurs du département.
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Encadrant *</InputLabel>
                        <Select
                            value={selectedEncadrant}
                            onChange={(e) => setSelectedEncadrant(e.target.value)}
                            label="Encadrant *"
                            sx={{ borderRadius: '8px' }}
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
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleCloseAssign} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmAssign}
                        disabled={submitting || !selectedEncadrant}
                        sx={{
                            backgroundColor: '#2d3748',
                            borderRadius: '8px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#1a2332' },
                        }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Affecter'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- DIALOG DÉFINIR SUJET --- */}
            <Dialog
                open={openSubjectDialog}
                onClose={handleCloseSubject}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '12px', padding: '8px' },
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment sx={{ color: '#8b5cf6' }} />
                    {hasSubject ? 'Modifier le sujet du stage' : 'Définir le sujet du stage'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="#687480" sx={{ mb: 3 }}>
                        {hasSubject 
                            ? 'Modifiez les informations du sujet de stage.'
                            : 'Définissez le sujet du stage que l\'étudiant devra réaliser.'}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Titre du sujet *"
                                value={subjectForm.titre}
                                onChange={(e) => handleSubjectChange('titre', e.target.value)}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                value={subjectForm.description}
                                onChange={(e) => handleSubjectChange('description', e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Objectifs"
                                value={subjectForm.objectifs}
                                onChange={(e) => handleSubjectChange('objectifs', e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Technologies"
                                value={subjectForm.technologies}
                                onChange={(e) => handleSubjectChange('technologies', e.target.value)}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Livrables attendus"
                                value={subjectForm.livrables}
                                onChange={(e) => handleSubjectChange('livrables', e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleCloseSubject} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmSubject}
                        disabled={submitting || !subjectForm.titre}
                        sx={{
                            backgroundColor: '#2d3748',
                            borderRadius: '8px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#1a2332' },
                        }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Enregistrer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- DIALOG CONSULTER RAPPORT --- */}
            <Dialog
                open={openReportDialog}
                onClose={handleCloseReport}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '12px', padding: '8px' },
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description sx={{ color: '#22c55e' }} />
                    Rapport de stage
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <FilePresent sx={{ fontSize: 56, color: '#22c55e' }} />
                        <Typography variant="h6" sx={{ mt: 2, fontWeight: 600, color: '#1a2332' }}>
                            Rapport disponible
                        </Typography>
                        <Typography variant="body2" color="#687480" sx={{ mt: 1 }}>
                            Le rapport a été déposé et validé par l'encadrant.
                            <br />
                            <strong>{student.prenom} {student.nom}</strong> • {offer.titre}
                        </Typography>
                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                startIcon={<Download />}
                                onClick={handleDownloadReport}
                                disabled={downloading}
                                sx={{
                                    backgroundColor: '#2d3748',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#1a2332' },
                                }}
                            >
                                {downloading ? <CircularProgress size={20} color="inherit" /> : 'Télécharger'}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Visibility />}
                                onClick={() => window.open(`/api/v1/internships/${internship._id}/report`, '_blank')}
                                sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#148aa0', color: '#148aa0' }}
                            >
                                Voir en ligne
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleCloseReport} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default InternDetail;
// src/components/rh/GenerateConvention.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    TextField,
    Divider,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemAvatar,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    Download,
    Description,
    ArrowBack,
    CheckCircle,
    Print,
    Search,
    FileCopy,
    DoneAll,
    Person,
    Work,
    CalendarToday,
    Email,
    School,
    Event,
    Upload,
    Visibility,
    Send,
    Edit,
    Cancel,
    PictureAsPdf,
    InsertDriveFile,
    Image,
    RemoveRedEye,
    CloudUpload,
    Check,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const PageHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
});

const StyledCard = styled(Card)({
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
});

const StepIconWrapper = styled(Box)(({ active, completed }) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: completed ? '#22c55e' : active ? '#2d3748' : '#e5e7eb',
    color: completed || active ? '#fff' : '#999',
    fontSize: '16px',
    fontWeight: 600,
}));

const InfoRow = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 0',
    '& .MuiSvgIcon-root': {
        color: '#2d3748',
        fontSize: '18px',
    },
});

const SearchContainer = styled(Box)({
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
});

const InfoPaper = styled(Paper)({
    padding: '20px 24px',
    backgroundColor: '#fafbfc',
    borderRadius: '10px',
    border: '1px solid #eef1f3',
});

const ActionButtons = styled(Box)({
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '16px',
});

const StatusChipStyled = styled(Chip)(({ status }) => {
    const colors = {
        'EnCours': { bg: '#d1fae5', text: '#065f46' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
        'Acceptee': { bg: '#d1fae5', text: '#065f46' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
        'EnAttente': { bg: '#dbeafe', text: '#1d4ed8' },
        'Soumise': { bg: '#dbeafe', text: '#1d4ed8' },
    };
    const color = colors[status] || colors['EnAttente'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 600,
        fontSize: '12px',
        height: '28px',
        padding: '0 14px',
    };
});

const SummaryPaper = styled(Paper)({
    marginTop: '24px',
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: '#fafbfc',
    border: '1px solid #eef1f3',
});

const TagChip = styled(Chip)({
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
    '&.purple': {
        backgroundColor: '#f3e8ff',
        color: '#6b21a8',
    },
    '&.orange': {
        backgroundColor: '#fef3c7',
        color: '#d97706',
    },
    '&.green': {
        backgroundColor: '#d1fae5',
        color: '#065f46',
    },
    '&.red': {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
    },
});

const PrimaryButton = styled(Button)(({ disabled, color }) => ({
    backgroundColor: disabled ? '#999999' : (color === 'success' ? '#22c55e' : '#2d3748'),
    color: '#ffffff',
    borderRadius: '10px',
    textTransform: 'none',
    padding: '10px 24px',
    '&:hover': {
        backgroundColor: disabled ? '#999999' : (color === 'success' ? '#16a34a' : '#1a202c'),
    },
    '&:disabled': {
        backgroundColor: '#999999',
        color: '#ffffff',
    },
}));

const SecondaryButton = styled(Button)({
    borderRadius: '10px',
    borderColor: '#2d3748',
    color: '#2d3748',
    textTransform: 'none',
    padding: '10px 24px',
    '&:hover': {
        borderColor: '#1a202c',
        backgroundColor: alpha('#2d3748', 0.04),
    },
});

const OutlinedButton = styled(Button)({
    borderRadius: '10px',
    borderColor: '#d0d4d8',
    color: '#6b7280',
    textTransform: 'none',
    padding: '10px 24px',
    '&:hover': {
        borderColor: '#2d3748',
        backgroundColor: alpha('#2d3748', 0.04),
    },
});

const DocumentCard = styled(Paper)({
    padding: '16px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #eef1f3',
    marginBottom: '12px',
    '&:hover': {
        backgroundColor: '#fafbfc',
    },
});

const DocumentIcon = styled(Box)({
    width: 40,
    height: 40,
    borderRadius: '8px',
    backgroundColor: '#e8edf0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    '& .MuiSvgIcon-root': {
        color: '#2d3748',
        fontSize: 20,
    },
});

const EmptyState = styled(Box)({
    textAlign: 'center',
    padding: '40px 20px',
    '& .MuiSvgIcon-root': {
        fontSize: 48,
        color: '#ccc',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const GenerateConvention = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [internshipId, setInternshipId] = useState('');
    const [internshipData, setInternshipData] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [conventionFile, setConventionFile] = useState(null);
    const [signDialogOpen, setSignDialogOpen] = useState(false);
    const [signature, setSignature] = useState('');

    // ✅ Vérifier les conditions
    const isEligible = internshipData && 
        internshipData.statut === 'EnCours' && 
        internshipData.applicationStatut === 'Acceptee';

    const steps = [
        {
            label: 'Rechercher le stage',
            description: 'Saisissez l\'ID du stage pour charger les données',
            icon: <Search />,
        },
        {
            label: 'Vérifier les informations',
            description: 'Confirmez les données et vérifiez les conditions',
            icon: <DoneAll />,
        },
        {
            label: 'Gérer la convention',
            description: 'Ajoutez votre signature et réenvoyez la convention',
            icon: <FileCopy />,
        },
    ];

    const fetchInternshipData = async () => {
        if (!internshipId) {
            setError('Veuillez saisir l\'ID du stage');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setConventionFile(null);

        try {
            const response = await api.get(`/internships/${internshipId}`);
            if (response.data?.data) {
                const data = response.data.data;
                
                // ✅ Récupérer le statut de l'application
                let applicationStatut = 'EnAttente';
                try {
                    if (data.applicationId) {
                        const appResponse = await api.get(`/applications/${data.applicationId}`);
                        if (appResponse.data?.data) {
                            applicationStatut = appResponse.data.data.statut || 'EnAttente';
                        }
                    }
                } catch (appError) {
                    console.warn('Erreur chargement application:', appError);
                }

                setInternshipData({
                    ...data,
                    applicationStatut,
                });
                
                // ✅ Vérifier si une convention existe déjà
                if (data.conventionFile) {
                    setConventionFile(data.conventionFile);
                }

                setSuccess('Données du stage chargées avec succès');
                
                // ✅ Si le stage est éligible, passer à l'étape 2
                if (data.statut === 'EnCours' && applicationStatut === 'Acceptee') {
                    setActiveStep(2);
                } else {
                    setActiveStep(1);
                }
            } else {
                setError('Stage non trouvé');
            }
        } catch (error) {
            console.error('Erreur chargement stage:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // ✅ Vérifier le type de fichier
        if (file.type !== 'application/pdf') {
            setError('Seul le format PDF est accepté');
            return;
        }

        // ✅ Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Le fichier ne doit pas dépasser 5MB');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('convention', file);
            formData.append('internshipId', internshipId);

            const response = await api.post(`/internships/${internshipId}/convention`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data?.data) {
                setConventionFile(response.data.data);
                setSuccess('Convention déposée avec succès');
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            setError(error.response?.data?.message || 'Erreur lors du dépôt');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleAddSignature = async () => {
        if (!signature.trim()) {
            setError('Veuillez saisir votre signature');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post(`/internships/${internshipId}/sign-convention`, {
                signature: signature,
                signedBy: user?.id,
            });

            if (response.data?.success) {
                setSuccess('Signature ajoutée avec succès');
                setSignDialogOpen(false);
                setSignature('');
                fetchInternshipData();
            }
        } catch (error) {
            console.error('Erreur signature:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'ajout de la signature');
        } finally {
            setLoading(false);
        }
    };

    const handleSendToStudent = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.post(`/internships/${internshipId}/send-convention`);

            if (response.data?.success) {
                setSuccess('Convention envoyée à l\'étudiant avec succès');
                fetchInternshipData();
            }
        } catch (error) {
            console.error('Erreur envoi:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'envoi');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setInternshipId('');
        setInternshipData(null);
        setActiveStep(0);
        setConventionFile(null);
        setSuccess('');
        setError('');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusChip = (status) => {
        return <StatusChipStyled label={status || 'En cours'} status={status} size="small" />;
    };

    const getFileIcon = (file) => {
        if (!file) return <InsertDriveFile />;
        const name = file.nomOriginal || file.nom || '';
        const ext = name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') {
            return <PictureAsPdf sx={{ color: '#ef4444' }} />;
        }
        return <InsertDriveFile />;
    };

    const getFileSize = (size) => {
        if (!size) return 'Taille inconnue';
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    const buildFileHref = (file) => {
        if (!file) return null;
        const apiRoot = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
        if (file.gridFsId) {
            return `${apiRoot}/api/v1/documents/file/${file.gridFsId}`;
        }
        if (file.url) {
            if (file.url.startsWith('/')) return `${apiRoot}${file.url}`;
            return file.url;
        }
        if (file.chemin) {
            if (file.chemin.startsWith('/')) return `${apiRoot}${file.chemin}`;
            return file.chemin;
        }
        return null;
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Gestion de la convention
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Vérifiez et gérez la convention de stage
                    </Typography>
                </Box>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/rh')}
                    sx={{ color: '#6b7280', textTransform: 'none' }}
                >
                    Retour
                </Button>
            </PageHeader>

            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 3, borderRadius: '10px' }} 
                    onClose={() => setError('')}
                >
                    {error}
                </Alert>
            )}
            {success && (
                <Alert 
                    severity="success" 
                    sx={{ mb: 3, borderRadius: '10px' }} 
                    onClose={() => setSuccess('')}
                >
                    {success}
                </Alert>
            )}

            <StyledCard>
                <CardContent sx={{ p: 4 }}>
                    <Stepper activeStep={activeStep} orientation="vertical">
                        {steps.map((step, index) => (
                            <Step key={step.label} active={activeStep === index} completed={activeStep > index}>
                                <StepLabel
                                    StepIconComponent={() => (
                                        <StepIconWrapper active={activeStep === index} completed={activeStep > index}>
                                            {activeStep > index ? <CheckCircle sx={{ fontSize: 16 }} /> : index + 1}
                                        </StepIconWrapper>
                                    )}
                                    sx={{
                                        '& .MuiStepLabel-label': {
                                            fontWeight: activeStep === index ? 600 : 400,
                                            color: activeStep === index ? '#2d3748' : '#999',
                                        },
                                    }}
                                >
                                    {step.label}
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {step.description}
                                    </Typography>
                                </StepLabel>
                                <StepContent>
                                    {/* ÉTAPE 0 : RECHERCHE */}
                                    {index === 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            <SearchContainer>
                                                <TextField
                                                    label="ID du stage *"
                                                    value={internshipId}
                                                    onChange={(e) => setInternshipId(e.target.value)}
                                                    placeholder="Entrez l'ID du stage"
                                                    sx={{ flex: 2, minWidth: '200px' }}
                                                    disabled={loading || activeStep > 0}
                                                    InputLabelProps={{ shrink: true }}
                                                    InputProps={{
                                                        sx: { borderRadius: '10px' },
                                                    }}
                                                />
                                                <PrimaryButton
                                                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Search />}
                                                    onClick={fetchInternshipData}
                                                    disabled={loading || !internshipId || activeStep > 0}
                                                >
                                                    {loading ? 'Chargement...' : 'Rechercher'}
                                                </PrimaryButton>
                                            </SearchContainer>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                Exemple : 67f8a1b2c3d4e5f6g7h8i9j0
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* ÉTAPE 1 : VÉRIFICATION DES INFORMATIONS */}
                                    {index === 1 && internshipData && (
                                        <Box sx={{ mt: 1 }}>
                                            <InfoPaper>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                Informations du stage
                                                            </Typography>
                                                            {getStatusChip(internshipData.statut)}
                                                        </Box>
                                                        <Divider sx={{ mb: 2 }} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <InfoRow>
                                                            <Person />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Stagiaire
                                                                </Typography>
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    {internshipData.etudiantId?.prenom || ''} {internshipData.etudiantId?.nom || ''}
                                                                </Typography>
                                                            </Box>
                                                        </InfoRow>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <InfoRow>
                                                            <Email />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Email
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {internshipData.etudiantId?.email || 'Non renseigné'}
                                                                </Typography>
                                                            </Box>
                                                        </InfoRow>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <InfoRow>
                                                            <School />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Université
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {internshipData.etudiantId?.universite || 'Non renseignée'}
                                                                </Typography>
                                                            </Box>
                                                        </InfoRow>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <InfoRow>
                                                            <Work />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Offre
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {internshipData.offreId?.titre || 'Non spécifié'}
                                                                </Typography>
                                                            </Box>
                                                        </InfoRow>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <InfoRow>
                                                            <CalendarToday />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Date de début
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {formatDate(internshipData.dateDebut)}
                                                                </Typography>
                                                            </Box>
                                                        </InfoRow>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <InfoRow>
                                                            <Event />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Date de fin
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {formatDate(internshipData.dateFin)}
                                                                </Typography>
                                                            </Box>
                                                        </InfoRow>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <InfoRow>
                                                            <Person />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Encadrant
                                                                </Typography>
                                                                <Typography variant="body2">
                                                                    {internshipData.encadrantId?.prenom || ''} {internshipData.encadrantId?.nom || ''}
                                                                </Typography>
                                                            </Box>
                                                        </InfoRow>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <InfoRow>
                                                            <CheckCircle />
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Statut de la candidature
                                                                </Typography>
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    {internshipData.applicationStatut === 'Acceptee' ? (
                                                                        <Chip label="Acceptée" size="small" sx={{ backgroundColor: '#d1fae5', color: '#065f46' }} />
                                                                    ) : (
                                                                        <Chip label={internshipData.applicationStatut || 'En attente'} size="small" sx={{ backgroundColor: '#fef3c7', color: '#d97706' }} />
                                                                    )}
                                                                </Typography>
                                                            </Box>
                                                        </InfoRow>
                                                    </Grid>
                                                </Grid>

                                                {/* ✅ Conditions de validation */}
                                                <Box sx={{ mt: 3, p: 2, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eef1f3' }}>
                                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                                        Conditions pour gérer la convention :
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {internshipData.statut === 'EnCours' ? (
                                                                <Check sx={{ color: '#22c55e' }} />
                                                            ) : (
                                                                <Cancel sx={{ color: '#ef4444' }} />
                                                            )}
                                                            <Typography variant="body2">
                                                                Stage en cours {internshipData.statut !== 'EnCours' && `(actuel: ${internshipData.statut})`}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {internshipData.applicationStatut === 'Acceptee' ? (
                                                                <Check sx={{ color: '#22c55e' }} />
                                                            ) : (
                                                                <Cancel sx={{ color: '#ef4444' }} />
                                                            )}
                                                            <Typography variant="body2">
                                                                Étudiant accepté {internshipData.applicationStatut !== 'Acceptee' && `(actuel: ${internshipData.applicationStatut})`}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </InfoPaper>

                                            <ActionButtons>
                                                <OutlinedButton onClick={handleReset}>
                                                    Modifier
                                                </OutlinedButton>
                                                {isEligible && (
                                                    <PrimaryButton
                                                        onClick={() => setActiveStep(2)}
                                                        startIcon={<FileCopy />}
                                                    >
                                                        Gérer la convention
                                                    </PrimaryButton>
                                                )}
                                            </ActionButtons>
                                        </Box>
                                    )}

                                    {/* ÉTAPE 2 : GÉRER LA CONVENTION */}
                                    {index === 2 && internshipData && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                                Convention de stage
                                            </Typography>

                                            {/* Document actuel */}
                                            {conventionFile ? (
                                                <DocumentCard>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <DocumentIcon>
                                                            {getFileIcon(conventionFile)}
                                                        </DocumentIcon>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {conventionFile.nomOriginal || conventionFile.nom || 'Convention.pdf'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {getFileSize(conventionFile.taille)} • Déposé le {formatDate(conventionFile.dateUpload)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box>
                                                        <Tooltip title="Voir">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    const href = buildFileHref(conventionFile);
                                                                    if (href) window.open(href, '_blank');
                                                                }}
                                                                sx={{ color: '#2d3748' }}
                                                            >
                                                                <Visibility fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </DocumentCard>
                                            ) : (
                                                <Box sx={{ mb: 3 }}>
                                                    <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
                                                        Aucune convention déposée par l'étudiant.
                                                    </Alert>
                                                    <Button
                                                        variant="outlined"
                                                        component="label"
                                                        startIcon={<Upload />}
                                                        disabled={uploading}
                                                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                                                    >
                                                        {uploading ? 'Dépôt en cours...' : 'Déposer la convention'}
                                                        <input
                                                            type="file"
                                                            hidden
                                                            accept=".pdf"
                                                            onChange={handleFileUpload}
                                                            ref={fileInputRef}
                                                        />
                                                    </Button>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                        Format PDF uniquement, max 5MB
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Divider sx={{ my: 3 }} />

                                            {/* Actions RH */}
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                                Actions RH
                                            </Typography>

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {conventionFile && (
                                                    <PrimaryButton
                                                        startIcon={<Edit />}
                                                        onClick={() => setSignDialogOpen(true)}
                                                        sx={{ width: 'fit-content' }}
                                                    >
                                                        Ajouter la signature électronique
                                                    </PrimaryButton>
                                                )}

                                                {conventionFile && (
                                                    <PrimaryButton
                                                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send />}
                                                        onClick={handleSendToStudent}
                                                        disabled={loading}
                                                        color="success"
                                                        sx={{ width: 'fit-content' }}
                                                    >
                                                        {loading ? 'Envoi...' : 'Réenvoyer à l\'étudiant'}
                                                    </PrimaryButton>
                                                )}

                                                <OutlinedButton onClick={handleReset} sx={{ width: 'fit-content' }}>
                                                    Nouvelle recherche
                                                </OutlinedButton>
                                            </Box>

                                            {/* Statut de la convention */}
                                            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    <strong>Statut :</strong> {conventionFile ? 'Convention déposée' : 'En attente de dépôt'}
                                                </Typography>
                                                {conventionFile && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        <strong>Signée par RH :</strong> {conventionFile.signedBy ? '✅ Oui' : '❌ Non'}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                </CardContent>
            </StyledCard>

            {/* ===== DIALOG SIGNATURE ===== */}
            <Dialog
                open={signDialogOpen}
                onClose={() => setSignDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Edit sx={{ color: '#2d3748' }} />
                        Ajouter la signature électronique
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Saisissez votre signature électronique pour valider la convention.
                    </Typography>
                    <TextField
                        label="Signature"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Ex: Dr. Karim BENNANI, Responsable RH"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                    <Alert severity="info" sx={{ mt: 2, borderRadius: '10px' }}>
                        Cette signature sera apposée sur la convention avant envoi à l'étudiant.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={() => setSignDialogOpen(false)}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Annuler
                    </Button>
                    <PrimaryButton
                        onClick={handleAddSignature}
                        disabled={loading || !signature.trim()}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Ajouter la signature'}
                    </PrimaryButton>
                </DialogActions>
            </Dialog>

            {/* ===== RÉSUMÉ ===== */}
            <SummaryPaper>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Gestion de la convention de stage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    La convention de stage doit être signée par l'étudiant, l'encadrant et le responsable RH.
                    Une fois complète, elle est envoyée à l'étudiant pour validation finale.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    <TagChip label="PDF requis" size="small" />
                    <TagChip label="Signature électronique" size="small" className="purple" />
                    <TagChip label="Envoi étudiant" size="small" className="green" />
                </Box>
            </SummaryPaper>
        </Container>
    );
};

export default GenerateConvention;
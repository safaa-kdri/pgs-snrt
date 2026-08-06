// src/components/rh/GenerateConvention.jsx
import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { pdfService } from '../../services/pdfService';

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

const StyledButton = styled(Button)({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 500,
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
        'EnCours': { bg: '#fef3c7', text: '#d97706' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
        'Acceptee': { bg: '#d1fae5', text: '#065f46' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
        'EnAttente': { bg: '#dbeafe', text: '#1d4ed8' },
    };
    const color = colors[status] || colors['EnAttente'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '12px',
        height: '26px',
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
});

const PrimaryButton = styled(Button)({
    backgroundColor: '#2d3748',
    color: '#ffffff',
    borderRadius: '10px',
    textTransform: 'none',
    padding: '10px 24px',
    '&:hover': {
        backgroundColor: '#1a202c',
    },
    '&:disabled': {
        backgroundColor: '#999999',
        color: '#ffffff',
    },
});

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

const DownloadInfoBox = styled(Box)({
    marginTop: '16px',
    padding: '16px 20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #eef1f3',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const GenerateConvention = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [internshipId, setInternshipId] = useState('');
    const [internshipData, setInternshipData] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);

    const steps = [
        {
            label: 'Rechercher le stage',
            description: 'Saisissez l\'ID du stage pour charger les données',
            icon: <Search />,
        },
        {
            label: 'Vérifier les informations',
            description: 'Confirmez les données du stagiaire et du stage',
            icon: <DoneAll />,
        },
        {
            label: 'Générer la convention',
            description: 'Téléchargez la convention au format PDF',
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
        setGeneratedPdfUrl(null);

        try {
            const response = await api.get(`/internships/${internshipId}`);
            if (response.data?.data) {
                setInternshipData(response.data.data);
                setSuccess('Données du stage chargées avec succès');
                setActiveStep(1);
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

    const handleGenerateConvention = async () => {
        if (!internshipData) {
            setError('Veuillez d\'abord charger les données du stage');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.get(`/internships/${internshipId}/generate-convention`, {
                responseType: 'blob',
            });

            const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            setGeneratedPdfUrl(blobUrl);
            setActiveStep(2);

            setSuccess('Convention générée avec succès');
        } catch (error) {
            console.error('Erreur génération convention:', error);
            setError(error.response?.data?.message || 'Erreur lors de la génération');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = () => {
        if (generatedPdfUrl) {
            const link = document.createElement('a');
            link.href = generatedPdfUrl;
            link.download = `Convention_Stage_${internshipData?.etudiantId?.nom || 'stagiaire'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handlePrintPdf = () => {
        if (generatedPdfUrl) {
            const win = window.open(generatedPdfUrl);
            win?.print();
        }
    };

    const handleReset = () => {
        setInternshipId('');
        setInternshipData(null);
        setActiveStep(0);
        setGeneratedPdfUrl(null);
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

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Générer une convention de stage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Générez une convention de stage au format PDF
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
                                                </Grid>
                                            </InfoPaper>

                                            <ActionButtons>
                                                <OutlinedButton onClick={handleReset}>
                                                    Modifier
                                                </OutlinedButton>
                                                <PrimaryButton
                                                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <FileCopy />}
                                                    onClick={handleGenerateConvention}
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Génération...' : 'Générer la convention'}
                                                </PrimaryButton>
                                            </ActionButtons>
                                        </Box>
                                    )}

                                    {/* ÉTAPE 2 : TÉLÉCHARGEMENT */}
                                    {index === 2 && generatedPdfUrl && (
                                        <Box sx={{ mt: 1 }}>
                                            <Alert
                                                icon={<CheckCircle sx={{ color: '#22c55e' }} />}
                                                severity="success"
                                                sx={{ mb: 3, borderRadius: '10px' }}
                                            >
                                                La convention a été générée avec succès !
                                            </Alert>

                                            <ActionButtons>
                                                <PrimaryButton
                                                    startIcon={<Download />}
                                                    onClick={handleDownloadPdf}
                                                    sx={{ px: 4 }}
                                                >
                                                    Télécharger
                                                </PrimaryButton>
                                                <SecondaryButton
                                                    startIcon={<Print />}
                                                    onClick={handlePrintPdf}
                                                    sx={{ px: 4 }}
                                                >
                                                    Imprimer
                                                </SecondaryButton>
                                                <OutlinedButton onClick={handleReset}>
                                                    Nouvelle convention
                                                </OutlinedButton>
                                            </ActionButtons>

                                            <DownloadInfoBox>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    <strong>Nom du fichier :</strong> Convention_Stage_{internshipData?.etudiantId?.nom || 'stagiaire'}.pdf
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    <strong>Stagiaire :</strong> {internshipData?.etudiantId?.prenom || ''} {internshipData?.etudiantId?.nom || ''}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    <strong>Période :</strong> {formatDate(internshipData?.dateDebut)} - {formatDate(internshipData?.dateFin)}
                                                </Typography>
                                            </DownloadInfoBox>
                                        </Box>
                                    )}
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                </CardContent>
            </StyledCard>

            {/* ===== RÉSUMÉ DES ACTIONS ===== */}
            <SummaryPaper>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    À quoi sert une convention de stage ?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    La convention de stage est un document officiel qui formalise l'accord entre le stagiaire,
                    l'établissement d'enseignement et la SNRT. Elle définit les droits et obligations de chaque partie,
                    la durée du stage, les missions confiées et les modalités d'encadrement.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    <TagChip label="Téléchargement PDF" size="small" />
                    <TagChip label="Impression" size="small" className="purple" />
                    <TagChip label="Signature requise" size="small" className="orange" />
                </Box>
            </SummaryPaper>
        </Container>
    );
};

export default GenerateConvention;
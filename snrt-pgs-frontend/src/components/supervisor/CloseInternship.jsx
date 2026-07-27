// src/components/supervisor/CloseInternship.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    Avatar,
    Card,
    CardContent,
    MenuItem,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    CheckCircle,
    Pending,
    Cancel,
    Description,
    Download,
    Send,
    School,
    Work,
    Person,
    CalendarToday,
    Assessment,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================
// STYLES
// ============================================

const CloseCard = styled(Paper)({
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    maxWidth: '900px',
    margin: '0 auto',
});

const SectionTitle = styled(Typography)({
    fontSize: '18px',
    fontWeight: 600,
    color: '#1a2332',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
});

const StepIcon = styled(Box)(({ active, completed }) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: completed ? '#22c55e' : active ? '#148aa0' : '#e5e7eb',
    color: completed || active ? '#fff' : '#999',
    fontSize: '16px',
    fontWeight: 600,
}));

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#fff',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const CloseInternship = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [openConfirm, setOpenConfirm] = useState(false);

    const [intern, setIntern] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [form, setForm] = useState({
        noteFinale: 0,
        appreciation: '',
        commentaires: '',
        dateCloture: new Date().toISOString().split('T')[0],
        documents: {
            rapportValide: false,
            presentationValide: false,
            attestationGeneree: false,
        },
    });

    useEffect(() => {
        fetchInternshipData();
    }, [id]);

    const fetchInternshipData = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockIntern = {
                id: id || '1',
                nom: 'EL HASSANI',
                prenom: 'Youssef',
                email: 'youssef@test.ma',
                stage: 'Stage Développement Web',
                department: 'DSI',
                encadrant: 'Mohamed CHERKAOUI',
                startDate: '2026-06-01',
                endDate: '2026-08-31',
                progress: 100,
                livrables: [
                    { nom: 'Rapport final', depose: true, valide: true },
                    { nom: 'Présentation', depose: true, valide: true },
                ],
            };

            setIntern(mockIntern);
            setForm({
                ...form,
                dateCloture: new Date().toISOString().split('T')[0],
                documents: {
                    rapportValide: true,
                    presentationValide: true,
                    attestationGeneree: false,
                },
            });

        } catch (error) {
            console.error('Erreur chargement:', error);
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
        setError('');
        setSuccess('');
    };

    const handleDocumentChange = (doc, value) => {
        setForm({
            ...form,
            documents: { ...form.documents, [doc]: value },
        });
    };

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            // TODO: Appel API POST /internships/:id/close
            console.log('📚 Clôture du stage:', { internId: id, ...form });
            setSuccess('✅ Stage clôturé avec succès !');
            setOpenConfirm(false);
            setActiveStep(3);
        } catch (error) {
            console.error('Erreur clôture:', error);
            setError('❌ Erreur lors de la clôture du stage');
        } finally {
            setSaving(false);
        }
    };

    const steps = [
        {
            label: 'Vérification des livrables',
            description: 'Vérifiez que tous les livrables ont été déposés et validés.',
            icon: <Description />,
        },
        {
            label: 'Évaluation finale',
            description: 'Saisissez la note finale et votre appréciation.',
            icon: <Assessment />,
        },
        {
            label: 'Documents de clôture',
            description: 'Générez l\'attestation et les documents de clôture.',
            icon: <Download />,
        },
        {
            label: 'Clôture terminée',
            description: 'Le stage a été clôturé avec succès.',
            icon: <CheckCircle />,
        },
    ];

    const getNoteColor = (note) => {
        if (note >= 16) return '#22c55e';
        if (note >= 12) return '#f59e0b';
        return '#ef4444';
    };

    const getNoteLabel = (note) => {
        if (note >= 16) return 'Excellent';
        if (note >= 14) return 'Très bien';
        if (note >= 12) return 'Bien';
        if (note >= 10) return 'Passable';
        return 'Insuffisant';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Non défini';
        return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr });
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Tous les livrables doivent être déposés et validés avant la clôture.
                        </Typography>
                        <Grid container spacing={2}>
                            {intern?.livrables.map((livrable, idx) => (
                                <Grid item xs={12} sm={6} key={idx}>
                                    <Card sx={{ borderRadius: '12px' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {livrable.nom}
                                                </Typography>
                                                {livrable.valide ? (
                                                    <Chip
                                                        label="Validé"
                                                        size="small"
                                                        sx={{ backgroundColor: '#d1fae5', color: '#065f46' }}
                                                        icon={<CheckCircle sx={{ fontSize: 14 }} />}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="En attente"
                                                        size="small"
                                                        sx={{ backgroundColor: '#fef3c7', color: '#d97706' }}
                                                        icon={<Pending sx={{ fontSize: 14 }} />}
                                                    />
                                                )}
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                {livrable.depose ? 'Déposé' : 'Non déposé'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                sx={{
                                    backgroundColor: '#148aa0',
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#0b7890' },
                                }}
                            >
                                Continuer
                            </Button>
                        </Box>
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    Note finale sur 20
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1 }}>
                                    <Typography variant="h2" sx={{ fontWeight: 700, color: getNoteColor(form.noteFinale) }}>
                                        {form.noteFinale}
                                    </Typography>
                                    <Box sx={{ flex: 1 }}>
                                        <input
                                            type="range"
                                            min="0"
                                            max="20"
                                            step="0.5"
                                            value={form.noteFinale}
                                            onChange={(e) => handleChange('noteFinale', parseFloat(e.target.value))}
                                            style={{ width: '100%' }}
                                        />
                                    </Box>
                                    <Typography variant="body2" fontWeight={500}>
                                        {getNoteLabel(form.noteFinale)}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    label="Appréciation générale"
                                    select
                                    value={form.appreciation}
                                    onChange={(e) => handleChange('appreciation', e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value="excellent">⭐ Excellent - Stage remarquable</MenuItem>
                                    <MenuItem value="tres_bien">⭐ Très bien - Stage réussi</MenuItem>
                                    <MenuItem value="bien">⭐ Bien - Stage satisfaisant</MenuItem>
                                    <MenuItem value="passable">⭐ Passable - Stage correct</MenuItem>
                                    <MenuItem value="insuffisant">⭐ Insuffisant - Stage à améliorer</MenuItem>
                                </StyledTextField>
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    label="Commentaires"
                                    multiline
                                    rows={4}
                                    value={form.commentaires}
                                    onChange={(e) => handleChange('commentaires', e.target.value)}
                                    fullWidth
                                    placeholder="Points forts, points d'amélioration, observations..."
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                sx={{ borderRadius: '10px', textTransform: 'none' }}
                            >
                                Retour
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={!form.appreciation || form.noteFinale === 0}
                                sx={{
                                    backgroundColor: '#148aa0',
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#0b7890' },
                                    '&:disabled': { backgroundColor: '#a0c4cd' },
                                }}
                            >
                                Continuer
                            </Button>
                        </Box>
                    </Box>
                );

            case 2:
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Générez les documents de clôture du stage.
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Card
                                    sx={{
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        border: form.documents.attestationGeneree ? '2px solid #22c55e' : '1px solid #e5e7eb',
                                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                                    }}
                                    onClick={() => handleDocumentChange('attestationGeneree', !form.documents.attestationGeneree)}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Description sx={{ color: form.documents.attestationGeneree ? '#22c55e' : '#999' }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    Attestation de stage
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {form.documents.attestationGeneree ? '✅ Générée' : 'Cliquez pour générer'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Card
                                    sx={{
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        border: form.documents.rapportValide ? '2px solid #22c55e' : '1px solid #e5e7eb',
                                        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                                    }}
                                    onClick={() => handleDocumentChange('rapportValide', !form.documents.rapportValide)}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Description sx={{ color: form.documents.rapportValide ? '#22c55e' : '#999' }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    Validation finale
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {form.documents.rapportValide ? '✅ Validé' : 'À valider'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                sx={{ borderRadius: '10px', textTransform: 'none' }}
                            >
                                Retour
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleOpenConfirm}
                                disabled={!form.documents.attestationGeneree || !form.documents.rapportValide}
                                sx={{
                                    backgroundColor: '#22c55e',
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#16a34a' },
                                    '&:disabled': { backgroundColor: '#a0c4cd' },
                                }}
                                startIcon={<CheckCircle />}
                            >
                                Clôturer le stage
                            </Button>
                        </Box>
                    </Box>
                );

            case 3:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ fontSize: 64, mb: 2 }}>🎉</Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#22c55e' }}>
                            Stage clôturé avec succès !
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                            Le stage de {intern?.prenom} {intern?.nom} a été clôturé.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Description />}
                                onClick={() => alert('📄 Téléchargement de l\'attestation')}
                                sx={{ borderRadius: '10px', textTransform: 'none' }}
                            >
                                Télécharger attestation
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<ArrowBack />}
                                onClick={() => navigate('/supervisor/interns')}
                                sx={{
                                    backgroundColor: '#148aa0',
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#0b7890' },
                                }}
                            >
                                Retour à la liste
                            </Button>
                        </Box>
                    </Box>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(`/supervisor/interns/${id}`)}
                sx={{ mb: 3, textTransform: 'none', color: '#666' }}
            >
                Retour au stagiaire
            </Button>

            <CloseCard>
                {/* ===== EN-TÊTE ===== */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                        sx={{
                            width: 56,
                            height: 56,
                            backgroundColor: '#22c55e',
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#fff',
                        }}
                    >
                        {intern?.prenom?.[0]}{intern?.nom?.[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a2332' }}>
                            Clôture du stage
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {intern?.stage} - {intern?.department}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                        {error}
                    </Alert>
                )}

                {success && activeStep === 3 && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
                        {success}
                    </Alert>
                )}

                {/* ===== INFORMATIONS STAGIAIRE ===== */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            <Person sx={{ fontSize: 14, verticalAlign: 'middle' }} /> Stagiaire
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                            {intern?.prenom} {intern?.nom}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            <Work sx={{ fontSize: 14, verticalAlign: 'middle' }} /> Stage
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                            {intern?.stage}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            <CalendarToday sx={{ fontSize: 14, verticalAlign: 'middle' }} /> Période
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                            {formatDate(intern?.startDate)} - {formatDate(intern?.endDate)}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />

                {/* ===== STEPS ===== */}
                <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((step, index) => (
                        <Step key={step.label} active={activeStep === index} completed={activeStep > index}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <StepIcon active={activeStep === index} completed={activeStep > index}>
                                        {activeStep > index ? <CheckCircle sx={{ fontSize: 16 }} /> : index + 1}
                                    </StepIcon>
                                )}
                                sx={{
                                    '& .MuiStepLabel-label': {
                                        fontWeight: activeStep === index ? 600 : 400,
                                        color: activeStep === index ? '#1a2332' : '#999',
                                    },
                                }}
                            >
                                {step.label}
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {step.description}
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                {renderStepContent(index)}
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </CloseCard>

            {/* ===== DIALOG DE CONFIRMATION ===== */}
            <Dialog
                open={openConfirm}
                onClose={handleCloseConfirm}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: '#22c55e' }} />
                    Confirmer la clôture
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Êtes-vous sûr de vouloir clôturer le stage de{' '}
                        <strong>{intern?.prenom} {intern?.nom}</strong> ?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Cette action est irréversible. L'attestation de stage sera générée automatiquement.
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#f7f7f7', borderRadius: '10px' }}>
                        <Typography variant="body2" fontWeight={500}>
                            📊 Récapitulatif :
                        </Typography>
                        <Typography variant="body2">
                            Note finale : <strong>{form.noteFinale}/20</strong>
                        </Typography>
                        <Typography variant="body2">
                            Appréciation : <strong>{form.appreciation}</strong>
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseConfirm}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                        disabled={saving}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={saving}
                        sx={{
                            backgroundColor: '#22c55e',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#16a34a' },
                            '&:disabled': { backgroundColor: '#a0c4cd' },
                        }}
                    >
                        {saving ? <CircularProgress size={24} color="inherit" /> : 'Confirmer la clôture'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CloseInternship;
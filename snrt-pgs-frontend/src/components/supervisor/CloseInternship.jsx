// src/components/supervisor/CloseInternship.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    TextField,
    Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    CheckCircle,
    Cancel,
    Description,
    School,
    Work,
    Person,
    Star,
} from '@mui/icons-material';
import api from '../../services/api';
import { useSelector } from 'react-redux';

// ============================================
// STYLES// ============================================

const StyledPaper = styled(Paper)({
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
});

const StepIconWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active' && prop !== 'completed',
})(({ active, completed }) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: completed ? '#22c55e' : active ? '#2d3748' : '#e5e7eb',
    color: completed || active ? '#fff' : '#999',
    fontSize: '14px',
    fontWeight: 600,
}));

const InfoRow = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '4px 0',
    '& .MuiSvgIcon-root': {
        color: '#687480',
        fontSize: '18px',
    },
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

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const CloseInternship = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [internship, setInternship] = useState(null);
    const [student, setStudent] = useState(null);
    const [offer, setOffer] = useState(null);
    const [livrables, setLivrables] = useState([]);
    const [evaluation, setEvaluation] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [checklist, setChecklist] = useState({
        tousLivrablesValides: false,
        evaluationFaite: false,
        rapportValide: false,
        attestationGeneree: false,
    });
    const [remarqueCloture, setRemarqueCloture] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // ✅ Route correcte : /internships/:id
            const response = await api.get(`/internships/${id}`);
            const data = response.data?.data || response.data;
            setInternship(data);
            setStudent(data.etudiantId || {});
            setOffer(data.offreId || {});
            setLivrables(data.livrables || []);
            setEvaluation(data.evaluation || null);

            // Vérifier les conditions
            const tousValides = (data.livrables || []).every(l => l.valide === true);
            const evalFaite = !!data.evaluation;
            const rapportValide = (data.livrables || []).some(l => l.type === 'Rapport' && l.valide === true);

            setChecklist({
                tousLivrablesValides: tousValides,
                evaluationFaite: evalFaite,
                rapportValide: rapportValide,
                attestationGeneree: false,
            });

            // Déterminer l'étape active
            if (!tousValides) setActiveStep(0);
            else if (!evalFaite) setActiveStep(1);
            else if (!rapportValide) setActiveStep(2);
            else setActiveStep(3);

        } catch (error) {
            console.error('Erreur:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAttestation = async () => {
        setSubmitting(true);
        try {
            // ✅ Route correcte : /internships/:id/generate-attestation
            await api.post(`/internships/${id}/generate-attestation`);
            setChecklist({ ...checklist, attestationGeneree: true });
            setSuccess('Attestation générée avec succès');
            fetchData();
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.response?.data?.message || 'Erreur lors de la génération');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloture = async () => {
        if (!checklist.attestationGeneree) {
            setError('Veuillez générer l\'attestation avant de clôturer');
            return;
        }
        setSubmitting(true);
        try {
            // ✅ Route correcte : /internships/:id/close
            await api.put(`/internships/${id}/close`, {
                remarques: remarqueCloture,
            });
            setSuccess('Stage clôturé avec succès !');
            setTimeout(() => navigate('/supervisor/stagiaires'), 2000);
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.response?.data?.message || 'Erreur lors de la clôture');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

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

    const steps = [
        {
            label: 'Validation des livrables',
            description: 'Tous les livrables doivent être validés',
            completed: checklist.tousLivrablesValides,
        },
        {
            label: 'Évaluation du stagiaire',
            description: 'L\'évaluation doit être complétée',
            completed: checklist.evaluationFaite,
        },
        {
            label: 'Rapport final',
            description: 'Le rapport de stage doit être validé',
            completed: checklist.rapportValide,
        },
        {
            label: 'Génération attestation',
            description: 'L\'attestation de stage doit être générée',
            completed: checklist.attestationGeneree,
        },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={44} sx={{ color: '#2d3748' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(`/supervisor/stagiaire/${id}`)}
                    sx={{ textTransform: 'none', color: '#666' }}
                >
                    Retour au stagiaire
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

            <StyledPaper>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700} color="#1a2332">
                            Clôture du stage
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {student?.prenom || ''} {student?.nom || ''} • {offer?.titre || 'Stage'}
                        </Typography>
                    </Box>
                    {internship?.statut && (
                        <StatusChip label={getStatusLabel(internship.statut)} status={internship.statut} />
                    )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Infos stagiaire */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <InfoRow>
                            <Person />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Stagiaire</Typography>
                                <Typography variant="body2">{student?.prenom || ''} {student?.nom || ''}</Typography>
                            </Box>
                        </InfoRow>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoRow>
                            <School />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Université</Typography>
                                <Typography variant="body2">{student?.universite || 'Non renseignée'}</Typography>
                            </Box>
                        </InfoRow>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoRow>
                            <Work />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Période</Typography>
                                <Typography variant="body2">
                                    {formatDate(internship?.dateDebut)} - {formatDate(internship?.dateFin)}
                                </Typography>
                            </Box>
                        </InfoRow>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoRow>
                            <Star />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Évaluation</Typography>
                                <Typography variant="body2">
                                    {evaluation ? `${evaluation.note || 0}/20` : 'Non évalué'}
                                </Typography>
                            </Box>
                        </InfoRow>
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />

                {/* Stepper */}
                <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
                    {steps.map((step, index) => (
                        <Step key={step.label} active={activeStep === index} completed={step.completed}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <StepIconWrapper active={activeStep === index} completed={step.completed}>
                                        {step.completed ? <CheckCircle sx={{ fontSize: 16 }} /> : index + 1}
                                    </StepIconWrapper>
                                )}
                            >
                                <Typography fontWeight={step.completed ? 600 : 400}>
                                    {step.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {step.description}
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Box sx={{ mt: 1 }}>
                                    {index === 0 && (
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                {livrables.length === 0 ? (
                                                    'Aucun livrable déposé'
                                                ) : (
                                                    <Box>
                                                        {livrables.map((l, idx) => (
                                                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                                <Description sx={{ fontSize: 16, color: '#687480' }} />
                                                                <Typography variant="body2">
                                                                    {l.nom || 'Sans nom'}
                                                                </Typography>
                                                                <Chip
                                                                    label={l.valide ? '✅ Validé' : l.statut === 'Rejete' ? '❌ Rejeté' : '⏳ En attente'}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: l.valide ? '#d1fae5' : l.statut === 'Rejete' ? '#fee2e2' : '#fef3c7',
                                                                        color: l.valide ? '#065f46' : l.statut === 'Rejete' ? '#991b1b' : '#d97706',
                                                                    }}
                                                                />
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Typography>
                                            {!step.completed && (
                                                <Alert severity="warning" sx={{ borderRadius: '10px' }}>
                                                    Certains livrables sont encore en attente de validation
                                                </Alert>
                                            )}
                                        </Box>
                                    )}
                                    {index === 1 && (
                                        <Box>
                                            {!step.completed ? (
                                                <Alert severity="warning" sx={{ borderRadius: '10px' }}>
                                                    L'évaluation du stagiaire n'a pas encore été réalisée
                                                </Alert>
                                            ) : (
                                                <Alert severity="success" sx={{ borderRadius: '10px' }}>
                                                    Évaluation réalisée : {evaluation?.note || 0}/20
                                                </Alert>
                                            )}
                                        </Box>
                                    )}
                                    {index === 2 && (
                                        <Box>
                                            {!step.completed ? (
                                                <Alert severity="warning" sx={{ borderRadius: '10px' }}>
                                                    Le rapport de stage n'a pas encore été validé
                                                </Alert>
                                            ) : (
                                                <Alert severity="success" sx={{ borderRadius: '10px' }}>
                                                    Rapport validé
                                                </Alert>
                                            )}
                                        </Box>
                                    )}
                                    {index === 3 && (
                                        <Box>
                                            {!step.completed ? (
                                                <Box>
                                                    <Alert severity="info" sx={{ borderRadius: '10px', mb: 2 }}>
                                                        Générez l'attestation de stage avant la clôture
                                                    </Alert>
                                                    <Button
                                                        variant="contained"
                                                        onClick={handleGenerateAttestation}
                                                        disabled={submitting}
                                                        sx={{
                                                            backgroundColor: '#2d3748',
                                                            borderRadius: '10px',
                                                            textTransform: 'none',
                                                            '&:hover': { backgroundColor: '#1a202c' },
                                                        }}
                                                    >
                                                        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Générer l\'attestation'}
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Alert severity="success" sx={{ borderRadius: '10px' }}>
                                                    Attestation générée
                                                </Alert>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>

                <Divider sx={{ mb: 3 }} />

                {/* Remarque de clôture */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        Remarque de clôture (optionnelle)
                    </Typography>
                    <TextField
                        value={remarqueCloture}
                        onChange={(e) => setRemarqueCloture(e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Ajoutez une remarque finale..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                </Box>

                {/* Boutons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(`/supervisor/stagiaire/${id}`)}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCloture}
                        disabled={!checklist.attestationGeneree || submitting}
                        sx={{
                            backgroundColor: checklist.attestationGeneree ? '#22c55e' : '#999',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: checklist.attestationGeneree ? '#16a34a' : '#999' },
                        }}
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Clôturer le stage'}
                    </Button>
                </Box>
            </StyledPaper>
        </Container>
    );
};

export default CloseInternship;
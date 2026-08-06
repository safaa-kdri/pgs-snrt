// src/components/supervisor/Evaluation.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Button,
    TextField,
    Rating,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Divider,
    Chip,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Star,
    Save,
    School,
    Work,
    Person,
    CalendarToday,
} from '@mui/icons-material';
import api from '../../services/api';
import { useSelector } from 'react-redux';

// ============================================
// STYLES
// ============================================

const StyledPaper = styled(Paper)({
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
});

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

const CompetenceCard = styled(Card)({
    borderRadius: '12px',
    padding: '16px 20px',
    border: '1px solid #eef1f3',
    boxShadow: 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
        borderColor: '#2d3748',
        backgroundColor: '#f7f8fa',
    },
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'EnCours': { bg: '#dbeafe', text: '#1d4ed8' },
        'Termine': { bg: '#d1fae5', text: '#065f46' },
        'Annule': { bg: '#fee2e2', text: '#991b1b' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
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

const Evaluation = () => {
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
    const [existingEvaluation, setExistingEvaluation] = useState(null);
    
    const [evaluationData, setEvaluationData] = useState({
        note: 0,
        commentaires: '',
        competences: [
            { nom: 'Autonomie', niveau: 'Intermediaire', note: 0 },
            { nom: 'Qualité du travail', niveau: 'Intermediaire', note: 0 },
            { nom: 'Relationnel', niveau: 'Intermediaire', note: 0 },
            { nom: 'Technique', niveau: 'Intermediaire', note: 0 },
            { nom: 'Adaptabilité', niveau: 'Intermediaire', note: 0 },
        ],
        pointsForts: '',
        pointsFaibles: '',
        recommandations: '',
    });

    const niveauOptions = ['Debutant', 'Intermediaire', 'Avance', 'Expert'];

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
            
            if (data.evaluation) {
                setExistingEvaluation(data.evaluation);
                setEvaluationData({
                    note: data.evaluation.note || 0,
                    commentaires: data.evaluation.commentaires || '',
                    competences: data.evaluation.competencesEvaluees || evaluationData.competences,
                    pointsForts: data.evaluation.pointsForts || '',
                    pointsFaibles: data.evaluation.pointsFaibles || '',
                    recommandations: data.evaluation.recommandations || '',
                });
            }
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setEvaluationData({ ...evaluationData, [field]: value });
    };

    const handleCompetenceChange = (index, field, value) => {
        const newCompetences = [...evaluationData.competences];
        newCompetences[index][field] = value;
        setEvaluationData({ ...evaluationData, competences: newCompetences });
    };

    const handleSubmit = async () => {
        if (evaluationData.note === 0) {
            setError('Veuillez attribuer une note');
            return;
        }
        
        setSubmitting(true);
        setError('');
        try {
            // ✅ Route correcte : /internships/:id/evaluate
            await api.put(`/internships/${id}/evaluate`, evaluationData);
            setSuccess('Évaluation enregistrée avec succès');
            setTimeout(() => navigate('/supervisor/stagiaires'), 1500);
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
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
                            {existingEvaluation ? 'Modifier l\'évaluation' : 'Évaluation du stagiaire'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {student?.prenom || ''} {student?.nom || ''} • {offer?.titre || 'Stage'}
                        </Typography>
                    </Box>
                    {internship?.statut && (
                        <StatusChip label={internship.statut} status={internship.statut} />
                    )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Infos stagiaire */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
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
                                <Typography variant="caption" color="text.secondary">Stage</Typography>
                                <Typography variant="body2">{offer?.titre || 'Sans titre'}</Typography>
                            </Box>
                        </InfoRow>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoRow>
                            <CalendarToday />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Période</Typography>
                                <Typography variant="body2">
                                    {formatDate(internship?.dateDebut)} - {formatDate(internship?.dateFin)}
                                </Typography>
                            </Box>
                        </InfoRow>
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />

                {/* Note */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        Note finale (sur 20)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <TextField
                            type="number"
                            value={evaluationData.note}
                            onChange={(e) => handleChange('note', Math.min(20, Math.max(0, Number(e.target.value))))}
                            InputProps={{ inputProps: { min: 0, max: 20, step: 0.5 } }}
                            sx={{ width: 120 }}
                            helperText={evaluationData.note > 0 ? `${Math.round((evaluationData.note / 20) * 5 * 10) / 10}/5` : ''}
                        />
                        <Rating
                            value={Math.min(evaluationData.note / 4, 5)}
                            readOnly
                            precision={0.5}
                            size="large"
                        />
                    </Box>
                </Box>

                {/* Compétences */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        Compétences évaluées (sur 5)
                    </Typography>
                    <Grid container spacing={2}>
                        {evaluationData.competences.map((comp, idx) => (
                            <Grid item xs={12} sm={6} key={idx}>
                                <CompetenceCard>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" sx={{ minWidth: 100, fontWeight: 500 }}>
                                            {comp.nom}
                                        </Typography>
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <InputLabel>Niveau</InputLabel>
                                            <Select
                                                value={comp.niveau || 'Intermediaire'}
                                                onChange={(e) => handleCompetenceChange(idx, 'niveau', e.target.value)}
                                                label="Niveau"
                                            >
                                                {niveauOptions.map((n) => (
                                                    <MenuItem key={n} value={n}>{n}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
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
                                </CompetenceCard>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Points forts / Points faibles */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                            Points forts
                        </Typography>
                        <TextField
                            value={evaluationData.pointsForts}
                            onChange={(e) => handleChange('pointsForts', e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Points forts du stagiaire..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                            Points faibles
                        </Typography>
                        <TextField
                            value={evaluationData.pointsFaibles}
                            onChange={(e) => handleChange('pointsFaibles', e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Points à améliorer..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                </Grid>

                {/* Recommandations */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                        Recommandations
                    </Typography>
                    <TextField
                        value={evaluationData.recommandations}
                        onChange={(e) => handleChange('recommandations', e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Recommandations pour l'étudiant..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                </Box>

                {/* Commentaires */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                        Commentaires généraux
                    </Typography>
                    <TextField
                        value={evaluationData.commentaires}
                        onChange={(e) => handleChange('commentaires', e.target.value)}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Commentaires sur le stage..."
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
                        onClick={handleSubmit}
                        disabled={submitting}
                        sx={{
                            backgroundColor: '#2d3748',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#1a202c' },
                        }}
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : 
                            existingEvaluation ? 'Mettre à jour' : 'Enregistrer'}
                    </Button>
                </Box>
            </StyledPaper>
        </Container>
    );
};

export default Evaluation;
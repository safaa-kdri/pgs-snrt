// src/components/supervisor/Evaluation.jsx
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
    Rating,
    Slider,
    MenuItem,
    Card,
    CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Save,
    Assessment,
    Person,
    School,
    Work,
    Star,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================
// STYLES
// ============================================

const EvaluationCard = styled(Paper)({
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

const CompetenceItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#f7f7f7',
    borderRadius: '10px',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '12px',
});

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#fff',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Evaluation = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [intern, setIntern] = useState(null);

    const [form, setForm] = useState({
        note: 0,
        commentaires: '',
        competences: [
            { nom: 'Qualité du travail', note: 0, commentaire: '' },
            { nom: 'Autonomie', note: 0, commentaire: '' },
            { nom: 'Esprit d\'équipe', note: 0, commentaire: '' },
            { nom: 'Communication', note: 0, commentaire: '' },
            { nom: 'Progression', note: 0, commentaire: '' },
        ],
        recommandation: 'positive',
    });

    useEffect(() => {
        fetchInternData();
    }, [id]);

    const fetchInternData = async () => {
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
                startDate: '2026-06-01',
                endDate: '2026-08-31',
                encadrant: 'Mohamed CHERKAOUI',
            };

            setIntern(mockIntern);

            // Pré-remplir les notes si une évaluation existe déjà
            // setForm({ ...form, note: 16, commentaires: 'Bon travail...' });

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

    const handleCompetenceChange = (index, field, value) => {
        const newCompetences = [...form.competences];
        newCompetences[index][field] = value;
        setForm({ ...form, competences: newCompetences });
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        // Validation
        if (form.note < 10 && form.recommandation === 'positive') {
            setError('La note est inférieure à 10 mais la recommandation est positive.');
            setSaving(false);
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // TODO: Appel API POST /internships/:id/evaluate
            console.log('📝 Évaluation sauvegardée:', { internId: id, ...form });
            setSuccess('✅ Évaluation sauvegardée avec succès !');
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setError('❌ Erreur lors de la sauvegarde de l\'évaluation');
        } finally {
            setSaving(false);
        }
    };

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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    if (!intern) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    Stagiaire non trouvé
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/supervisor/interns')}
                    sx={{ mt: 2 }}
                >
                    Retour à la liste
                </Button>
            </Container>
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

            <EvaluationCard>
                {/* ===== EN-TÊTE ===== */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                        sx={{
                            width: 56,
                            height: 56,
                            backgroundColor: '#148aa0',
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#fff',
                        }}
                    >
                        {intern.prenom[0]}{intern.nom[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a2332' }}>
                            Évaluation de {intern.prenom} {intern.nom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {intern.stage} - {intern.department}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
                        {success}
                    </Alert>
                )}

                {/* ===== NOTE GLOBALE ===== */}
                <SectionTitle>
                    <Assessment sx={{ color: '#4f46e5' }} />
                    Note globale
                </SectionTitle>

                <Box sx={{ mb: 4 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h2" sx={{ fontWeight: 700, color: getNoteColor(form.note) }}>
                                        {form.note}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        /20
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ color: getNoteColor(form.note) }}>
                                        {getNoteLabel(form.note)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Note globale du stagiaire
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Slider
                                value={form.note}
                                onChange={(e, val) => handleChange('note', val)}
                                min={0}
                                max={20}
                                step={0.5}
                                marks={[
                                    { value: 0, label: '0' },
                                    { value: 10, label: '10' },
                                    { value: 20, label: '20' },
                                ]}
                                sx={{
                                    '& .MuiSlider-track': {
                                        backgroundColor: getNoteColor(form.note),
                                    },
                                    '& .MuiSlider-thumb': {
                                        backgroundColor: getNoteColor(form.note),
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* ===== COMPÉTENCES ===== */}
                <SectionTitle>
                    <Star sx={{ color: '#f59e0b' }} />
                    Évaluation des compétences
                </SectionTitle>

                {form.competences.map((comp, index) => (
                    <CompetenceItem key={index}>
                        <Box sx={{ minWidth: '120px' }}>
                            <Typography variant="body2" fontWeight={500}>
                                {comp.nom}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Slider
                                value={comp.note}
                                onChange={(e, val) => handleCompetenceChange(index, 'note', val)}
                                min={0}
                                max={20}
                                step={0.5}
                                sx={{ width: '120px' }}
                            />
                            <Typography variant="body2" fontWeight={600} sx={{ minWidth: '30px' }}>
                                {comp.note}
                            </Typography>
                            <StyledTextField
                                placeholder="Commentaire"
                                size="small"
                                value={comp.commentaire}
                                onChange={(e) => handleCompetenceChange(index, 'commentaire', e.target.value)}
                                sx={{ width: '200px' }}
                            />
                        </Box>
                    </CompetenceItem>
                ))}

                {/* ===== COMMENTAIRES ===== */}
                <SectionTitle sx={{ mt: 3 }}>
                    <Person sx={{ color: '#8b5cf6' }} />
                    Commentaires généraux
                </SectionTitle>

                <StyledTextField
                    label="Commentaires sur le stagiaire"
                    multiline
                    rows={4}
                    value={form.commentaires}
                    onChange={(e) => handleChange('commentaires', e.target.value)}
                    fullWidth
                    placeholder="Points forts, points d'amélioration, observations générales..."
                    sx={{ mb: 3 }}
                />

                {/* ===== RECOMMANDATION ===== */}
                <SectionTitle>
                    <Work sx={{ color: '#22c55e' }} />
                    Recommandation
                </SectionTitle>

                <StyledTextField
                    select
                    label="Recommandation"
                    value={form.recommandation}
                    onChange={(e) => handleChange('recommandation', e.target.value)}
                    fullWidth
                    sx={{ mb: 3 }}
                >
                    <MenuItem value="positive">✅ Positive - Recommandé</MenuItem>
                    <MenuItem value="neutral">➖ Neutre - Sans opinion</MenuItem>
                    <MenuItem value="negative">❌ Négative - Non recommandé</MenuItem>
                </StyledTextField>

                {/* ===== BOUTONS ===== */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(`/supervisor/interns/${id}`)}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                        disabled={saving}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                            backgroundColor: '#148aa0',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#0b7890' },
                            '&:disabled': { backgroundColor: '#a0c4cd' },
                        }}
                    >
                        {saving ? 'Sauvegarde...' : '💾 Enregistrer l\'évaluation'}
                    </Button>
                </Box>
            </EvaluationCard>
        </Container>
    );
};

export default Evaluation;
// src/components/department/OfferEditPage.jsx
// ✅ PAGE DE MODIFICATION D'OFFRE

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
    IconButton,
    MenuItem,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    Stack,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    ArrowBack,
    Add,
    Delete,
    Save,
    Work,
    School,
    Description,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const PageContainer = styled(Container)({
    paddingTop: '32px',
    paddingBottom: '32px',
});

const HeaderSection = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '16px',
});

const HeaderLeft = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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

const ActionBar = styled(Paper)({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '12px 24px',
    marginBottom: '24px',
    borderRadius: '10px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #eef1f3',
    boxShadow: 'none',
    flexWrap: 'wrap',
    gap: '12px',
});

const CreateCard = styled(Paper)({
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #eef1f3',
    maxWidth: '1000px',
    margin: '0 auto',
});

const SectionTitle = styled(Typography)({
    fontSize: '14px',
    fontWeight: 600,
    color: '#1a2332',
    marginBottom: '16px',
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

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        backgroundColor: '#fff',
    },
});

const FormCard = styled(Card)({
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#fafafa',
    border: '1px solid #eef1f3',
    marginBottom: '12px',
    '&:last-child': {
        marginBottom: 0,
    },
});

const PrimaryButton = styled(Button)({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    padding: '8px 28px',
    backgroundColor: '#148aa0',
    color: '#ffffff',
    '&:hover': {
        backgroundColor: '#0b7890',
    },
    '&:disabled': {
        backgroundColor: '#94b8c4',
        color: '#ffffff',
    },
});

// ============================================
// CONSTANTES
// ============================================

const STAGE_TYPES = ['PFE', 'PFA', 'Initiation', 'Ete'];
const COMPETENCE_LEVELS = ['Debutant', 'Intermediaire', 'Avance', 'Expert'];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const OfferEditPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [periods, setPeriods] = useState([]);

    // ÉTAT DU FORMULAIRE
    const [form, setForm] = useState({
        titre: '',
        description: '',
        nbPostes: 1,
        typeStage: '',
        periodeId: '',
        dateDebut: '',
        dateFin: '',
        dateLimiteCandidature: '',
        sujets: [
            {
                titre: '',
                description: '',
                missions: [''],
                profilRecherche: '',
                competences: [{ nom: '', niveau: '' }],
            },
        ],
    });

    useEffect(() => {
        if (id) {
            fetchOfferDetail();
            fetchPeriods();
        }
    }, [id]);

    const fetchOfferDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/offers/${id}`);
            const data = response.data?.offer || response.data?.data || response.data;
            
            if (!data) {
                throw new Error('Offre non trouvée');
            }

            // Formater les dates pour le formulaire
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return date.toISOString().split('T')[0];
            };

            setForm({
                titre: data.titre || '',
                description: data.description || '',
                nbPostes: data.nbPostes || 1,
                typeStage: data.typeStage || '',
                periodeId: data.periodeId || '',
                dateDebut: formatDate(data.dateDebut),
                dateFin: formatDate(data.dateFin),
                dateLimiteCandidature: formatDate(data.dateLimiteCandidature),
                sujets: data.sujets && data.sujets.length > 0 ? data.sujets : [
                    {
                        titre: '',
                        description: '',
                        missions: [''],
                        profilRecherche: '',
                        competences: [{ nom: '', niveau: '' }],
                    },
                ],
            });

        } catch (error) {
            console.error('Erreur chargement offre:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement de l\'offre');
        } finally {
            setLoading(false);
        }
    };

    const fetchPeriods = async () => {
        try {
            const response = await api.get('/periods');
            let data = [];
            if (response.data?.data) {
                data = response.data.data;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            }
            const activePeriods = data.filter(p => p.actif !== false && p.isDeleted !== true);
            setPeriods(activePeriods);
        } catch (error) {
            console.error('Erreur chargement périodes:', error);
        }
    };

    // ============================================
    // GESTION DU FORMULAIRE
    // ============================================

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
        setError('');
        setSuccess('');
    };

    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...form.sujets];
        newSubjects[index][field] = value;
        setForm({ ...form, sujets: newSubjects });
    };

    const handleMissionChange = (subjectIndex, missionIndex, value) => {
        const newSubjects = [...form.sujets];
        newSubjects[subjectIndex].missions[missionIndex] = value;
        setForm({ ...form, sujets: newSubjects });
    };

    const handleCompetenceChange = (subjectIndex, compIndex, field, value) => {
        const newSubjects = [...form.sujets];
        newSubjects[subjectIndex].competences[compIndex][field] = value;
        setForm({ ...form, sujets: newSubjects });
    };

    // ============================================
    // GESTION DES SUJETS
    // ============================================

    const addSubject = () => {
        setForm({
            ...form,
            sujets: [
                ...form.sujets,
                {
                    titre: '',
                    description: '',
                    missions: [''],
                    profilRecherche: '',
                    competences: [{ nom: '', niveau: '' }],
                },
            ],
        });
    };

    const removeSubject = (index) => {
        if (form.sujets.length <= 1) return;
        const newSubjects = form.sujets.filter((_, i) => i !== index);
        setForm({ ...form, sujets: newSubjects });
    };

    const addMission = (subjectIndex) => {
        const newSubjects = [...form.sujets];
        newSubjects[subjectIndex].missions.push('');
        setForm({ ...form, sujets: newSubjects });
    };

    const removeMission = (subjectIndex, missionIndex) => {
        const newSubjects = [...form.sujets];
        if (newSubjects[subjectIndex].missions.length <= 1) return;
        newSubjects[subjectIndex].missions = newSubjects[subjectIndex].missions.filter(
            (_, i) => i !== missionIndex
        );
        setForm({ ...form, sujets: newSubjects });
    };

    const addCompetence = (subjectIndex) => {
        const newSubjects = [...form.sujets];
        newSubjects[subjectIndex].competences.push({ nom: '', niveau: '' });
        setForm({ ...form, sujets: newSubjects });
    };

    const removeCompetence = (subjectIndex, compIndex) => {
        const newSubjects = [...form.sujets];
        if (newSubjects[subjectIndex].competences.length <= 1) return;
        newSubjects[subjectIndex].competences = newSubjects[subjectIndex].competences.filter(
            (_, i) => i !== compIndex
        );
        setForm({ ...form, sujets: newSubjects });
    };

    // ============================================
    // VALIDATION ET SOUMISSION
    // ============================================

    const validateForm = () => {
        const errors = [];
        if (!form.titre || form.titre.trim() === '') errors.push('Le titre est obligatoire');
        if (!form.description || form.description.trim() === '') errors.push('La description est obligatoire');
        if (!form.typeStage) errors.push('Le type de stage est obligatoire');
        if (!form.periodeId) errors.push('La période est obligatoire');
        if (!form.dateDebut) errors.push('La date de début est obligatoire');
        if (!form.dateFin) errors.push('La date de fin est obligatoire');
        if (!form.dateLimiteCandidature) errors.push('La date limite de candidature est obligatoire');
        
        form.sujets.forEach((sujet, index) => {
            if (!sujet.titre || sujet.titre.trim() === '') {
                errors.push(`Le titre du sujet ${index + 1} est obligatoire`);
            }
            if (!sujet.description || sujet.description.trim() === '') {
                errors.push(`La description du sujet ${index + 1} est obligatoire`);
            }
        });
        
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const errors = validateForm();
        if (errors.length > 0) {
            setError(errors.join(', '));
            return;
        }

        setSaving(true);

        try {
            const dataToSend = {
                titre: form.titre.trim(),
                description: form.description.trim(),
                nbPostes: form.nbPostes || 1,
                typeStage: form.typeStage,
                periodeId: form.periodeId,
                dateDebut: form.dateDebut,
                dateFin: form.dateFin,
                dateLimiteCandidature: form.dateLimiteCandidature,
                sujets: form.sujets
                    .filter(s => s.titre && s.titre.trim() !== '')
                    .map(sujet => ({
                        titre: sujet.titre.trim(),
                        description: sujet.description ? sujet.description.trim() : '',
                        missions: (sujet.missions || [])
                            .filter(m => m && m.trim() !== ''),
                        profilRecherche: sujet.profilRecherche ? sujet.profilRecherche.trim() : '',
                        competences: (sujet.competences || [])
                            .filter(c => c.nom && c.nom.trim() !== '')
                            .map(c => ({
                                nom: c.nom.trim(),
                                niveau: c.niveau || 'Debutant'
                            }))
                    })),
                documentsRequis: []
            };

            if (dataToSend.sujets.length === 0) {
                setError('Au moins un sujet valide est requis');
                setSaving(false);
                return;
            }

            console.log('📤 [OfferEdit] Envoi des données:', JSON.stringify(dataToSend, null, 2));

            await api.put(`/offers/${id}`, dataToSend);

            setSuccess('Offre modifiée avec succès !');
            setTimeout(() => {
                navigate('/department/my-offers');
            }, 1500);
        } catch (error) {
            console.error('Erreur modification offre:', error);
            setError(error.response?.data?.message || 'Erreur lors de la modification de l\'offre');
        } finally {
            setSaving(false);
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

    return (
        <PageContainer maxWidth="lg">
            {/* ===== EN-TÊTE ===== */}
            <HeaderSection>
                <HeaderLeft>
                    <IconButton onClick={() => navigate('/department/my-offers')} sx={{ color: '#666' }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <HeaderTitle>Modifier l'offre</HeaderTitle>
                        <HeaderSubtitle>
                            {form.titre || 'Offre sans titre'}
                        </HeaderSubtitle>
                    </Box>
                </HeaderLeft>
            </HeaderSection>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{success}</Alert>}

            {/* ===== BARRE D'ACTIONS ===== */}
            <ActionBar>
                <PrimaryButton
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    onClick={handleSubmit}
                    disabled={saving}
                >
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </PrimaryButton>
            </ActionBar>

            <CreateCard>
                <form onSubmit={handleSubmit}>
                    {/* ===== INFORMATIONS GÉNÉRALES ===== */}
                    <SectionTitle>
                        <SectionIcon color="#148aa0">
                            <Work sx={{ fontSize: 16 }} />
                        </SectionIcon>
                        Informations générales
                    </SectionTitle>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <StyledTextField
                                label="Titre de l'offre *"
                                value={form.titre}
                                onChange={(e) => handleChange('titre', e.target.value)}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <StyledTextField
                                label="Description *"
                                value={form.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                fullWidth
                                multiline
                                rows={4}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                label="Nombre de postes"
                                type="number"
                                value={form.nbPostes}
                                onChange={(e) => handleChange('nbPostes', parseInt(e.target.value) || 1)}
                                fullWidth
                                InputProps={{ inputProps: { min: 1 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Type de stage *</InputLabel>
                                <Select
                                    value={form.typeStage}
                                    onChange={(e) => handleChange('typeStage', e.target.value)}
                                    label="Type de stage *"
                                    sx={{ borderRadius: '8px', backgroundColor: '#fff' }}
                                >
                                    {STAGE_TYPES.map((type) => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Période *</InputLabel>
                                <Select
                                    value={form.periodeId}
                                    onChange={(e) => handleChange('periodeId', e.target.value)}
                                    label="Période *"
                                    sx={{ borderRadius: '8px', backgroundColor: '#fff' }}
                                >
                                    {periods.length === 0 ? (
                                        <MenuItem disabled value="">Aucune période disponible</MenuItem>
                                    ) : (
                                        periods.map((period) => (
                                            <MenuItem key={period._id || period.id} value={period._id || period.id}>
                                                {period.nom}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* ===== DATES ===== */}
                    <SectionTitle>
                        <SectionIcon color="#f59e0b">
                            <School sx={{ fontSize: 16 }} />
                        </SectionIcon>
                        Dates
                    </SectionTitle>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <StyledTextField
                                label="Date de début *"
                                type="date"
                                value={form.dateDebut}
                                onChange={(e) => handleChange('dateDebut', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StyledTextField
                                label="Date de fin *"
                                type="date"
                                value={form.dateFin}
                                onChange={(e) => handleChange('dateFin', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StyledTextField
                                label="Date limite candidature *"
                                type="date"
                                value={form.dateLimiteCandidature}
                                onChange={(e) => handleChange('dateLimiteCandidature', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                                helperText="Doit être antérieure à la date de début"
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* ===== SUJETS ===== */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <SectionTitle>
                            <SectionIcon color="#8b5cf6">
                                <Description sx={{ fontSize: 16 }} />
                            </SectionIcon>
                            Sujets de stage
                        </SectionTitle>
                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={addSubject}
                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                        >
                            Ajouter un sujet
                        </Button>
                    </Box>

                    {form.sujets.map((sujet, subjectIndex) => (
                        <FormCard key={subjectIndex}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600} color="#1a2332">
                                    Sujet {subjectIndex + 1}
                                </Typography>
                                {form.sujets.length > 1 && (
                                    <IconButton onClick={() => removeSubject(subjectIndex)} color="error" size="small">
                                        <Delete fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <StyledTextField
                                        label="Titre du sujet *"
                                        value={sujet.titre}
                                        onChange={(e) => handleSubjectChange(subjectIndex, 'titre', e.target.value)}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <StyledTextField
                                        label="Description du sujet *"
                                        value={sujet.description}
                                        onChange={(e) => handleSubjectChange(subjectIndex, 'description', e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <StyledTextField
                                        label="Profil recherché"
                                        value={sujet.profilRecherche}
                                        onChange={(e) => handleSubjectChange(subjectIndex, 'profilRecherche', e.target.value)}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>

                            {/* ===== MISSIONS ===== */}
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" fontWeight={600} color="#1a2332" sx={{ display: 'block', mb: 1 }}>
                                    Missions
                                </Typography>
                                {sujet.missions.map((mission, missionIndex) => (
                                    <Box key={missionIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                        <StyledTextField
                                            value={mission}
                                            onChange={(e) => handleMissionChange(subjectIndex, missionIndex, e.target.value)}
                                            placeholder={`Mission ${missionIndex + 1}`}
                                            fullWidth
                                            size="small"
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => removeMission(subjectIndex, missionIndex)}
                                            disabled={sujet.missions.length <= 1}
                                            sx={{ color: '#ef4444' }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button
                                    size="small"
                                    startIcon={<Add />}
                                    onClick={() => addMission(subjectIndex)}
                                    sx={{ textTransform: 'none', color: '#148aa0', fontSize: '12px' }}
                                >
                                    Ajouter une mission
                                </Button>
                            </Box>

                            {/* ===== COMPÉTENCES ===== */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="caption" fontWeight={600} color="#1a2332" sx={{ display: 'block', mb: 1 }}>
                                    Compétences requises
                                </Typography>
                                {sujet.competences.map((comp, compIndex) => (
                                    <Box key={compIndex} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                                        <StyledTextField
                                            value={comp.nom}
                                            onChange={(e) => handleCompetenceChange(subjectIndex, compIndex, 'nom', e.target.value)}
                                            placeholder="Nom de la compétence"
                                            size="small"
                                            sx={{ flex: 2 }}
                                        />
                                        <FormControl size="small" sx={{ flex: 1 }}>
                                            <Select
                                                value={comp.niveau}
                                                onChange={(e) => handleCompetenceChange(subjectIndex, compIndex, 'niveau', e.target.value)}
                                                displayEmpty
                                                sx={{ borderRadius: '8px', backgroundColor: '#fff' }}
                                            >
                                                <MenuItem value="">Niveau</MenuItem>
                                                {COMPETENCE_LEVELS.map((level) => (
                                                    <MenuItem key={level} value={level}>{level}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <IconButton
                                            size="small"
                                            onClick={() => removeCompetence(subjectIndex, compIndex)}
                                            disabled={sujet.competences.length <= 1}
                                            sx={{ color: '#ef4444' }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button
                                    size="small"
                                    startIcon={<Add />}
                                    onClick={() => addCompetence(subjectIndex)}
                                    sx={{ textTransform: 'none', color: '#148aa0', fontSize: '12px' }}
                                >
                                    Ajouter une compétence
                                </Button>
                            </Box>
                        </FormCard>
                    ))}
                </form>
            </CreateCard>
        </PageContainer>
    );
};

export default OfferEditPage;
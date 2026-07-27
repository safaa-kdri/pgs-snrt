// src/components/department/CreateOffer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Add,
    Delete,
    Save,
    Send,
    Work,
    School,
    Description,
    CheckCircle,
    Cancel,
    AttachFile,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const CreateCard = styled(Paper)({
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    maxWidth: '1000px',
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

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#fff',
    },
});

const FormCard = styled(Card)({
    borderRadius: '12px',
    padding: '16px',
    backgroundColor: '#f7f7f7',
    marginBottom: '12px',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const CreateOffer = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        titre: '',
        description: '',
        nbPostes: 1,
        typeStage: '',
        periodeId: '',
        dateDebut: '',
        dateFin: '',
        dateLimiteCandidature: '',
        documentsRequis: [],
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

    const [periods, setPeriods] = useState([]);

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setPeriods([
                { id: '1', nom: 'Été 2026' },
                { id: '2', nom: 'Hiver 2027' },
                { id: '3', nom: 'Printemps 2026' },
            ]);
        } catch (error) {
            console.error('Erreur chargement périodes:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleAddDocument = () => {
        setForm({
            ...form,
            documentsRequis: [...form.documentsRequis, { type: '', obligatoire: true }],
        });
    };

    const handleDocumentChange = (index, field, value) => {
        const newDocs = [...form.documentsRequis];
        newDocs[index][field] = value;
        setForm({ ...form, documentsRequis: newDocs });
    };

    const handleRemoveDocument = (index) => {
        const newDocs = form.documentsRequis.filter((_, i) => i !== index);
        setForm({ ...form, documentsRequis: newDocs });
    };

    const validateForm = () => {
        const errors = [];
        if (!form.titre) errors.push('Le titre est obligatoire');
        if (!form.description) errors.push('La description est obligatoire');
        if (!form.typeStage) errors.push('Le type de stage est obligatoire');
        if (!form.periodeId) errors.push('La période est obligatoire');
        if (!form.dateDebut) errors.push('La date de début est obligatoire');
        if (!form.dateFin) errors.push('La date de fin est obligatoire');
        if (!form.dateLimiteCandidature) errors.push('La date limite de candidature est obligatoire');
        form.sujets.forEach((sujet, index) => {
            if (!sujet.titre) errors.push(`Le titre du sujet ${index + 1} est obligatoire`);
            if (!sujet.description) errors.push(`La description du sujet ${index + 1} est obligatoire`);
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
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('📋 Offre créée:', form);
            setSuccess('✅ Offre créée avec succès !');
            setTimeout(() => navigate('/department/my-offers'), 1500);
        } catch (error) {
            console.error('Erreur création offre:', error);
            setError('❌ Erreur lors de la création de l\'offre');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        // Sauvegarde en brouillon
        console.log('📝 Brouillon sauvegardé:', form);
        setSuccess('✅ Brouillon sauvegardé avec succès !');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/department')}
                sx={{ mb: 3, textTransform: 'none', color: '#666' }}
            >
                Retour au tableau de bord
            </Button>

            <CreateCard>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332', mb: 1 }}>
                    📋 Créer une offre de stage
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Remplissez les informations ci-dessous pour créer une nouvelle offre de stage
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

                <form onSubmit={handleSubmit}>
                    {/* ===== INFORMATIONS GÉNÉRALES ===== */}
                    <SectionTitle><Work sx={{ color: '#148aa0' }} /> Informations générales</SectionTitle>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <StyledTextField
                                label="Titre de l'offre *"
                                value={form.titre}
                                onChange={(e) => handleChange('titre', e.target.value)}
                                fullWidth
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
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                label="Nombre de postes"
                                type="number"
                                value={form.nbPostes}
                                onChange={(e) => handleChange('nbPostes', parseInt(e.target.value))}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type de stage *</InputLabel>
                                <Select
                                    value={form.typeStage}
                                    onChange={(e) => handleChange('typeStage', e.target.value)}
                                    label="Type de stage *"
                                    sx={{ borderRadius: '10px', backgroundColor: '#fff' }}
                                >
                                    <MenuItem value="PFE">PFE</MenuItem>
                                    <MenuItem value="PFA">PFA</MenuItem>
                                    <MenuItem value="Initiation">Initiation</MenuItem>
                                    <MenuItem value="Ete">Été</MenuItem>
                                    <MenuItem value="Master">Master</MenuItem>
                                    <MenuItem value="Licence">Licence</MenuItem>
                                    <MenuItem value="Technicien">Technicien</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Période *</InputLabel>
                                <Select
                                    value={form.periodeId}
                                    onChange={(e) => handleChange('periodeId', e.target.value)}
                                    label="Période *"
                                    sx={{ borderRadius: '10px', backgroundColor: '#fff' }}
                                >
                                    {periods.map((period) => (
                                        <MenuItem key={period.id} value={period.id}>
                                            {period.nom}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* ===== DATES ===== */}
                    <SectionTitle><School sx={{ color: '#f59e0b' }} /> Dates</SectionTitle>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <StyledTextField
                                label="Date de début *"
                                type="date"
                                value={form.dateDebut}
                                onChange={(e) => handleChange('dateDebut', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
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
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* ===== SUJETS ===== */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <SectionTitle><Description sx={{ color: '#8b5cf6' }} /> Sujets de stage</SectionTitle>
                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={addSubject}
                            sx={{ borderRadius: '10px', textTransform: 'none' }}
                        >
                            Ajouter un sujet
                        </Button>
                    </Box>

                    {form.sujets.map((sujet, subjectIndex) => (
                        <FormCard key={subjectIndex}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    Sujet {subjectIndex + 1}
                                </Typography>
                                {form.sujets.length > 1 && (
                                    <IconButton onClick={() => removeSubject(subjectIndex)} color="error">
                                        <Delete />
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
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
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
                                    sx={{ textTransform: 'none', color: '#148aa0' }}
                                >
                                    Ajouter une mission
                                </Button>
                            </Box>

                            {/* ===== COMPÉTENCES ===== */}
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
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
                                                sx={{ borderRadius: '10px', backgroundColor: '#fff' }}
                                            >
                                                <MenuItem value="">Niveau</MenuItem>
                                                <MenuItem value="Débutant">Débutant</MenuItem>
                                                <MenuItem value="Intermédiaire">Intermédiaire</MenuItem>
                                                <MenuItem value="Avancé">Avancé</MenuItem>
                                                <MenuItem value="Expert">Expert</MenuItem>
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
                                    sx={{ textTransform: 'none', color: '#148aa0' }}
                                >
                                    Ajouter une compétence
                                </Button>
                            </Box>
                        </FormCard>
                    ))}

                    <Divider sx={{ my: 4 }} />

                    {/* ===== DOCUMENTS REQUIS ===== */}
                    <SectionTitle><AttachFile sx={{ color: '#22c55e' }} /> Documents requis</SectionTitle>
                    {form.documentsRequis.map((doc, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                            <FormControl fullWidth>
                                <InputLabel>Type de document</InputLabel>
                                <Select
                                    value={doc.type}
                                    onChange={(e) => handleDocumentChange(index, 'type', e.target.value)}
                                    label="Type de document"
                                    sx={{ borderRadius: '10px', backgroundColor: '#fff' }}
                                >
                                    <MenuItem value="CV">CV</MenuItem>
                                    <MenuItem value="Lettre Motivation">Lettre de motivation</MenuItem>
                                    <MenuItem value="Releve Notes">Relevé de notes</MenuItem>
                                    <MenuItem value="Attestation Scolarite">Attestation de scolarité</MenuItem>
                                    <MenuItem value="Autre">Autre</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <Select
                                    value={doc.obligatoire ? 'true' : 'false'}
                                    onChange={(e) => handleDocumentChange(index, 'obligatoire', e.target.value === 'true')}
                                    sx={{ borderRadius: '10px', backgroundColor: '#fff', minWidth: 120 }}
                                >
                                    <MenuItem value="true">Obligatoire</MenuItem>
                                    <MenuItem value="false">Optionnel</MenuItem>
                                </Select>
                            </FormControl>
                            <IconButton onClick={() => handleRemoveDocument(index)} sx={{ color: '#ef4444' }}>
                                <Delete />
                            </IconButton>
                        </Box>
                    ))}
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleAddDocument}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Ajouter un document requis
                    </Button>

                    <Divider sx={{ my: 4 }} />

                    {/* ===== BOUTONS ===== */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Save />}
                            onClick={handleSaveDraft}
                            disabled={saving}
                            sx={{ borderRadius: '10px', textTransform: 'none' }}
                        >
                            Sauvegarder en brouillon
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Send />}
                            disabled={saving}
                            sx={{
                                backgroundColor: '#148aa0',
                                borderRadius: '10px',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#0b7890' },
                            }}
                        >
                            {saving ? 'Création...' : '📤 Soumettre pour validation'}
                        </Button>
                    </Box>
                </form>
            </CreateCard>
        </Container>
    );
};

export default CreateOffer;
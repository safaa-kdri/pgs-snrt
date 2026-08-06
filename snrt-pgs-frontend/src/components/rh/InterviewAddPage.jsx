// src/components/rh/InterviewAddPage.jsx
// ✅ PAGE DE PLANIFICATION D'ENTRETIEN

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Save,
    Event,
    VideoCall,
    LocationOn,
    Schedule,
} from '@mui/icons-material';
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

const StyledPaper = styled(Paper)({
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
});

const StyledButton = styled(Button)({
    borderRadius: '12px',
    textTransform: 'none',
    padding: '10px 32px',
    fontWeight: 600,
});

const SaveButton = styled(StyledButton)({
    backgroundColor: '#2d3748',
    color: '#ffffff',
    '&:hover': { backgroundColor: '#1a202c' },
    '&:disabled': { backgroundColor: '#999999' },
});

const CancelButton = styled(StyledButton)({
    borderColor: '#d0d4d8',
    color: '#666666',
    '&:hover': { 
        borderColor: '#2d3748',
        backgroundColor: 'rgba(45, 55, 72, 0.04)',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const InterviewAddPage = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        applicationId: '',
        date: '',
        heure: '',
        duree: 30,
        type: 'presentiel',
        lieu: '',
        lienVisio: '',
        commentaires: '',
    });

    const typeOptions = [
        { value: 'presentiel', label: 'Présentiel', icon: <LocationOn /> },
        { value: 'visio', label: 'Visio', icon: <VideoCall /> },
        { value: 'telephonique', label: 'Téléphonique', icon: <Schedule /> },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    };

    const validateForm = () => {
        const errors = [];
        if (!formData.applicationId) errors.push("L'ID de la candidature est requis");
        if (!formData.date) errors.push('La date est requise');
        if (!formData.heure) errors.push("L'heure est requise");
        
        if (formData.type === 'visio' && !formData.lienVisio) {
            errors.push('Un lien de visioconférence est requis');
        }
        if (formData.type === 'presentiel' && !formData.lieu) {
            errors.push('Un lieu est requis pour un entretien présentiel');
        }
        
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (errors.length > 0) {
            setError(errors.join('. '));
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/interviews', formData);
            setSuccess('Entretien planifié avec succès !');
            
            // Rediriger après 1.5 secondes
            setTimeout(() => {
                navigate('/rh/interviews');
            }, 1500);
        } catch (error) {
            console.error('Erreur création:', error);
            setError(
                error.response?.data?.message || 
                'Erreur lors de la planification de l\'entretien'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        navigate('/rh/interviews');
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={handleBack} sx={{ color: '#666' }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                            Planifier un entretien
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Remplissez les informations pour planifier un entretien avec un candidat
                        </Typography>
                    </Box>
                </Box>
            </PageHeader>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                    {success}
                </Alert>
            )}

            {/* ===== FORMULAIRE ===== */}
            <StyledPaper>
                <Grid container spacing={3}>
                    {/* ID de la candidature */}
                    <Grid item xs={12}>
                        <TextField
                            id="interview-applicationId"
                            label="ID de la candidature *"
                            name="applicationId"
                            value={formData.applicationId}
                            onChange={handleChange}
                            fullWidth
                            placeholder="Entrez l'ID de la candidature"
                            helperText="Entrez l'identifiant de la candidature pour laquelle vous planifiez l'entretien"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>

                    {/* Date et Heure */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="interview-date"
                            label="Date *"
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="interview-heure"
                            label="Heure *"
                            type="time"
                            name="heure"
                            value={formData.heure}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>

                    {/* Durée et Type */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="interview-duree"
                            label="Durée (minutes)"
                            type="number"
                            name="duree"
                            value={formData.duree}
                            onChange={handleChange}
                            fullWidth
                            InputProps={{ inputProps: { min: 15, max: 180, step: 5 } }}
                            helperText="Entre 15 et 180 minutes"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="interview-type-label">Type *</InputLabel>
                            <Select
                                labelId="interview-type-label"
                                id="interview-type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                label="Type *"
                                sx={{ borderRadius: '10px' }}
                            >
                                {typeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {option.icon}
                                            {option.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Lieu (Présentiel) */}
                    {formData.type === 'presentiel' && (
                        <Grid item xs={12}>
                            <TextField
                                id="interview-lieu"
                                label="Lieu *"
                                name="lieu"
                                value={formData.lieu}
                                onChange={handleChange}
                                fullWidth
                                placeholder="Adresse, salle, bâtiment..."
                                helperText="Indiquez l'adresse complète du lieu de l'entretien"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                    )}

                    {/* Lien Visio (Visio) */}
                    {formData.type === 'visio' && (
                        <Grid item xs={12}>
                            <TextField
                                id="interview-lienVisio"
                                label="Lien Visio *"
                                name="lienVisio"
                                value={formData.lienVisio}
                                onChange={handleChange}
                                fullWidth
                                placeholder="https://meet.google.com/..."
                                helperText="Entrez le lien de la réunion visio"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                    )}

                    {/* Commentaires */}
                    <Grid item xs={12}>
                        <TextField
                            id="interview-commentaires"
                            label="Commentaires (optionnel)"
                            name="commentaires"
                            value={formData.commentaires}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Informations supplémentaires pour le candidat..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>

                    {/* Résumé */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, backgroundColor: '#f7f8fa', borderRadius: '12px' }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                                Résumé de la planification
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Type:</strong> {typeOptions.find(t => t.value === formData.type)?.label || '-'}
                                    </Typography>
                                </Grid>
                                {formData.date && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Date:</strong> {new Date(formData.date).toLocaleDateString('fr-FR', { 
                                                day: '2-digit', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}
                                        </Typography>
                                    </Grid>
                                )}
                                {formData.heure && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Heure:</strong> {formData.heure} ({formData.duree} min)
                                        </Typography>
                                    </Grid>
                                )}
                                {formData.type === 'presentiel' && formData.lieu && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Lieu:</strong> {formData.lieu}
                                        </Typography>
                                    </Grid>
                                )}
                                {formData.type === 'visio' && formData.lienVisio && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Lien Visio:</strong> {formData.lienVisio}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Boutons */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <CancelButton variant="outlined" onClick={handleBack}>
                                Annuler
                            </CancelButton>
                            <SaveButton
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                            >
                                {submitting ? 'Planification...' : 'Planifier l\'entretien'}
                            </SaveButton>
                        </Box>
                    </Grid>
                </Grid>
            </StyledPaper>
        </Container>
    );
};

export default InterviewAddPage;
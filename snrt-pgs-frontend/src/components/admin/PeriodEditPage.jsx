// src/components/admin/PeriodEditPage.jsx
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
    Switch,
    FormControlLabel,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Save,
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

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#fff',
    },
});

const StyledButton = styled(Button)({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 500,
    padding: '10px 32px',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const PeriodEditPage = () => {
    const navigate = useNavigate();
    const periodId = window.location.pathname.split('/').pop();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        nom: '',
        dateDebut: '',
        dateFin: '',
        dateOuvertureCandidatures: '',
        dateFermetureCandidatures: '',
        actif: true,
    });

    useEffect(() => {
        fetchPeriod();
    }, [periodId]);

    const fetchPeriod = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/periods/${periodId}`);
            const data = response.data?.data || response.data;
            
            setFormData({
                nom: data.nom || '',
                dateDebut: data.dateDebut ? data.dateDebut.split('T')[0] : '',
                dateFin: data.dateFin ? data.dateFin.split('T')[0] : '',
                dateOuvertureCandidatures: data.dateOuvertureCandidatures ? data.dateOuvertureCandidatures.split('T')[0] : '',
                dateFermetureCandidatures: data.dateFermetureCandidatures ? data.dateFermetureCandidatures.split('T')[0] : '',
                actif: data.actif !== undefined ? data.actif : true,
            });
        } catch (error) {
            console.error('Erreur chargement période:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const payload = {
                nom: formData.nom,
                dateDebut: formData.dateDebut,
                dateFin: formData.dateFin,
                dateOuvertureCandidatures: formData.dateOuvertureCandidatures,
                dateFermetureCandidatures: formData.dateFermetureCandidatures,
                actif: formData.actif,
            };

            await api.put(`/periods/${periodId}`, payload);
            setSuccess('Période modifiée avec succès !');
            setTimeout(() => navigate('/admin/periods'), 1500);
        } catch (error) {
            console.error('Erreur modification:', error);
            setError(error.response?.data?.message || 'Erreur lors de la modification');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/periods');
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={60} thickness={4} sx={{ color: '#2d3748' }} />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <PageHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={handleBack} sx={{ color: '#666' }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                            Modifier la période
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {formData.nom || 'Période sans nom'}
                        </Typography>
                    </Box>
                </Box>
                <StyledButton
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{
                        backgroundColor: '#2d3748',
                        '&:hover': { backgroundColor: '#1a2332' },
                    }}
                >
                    {saving ? <CircularProgress size={24} color="inherit" /> : <><Save sx={{ mr: 1 }} /> Enregistrer</>}
                </StyledButton>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

            <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <StyledTextField
                            label="Nom de la période *"
                            value={formData.nom}
                            onChange={(e) => handleChange('nom', e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            label="Date de début *"
                            type="date"
                            value={formData.dateDebut}
                            onChange={(e) => handleChange('dateDebut', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            label="Date de fin *"
                            type="date"
                            value={formData.dateFin}
                            onChange={(e) => handleChange('dateFin', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            label="Ouverture candidatures *"
                            type="date"
                            value={formData.dateOuvertureCandidatures}
                            onChange={(e) => handleChange('dateOuvertureCandidatures', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            label="Fermeture candidatures *"
                            type="date"
                            value={formData.dateFermetureCandidatures}
                            onChange={(e) => handleChange('dateFermetureCandidatures', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.actif}
                                    onChange={(e) => handleChange('actif', e.target.checked)}
                                />
                            }
                            label={formData.actif ? 'Actif' : 'Inactif'}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default PeriodEditPage;
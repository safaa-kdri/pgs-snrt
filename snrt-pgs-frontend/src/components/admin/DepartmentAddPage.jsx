// src/components/admin/DepartmentAddPage.jsx
import React, { useState } from 'react';
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
    Add,
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

const DepartmentAddPage = () => {
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        responsableId: '',
        actif: true,
    });

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
                description: formData.description,
                responsableId: formData.responsableId || undefined,
                actif: formData.actif,
            };

            await api.post('/departments', payload);
            setSuccess('Département créé avec succès !');
            setTimeout(() => navigate('/admin/departments'), 1500);
        } catch (error) {
            console.error('Erreur création:', error);
            setError(error.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/departments');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <PageHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={handleBack} sx={{ color: '#666' }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                            Ajouter un département
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Créer un nouveau département
                        </Typography>
                    </Box>
                </Box>
                <StyledButton
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{
                        backgroundColor: '#2d3748',
                        '&:hover': { backgroundColor: '#1a202c' },
                    }}
                >
                    {saving ? <CircularProgress size={24} color="inherit" /> : <><Add sx={{ mr: 1 }} /> Créer</>}
                </StyledButton>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

            <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <StyledTextField
                            label="Nom du département *"
                            value={formData.nom}
                            onChange={(e) => handleChange('nom', e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <StyledTextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <StyledTextField
                            label="ID du responsable"
                            value={formData.responsableId}
                            onChange={(e) => handleChange('responsableId', e.target.value)}
                            fullWidth
                            helperText="ID de l'utilisateur responsable (optionnel)"
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

export default DepartmentAddPage;
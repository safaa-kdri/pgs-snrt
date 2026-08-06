// src/components/admin/DepartmentEditPage.jsx
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

const DepartmentEditPage = () => {
    const navigate = useNavigate();
    const deptId = window.location.pathname.split('/').pop();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        responsableId: '',
        actif: true,
    });

    useEffect(() => {
        fetchDepartment();
    }, [deptId]);

    const fetchDepartment = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/departments/${deptId}`);
            const data = response.data?.data || response.data;
            
            setFormData({
                nom: data.nom || '',
                description: data.description || '',
                responsableId: data.responsableId?._id || data.responsableId || '',
                actif: data.actif !== undefined ? data.actif : true,
            });
        } catch (error) {
            console.error('Erreur chargement departement:', error);
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
                description: formData.description,
                responsableId: formData.responsableId || undefined,
                actif: formData.actif,
            };

            await api.put(`/departments/${deptId}`, payload);
            setSuccess('Departement modifie avec succes !');
            setTimeout(() => navigate('/admin/departments'), 1500);
        } catch (error) {
            console.error('Erreur modification:', error);
            setError(error.response?.data?.message || 'Erreur lors de la modification');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/departments');
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={60} thickness={4} sx={{ color: '#000000' }} />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={handleBack} sx={{ color: '#666' }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                            Modifier le departement
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {formData.nom || 'Departement sans nom'}
                        </Typography>
                    </Box>
                </Box>
                <StyledButton
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{
                        backgroundColor: '#000000',
                        '&:hover': { backgroundColor: '#333333' },
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
                            label="Nom du departement *"
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
                            rows={4}
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

export default DepartmentEditPage;
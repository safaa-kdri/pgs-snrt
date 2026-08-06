// src/components/department/EncadrantEditPage.jsx
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
    Edit,
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

const EncadrantEditPage = () => {
    const navigate = useNavigate();
    const encadrantId = window.location.pathname.split('/').pop();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        cin: '',
        motDePasse: '',
        confirmMotDePasse: '',
        actif: true,
    });

    useEffect(() => {
        fetchEncadrant();
    }, [encadrantId]);

    // ✅ CORRECTION : Utiliser la bonne route avec le type "interne"
    const fetchEncadrant = async () => {
        setLoading(true);
        setError('');
        try {
            // ✅ Correction : /users/interne/{id} au lieu de /users/internal/{id}
            const response = await api.get(`/users/interne/${encadrantId}`);
            console.log('📥 Réponse API:', response.data);
            
            // ✅ Gérer les différentes structures de réponse
            let data = response.data?.data || response.data;
            
            // Si la réponse est un tableau, prendre le premier élément
            if (Array.isArray(data)) {
                data = data[0];
            }
            
            if (!data) {
                throw new Error('Encadrant non trouvé');
            }
            
            setFormData({
                nom: data.nom || '',
                prenom: data.prenom || '',
                email: data.email || '',
                telephone: data.telephone || '',
                cin: data.cin || '',
                motDePasse: '',
                confirmMotDePasse: '',
                actif: data.actif !== undefined ? data.actif : true,
            });
        } catch (error) {
            console.error('❌ Erreur chargement encadrant:', error);
            if (error.response?.status === 404) {
                setError('Encadrant non trouvé');
                setTimeout(() => navigate('/department/encadrants'), 2000);
            } else {
                setError(error.response?.data?.message || 'Erreur lors du chargement');
            }
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
                prenom: formData.prenom,
                email: formData.email,
                telephone: formData.telephone || '',
                actif: formData.actif,
            };
            if (formData.motDePasse) {
                payload.motDePasse = formData.motDePasse;
            }

            // ✅ Correction : /users/interne/{id} au lieu de /users/internal/{id}
            await api.put(`/users/interne/${encadrantId}`, payload);
            setSuccess('Encadrant modifié avec succès !');
            setTimeout(() => navigate('/department/encadrants'), 1500);
        } catch (error) {
            console.error('Erreur modification:', error);
            setError(error.response?.data?.message || 'Erreur lors de la modification');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate('/department/encadrants');
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
                            Modifier l'encadrant
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {formData.prenom} {formData.nom}
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
                    {saving ? <CircularProgress size={24} color="inherit" /> : <><Save sx={{ mr: 1 }} /> Enregistrer</>}
                </StyledButton>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

            <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            label="Nom *"
                            value={formData.nom}
                            onChange={(e) => handleChange('nom', e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            label="Prénom *"
                            value={formData.prenom}
                            onChange={(e) => handleChange('prenom', e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <StyledTextField
                            label="Email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            fullWidth
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            label="Téléphone"
                            value={formData.telephone}
                            onChange={(e) => handleChange('telephone', e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            label="CIN"
                            value={formData.cin}
                            onChange={(e) => handleChange('cin', e.target.value)}
                            fullWidth
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <StyledTextField
                            label="Nouveau mot de passe (optionnel)"
                            type="password"
                            value={formData.motDePasse}
                            onChange={(e) => handleChange('motDePasse', e.target.value)}
                            fullWidth
                            helperText="Laisser vide pour ne pas modifier le mot de passe"
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
                            label={formData.actif ? 'Compte actif' : 'Compte inactif'}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default EncadrantEditPage;
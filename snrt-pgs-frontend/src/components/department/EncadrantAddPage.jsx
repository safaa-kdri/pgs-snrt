// src/components/department/EncadrantAddPage.jsx
// ✅ VERSION CORRIGÉE

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
    IconButton,
    Switch,
    FormControlLabel, 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Save,
    PersonAdd,
} from '@mui/icons-material';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

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

// ✅ ID connu du rôle Encadrant
const ENCADRANT_ROLE_ID = '6a6921c0fa6332cca9a6d7fc';

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const EncadrantAddPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [encadrantRoleId, setEncadrantRoleId] = useState(ENCADRANT_ROLE_ID);

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

    // ✅ Vérifier que le rôle existe, mais utiliser l'ID direct
    useEffect(() => {
        const verifyRole = async () => {
            try {
                const response = await api.get('/roles');
                const roles = response.data?.data || response.data || [];
                const encadrantRole = roles.find(r => r.nom === 'Encadrant');
                
                if (encadrantRole) {
                    setEncadrantRoleId(encadrantRole._id || encadrantRole.id);
                    console.log('✅ Rôle Encadrant trouvé:', encadrantRoleId);
                } else {
                    // ✅ Utiliser l'ID connu si le rôle n'est pas trouvé
                    setEncadrantRoleId(ENCADRANT_ROLE_ID);
                    console.log('⚠️ Utilisation de l\'ID connu:', ENCADRANT_ROLE_ID);
                }
            } catch (error) {
                console.error('❌ Erreur chargement rôle:', error);
                // ✅ En cas d'erreur, utiliser l'ID connu
                setEncadrantRoleId(ENCADRANT_ROLE_ID);
            }
        };
        
        verifyRole();
    }, []);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        setError('');
        setSuccess('');
    };

    const validateForm = () => {
        if (!formData.nom) { setError('Le nom est obligatoire'); return false; }
        if (!formData.prenom) { setError('Le prénom est obligatoire'); return false; }
        if (!formData.email) { setError('L\'email est obligatoire'); return false; }
        if (!formData.cin) { setError('Le CIN est obligatoire'); return false; }
        
        if (!formData.motDePasse || formData.motDePasse.length < 20) {
            setError('Le mot de passe doit contenir au moins 20 caractères');
            return false;
        }
        if (formData.motDePasse !== formData.confirmMotDePasse) {
            setError('Les mots de passe ne correspondent pas');
            return false;
        }
        
        const password = formData.motDePasse;
        const errors = [];
        if (!/[A-Z]/.test(password)) errors.push('une majuscule');
        if (!/[a-z]/.test(password)) errors.push('une minuscule');
        if (!/[0-9]/.test(password)) errors.push('un chiffre');
        if (!/[^A-Za-z0-9]/.test(password)) errors.push('un caractère spécial');
        if (errors.length > 0) {
            setError(`Le mot de passe doit contenir : ${errors.join(', ')}`);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!validateForm()) return;
        
        // ✅ Vérifier que le rôle existe
        if (!encadrantRoleId) {
            setError('Rôle "Encadrant" non trouvé. Veuillez contacter l\'administrateur.');
            return;
        }

        setSaving(true);

        try {
            const payload = {
                nom: formData.nom,
                prenom: formData.prenom,
                email: formData.email,
                telephone: formData.telephone || '',
                cin: formData.cin,
                motDePasse: formData.motDePasse,
                roleId: encadrantRoleId,
                // ✅ Le département est automatiquement assigné
                departementId: user?.departementId || null,
                actif: formData.actif,
            };

            console.log('📤 [EncadrantAdd] Payload:', payload);

            await api.post('/users/internal', payload);
            setSuccess('Encadrant ajouté avec succès !');
            setTimeout(() => navigate('/department/encadrants'), 1500);
        } catch (error) {
            console.error('❌ Erreur ajout:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'ajout');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate('/department/encadrants');
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
                            Ajouter un encadrant
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Remplissez les informations pour ajouter un nouvel encadrant
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
                    {saving ? <CircularProgress size={24} color="inherit" /> : <><PersonAdd sx={{ mr: 1 }} /> Ajouter</>}
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
                            label="Email *"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            fullWidth
                            required
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
                            label="CIN *"
                            value={formData.cin}
                            onChange={(e) => handleChange('cin', e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            label="Mot de passe *"
                            type="password"
                            value={formData.motDePasse}
                            onChange={(e) => handleChange('motDePasse', e.target.value)}
                            fullWidth
                            helperText="Minimum 20 caractères avec majuscule, minuscule, chiffre et caractère spécial"
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <StyledTextField
                            label="Confirmer le mot de passe *"
                            type="password"
                            value={formData.confirmMotDePasse}
                            onChange={(e) => handleChange('confirmMotDePasse', e.target.value)}
                            fullWidth
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
                            label={formData.actif ? 'Compte actif' : 'Compte inactif'}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default EncadrantAddPage;
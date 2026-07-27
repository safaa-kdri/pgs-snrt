// src/components/student/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Box,
    CircularProgress,
    Grid,
    Avatar,
    Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { authService } from '../../services/auth';

// ============================================
// STYLES
// ============================================

const ProfileCard = styled(Paper)({
    backgroundColor: '#f7f7f7',
    borderRadius: '19px',
    padding: '40px 35px 35px',
    boxShadow: 'none',
    maxWidth: '800px',
    margin: '0 auto',
});

const ProfileAvatar = styled(Avatar)({
    width: 100,
    height: 100,
    margin: '0 auto 20px',
    backgroundColor: '#148aa0',
    fontSize: 40,
    fontWeight: 700,
});

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        height: '44px',
        '& fieldset': { borderColor: '#dfe5ea' },
        '&:hover fieldset': { borderColor: '#dfe5ea' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 16px',
        fontSize: '14px',
        color: '#707b86',
    },
    width: '100%',
});

const SaveButton = styled(Button)({
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#148aa0',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
    textTransform: 'none',
    '&:hover': { backgroundColor: '#0b7890' },
    '&:disabled': { backgroundColor: '#a0c4cd' },
    padding: '0 40px',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        ville: '',
        pays: '',
        universite: '',
        filiere: '',
        niveau: '',
        annee: '',
    });

    const [originalForm, setOriginalForm] = useState({});

    useEffect(() => {
        if (user) {
            const userData = {
                nom: user.nom || '',
                prenom: user.prenom || '',
                email: user.email || '',
                telephone: user.telephone || '',
                adresse: user.adresse || '',
                ville: user.ville || '',
                pays: user.pays || '',
                universite: user.universite || '',
                filiere: user.filiere || '',
                niveau: user.niveau || '',
                annee: user.annee || '',
            };
            setForm(userData);
            setOriginalForm(userData);
        }
    }, [user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const hasChanges = () => {
        return JSON.stringify(form) !== JSON.stringify(originalForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!hasChanges()) {
            setError('Aucune modification détectée');
            return;
        }

        setSaving(true);

        try {
            const response = await api.put('/users/me', form);
            console.log('🟢 Profil mis à jour:', response.data);

            const updatedUser = { ...user, ...form };
            authService.setCurrentUser(updatedUser);

            setSuccess('✅ Profil mis à jour avec succès !');
            setOriginalForm(form);

        } catch (err) {
            console.error('🔴 Erreur:', err);
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    const getInitials = () => {
        if (form.prenom && form.nom) {
            return `${form.prenom[0]}${form.nom[0]}`.toUpperCase();
        }
        return '?';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <ProfileCard>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332', textAlign: 'center', mb: 1 }}>
                    👤 Mon Profil
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
                    Gérez vos informations personnelles
                </Typography>

                <ProfileAvatar>{getInitials()}</ProfileAvatar>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                label="Nom"
                                name="nom"
                                value={form.nom}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                label="Prénom"
                                name="prenom"
                                value={form.prenom}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <StyledTextField
                                label="Email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                disabled={true}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                label="Téléphone"
                                name="telephone"
                                value={form.telephone}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <StyledTextField
                                label="Adresse"
                                name="adresse"
                                value={form.adresse}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                label="Ville"
                                name="ville"
                                value={form.ville}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                label="Pays"
                                name="pays"
                                value={form.pays}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2332', mb: 2 }}>
                        🎓 Informations académiques
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <StyledTextField
                                label="Université / École"
                                name="universite"
                                value={form.universite}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                label="Filière"
                                name="filiere"
                                value={form.filiere}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                label="Niveau"
                                name="niveau"
                                value={form.niveau}
                                onChange={handleChange}
                                disabled={saving}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                        <Button
                            variant="outlined"
                            sx={{
                                borderColor: '#999',
                                color: '#666',
                                textTransform: 'none',
                                borderRadius: '12px',
                            }}
                            onClick={() => navigate('/dashboard')}
                            disabled={saving}
                        >
                            Annuler
                        </Button>
                        <SaveButton
                            type="submit"
                            disabled={saving || !hasChanges()}
                        >
                            {saving ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                '💾 Enregistrer'
                            )}
                        </SaveButton>
                    </Box>
                </form>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        variant="text"
                        sx={{ color: '#ef4444', textTransform: 'none' }}
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                    >
                        🚪 Se déconnecter
                    </Button>
                </Box>
            </ProfileCard>
        </Container>
    );
};

export default Profile;
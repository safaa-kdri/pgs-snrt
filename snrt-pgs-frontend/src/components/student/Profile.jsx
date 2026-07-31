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
    backgroundColor: '#fbf9f9',
    borderRadius: '19px',
    padding: '40px 35px 35px',
    boxShadow: 'none',
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid #e8edf0',
});

const PageTitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontWeight: 700,
    fontSize: '24px',
    color: '#1a2332',
    textAlign: 'center',
    marginBottom: '4px',
});

const PageSubtitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: '14px',
    color: '#6d7884',
    textAlign: 'center',
    marginBottom: '24px',
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
        color: '#1a2332',
        fontFamily: 'Inter, sans-serif',
    },
    '& .MuiInputLabel-root': {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#6d7884',
        '&.Mui-focused': { color: '#148aa0' },
    },
    width: '100%',
});

const SaveButton = styled(Button)({
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#148aa0',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    padding: '0 40px',
    '&:hover': { backgroundColor: '#0b7890' },
    '&:disabled': { backgroundColor: '#a0c4cd' },
});

const CancelButton = styled(Button)({
    height: '44px',
    borderRadius: '10px',
    borderColor: '#d1d5db',
    color: '#6d7884',
    fontSize: '15px',
    fontWeight: 500,
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    padding: '0 40px',
    '&:hover': {
        borderColor: '#148aa0',
        color: '#148aa0',
        backgroundColor: 'rgba(20, 138, 160, 0.04)',
    },
});

const StyledAlert = styled(Alert)({
    borderRadius: '10px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    marginBottom: '16px',
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

    // ✅ UNIQUEMENT LES CHAMPS MOT DE PASSE
    const [form, setForm] = useState({
        ancienMotDePasse: '',
        nouveauMotDePasse: '',
        confirmationMotDePasse: '',
    });

    useEffect(() => {
        // Réinitialiser les champs quand le composant se monte
        setForm({
            ancienMotDePasse: '',
            nouveauMotDePasse: '',
            confirmationMotDePasse: '',
        });
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const validateForm = () => {
        if (!form.ancienMotDePasse) {
            setError('Veuillez saisir votre mot de passe actuel');
            return false;
        }
        if (!form.nouveauMotDePasse || form.nouveauMotDePasse.length < 8) {
            setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
            return false;
        }
        if (form.nouveauMotDePasse !== form.confirmationMotDePasse) {
            setError('Les nouveaux mots de passe ne correspondent pas');
            return false;
        }
        if (form.ancienMotDePasse === form.nouveauMotDePasse) {
            setError('Le nouveau mot de passe doit être différent de l\'ancien');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            // ✅ Appel API pour changer le mot de passe
            const response = await api.put('/auth/change-password', {
                ancienMotDePasse: form.ancienMotDePasse,
                nouveauMotDePasse: form.nouveauMotDePasse,
            });

            setSuccess('Mot de passe modifié avec succès');
            
            // Réinitialiser les champs
            setForm({
                ancienMotDePasse: '',
                nouveauMotDePasse: '',
                confirmationMotDePasse: '',
            });

            // Déconnecter l'utilisateur après changement de mot de passe (optionnel)
            // setTimeout(() => {
            //     logout();
            //     navigate('/login');
            // }, 2000);

        } catch (err) {
            console.error('Erreur changement mot de passe:', err);
            setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={48} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <ProfileCard>
                <PageTitle>Changer mon mot de passe</PageTitle>
                <PageSubtitle>
                    Pour des raisons de sécurité, veuillez saisir votre mot de passe actuel
                </PageSubtitle>

                {error && (
                    <StyledAlert severity="error">
                        {error}
                    </StyledAlert>
                )}

                {success && (
                    <StyledAlert severity="success">
                        {success}
                    </StyledAlert>
                )}

                <form onSubmit={handleSubmit}>
                    <StyledTextField
                        label="Mot de passe actuel"
                        name="ancienMotDePasse"
                        type="password"
                        value={form.ancienMotDePasse}
                        onChange={handleChange}
                        disabled={saving}
                        size="small"
                        fullWidth
                        sx={{ mb: 2 }}
                    />

                    <Divider sx={{ my: 2 }} />

                    <StyledTextField
                        label="Nouveau mot de passe"
                        name="nouveauMotDePasse"
                        type="password"
                        value={form.nouveauMotDePasse}
                        onChange={handleChange}
                        disabled={saving}
                        size="small"
                        fullWidth
                        sx={{ mb: 2 }}
                    />

                    <StyledTextField
                        label="Confirmer le nouveau mot de passe"
                        name="confirmationMotDePasse"
                        type="password"
                        value={form.confirmationMotDePasse}
                        onChange={handleChange}
                        disabled={saving}
                        size="small"
                        fullWidth
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                        <CancelButton
                            variant="outlined"
                            onClick={() => navigate('/dashboard/applications')}
                            disabled={saving}
                        >
                            Annuler
                        </CancelButton>
                        <SaveButton
                            type="submit"
                            disabled={saving || !form.ancienMotDePasse || !form.nouveauMotDePasse || !form.confirmationMotDePasse}
                        >
                            {saving ? (
                                <CircularProgress size={22} color="inherit" />
                            ) : (
                                'Changer le mot de passe'
                            )}
                        </SaveButton>
                    </Box>
                </form>
            </ProfileCard>
        </Container>
    );
};

export default Profile;
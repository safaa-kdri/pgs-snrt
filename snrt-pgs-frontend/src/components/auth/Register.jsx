// src/components/auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Typography,
    Box,
    Container,
    Grid,
    TextField,
    Button,
    Paper,
    Alert,
    Checkbox,
    FormControlLabel,
    MenuItem,
    CircularProgress,
    Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { authService } from '../../services/auth';

// ============================================
// STYLES REGISTER
// ============================================

const PageTitle = styled(Typography)({
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 700,
    color: '#252930',
    margin: '0 auto 10px',
    maxWidth: '600px',
    lineHeight: 1.2,
    fontFamily: '"Inria Sans", sans-serif',
});

const TitleLine = styled(Box)({
    height: '2px',
    background: '#cfd5da',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto 10px',
});

const RegisterNote = styled(Typography)({
    textAlign: 'center',
    color: '#06101b',
    fontSize: '14px',
    margin: '0 auto 28px',
    maxWidth: '600px',
    fontFamily: '"Inria Sans", sans-serif',
});

const RegisterCard = styled(Paper)({
    backgroundColor: '#fbf9f9',
    borderRadius: '19px',
    padding: '28px 28px 30px',
    boxShadow: 'none',
    maxWidth: '800px',
    margin: '0 auto',
});

// ============================================
// STYLES POUR TOUS LES CHAMPS
// ============================================

const RegisterField = styled(TextField)({
    width: '100%',
    marginBottom: '8px',

    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        height: '40px',

        '& fieldset': {
            borderColor: '#dfe5ea',
        },

        '&:hover fieldset': {
            borderColor: '#dfe5ea',
        },

        '&.Mui-focused fieldset': {
            borderColor: '#148aa0',
        },
    },

    '& .MuiInputBase-input': {
        padding: '0 14px',
        fontSize: '14px',
        height: '40px',
        lineHeight: '40px',
        boxSizing: 'border-box',
    },

    '& .MuiSelect-select': {
        padding: '0 14px !important',
        height: '40px !important',
        lineHeight: '40px !important',
        display: 'flex',
        alignItems: 'center',
    },

    '& .MuiInputLabel-root': {
        transform: 'translate(14px, 10px) scale(1)',
        fontSize: '14px',
        '&.Mui-focused, &.MuiFormLabel-filled': {
            transform: 'translate(14px, -8px) scale(0.75)',
        },
    },
});

// ============================================
// STYLE UNIQUEMENT POUR LE CHAMP DATE
// ============================================

const DateField = styled(TextField)({
    width: '100%',
    marginBottom: '8px',

    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        height: '72px',

        '& fieldset': {
            borderColor: '#dfe5ea',
        },

        '&:hover fieldset': {
            borderColor: '#dfe5ea',
        },

        '&.Mui-focused fieldset': {
            borderColor: '#148aa0',
        },
    },

    '& .MuiInputBase-input': {
        padding: '28px 14px 10px 14px',
        fontSize: '14px',
        color: '#222222',
        height: 'auto',
        lineHeight: '1.4',
        boxSizing: 'border-box',
    },

    '& .MuiInputLabel-root': {
        transform: 'translate(14px, 8px) scale(1)',
        fontSize: '14px',
        color: '#6d7884',
        '&.Mui-focused, &.MuiFormLabel-filled': {
            transform: 'translate(14px, 4px) scale(0.75)',
        },
    },

    '& input[type="date"]': {
        padding: '28px 14px 10px 14px !important',
        height: 'auto !important',
        minHeight: 'auto !important',
        lineHeight: '1.4 !important',
        '&::-webkit-calendar-picker-indicator': {
            opacity: 0.6,
            padding: '4px',
            marginRight: '4px',
        },
        '&::-webkit-datetime-edit': {
            padding: 0,
        },
        '&::-webkit-datetime-edit-fields-wrapper': {
            padding: 0,
        },
        '&::-webkit-datetime-edit-text': {
            padding: '0 2px',
        },
    },
});

const AddButton = styled(Button)({
    width: '180px',
    height: '38px',
    marginLeft: 'auto',
    display: 'block',
    border: '2px solid #777',
    borderRadius: '5px',
    background: 'transparent',
    color: '#777',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '14px',
    textTransform: 'none',
    '&:hover': {
        borderColor: '#148aa0',
        color: '#148aa0',
        backgroundColor: 'transparent',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        civilite: '',
        nom: '',
        prenom: '',
        dateNaissance: '',
        email: '',
        emailConfirmation: '',
        cin: '',
        telephone: '',
        adresse: '',
        ville: '',
        pays: '',
        motDePasse: '',
        confirmationMotDePasse: '',
        acceptTerms: false
    });

    const [errors, setErrors] = useState({});

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token || isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
        setError('');
    };

    const validate = () => {
        const newErrors = {};

        if (!form.civilite) newErrors.civilite = 'La civilité est obligatoire';
        if (!form.nom) newErrors.nom = 'Le nom est obligatoire';
        if (!form.prenom) newErrors.prenom = 'Le prénom est obligatoire';
        if (!form.dateNaissance) newErrors.dateNaissance = 'La date de naissance est obligatoire';
        if (!form.email) newErrors.email = 'L\'email est obligatoire';
        if (form.email !== form.emailConfirmation) {
            newErrors.emailConfirmation = 'Les emails ne correspondent pas';
        }
        if (!form.cin) newErrors.cin = 'Le CIN est obligatoire';
        if (!form.telephone) newErrors.telephone = 'Le téléphone est obligatoire';
        if (!form.adresse) newErrors.adresse = 'L\'adresse est obligatoire';
        if (!form.ville) newErrors.ville = 'La ville est obligatoire';
        if (!form.pays) newErrors.pays = 'Le pays est obligatoire';
        if (!form.motDePasse || form.motDePasse.length < 16) {
            newErrors.motDePasse = 'Le mot de passe doit contenir au moins 16 caractères';
        }
        if (form.motDePasse !== form.confirmationMotDePasse) {
            newErrors.confirmationMotDePasse = 'Les mots de passe ne correspondent pas';
        }
        if (!form.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setError('');

        try {
            await authService.register(form);
            setSuccess(true);

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error('🔴 Erreur inscription:', err);
            setError(err.response?.data?.message || 'Erreur d\'inscription');
        } finally {
            setLoading(false);
        }
    };

    // ========================================== //
    // AFFICHAGE SUCCÈS
    // ========================================== //

    if (success) {
        return (
            <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
                <RegisterCard>
                    <Typography variant="h5" sx={{ textAlign: 'center', color: '#148aa0', mb: 2 }}>
                        ✅ Inscription réussie !
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                        Vous allez être redirigé vers la page de connexion.
                    </Typography>
                </RegisterCard>
            </Box>
        );
    }

    // ========================================== //
    // AFFICHAGE PRINCIPAL
    // ========================================== //

    return (
        <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <PageTitle>Inscription</PageTitle>
            <TitleLine />
            <RegisterNote>
                Ces informations vous permettront d'accéder à votre compte par la suite
            </RegisterNote>

            <RegisterCard>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <RegisterField
                        select
                        label="* Civilité"
                        name="civilite"
                        value={form.civilite}
                        onChange={handleChange}
                        error={!!errors.civilite}
                        helperText={errors.civilite}
                        disabled={loading}
                    >
                        <MenuItem value="">Sélectionner</MenuItem>
                        <MenuItem value="M.">M.</MenuItem>
                        <MenuItem value="Mme">Mme</MenuItem>
                        <MenuItem value="Mlle">Mlle</MenuItem>
                    </RegisterField>

                    <RegisterField
                        label="* Nom"
                        name="nom"
                        value={form.nom}
                        onChange={handleChange}
                        error={!!errors.nom}
                        helperText={errors.nom}
                        disabled={loading}
                    />

                    <RegisterField
                        label="* Prénom"
                        name="prenom"
                        value={form.prenom}
                        onChange={handleChange}
                        error={!!errors.prenom}
                        helperText={errors.prenom}
                        disabled={loading}
                    />

                    <DateField
                        label="* Date de naissance"
                        type="date"
                        name="dateNaissance"
                        value={form.dateNaissance}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.dateNaissance}
                        helperText={errors.dateNaissance}
                        disabled={loading}
                    />

                    <RegisterField
                        label="* Email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        disabled={loading}
                    />

                    <RegisterField
                        label="* Confirmation email"
                        type="email"
                        name="emailConfirmation"
                        value={form.emailConfirmation}
                        onChange={handleChange}
                        error={!!errors.emailConfirmation}
                        helperText={errors.emailConfirmation}
                        disabled={loading}
                    />

                    <RegisterField
                        label="* CIN"
                        name="cin"
                        value={form.cin}
                        onChange={handleChange}
                        error={!!errors.cin}
                        helperText={errors.cin}
                        disabled={loading}
                    />

                    <RegisterField
                        label="* Téléphone"
                        name="telephone"
                        value={form.telephone}
                        onChange={handleChange}
                        error={!!errors.telephone}
                        helperText={errors.telephone}
                        disabled={loading}
                    />

                    <RegisterField
                        label="* Adresse"
                        name="adresse"
                        value={form.adresse}
                        onChange={handleChange}
                        error={!!errors.adresse}
                        helperText={errors.adresse}
                        disabled={loading}
                    />

                    <RegisterField
                        label="* Ville"
                        name="ville"
                        value={form.ville}
                        onChange={handleChange}
                        error={!!errors.ville}
                        helperText={errors.ville}
                        disabled={loading}
                    />

                    <RegisterField
                        label="* Pays"
                        name="pays"
                        value={form.pays}
                        onChange={handleChange}
                        error={!!errors.pays}
                        helperText={errors.pays}
                        disabled={loading}
                    />

                    <RegisterField
                        label="* Mot de passe"
                        type="password"
                        name="motDePasse"
                        value={form.motDePasse}
                        onChange={handleChange}
                        error={!!errors.motDePasse}
                        helperText={errors.motDePasse}
                        disabled={loading}
                    />

                    <RegisterField
                        label="* Confirmation mot de passe"
                        type="password"
                        name="confirmationMotDePasse"
                        value={form.confirmationMotDePasse}
                        onChange={handleChange}
                        error={!!errors.confirmationMotDePasse}
                        helperText={errors.confirmationMotDePasse}
                        disabled={loading}
                    />

                    <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="acceptTerms"
                                    checked={form.acceptTerms}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            }
                            label="En cochant cette case, vous acceptez nos Termes et Conditions du service."
                        />
                        {errors.acceptTerms && (
                            <Typography color="error" variant="caption" display="block">
                                {errors.acceptTerms}
                            </Typography>
                        )}
                    </Box>

                    <AddButton type="submit" disabled={loading}>
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Ajouter"}
                    </AddButton>
                </form>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2">
                        Déjà un compte ?{' '}
                        <Link component={RouterLink} to="/login" sx={{ color: '#075fff', fontWeight: 600 }}>
                            Se connecter
                        </Link>
                    </Typography>
                </Box>
            </RegisterCard>
        </Box>
    );
};

export default Register;
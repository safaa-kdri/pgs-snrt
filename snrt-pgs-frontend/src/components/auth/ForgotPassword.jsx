// src/components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
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
    InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { authService } from '../../services/auth';

// ============================================
// STYLES
// ============================================

const ForgotCard = styled(Paper)({
    backgroundColor: '#f7f7f7',
    borderRadius: '19px',
    padding: '40px 35px 35px',
    textAlign: 'center',
    boxShadow: 'none',
    maxWidth: '450px',
    margin: '0 auto',
    '& h2': {
        margin: '0 0 10px',
        color: '#07111b',
        fontSize: '24px',
        lineHeight: 1.2,
        fontWeight: 700,
    },
});

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '27px',
        backgroundColor: '#ffffff',
        height: '44px',
        '& fieldset': { borderColor: '#e1e6eb' },
        '&:hover fieldset': { borderColor: '#e1e6eb' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 20px 0 45px',
        fontSize: '16px',
        color: '#6d7884',
    },
    '& .MuiInputAdornment-root': {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#aab1b8',
        zIndex: 1,
        pointerEvents: 'none',
    },
    width: '100%',
    margin: '0 auto 10px',
    display: 'block',
});

const SubmitButton = styled(Button)({
    width: '100%',
    height: '44px',
    marginTop: '10px',
    borderRadius: '23px',
    backgroundColor: '#148aa0',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 700,
    textTransform: 'none',
    '&:hover': { backgroundColor: '#0b7890' },
    '&:disabled': { backgroundColor: '#a0c4cd' },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!email) {
            setError('Veuillez saisir votre adresse email');
            return;
        }

        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setSuccess(true);
            setError('');
        } catch (err) {
            console.error('🔴 Erreur:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <ForgotCard>
                <Typography variant="h2">🔑 Mot de passe oublié</Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Saisissez votre adresse email pour recevoir un lien de réinitialisation
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>
                        ✅ Un email de réinitialisation a été envoyé à <strong>{email}</strong>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <StyledTextField
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading || success}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <i className="fa-solid fa-envelope" style={{ fontSize: 18 }}></i>
                                </InputAdornment>
                            ),
                        }}
                        variant="outlined"
                    />

                    <SubmitButton
                        type="submit"
                        disabled={loading || success}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Envoyer le lien'
                        )}
                    </SubmitButton>
                </form>

                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="text"
                        sx={{ color: '#999', textTransform: 'none' }}
                        onClick={() => navigate('/login')}
                        disabled={loading}
                    >
                        ← Retour à la connexion
                    </Button>
                </Box>
            </ForgotCard>
        </Container>
    );
};

export default ForgotPassword;
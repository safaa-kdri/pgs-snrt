// src/components/auth/Verify2FA.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { authService } from '../../services/auth';

const Verify2FA = () => {
    const navigate = useNavigate();

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const storedEmail = localStorage.getItem('2faEmail');
        if (storedEmail) {
            setEmail(storedEmail);
            return;
        }
        navigate('/login', { replace: true });
    }, [navigate]);

    const redirectByRole = (userData) => {
        const role = userData?.role || userData?.userType;

        switch (role) {
            case 'Administrateur':
                navigate('/admin', { replace: true });
                break;
            case 'RH':
                navigate('/rh', { replace: true });
                break;
            case 'Departement':
                navigate('/department', { replace: true });
                break;
            case 'Encadrant':
                navigate('/supervisor', { replace: true });
                break;
            default:
                navigate('/dashboard', { replace: true });
                break;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.verify2FA({
                code: code,
            });

            console.log('🔵 Réponse 2FA :', response);

            if (response.success || response.user) {
                localStorage.removeItem('2faEmail');

                if (response.token) {
                    localStorage.setItem('token', response.token);
                }

                let userData = response.user;
                if (userData) {
                    localStorage.setItem('user', JSON.stringify(userData));
                    authService.setCurrentUser(userData);
                } else {
                    userData = authService.getCurrentUser();
                }

                if (!userData) {
                    const loadedUser = await authService.me();
                    userData = loadedUser || {};
                    if (loadedUser) {
                        authService.setCurrentUser(loadedUser);
                        localStorage.setItem('user', JSON.stringify(loadedUser));
                    }
                }

                redirectByRole(userData);
                return;
            }

            setError('Code invalide ou expiré. Veuillez réessayer.');
        } catch (err) {
            setError(err?.response?.data?.message || 'Erreur de vérification');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setLoading(true);

        try {
            await authService.resendTwoFactorCode();
            setError('✅ Nouveau code envoyé par email');
        } catch (err) {
            setError(err?.response?.data?.message || 'Erreur lors du renvoi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    🔐 Vérification à deux facteurs
                </Typography>

                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                    Un code de vérification a été envoyé à votre adresse email.
                    Veuillez le saisir ci-dessous.
                </Typography>

                {error && (
                    <Alert severity={error.includes('✅') ? 'success' : 'error'} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Code de vérification"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Entrez le code à 6 chiffres"
                        inputProps={{ maxLength: 6 }}
                        sx={{ mb: 3 }}
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mb: 2, bgcolor: '#1a237e' }}
                        disabled={loading || code.length < 6}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Vérifier'}
                    </Button>
                </form>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button onClick={handleResend} disabled={loading} color="primary">
                        Renvoyer le code
                    </Button>
                    <Button onClick={() => navigate('/')} color="primary">
                        Retour à l'accueil
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Verify2FA;
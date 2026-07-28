// src/components/auth/LoginModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { login } from '../../store/slices/authSlice';
import {
    PersonOutline,
    VpnKeyOutlined,
} from '@mui/icons-material';

const StyledDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#f7f7f7',
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
        fontSize: '15px',
        color: '#6d7884',
        fontFamily: 'Inter, sans-serif',
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
    marginBottom: '12px',
});

const LoginButton = styled(Button)({
    width: '100%',
    height: '44px',
    borderRadius: '23px',
    backgroundColor: '#148aa0',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    '&:hover': { backgroundColor: '#0b7890' },
    '&:disabled': { backgroundColor: '#a0c4cd' },
});

const LoginModal = ({ open, onClose, onLoginSuccess }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [cin, setCin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!cin || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);

        try {
            const result = await dispatch(
                login({ cin, motDePasse: password })
            ).unwrap();

            if (result?.requiresTwoFactor) {
                localStorage.setItem('2faEmail', cin);
                onClose();
                navigate('/verify-2fa', { replace: true });
                return;
            }

            if (result?.user) {
                setError('');
                onLoginSuccess?.();
                onClose();
                // ✅ Rediriger vers l'accueil après connexion
                navigate('/', { replace: true });
            }
        } catch (err) {
            setAttempts(prev => prev + 1);
            setError(err || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const isBlocked = attempts >= 3;

    return (
        <StyledDialog open={open} onClose={onClose}>
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                <Typography variant="h5" fontWeight={700} color="#1a2332">
                    🔐 Connexion requise
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Veuillez vous connecter pour postuler à cette offre
                </Typography>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        Vous avez <strong>{3 - attempts}</strong> tentative(s) restante(s)
                    </Typography>
                </Box>

                <form onSubmit={handleLogin}>
                    <StyledTextField
                        placeholder="CIN"
                        value={cin}
                        onChange={(e) => setCin(e.target.value)}
                        disabled={loading || isBlocked}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonOutline sx={{ color: '#aab1b8', fontSize: 18 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <StyledTextField
                        placeholder="Mot de passe"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading || isBlocked}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <VpnKeyOutlined sx={{ color: '#aab1b8', fontSize: 18 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <LoginButton
                        type="submit"
                        disabled={loading || isBlocked}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
                    </LoginButton>
                </form>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                        variant="text"
                        sx={{ color: '#075fff', textTransform: 'none' }}
                        onClick={() => {
                            onClose();
                            navigate('/forgot-password');
                        }}
                    >
                        Mot de passe oublié ?
                    </Button>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Pas encore de compte ?{' '}
                        <Button
                            variant="text"
                            sx={{ color: '#075fff', textTransform: 'none', p: 0 }}
                            onClick={() => {
                                onClose();
                                navigate('/register');
                            }}
                        >
                            S'inscrire
                        </Button>
                    </Typography>
                </Box>
            </DialogContent>
        </StyledDialog>
    );
};

export default LoginModal;
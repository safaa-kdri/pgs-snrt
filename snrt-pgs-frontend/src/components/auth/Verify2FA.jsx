// src/components/auth/Verify2FA.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { verify2FA } from '../../store/slices/authSlice';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const PageContainer = styled(Container)({
    maxWidth: '100% !important',
    padding: '0 !important',
    margin: '0 !important',
});

const StyledCard = styled(Card)({
    backgroundColor: '#fbf9f9',
    borderRadius: '19px',
    padding: '48px 40px 40px',
    boxShadow: 'none',
    maxWidth: '480px',
    margin: '0 auto',
    border: '1px solid #e8edf0',
});

const CardTitle = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontWeight: 700,
    fontSize: '28px',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: '8px',
});

const CardSubtitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: '15px',
    color: '#6d7884',
    textAlign: 'center',
    marginBottom: '32px',
    lineHeight: 1.6,
});

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        height: '64px',
        '& fieldset': { borderColor: '#dfe5ea', borderWidth: '1px' },
        '&:hover fieldset': { borderColor: '#dfe5ea' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0', borderWidth: '2px' },
        '&.Mui-error fieldset': { borderColor: '#d32f2f' },
    },
    '& .MuiInputBase-input': {
        padding: '0 20px',
        fontSize: '22px',
        color: '#1a1a2e',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
        letterSpacing: '8px',
        fontWeight: 600,
        height: '64px',
        '&::placeholder': {
            color: '#b0b8c4',
            letterSpacing: '4px',
            fontSize: '18px',
            fontWeight: 400,
        },
    },
    '& .MuiInputLabel-root': {
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#6d7884',
        '&.Mui-focused': { color: '#148aa0' },
        '&.Mui-error': { color: '#d32f2f' },
    },
});

const DotIndicator = styled(Box)({
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    marginTop: '12px',
    marginBottom: '24px',
});

const Dot = styled(Box)(({ active }) => ({
    width: '40px',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: active ? '#148aa0' : '#e1e6eb',
    transition: 'all 0.3s ease',
}));

const VerifyButton = styled(Button)({
    width: '100%',
    height: '52px',
    borderRadius: '12px',
    backgroundColor: '#148aa0',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    boxShadow: 'none',
    '&:hover': { backgroundColor: '#0b7890', boxShadow: 'none' },
    '&:disabled': { backgroundColor: '#b8d0d8', color: '#ffffff' },
});

const ActionButton = styled(Button)({
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    textTransform: 'none',
    padding: '8px 4px',
    '&:hover': { backgroundColor: 'transparent' },
});

const StyledAlert = styled(Alert)({
    borderRadius: '10px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    marginBottom: '20px',
    padding: '12px 16px',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Verify2FA = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);
    const [userData, setUserData] = useState(null);

    // Vérifier si déjà connecté
    useEffect(() => {
        const user = localStorage.getItem('user');
        
        if (user) {
            try {
                const userData = JSON.parse(user);
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
                        // ✅ REDIRIGER VERS L'ACCUEIL
                        navigate('/', { replace: true });
                        break;
                }
                return;
            } catch (e) {
                console.error('Erreur parsing user:', e);
            }
        }

        const storedEmail = localStorage.getItem('2faEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const resultAction = await dispatch(verify2FA({ code }));

            if (verify2FA.rejected.match(resultAction)) {
                throw new Error(resultAction.payload || 'Code invalide ou expiré');
            }

            localStorage.removeItem('2faEmail');
            localStorage.removeItem('2faUserId');

            const userData = resultAction.payload?.user;
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
            }

            // ✅ REDIRIGER VERS L'ACCUEIL
            navigate('/', { replace: true });
            
        } catch (err) {
            const errorMsg = err?.response?.data?.message || err?.message || 'Erreur de vérification';
            
            if (errorMsg.includes('Session expiree') || errorMsg.includes('preAuthToken')) {
                localStorage.removeItem('2faEmail');
                navigate('/login', { replace: true });
                return;
            }
            
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/resend-2fa');
            setError('Nouveau code envoyé par email');
        } catch (err) {
            const errorMsg = err?.response?.data?.message || 'Erreur lors du renvoi';
            
            if (errorMsg.includes('Session expiree') || errorMsg.includes('preAuthToken')) {
                localStorage.removeItem('2faEmail');
                navigate('/login', { replace: true });
                return;
            }
            
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const goToHome = () => {
        localStorage.removeItem('2faEmail');
        navigate('/', { replace: true });
    };

    // État succès
    if (success) {
        const fullName = `${userData?.prenom || ''} ${userData?.nom || ''}`.trim() || 'Utilisateur';

        return (
            <PageContainer maxWidth="xl">
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '80vh',
                    px: { xs: 2, md: 3 }
                }}>
                    <StyledCard>
                        <CardContent sx={{ p: 0, textAlign: 'center' }}>
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '50%',
                                    backgroundColor: '#e8f5e9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                }}>
                                    <Typography variant="h3" sx={{ color: '#22c55e' }}>
                                        ✓
                                    </Typography>
                                </Box>
                            </Box>

                            <CardTitle>Authentification réussie</CardTitle>
                            <CardSubtitle>
                                Bienvenue <strong>{fullName}</strong>
                            </CardSubtitle>

                            <Box sx={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                mt: 2
                            }}>
                                <ActionButton
                                    onClick={goToHome}
                                    sx={{ color: '#6d7884' }}
                                >
                                    <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i>
                                    Accueil
                                </ActionButton>
                            </Box>
                        </CardContent>
                    </StyledCard>
                </Box>
            </PageContainer>
        );
    }

    // Formulaire 2FA
    return (
        <PageContainer maxWidth="xl">
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                px: { xs: 2, md: 3 }
            }}>
                <StyledCard>
                    <CardContent sx={{ p: 0 }}>
                        <CardTitle>Vérification à deux facteurs</CardTitle>
                        <CardSubtitle>
                            Un code de vérification a été envoyé à votre adresse email.<br />
                            Veuillez le saisir ci-dessous.
                        </CardSubtitle>

                        {error && (
                            <StyledAlert severity={error.includes('Nouveau code') ? 'success' : 'error'}>
                                {error}
                            </StyledAlert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <StyledTextField
                                fullWidth
                                label="Code de vérification"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="— — — — — —"
                                inputProps={{ maxLength: 6 }}
                                disabled={loading}
                                autoFocus
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <i className="fa-solid fa-shield-halved" style={{ color: '#148aa0', fontSize: '18px' }}></i>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <DotIndicator>
                                {[...Array(6)].map((_, index) => (
                                    <Dot key={index} active={code.length > index} />
                                ))}
                            </DotIndicator>

                            <VerifyButton
                                type="submit"
                                disabled={loading || code.length < 6}
                            >
                                {loading ? (
                                    <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                                ) : (
                                    'Vérifier'
                                )}
                            </VerifyButton>
                        </form>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 3,
                            pt: 2,
                            borderTop: '1px solid #e8edf0'
                        }}>
                            <ActionButton
                                onClick={handleResend}
                                disabled={loading}
                                sx={{ color: '#148aa0' }}
                            >
                                <i className="fa-solid fa-rotate-right" style={{ marginRight: '6px' }}></i>
                                Renvoyer le code
                            </ActionButton>
                            <ActionButton
                                onClick={goToHome}
                                sx={{ color: '#6d7884' }}
                            >
                                <i className="fa-solid fa-xmark" style={{ marginRight: '6px' }}></i>
                                Annuler
                            </ActionButton>
                        </Box>
                    </CardContent>
                </StyledCard>
            </Box>
        </PageContainer>
    );
};

export default Verify2FA;
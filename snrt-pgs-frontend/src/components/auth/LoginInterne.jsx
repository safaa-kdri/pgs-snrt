// src/components/auth/LoginInterne.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography,
    Box,
    Button,
    InputAdornment,
    TextField,
    Link,
    CircularProgress,
    Alert,
    Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { login } from '../../store/slices/authSlice';

// ============================================
// STYLES
// ============================================

const PageContainer = styled(Box)({
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
});

const LoginCard = styled(Paper)({
    backgroundColor: '#ffffff',
    borderRadius: '19px',
    padding: '24px 28px 20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    maxWidth: '360px',
    width: '100%',
    textAlign: 'center',
});

const Logo = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16px',
    '& img': {
        width: '80px',
        height: 'auto',
        objectFit: 'contain',
    },
});

const Title = styled(Typography)({
    fontFamily: '"Inter", sans-serif',
    fontWeight: 700,
    fontSize: '20px',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: '2px',
});

const Subtitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: '13px',
    color: '#6d7884',
    textAlign: 'center',
    marginBottom: '16px',
});

// ✅ CHAMPS AVEC ESPACE SUFFISANT POUR LES ICÔNES
const StyledTextField = styled(TextField)({
    width: '100%',
    marginBottom: '10px',
    '& .MuiOutlinedInput-root': {
        borderRadius: '27px',
        backgroundColor: '#f8f9fa',
        height: '42px',
        '& fieldset': {
            borderColor: '#e1e6eb',
            borderWidth: '1px',
        },
        '&:hover fieldset': {
            borderColor: '#e1e6eb',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#148aa0',
            borderWidth: '2px',
        },
    },
    '& .MuiInputBase-input': {
        padding: '0 14px 0 44px', // ✅ Padding gauche augmenté (14px → 44px) pour laisser de la place à l'icône
        fontSize: '14px',
        color: '#1a1a2e',
        fontFamily: 'Inter, sans-serif',
        height: '42px',
        boxSizing: 'border-box',
    },
    '& .MuiInputLabel-root': {
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        color: '#6d7884',
        '&.Mui-focused': {
            color: '#148aa0',
        },
    },
    '& .MuiInputAdornment-root': {
        position: 'absolute',
        left: '14px', // ✅ Légèrement décalé vers la droite
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#aab1b8',
        zIndex: 1,
        pointerEvents: 'none',
    },
});

const LoginButton = styled(Button)({
    width: '100%',
    height: '42px',
    borderRadius: '23px',
    backgroundColor: '#148aa0',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    boxShadow: 'none',
    marginTop: '2px',
    '&:hover': {
        backgroundColor: '#0b7890',
        boxShadow: 'none',
    },
    '&:disabled': {
        backgroundColor: '#b8d0d8',
        color: '#ffffff',
    },
});

const ForgotLink = styled(Link)({
    color: '#075fff',
    fontSize: '13px',
    textDecoration: 'underline',
    display: 'block',
    marginBottom: '8px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center',
});

const TermsText = styled(Typography)({
    maxWidth: '160px',
    margin: '0 auto',
    color: '#000',
    fontSize: '11px',
    lineHeight: 1.4,
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center',
    '& a': { color: '#075fff' },
});

const BackLink = styled(Link)({
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
    color: '#6d7884',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '10px',
    cursor: 'pointer',
    '&:hover': {
        color: '#148aa0',
    },
});

const Divider = styled(Box)({
    width: '100%',
    height: '1px',
    backgroundColor: '#e8edf0',
    margin: '10px 0',
});

const CaptchaBox = styled(Box)({
    height: '36px',
    margin: '4px 0',
    background: '#e8e8e8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '6px',
    '& svg': {
        width: '120px',
        height: '34px',
    },
});

const CaptchaWrapper = styled(Box)({
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8px',
});

const CaptchaInput = styled(TextField)({
    width: '100px',
    '& .MuiOutlinedInput-root': {
        borderRadius: '6px',
        height: '32px',
        backgroundColor: '#ffffff',
        '& fieldset': { borderColor: '#e1e6eb' },
    },
    '& .MuiInputBase-input': {
        padding: '0 12px',
        fontSize: '13px',
        color: '#6d7884',
        fontFamily: 'Inter, sans-serif',
        height: '32px',
        boxSizing: 'border-box',
    },
});

const GrayButton = styled(Button)({
    height: '32px',
    border: 0,
    borderRadius: '5px',
    padding: '0 10px',
    backgroundColor: '#68727c',
    color: '#fff',
    fontSize: '11px',
    fontFamily: 'Inter, sans-serif',
    textTransform: 'none',
    minWidth: '70px',
    '&:hover': { backgroundColor: '#555' },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const LoginInterne = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [cin, setCin] = useState('');
    const [password, setPassword] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaText, setCaptchaText] = useState('');
    const [loginError, setLoginError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [loading, setLoading] = useState(false);

    const { isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            const role = user?.role || user?.userType;
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
                    navigate('/admin', { replace: true });
                    break;
            }
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        regenerateCaptcha();
    }, [location.pathname]);

    const regenerateCaptcha = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const usedChars = new Set();
        while (result.length < 6) {
            const char = chars.charAt(Math.floor(Math.random() * chars.length));
            if (!usedChars.has(char)) {
                usedChars.add(char);
                result += char;
            }
        }
        setCaptchaText(result);
        setCaptchaInput('');
        setLoginError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!cin || !password) {
            setLoginError('Veuillez remplir tous les champs');
            return;
        }

        if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
            setLoginError('CAPTCHA incorrect');
            regenerateCaptcha();
            return;
        }

        setLoading(true);

        try {
            const result = await dispatch(login({
                cin: cin,
                motDePasse: password,
            })).unwrap();

            if (result.requiresTwoFactor || result.needs2FA) {
                localStorage.setItem('2faEmail', cin);
                navigate('/verify-2fa-interne', { replace: true });
                return;
            }
        } catch (err) {
            setAttempts(prev => prev + 1);
            setLoginError(typeof err === 'string' ? err : 'Erreur de connexion');
            regenerateCaptcha();
        } finally {
            setLoading(false);
        }
    };

    const isBlocked = attempts >= 3;

    return (
        <PageContainer>
            <LoginCard>
                <Logo>
                    <img src="/logo_snrt_final.png" alt="SNRT" />
                </Logo>

                <Title>Espace Personnel</Title>
                <Subtitle>Connectez-vous avec votre CIN</Subtitle>

                {loginError && (
                    <Alert severity="error" sx={{ mb: 1.5, borderRadius: '10px', fontSize: '12px', py: 0 }}>
                        {loginError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    {/* ✅ CIN - Icône Enveloppe */}
                    <StyledTextField
                        label="CIN"
                        value={cin}
                        onChange={(e) => setCin(e.target.value)}
                        disabled={loading || isBlocked}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <i className="fa-solid fa-envelope" style={{ fontSize: 14 }}></i>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* ✅ Mot de passe - Icône Cadenas */}
                    <StyledTextField
                        label="Mot de passe"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading || isBlocked}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <i className="fa-solid fa-lock" style={{ fontSize: 14 }}></i>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <CaptchaBox>
                        <svg viewBox="0 0 240 70" aria-hidden="true">
                            <path d="M7 17 C45 35, 82 2, 132 25 S205 12, 232 32" fill="none" stroke="#589dff" strokeWidth="2" />
                            <path d="M10 48 C64 28, 115 58, 230 17" fill="none" stroke="#ef5fb0" strokeWidth="2" />
                            {captchaText.split('').map((char, index) => {
                                const colors = ['#75e45e', '#65e4d6', '#59e2d8', '#3364f0', '#ff65c8', '#65e45e'];
                                const rotates = [-4, 6, -7, 9, -5, 7];
                                return (
                                    <text
                                        key={index}
                                        x={15 + index * 38}
                                        y="50"
                                        fontSize="50"
                                        fontFamily="Trebuchet MS"
                                        fill={colors[index % 6]}
                                        transform={`rotate(${rotates[index % 6]} ${15 + index * 38} 50)`}
                                    >
                                        {char}
                                    </text>
                                );
                            })}
                        </svg>
                    </CaptchaBox>

                    <CaptchaWrapper>
                        <CaptchaInput
                            placeholder="Saisissez"
                            variant="outlined"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            disabled={loading || isBlocked}
                        />
                        <GrayButton onClick={regenerateCaptcha} disabled={loading || isBlocked}>
                            Régénérer
                        </GrayButton>
                    </CaptchaWrapper>

                    <LoginButton type="submit" disabled={loading || isBlocked}>
                        {loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : 'Se connecter'}
                    </LoginButton>
                </form>

                <ForgotLink href="/forgot-password">Mot de passe oublié !</ForgotLink>

                <TermsText>
                    En vous connectant, vous acceptez nos <a href="/terms">Termes et Conditions</a> du service
                </TermsText>

                <Divider />

                <BackLink onClick={() => navigate('/')}>
                    <i className="fa-solid fa-arrow-left"></i>
                    Retour à l'accueil
                </BackLink>
            </LoginCard>
        </PageContainer>
    );
};

export default LoginInterne;
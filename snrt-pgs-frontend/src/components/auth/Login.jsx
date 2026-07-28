// src/components/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';

// ============================================
// STYLES
// ============================================

const LoginCard = styled(Paper)({
    backgroundColor: '#f7f7f7',
    borderRadius: '19px',
    padding: '30px 35px 35px',
    textAlign: 'center',
    boxShadow: 'none',
    maxWidth: '850px',
    margin: '0 auto',
});

const PageTitle = styled(Typography)({
    textAlign: 'center',
    fontSize: '36px',
    fontWeight: 700,
    color: '#252930',
    margin: '0 0 6px 0',
    lineHeight: 1.2,
    fontFamily: '"Inter", sans-serif',
});

const TitleLine = styled(Box)({
    height: '1px',
    background: '#0b7890',
    width: '100%',
    margin: '0 0 20px 0',
});

const AttemptsText = styled(Typography)({
    margin: '0 0 18px',
    color: '#687480',
    fontSize: '15px',
    lineHeight: 1.8,
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center',
    maxWidth: '100%',
    '& strong': { fontWeight: 700 },
});

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '27px',
        backgroundColor: '#ffffff',
        height: '38px',
        '& fieldset': { borderColor: '#e1e6eb' },
        '&:hover fieldset': { borderColor: '#e1e6eb' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 20px 0 48px',
        fontSize: '16px',
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
    maxWidth: '800px', // ✅ Même largeur que le bouton
    margin: '0 auto 12px',
    display: 'block',
});

const CaptchaContainer = styled(Box)({
    width: '100%',
    maxWidth: '800px', // ✅ Même largeur que le bouton
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
});

const CaptchaBox = styled(Box)({
    height: '38px',
    margin: '8px 0',
    background: '#e8e8e8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '8px',
    width: '100%',
    '& svg': {
        width: '170px',
        height: '34px',
    },
});

const CaptchaInput = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        height: '38px',
        backgroundColor: '#ffffff',
        '& fieldset': { borderColor: '#e1e6eb' },
    },
    '& .MuiInputBase-input': {
        padding: '0 16px',
        fontSize: '16px',
        color: '#6d7884',
        fontFamily: 'Inter, sans-serif',
    },
    width: '140px',
});

const GrayButton = styled(Button)({
    height: '38px',
    border: 0,
    borderRadius: '8px',
    padding: '0 22px',
    backgroundColor: '#68727c',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    textTransform: 'none',
    minWidth: '130px',
    '&:hover': { backgroundColor: '#555' },
});

const LoginButton = styled(Button)({
    width: '100%',
    height: '38px',
    marginTop: '6px',
    maxWidth: '800px', // ✅ Largeur de référence
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: '27px',
    backgroundColor: '#148aa0',
    color: '#fff',
    fontSize: '17px',
    fontWeight: 700,
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    '&:hover': { backgroundColor: '#0b7890' },
    '& i': { marginRight: '10px' },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [cin, setCin] = useState('');
    const [password, setPassword] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaText, setCaptchaText] = useState('0vty6d');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);

    const from = location.state?.from || '/';

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

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
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!cin || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
            setError('CAPTCHA incorrect');
            regenerateCaptcha();
            return;
        }

        setLoading(true);

        try {
            const result = await dispatch(
                login({ cin, motDePasse: password })
            ).unwrap();

            if (result?.requiresTwoFactor) {
                localStorage.setItem('2faEmail', cin);
                navigate('/verify-2fa', { 
                    replace: true, 
                    state: { from: from } 
                });
                return;
            }

            if (result?.user) {
                navigate(from, { replace: true });
            }
        } catch (err) {
            setAttempts(prev => prev + 1);
            setError(err || 'Erreur de connexion');
            regenerateCaptcha();
        } finally {
            setLoading(false);
        }
    };

    const isBlocked = attempts >= 3;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <PageTitle>Authentification</PageTitle>
            <TitleLine />

            <LoginCard>
                <AttemptsText>
                    <div>Vous avez <strong>3 tentatives</strong> pour entrer un mot de passe correct. Après la</div>
                    <div>3ème tentative incorrecte, votre compte sera <strong>bloqué pendant 60</strong></div>
                    <div><strong>minutes.</strong></div>
                </AttemptsText>

                {error && (
                    <Typography color="error" sx={{ mb: 1, fontSize: '15px', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                        {error}
                    </Typography>
                )}

                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <StyledTextField
                        placeholder="CIN"
                        value={cin}
                        onChange={(e) => setCin(e.target.value)}
                        disabled={loading || isBlocked}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <i className="fa-solid fa-id-card" style={{ fontSize: 18, color: '#aab1b8' }}></i>
                                </InputAdornment>
                            ),
                        }}
                        variant="outlined"
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
                                    <i className="fa-solid fa-lock" style={{ fontSize: 18, color: '#aab1b8' }}></i>
                                </InputAdornment>
                            ),
                        }}
                        variant="outlined"
                    />

                    <CaptchaContainer>
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

                        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
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
                        </Box>
                    </CaptchaContainer>

                    <LoginButton type="submit" disabled={loading || isBlocked}>
                        <i className="fa-solid fa-arrow-right-to-bracket"></i>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </LoginButton>
                </form>
            </LoginCard>
        </Container>
    );
};

export default Login;
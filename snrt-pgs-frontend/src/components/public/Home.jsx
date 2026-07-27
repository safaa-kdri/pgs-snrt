// src/components/public/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography,
    Box,
    Container,
    Grid,
    Button,
    Card,
    InputAdornment,
    TextField,
    MenuItem,
    Link,
    CircularProgress,
    Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { authService } from '../../services/auth';
import { fetchOffers, fetchDepartments, setPage } from '../../store/slices/offerSlice';
import { fetchResults, setPage as setResultPage } from '../../store/slices/resultSlice';
import OfferCard from './OfferCard';
import ResultCard from './ResultCard';

// ============================================
// STYLES - DESIGN SNRT PREMIUM
// ============================================

const SideCard = styled(Card)({
    backgroundColor: '#f7f7f7',
    borderRadius: '19px',
    padding: '32px 20px 20px',
    textAlign: 'center',
    minHeight: '480px',
    boxShadow: 'none',
    '& h2': {
        margin: '0 0 18px',
        color: '#07111b',
        fontSize: '18px',
        lineHeight: 1.2,
        fontWeight: 400,
        fontFamily: '"Inter", sans-serif',
    },
});

const AttemptsText = styled(Typography)({
    margin: '0 0 18px',
    color: '#687480',
    fontSize: '13px',
    lineHeight: 1.5,
    fontFamily: 'Inter, sans-serif',
    '& strong': { fontWeight: 700 },
});

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '27px',
        backgroundColor: '#ffffff',
        height: '42px',
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
    maxWidth: '220px',
    margin: '0 auto 10px',
    display: 'block',
});

const CaptchaBox = styled(Box)({
    height: '42px',
    margin: '6px 0',
    background: '#e8e8e8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '6px',
    '& svg': {
        width: '140px',
        height: '40px',
    },
});

const CaptchaInput = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '6px',
        height: '36px',
        backgroundColor: '#ffffff',
        '& fieldset': { borderColor: '#e1e6eb' },
    },
    '& .MuiInputBase-input': {
        padding: '0 14px',
        fontSize: '14px',
        color: '#6d7884',
        fontFamily: 'Inter, sans-serif',
    },
    width: '120px',
});

const GrayButton = styled(Button)({
    height: '36px',
    border: 0,
    borderRadius: '5px',
    padding: '0 12px',
    backgroundColor: '#68727c',
    color: '#fff',
    fontSize: '12px',
    fontFamily: 'Inter, sans-serif',
    textTransform: 'none',
    minWidth: '80px',
    '&:hover': { backgroundColor: '#555' },
});

const LoginButton = styled(Button)({
    width: '100%',
    height: '42px',
    marginBottom: '8px',
    maxWidth: '220px',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: '23px',
    backgroundColor: '#148aa0',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    '&:hover': { backgroundColor: '#0b7890' },
    '& i': { marginRight: '8px' },
});

const ForgotLink = styled(Link)({
    color: '#075fff',
    fontSize: '14px',
    textDecoration: 'underline',
    display: 'block',
    marginBottom: '12px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
});

const TermsText = styled(Typography)({
    width: '120px',
    margin: '0 auto',
    color: '#000',
    fontSize: '12px',
    lineHeight: 1.5,
    fontFamily: 'Inter, sans-serif',
    '& a': { color: '#075fff' },
});

const LinksCard = styled(Card)({
    marginTop: '48px',
    padding: '40px 32px',
    backgroundColor: '#f7f7f7',
    borderRadius: '19px',
    textAlign: 'left',
    boxShadow: 'none',
    '& a': {
        display: 'block',
        margin: '0 0 22px',
        color: '#000',
        textDecoration: 'none',
        fontSize: '17px',
        lineHeight: 1.4,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        '&:last-child': { marginBottom: 0 },
    },
});

const SearchCard = styled(Card)({
    backgroundColor: '#f7f7f7',
    borderRadius: '19px',
    padding: '32px 20px 20px',
    minHeight: '400px',
    maxHeight: '560px',
    position: 'sticky',
    top: '20px',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
    '& h2': {
        marginBottom: '18px',
        color: '#07111b',
        fontSize: '18px',
        fontWeight: 400,
        textAlign: 'center',
        fontFamily: '"Inter", sans-serif',
        flexShrink: 0,
    },
});

const SearchField = styled(TextField)({
    width: '100%',
    maxWidth: '220px',
    marginBottom: '10px',
    flexShrink: 0,
    '& .MuiOutlinedInput-root': {
        height: '42px',
        borderRadius: '27px',
        background: '#fff',
        '& fieldset': { borderColor: '#e1e6eb' },
        '&:hover fieldset': { borderColor: '#e1e6eb' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 28px',
        fontSize: '15px',
        color: '#6d7884',
        fontFamily: 'Inter, sans-serif',
    },
});

const DateField = styled(TextField)({
    width: '100%',
    maxWidth: '220px',
    marginBottom: '10px',
    flexShrink: 0,
    '& .MuiOutlinedInput-root': {
        height: '42px',
        borderRadius: '27px',
        background: '#fff',
        '& fieldset': { borderColor: '#e1e6eb' },
        '&:hover fieldset': { borderColor: '#e1e6eb' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 45px 0 28px',
        fontSize: '15px',
        color: '#6d7884',
        fontFamily: 'Inter, sans-serif',
    },
});

const SearchButton = styled(Button)({
    width: '200px',
    height: '42px',
    marginTop: '2px',
    borderRadius: '23px',
    background: '#148aa0',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    textTransform: 'none',
    flexShrink: 0,
    fontFamily: 'Inter, sans-serif',
    '&:hover': { background: '#0b7890' },
});

const HeroTitle = styled(Typography)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '38px',
    fontWeight: 700,
    color: '#222',
    lineHeight: 1.2,
    margin: '5px auto 8px',
    maxWidth: '100%',
    fontFamily: '"Inter", sans-serif',
    '& span': {
        color: '#168eb4',
        fontWeight: 700,
        fontStyle: 'italic',
    },
    [theme.breakpoints.down('md')]: { fontSize: '32px' },
    [theme.breakpoints.down('sm')]: { fontSize: '24px' },
}));

const HeroDivider = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    margin: '6px 0 8px',
    width: '100%',
    '& hr': {
        flex: 1,
        maxWidth: '100%',
        border: 'none',
        borderTop: '2px solid #168eb4',
    },
    '& i': {
        color: '#178fb5',
        fontSize: '24px',
    },
});

const HeroSubtitle = styled(Typography)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: '0 0 10px',
    fontSize: '18px',
    color: '#555',
    fontFamily: 'Inter, sans-serif',
});

const EmptyBox = styled(Box)({
    width: '100%',
    maxWidth: '600px',
    minHeight: '40px',
    margin: '0 auto 4px',
    borderRadius: '19px',
    backgroundColor: '#fbf9f9',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 14px',
    color: '#081323',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    '& i': {
        fontSize: '18px',
        color: '#168eb4',
    },
    '& h3': {
        margin: 0,
        fontSize: '16px',
        fontWeight: 700,
    },
    '& p': {
        margin: '1px 0 0',
        fontSize: '14px',
        fontWeight: 400,
        color: '#555',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // ========================================== //
    // 1️⃣ SELECTORS
    // ========================================== //

    const { offers, loading, error, total, page, pages, filters } = useSelector((state) => state.offers);
    const {
        results,
        loading: resultsLoading,
        error: resultsError,
        total: resultsTotal,
        page: resultsPage,
        pages: resultsPages,
    } = useSelector((state) => state.results);

    // ========================================== //
    // 2️⃣ ÉTATS LOCAUX
    // ========================================== //

    const [cin, setCin] = useState('');
    const [password, setPassword] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaText, setCaptchaText] = useState('0vty6d');
    const [loginError, setLoginError] = useState('');
    const [activeTab, setActiveTab] = useState('offres');
    const [attempts, setAttempts] = useState(0);
    const [loadingLogin, setLoadingLogin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // ========================================== //
    // 3️⃣ VÉRIFICATION CONNEXION (2FA + TOKEN)
    // ========================================== //

    useEffect(() => {
        if (location.state?.isAuthenticated) {
            setIsAuthenticated(true);
            return;
        }
        
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [location]);

    // ========================================== //
    // 4️⃣ REDIRECTION PAR RÔLE (SI DÉJÀ CONNECTÉ)
    // ========================================== //

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                const role = userData?.role || userData?.userType;

                if (location.state?.isAuthenticated) {
                    return;
                }

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
            } catch (e) {
                console.error('Erreur parsing user:', e);
            }
        }
    }, [navigate, location]);

    // ========================================== //
    // 5️⃣ CHARGEMENT DES OFFRES
    // ========================================== //

    useEffect(() => {
        dispatch(fetchOffers({ statut: 'Publiée', page: 1, limit: 10 }));
        dispatch(fetchDepartments());
    }, [dispatch]);

    // ========================================== //
    // 6️⃣ CHARGEMENT DES RÉSULTATS (ONGLET ACTIF)
    // ========================================== //

    useEffect(() => {
        if (activeTab === 'resultats') {
            dispatch(fetchResults({ page: 1, limit: 10 }));
        }
    }, [activeTab, dispatch]);

    // ========================================== //
    // 7️⃣ FONCTIONS
    // ========================================== //

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

    const handleLogin = async (e) => {
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

        setLoadingLogin(true);

        try {
            const response = await authService.login({
                cin: cin,
                motDePasse: password,
            });

            console.log('Réponse login :', response);

            if (response.requiresTwoFactor || response.needs2FA) {
                localStorage.setItem('2faEmail', cin);
                navigate('/verify-2fa', { replace: true });
                return;
            }

            localStorage.removeItem('2faEmail');

            const userData = response.user || response;
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
                if (response.token) {
                    localStorage.setItem('token', response.token);
                }
            }

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

        } catch (err) {
            setAttempts(prev => prev + 1);
            const errorMsg = err?.response?.data?.message || err?.message || 'Erreur de connexion';
            setLoginError(errorMsg);
            regenerateCaptcha();
        } finally {
            setLoadingLogin(false);
        }
    };

    const handleSearch = () => {
        dispatch(fetchOffers({ ...filters, statut: 'Publiée', page: 1, limit: 10 }));
    };

    const isBlocked = attempts >= 3;

    // ========================================== //
    // 8️⃣ RENDU DE LA PAGINATION - TOUJOURS VISIBLE
    // ========================================== //

    const renderPagination = () => {
        const pageNumbers = [];
        const maxVisible = 5;

        if (pages <= maxVisible) {
            for (let i = 1; i <= pages; i++) {
                pageNumbers.push(i);
            }
        } else if (page <= 3) {
            for (let i = 1; i <= 5; i++) {
                pageNumbers.push(i);
            }
        } else if (page >= pages - 2) {
            for (let i = pages - 4; i <= pages; i++) {
                pageNumbers.push(i);
            }
        } else {
            for (let i = page - 2; i <= page + 2; i++) {
                pageNumbers.push(i);
            }
        }

        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mt: 3,
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D9D9D9',
                    borderRadius: '8px',
                    width: '140px',
                    height: '36px',
                    padding: '0 2px',
                    overflow: 'hidden',
                    '& button': {
                        height: '100%',
                        border: 'none',
                        background: 'transparent !important',
                        color: '#F97316 !important',
                        fontSize: '16px',
                        fontWeight: 400,
                        fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 8px',
                        minWidth: '32px',
                        margin: '0',
                        '&:hover, &:active, &:focus': {
                            backgroundColor: 'transparent !important',
                            color: '#F97316 !important',
                        },
                        '&:disabled': {
                            opacity: 0.4,
                            cursor: 'not-allowed',
                            backgroundColor: 'transparent !important',
                            color: '#F97316 !important',
                        },
                        '&.active': {
                            backgroundColor: '#F97316 !important',
                            color: '#FFFFFF !important',
                            borderRadius: '4px',
                            fontWeight: 500,
                            width: '36px',
                            height: '36px',
                            padding: '0',
                            '&:hover, &:active, &:focus': {
                                backgroundColor: '#F97316 !important',
                                color: '#FFFFFF !important',
                            }
                        }
                    }
                }}>
                    <button
                        onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
                        disabled={page === 1}
                    >
                        &lt;&lt;
                    </button>

                    {pageNumbers.map((num) => (
                        <button
                            key={num}
                            className={num === page ? 'active' : ''}
                            onClick={() => dispatch(setPage(num))}
                        >
                            {num}
                        </button>
                    ))}

                    <button
                        onClick={() => dispatch(setPage(Math.min(pages, page + 1)))}
                        disabled={page === pages}
                    >
                        &gt;&gt;
                    </button>
                </Box>
            </Box>
        );
    };

    // ========================================== //
    // 9️⃣ AFFICHAGE
    // ========================================== //

    return (
        <Container maxWidth="xl" sx={{ padding: 0, margin: 0, maxWidth: '100%' }}>
            <Grid container spacing={0}>
                {/* ===== SIDEBAR GAUCHE ===== */}
                <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                    <SideCard>
                        <h2>Authentification</h2>

                        <AttemptsText>
                            Vous avez <strong>{3 - attempts}</strong> tentative(s) restante(s).
                            Après la 3ème tentative incorrecte, votre compte sera <strong>bloqué pendant 60 minutes.</strong>
                        </AttemptsText>

                        {loginError && (
                            <Typography color="error" sx={{ mb: 1, fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                                {loginError}
                            </Typography>
                        )}

                        <form onSubmit={handleLogin}>
                            <StyledTextField
                                placeholder="CIN"
                                value={cin}
                                onChange={(e) => setCin(e.target.value)}
                                disabled={loadingLogin || isBlocked}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <i className="fa-solid fa-envelope" style={{ fontSize: 16 }}></i>
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
                                disabled={loadingLogin || isBlocked}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <i className="fa-solid fa-lock" style={{ fontSize: 16 }}></i>
                                        </InputAdornment>
                                    ),
                                }}
                                variant="outlined"
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

                            <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center' }}>
                                <CaptchaInput
                                    placeholder="Saisissez"
                                    variant="outlined"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    disabled={loadingLogin || isBlocked}
                                />
                                <GrayButton onClick={regenerateCaptcha} disabled={loadingLogin || isBlocked}>
                                    Régénérer
                                </GrayButton>
                            </Box>

                            <LoginButton type="submit" disabled={loadingLogin || isBlocked}>
                                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                                {loadingLogin ? 'Connexion...' : 'Se connecter'}
                            </LoginButton>
                        </form>

                        <ForgotLink href="/forgot-password">Mot de passe oublié !</ForgotLink>

                        <TermsText>
                            En vous connectant, vous acceptez nos <a href="/terms">Termes et Conditions</a> du service
                        </TermsText>
                    </SideCard>

                    <LinksCard>
                        <a href="https://www.snrt.ma/" target="_blank" rel="noopener noreferrer">snrt.ma</a>
                        <a href="https://e-depot.snrt.ma/" target="_blank" rel="noopener noreferrer">e-dépôt des projets</a>
                        <a href="https://e-facture.snrt.ma/" target="_blank" rel="noopener noreferrer">e-facture</a>
                        <a href="https://www.regiesnrt.ma/fr" target="_blank" rel="noopener noreferrer">Régie publicitaire</a>
                    </LinksCard>
                </Grid>

                {/* ===== CONTENU PRINCIPAL ===== */}
                <Grid item xs={12} md={6} sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, borderLeft: { md: '1px solid #cfd5da' }, borderRight: { md: '1px solid #cfd5da' } }}>
                    <HeroTitle>
                        Bienvenue sur l'espace
                        <br />
                        <span>stages</span> de la SNRT
                    </HeroTitle>

                    <HeroDivider>
                        <hr />
                        <i className="fa-solid fa-graduation-cap"></i>
                        <hr />
                    </HeroDivider>

                    <HeroSubtitle>
                        Votre passerelle vers l'expérience professionnelle
                    </HeroSubtitle>

                    {/* Trait fin de séparation */}
                    <Box sx={{
                        width: '100%',
                        height: '1px',
                        backgroundColor: '#e0e4e8',
                        margin: '8px 0 16px 0'
                    }} />

                    {/* ========================================== */}
                    {/* ✅ BOUTONS DE NAVIGATION (UNIQUEMENT SI CONNECTÉ) */}
                    {/* ========================================== */}
                    {isAuthenticated && (
                        <Box sx={{ display: 'flex', gap: '12px', mb: 3, justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/')}
                                sx={{
                                    borderRadius: '30px',
                                    padding: '8px 24px',
                                    borderColor: '#148aa0',
                                    color: '#148aa0',
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: 'rgba(20, 138, 160, 0.05)',
                                        borderColor: '#148aa0',
                                    }
                                }}
                            >
                                <i className="fa-solid fa-arrow-left" style={{ marginRight: '8px' }}></i>
                                Accueil
                            </Button>

                            <Button
                                variant="contained"
                                onClick={() => {
                                    const token = localStorage.getItem('token');
                                    const storedUser = localStorage.getItem('user');
                                    if (token && storedUser) {
                                        try {
                                            const userData = JSON.parse(storedUser);
                                            const role = userData?.role || userData?.userType;
                                            switch (role) {
                                                case 'Administrateur': navigate('/admin'); break;
                                                case 'RH': navigate('/rh'); break;
                                                case 'Departement': navigate('/department'); break;
                                                case 'Encadrant': navigate('/supervisor'); break;
                                                default: navigate('/dashboard'); break;
                                            }
                                        } catch (e) { navigate('/dashboard'); }
                                    } else {
                                        navigate('/dashboard');
                                    }
                                }}
                                sx={{
                                    borderRadius: '30px',
                                    padding: '8px 24px',
                                    backgroundColor: '#148aa0',
                                    color: '#ffffff',
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: '#0b7890',
                                    }
                                }}
                            >
                                Dashboard
                                <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                            </Button>
                        </Box>
                    )}

                    {/* ===== ONGLETS STYLE SNRT ===== */}
                    <Box sx={{ display: 'flex', gap: '2px', mb: 3 }}>
                        <Button
                            onClick={() => setActiveTab('offres')}
                            sx={{
                                backgroundColor: activeTab === 'offres' ? '#148aa0' : 'transparent',
                                color: activeTab === 'offres' ? '#ffffff' : '#148aa0',
                                border: activeTab === 'offres' ? 'none' : '1px solid #148aa0',
                                borderRadius: '4px',
                                padding: '6px 20px',
                                fontSize: '14px',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontFamily: 'Arial, Helvetica, sans-serif',
                                '&:hover': {
                                    backgroundColor: activeTab === 'offres' ? '#0b7890' : 'rgba(20, 138, 160, 0.05)',
                                }
                            }}
                        >
                            Offres
                        </Button>
                        <Button
                            onClick={() => setActiveTab('resultats')}
                            sx={{
                                backgroundColor: activeTab === 'resultats' ? '#148aa0' : 'transparent',
                                color: activeTab === 'resultats' ? '#ffffff' : '#148aa0',
                                border: activeTab === 'resultats' ? 'none' : '1px solid #148aa0',
                                borderRadius: '4px',
                                padding: '6px 20px',
                                fontSize: '14px',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontFamily: 'Arial, Helvetica, sans-serif',
                                '&:hover': {
                                    backgroundColor: activeTab === 'resultats' ? '#0b7890' : 'rgba(20, 138, 160, 0.05)',
                                }
                            }}
                        >
                            Résultats
                        </Button>
                    </Box>

                    {/* ========================================== */}
                    {/* CONTENU CONDITIONNEL SELON L'ONGLET */}
                    {/* ========================================== */}

                    {activeTab === 'offres' ? (
                        // ===== ONGLET OFFRES =====
                        loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress sx={{ color: '#148aa0' }} />
                            </Box>
                        ) : error ? (
                            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                        ) : offers.length === 0 ? (
                            <Box sx={{ padding: '20px', textAlign: 'center', background: '#fbf9f9', borderRadius: '19px' }}>
                                <i className="fa-solid fa-circle-info" style={{ fontSize: '24px', color: '#168eb4' }}></i>
                                <h3 style={{ margin: '10px 0 5px', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                                    Aucune offre disponible
                                </h3>
                                <p style={{ color: '#555', fontFamily: 'Inter, sans-serif' }}>
                                    Restez connecté. Les nouvelles offres seront bientôt publiées.
                                </p>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ mt: 2 }}>
                                    {offers.map((offer) => (
                                        <OfferCard key={offer._id} offer={offer} />
                                    ))}
                                </Box>
                                {renderPagination()}
                            </>
                        )
                    ) : (
                        // ===== ONGLET RÉSULTATS =====
                        <>
                            {resultsLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress sx={{ color: '#148aa0' }} />
                                </Box>
                            ) : resultsError ? (
                                <Alert severity="error" sx={{ mt: 2 }}>{resultsError}</Alert>
                            ) : results.length === 0 ? (
                                <Box sx={{ padding: '20px', textAlign: 'center', background: '#fbf9f9', borderRadius: '19px' }}>
                                    <i className="fa-solid fa-circle-info" style={{ fontSize: '24px', color: '#168eb4' }}></i>
                                    <h3 style={{ margin: '10px 0 5px', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                                        Aucun résultat publié
                                    </h3>
                                    <p style={{ color: '#555', fontFamily: 'Inter, sans-serif' }}>
                                        Les résultats seront publiés ici dès qu'ils seront disponibles.
                                    </p>
                                </Box>
                            ) : (
                                <>
                                    <Box sx={{ border: '1px solid #e8edf0', borderRadius: '8px', overflow: 'hidden' }}>
                                        {results.map((result) => (
                                            <ResultCard key={result._id} result={result} />
                                        ))}
                                    </Box>
                                    {resultsPages > 1 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: '4px' }}>
                                            <button
                                                onClick={() => dispatch(setResultPage(Math.max(1, resultsPage - 1)))}
                                                disabled={resultsPage === 1}
                                                style={{
                                                    minWidth: '20px',
                                                    height: '20px',
                                                    border: '1px solid #d9dee3',
                                                    borderRadius: '4px',
                                                    background: '#ffffff',
                                                    color: '#f05f1c',
                                                    fontSize: '10px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    fontFamily: 'Inter, sans-serif',
                                                    padding: '0 8px',
                                                }}
                                            >
                                                {'<<'}
                                            </button>
                                            <span style={{ padding: '0 10px', fontFamily: 'Inter, sans-serif', color: '#6d7884' }}>
                                                {resultsPage} / {resultsPages}
                                            </span>
                                            <button
                                                onClick={() => dispatch(setResultPage(Math.min(resultsPages, resultsPage + 1)))}
                                                disabled={resultsPage === resultsPages}
                                                style={{
                                                    minWidth: '32px',
                                                    height: '32px',
                                                    border: '1px solid #d9dee3',
                                                    borderRadius: '4px',
                                                    background: '#ffffff',
                                                    color: '#f05f1c',
                                                    fontSize: '13px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    fontFamily: 'Inter, sans-serif',
                                                    padding: '0 8px',
                                                }}
                                            >
                                                {'>>'}
                                            </button>
                                        </Box>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </Grid>

                {/* ===== SIDEBAR DROITE ===== */}
                <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                    <SearchCard>
                        <h2>Recherche les offres</h2>

                        <SearchField placeholder="Profil" variant="outlined" />

                        <SearchField select defaultValue="" variant="outlined">
                            <MenuItem value="">* Sélectionner</MenuItem>
                            <MenuItem value="Informatique">Informatique</MenuItem>
                            <MenuItem value="Audiovisuel">Audiovisuel</MenuItem>
                            <MenuItem value="Gestion">Gestion</MenuItem>
                            <MenuItem value="Communication">Communication</MenuItem>
                        </SearchField>

                        <DateField
                            placeholder="jj/mm/aaaa"
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end" sx={{ position: 'absolute', right: 16, color: '#333' }}>
                                        <i className="fa-solid fa-calendar"></i>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <SearchButton onClick={handleSearch}>
                            Recherche
                        </SearchButton>
                    </SearchCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Home;
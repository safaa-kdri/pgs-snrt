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

const SuccessButtonOutlined = styled(ActionButton)({
    color: '#6d7884',
    border: '1px solid #e0e4e8',
    borderRadius: '10px',
    padding: '8px 20px',
    '&:hover': {
        backgroundColor: '#f0f2f5',
    },
});

const SuccessButtonContained = styled(ActionButton)({
    color: 'white',
    backgroundColor: '#148aa0',
    borderRadius: '10px',
    padding: '8px 20px',
    '&:hover': {
        backgroundColor: '#0b7890',
    },
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

    // ✅ Rediriger vers le bon dashboard selon le rôle
    const redirectByRole = (user, target = null) => {
        const role = user?.role || user?.userType;
        console.log('[Verify2FA] Redirection selon role:', role);
        
        if (target) {
            navigate(target, { replace: true });
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
    };

    // ✅ Vérifier si déjà connecté
    useEffect(() => {
        console.log('[Verify2FA] useEffect - Debut');
        
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('[Verify2FA] token present :', !!token);
        console.log('[Verify2FA] user present :', !!user);
        
        if (token && user) {
            try {
                const userData = JSON.parse(user);
                console.log('[Verify2FA] Utilisateur deja connecte, role:', userData?.role || userData?.userType);
                redirectByRole(userData);
                return;
            } catch (e) {
                console.error('[Verify2FA] Erreur parsing user:', e);
            }
        }

        // ✅ Si token existe mais pas user → récupérer le user
        if (token && !user) {
            console.log('[Verify2FA] Token present mais pas user - recuperation...');
            const fetchUser = async () => {
                try {
                    const response = await api.get('/auth/me');
                    if (response.data?.user) {
                        const userData = response.data.user;
                        const userWithRole = {
                            ...userData,
                            role: userData.role || userData.userType || 'Etudiant',
                            userType: userData.userType || userData.role || 'Etudiant',
                        };
                        localStorage.setItem('user', JSON.stringify(userWithRole));
                        console.log('[Verify2FA] Utilisateur recupere depuis /me');
                        redirectByRole(userWithRole);
                        return;
                    }
                } catch (err) {
                    console.error('[Verify2FA] Erreur recuperation user:', err);
                }
            };
            fetchUser();
            return;
        }

        const storedEmail = localStorage.getItem('2faEmail');
        console.log('[Verify2FA] storedEmail :', storedEmail);
        
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            console.log('[Verify2FA] Pas de 2faEmail, redirection vers /login');
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('[Verify2FA] handleSubmit - Debut');
        console.log('[Verify2FA] Code saisi :', code);

        try {
            const existingToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            console.log('[Verify2FA] Token existant :', !!existingToken);
            console.log('[Verify2FA] User existant :', !!storedUser);
            
            if (existingToken && storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    console.log('[Verify2FA] Deja connecte, redirection selon role');
                    redirectByRole(userData);
                    return;
                } catch (e) {
                    console.error('[Verify2FA] Erreur parsing:', e);
                }
            }

            // ✅ Si token existe mais pas user → récupérer
            if (existingToken && !storedUser) {
                try {
                    const response = await api.get('/auth/me');
                    if (response.data?.user) {
                        const userData = response.data.user;
                        const userWithRole = {
                            ...userData,
                            role: userData.role || userData.userType || 'Etudiant',
                            userType: userData.userType || userData.role || 'Etudiant',
                        };
                        localStorage.setItem('user', JSON.stringify(userWithRole));
                        console.log('[Verify2FA] User recupere');
                        redirectByRole(userWithRole);
                        return;
                    }
                } catch (err) {
                    console.error('[Verify2FA] Erreur recuperation:', err);
                }
            }

            console.log('[Verify2FA] Dispatch verify2FA avec code :', code);
            const resultAction = await dispatch(verify2FA({ code }));
            console.log('[Verify2FA] Resultat verify2FA :', resultAction);

            if (verify2FA.rejected.match(resultAction)) {
                console.error('[Verify2FA] verify2FA rejete :', resultAction.payload);
                throw new Error(resultAction.payload || 'Code invalide ou expire');
            }

            console.log('[Verify2FA] verify2FA reussi !');
            
            localStorage.removeItem('2faEmail');
            localStorage.removeItem('2faUserId');

            const userData = resultAction.payload?.user;
            const authToken = resultAction.payload?.token;

            console.log('[Verify2FA] userData recu :', userData);
            console.log('[Verify2FA] authToken recu :', !!authToken);

            if (authToken) {
                localStorage.setItem('token', authToken);
                console.log('[Verify2FA] Token stocke');
            } else {
                console.warn('[Verify2FA] Aucun token recu !');
            }

            if (userData) {
                const userWithRole = {
                    ...userData,
                    role: userData.role || userData.userType || 'Etudiant',
                    userType: userData.userType || userData.role || 'Etudiant',
                };
                localStorage.setItem('user', JSON.stringify(userWithRole));
                console.log('[Verify2FA] userData stocke');
                setUserData(userWithRole);
            }

            console.log('[Verify2FA] Token final present:', !!localStorage.getItem('token'));
            console.log('[Verify2FA] User final present:', !!localStorage.getItem('user'));

            // ✅ Redirection après 2FA
            const role = userData?.role || userData?.userType;
            console.log('[Verify2FA] Role pour redirection:', role);

            switch (role) {
                case 'Administrateur':
                    console.log('[Verify2FA] REDIRECTION VERS /admin');
                    navigate('/admin', { replace: true });
                    break;
                case 'RH':
                    console.log('[Verify2FA] REDIRECTION VERS /rh');
                    navigate('/rh', { replace: true });
                    break;
                case 'Departement':
                    console.log('[Verify2FA] REDIRECTION VERS /department');
                    navigate('/department', { replace: true });
                    break;
                case 'Encadrant':
                    console.log('[Verify2FA] REDIRECTION VERS /supervisor');
                    navigate('/supervisor', { replace: true });
                    break;
                default:
                    console.log('[Verify2FA] REDIRECTION VERS /dashboard');
                    navigate('/dashboard', { replace: true });
                    break;
            }
        } catch (err) {
            console.error('[Verify2FA] Erreur catch :', err);
            const errorMsg = err?.response?.data?.message || err?.message || 'Erreur de verification';
            console.log('[Verify2FA] Error message :', errorMsg);
            
            if (errorMsg.includes('Session expiree') || errorMsg.includes('preAuthToken')) {
                console.log('[Verify2FA] Session expiree, redirection vers login');
                localStorage.removeItem('2faEmail');
                navigate('/login', { replace: true });
                return;
            }
            
            setError(errorMsg);
        } finally {
            setLoading(false);
            console.log('[Verify2FA] handleSubmit - Fin');
        }
    };

    const handleResend = async () => {
        setError('');
        setLoading(true);

        console.log('[Verify2FA] handleResend - Debut');

        try {
            await api.post('/auth/resend-2fa');
            setError('Nouveau code envoye par email');
            console.log('[Verify2FA] Code renvoye avec succes');
        } catch (err) {
            const errorMsg = err?.response?.data?.message || 'Erreur lors du renvoi';
            console.error('[Verify2FA] Erreur resend :', errorMsg);
            
            if (errorMsg.includes('Session expiree') || errorMsg.includes('preAuthToken')) {
                console.log('[Verify2FA] Session expiree, redirection vers login');
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
        console.log('[Verify2FA] goToHome - Retour a l\'accueil');
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

                            <CardTitle>Authentification reussie</CardTitle>
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
                                <SuccessButtonOutlined
                                    onClick={goToHome}
                                >
                                    <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i>
                                    Accueil
                                </SuccessButtonOutlined>

                                <SuccessButtonContained onClick={() => {
                                    console.log('[Verify2FA] Clic sur Dashboard button');
                                    const role = userData?.role || userData?.userType;
                                    switch (role) {
                                        case 'Administrateur':
                                            navigate('/admin');
                                            break;
                                        case 'RH':
                                            navigate('/rh');
                                            break;
                                        case 'Departement':
                                            navigate('/department');
                                            break;
                                        case 'Encadrant':
                                            navigate('/supervisor');
                                            break;
                                        default:
                                            navigate('/dashboard');
                                            break;
                                    }
                                }}>
                                    Dashboard
                                    <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                                </SuccessButtonContained>
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
                        <CardTitle>Verification à deux facteurs</CardTitle>
                        <CardSubtitle>
                            Un code de verification a ete envoye à votre adresse email.<br />
                            Veuillez le saisir ci-dessous.
                        </CardSubtitle>

                        {error && (
                            <StyledAlert severity={error.includes('Nouveau') ? 'success' : 'error'}>
                                {error}
                            </StyledAlert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <StyledTextField
                                fullWidth
                                label="Code de verification"
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
                                    'Verifier'
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
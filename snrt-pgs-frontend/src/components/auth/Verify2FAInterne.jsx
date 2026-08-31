// src/components/auth/Verify2FAInterne.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    InputAdornment,
    Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { verify2FA } from '../../store/slices/authSlice';
import api from '../../services/api';

// ============================================
// STYLES - MEME THEME QUE LoginInterne
// ============================================

const PageContainer = styled(Box)({
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
});

const StyledCard = styled(Paper)({
    backgroundColor: '#ffffff',
    borderRadius: '19px',
    padding: '24px 28px 20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    maxWidth: '360px',
    width: '100%',
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
        padding: '0 14px 0 14px',
        fontSize: '14px',
        color: '#1a1a2e',
        fontFamily: 'Inter, sans-serif',
        height: '42px',
        boxSizing: 'border-box',
        textAlign: 'center',
        letterSpacing: '6px',
        fontWeight: 600,
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
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#aab1b8',
        zIndex: 1,
        pointerEvents: 'none',
    },
});

const DotIndicator = styled(Box)({
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
    marginTop: '8px',
    marginBottom: '16px',
});

const Dot = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active',
})(({ active }) => ({
    width: '32px',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: active ? '#148aa0' : '#e1e6eb',
    transition: 'all 0.3s ease',
}));

const VerifyButton = styled(Button)({
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

const ActionLink = styled(Link)({
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

const StyledAlert = styled(Alert)({
    borderRadius: '10px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    marginBottom: '12px',
    padding: '8px 12px',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Verify2FAInterne = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    // ✅ Rediriger vers le bon dashboard interne selon le rôle
    const redirectByRole = (user) => {
        const role = user?.role || user?.userType;
        console.log('[Verify2FAInterne] Redirection selon role:', role);

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
                // Fallback vers admin si role inconnu
                navigate('/admin', { replace: true });
                break;
        }
    };

    // ✅ Vérifier si déjà connecté
    useEffect(() => {
        console.log('[Verify2FAInterne] useEffect - Debut');

        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        console.log('[Verify2FAInterne] token present:', !!token);
        console.log('[Verify2FAInterne] user present:', !!user);

        if (token && user) {
            try {
                const userData = JSON.parse(user);
                const role = userData?.role || userData?.userType;
                console.log('[Verify2FAInterne] Utilisateur deja connecte, role:', role);

                // ✅ Vérifier que c'est bien un utilisateur interne
                if (role === 'Administrateur' || role === 'RH' || role === 'Departement' || role === 'Encadrant') {
                    redirectByRole(userData);
                    return;
                } else {
                    // Si c'est un externe, rediriger vers login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login-interne', { replace: true });
                    return;
                }
            } catch (e) {
                console.error('[Verify2FAInterne] Erreur parsing user:', e);
            }
        }

        const storedEmail = localStorage.getItem('2faEmail');
        console.log('[Verify2FAInterne] storedEmail:', storedEmail);

        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            console.log('[Verify2FAInterne] Pas de 2faEmail, redirection vers /login-interne');
            navigate('/login-interne', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('[Verify2FAInterne] handleSubmit - Debut');
        console.log('[Verify2FAInterne] Code saisi:', code);

        try {
            const existingToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            console.log('[Verify2FAInterne] Token existant:', !!existingToken);
            console.log('[Verify2FAInterne] User existant:', !!storedUser);

            if (existingToken && storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    const role = userData?.role || userData?.userType;
                    if (role === 'Administrateur' || role === 'RH' || role === 'Departement' || role === 'Encadrant') {
                        redirectByRole(userData);
                        return;
                    }
                } catch (e) {
                    console.error('[Verify2FAInterne] Erreur parsing:', e);
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
                        console.log('[Verify2FAInterne] User recupere');

                        const role = userWithRole?.role || userWithRole?.userType;
                        if (role === 'Administrateur' || role === 'RH' || role === 'Departement' || role === 'Encadrant') {
                            redirectByRole(userWithRole);
                            return;
                        }
                    }
                } catch (err) {
                    console.error('[Verify2FAInterne] Erreur recuperation:', err);
                }
            }

            console.log('[Verify2FAInterne] Dispatch verify2FA avec code:', code);
            const resultAction = await dispatch(verify2FA({ code }));
            console.log('[Verify2FAInterne] Resultat verify2FA:', resultAction);

            if (verify2FA.rejected.match(resultAction)) {
                console.error('[Verify2FAInterne] verify2FA rejete:', resultAction.payload);
                throw new Error(resultAction.payload || 'Code invalide ou expire');
            }

            console.log('[Verify2FAInterne] verify2FA reussi !');

            localStorage.removeItem('2faEmail');
            localStorage.removeItem('2faUserId');

            const userData = resultAction.payload?.user;
            const authToken = resultAction.payload?.token;

            console.log('[Verify2FAInterne] userData recu:', userData);
            console.log('[Verify2FAInterne] authToken recu:', !!authToken);

            if (authToken) {
                localStorage.setItem('token', authToken);
                console.log('[Verify2FAInterne] Token stocke');
            } else {
                console.warn('[Verify2FAInterne] Aucun token recu !');
            }

            if (userData) {
                const userWithRole = {
                    ...userData,
                    role: userData.role || userData.userType || 'Etudiant',
                    userType: userData.userType || userData.role || 'Etudiant',
                };
                localStorage.setItem('user', JSON.stringify(userWithRole));
                console.log('[Verify2FAInterne] userData stocke');
            }

            console.log('[Verify2FAInterne] Token final present:', !!localStorage.getItem('token'));
            console.log('[Verify2FAInterne] User final present:', !!localStorage.getItem('user'));

            // ✅ Redirection vers les dashboards internes
            const role = userData?.role || userData?.userType;
            console.log('[Verify2FAInterne] Role pour redirection:', role);

            if (role === 'Administrateur' || role === 'RH' || role === 'Departement' || role === 'Encadrant') {
                redirectByRole(userData);
            } else {
                // Si le rôle n'est pas interne, rediriger vers login-interne
                console.log('[Verify2FAInterne] Role non interne, redirection vers /login-interne');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login-interne', { replace: true });
            }
        } catch (err) {
            console.error('[Verify2FAInterne] Erreur catch:', err);
            const errorMsg = err?.response?.data?.message || err?.message || 'Erreur de verification';
            console.log('[Verify2FAInterne] Error message:', errorMsg);

            if (errorMsg.includes('Session expiree') || errorMsg.includes('preAuthToken')) {
                console.log('[Verify2FAInterne] Session expiree, redirection vers login-interne');
                localStorage.removeItem('2faEmail');
                navigate('/login-interne', { replace: true });
                return;
            }

            setError(errorMsg);
        } finally {
            setLoading(false);
            console.log('[Verify2FAInterne] handleSubmit - Fin');
        }
    };

    const handleResend = async () => {
        setError('');
        setLoading(true);

        console.log('[Verify2FAInterne] handleResend - Debut');

        try {
            await api.post('/auth/resend-2fa');
            setError('Nouveau code envoye par email');
            console.log('[Verify2FAInterne] Code renvoye avec succes');
        } catch (err) {
            const errorMsg = err?.response?.data?.message || 'Erreur lors du renvoi';
            console.error('[Verify2FAInterne] Erreur resend:', errorMsg);

            if (errorMsg.includes('Session expiree') || errorMsg.includes('preAuthToken')) {
                console.log('[Verify2FAInterne] Session expiree, redirection vers login-interne');
                localStorage.removeItem('2faEmail');
                navigate('/login-interne', { replace: true });
                return;
            }

            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const goToLogin = () => {
        console.log('[Verify2FAInterne] goToLogin - Retour vers login-interne');
        localStorage.removeItem('2faEmail');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login-interne', { replace: true });
    };

    return (
        <PageContainer>
            <StyledCard>
                <Logo>
                    <img src="/logo_snrt_final.png" alt="SNRT" />
                </Logo>

                <Title>Verification à deux facteurs</Title>
                <Subtitle>
                    Un code de verification a ete envoye à votre adresse email.<br />
                    Veuillez le saisir ci-dessous.
                </Subtitle>

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
                                    <i className="fa-solid fa-shield-halved" style={{ color: '#148aa0', fontSize: '16px' }}></i>
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
                            <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                        ) : (
                            'Verifier'
                        )}
                    </VerifyButton>
                </form>

                <ActionLink onClick={handleResend} disabled={loading}>
                    <i className="fa-solid fa-rotate-right" style={{ marginRight: '6px' }}></i>
                    Renvoyer le code
                </ActionLink>

                <Divider />

                <ActionLink onClick={goToLogin}>
                    <i className="fa-solid fa-arrow-left" style={{ marginRight: '6px' }}></i>
                    Retour à la connexion
                </ActionLink>
            </StyledCard>
        </PageContainer>
    );
};

export default Verify2FAInterne;
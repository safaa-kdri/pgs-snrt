// src/components/common/Header.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Menu as MenuIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { logout, loadCurrentUser } from '../../store/slices/authSlice';
import ThemeToggle from './ThemeToggle';

// ============================================
// STYLES
// ============================================

const BackButton = styled(Button)({
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: '50px',
    padding: '6px 16px',
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    '& svg': {
        marginRight: '8px',
    },
});

const MenuButton = styled(IconButton)({
    color: 'white',
    '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});

const Header = ({ toggleDrawer }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    
    const { isAuthenticated, user, status } = useSelector((state) => state.auth);
    
    // ✅ Vérifier si l'utilisateur est déjà connecté
    useEffect(() => {
        const hasUser = localStorage.getItem('user');
        
        if (!isAuthenticated && status !== 'loading' && hasUser) {
            dispatch(loadCurrentUser());
        }
    }, [dispatch, isAuthenticated, status]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    // ✅ HEADER VIDE POUR LOGIN INTERNE
    if (location.pathname === '/login-interne') {
        return (
            <AppBar
                position="sticky"
                sx={{
                    backgroundColor: '#06455b',
                    backgroundImage: 'url(/navbar-bg.jpeg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    height: '74px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 20px',
                        height: '74px',
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,
                            flexShrink: 0
                        }}>
                            <img
                                src="/logo_snrt_final.png"
                                alt="SNRT"
                                style={{ width: '80px', height: 'auto', display: 'block' }}
                            />
                            <Typography
                                variant="h5"
                                component={Link}
                                to="/"
                                sx={{
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '17px',
                                    fontFamily: '"Inria Sans", sans-serif',
                                    ml: '-6px',
                                    letterSpacing: '1px',
                                    lineHeight: 1,
                                    margin: 0,
                                    padding: 0
                                }}
                            >
                                E-stages
                            </Typography>
                        </Box>
                        <ThemeToggle />
                    </Toolbar>
                </Container>
            </AppBar>
        );
    }

    // ✅ HEADER NORMAL (pages publiques)
    return (
        <AppBar
            position="sticky"
            sx={{
                backgroundColor: '#06455b',
                backgroundImage: 'url(/navbar-bg.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                height: '74px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 20px',
                    height: '74px',
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 20,
                        flexShrink: 0
                    }}>
                        {/* ===== Logo ===== */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,
                            flexShrink: 0
                        }}>
                            <img
                                src="/logo_snrt_final.png"
                                alt="SNRT"
                                style={{ width: '80px', height: 'auto', display: 'block' }}
                            />
                            <Typography
                                variant="h5"
                                component={Link}
                                to="/"
                                sx={{
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '17px',
                                    fontFamily: '"Inria Sans", sans-serif',
                                    ml: '-6px',
                                    letterSpacing: '1px',
                                    lineHeight: 1,
                                    margin: 0,
                                    padding: 0
                                }}
                            >
                                E-stages
                            </Typography>
                        </Box>

                        {/* ===== Liens navigation ===== */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 5,
                            flexShrink: 0
                        }}>
                            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontFamily: '"Inria Sans", sans-serif', fontSize: '20px', fontWeight: 200, letterSpacing: '0.5px', padding: '4px 0', margin: 0 }}>Accueil</Link>
                            <Link to="/faq" style={{ color: 'white', textDecoration: 'none', fontFamily: '"Inria Sans", sans-serif', fontSize: '18px', fontWeight: 400, letterSpacing: '0.5px', padding: '4px 0', margin: 0 }}>FAQ</Link>
                            <Link to="/contact" style={{ color: 'white', textDecoration: 'none', fontFamily: '"Inria Sans", sans-serif', fontSize: '18px', fontWeight: 400, letterSpacing: '0.5px', padding: '4px 0', margin: 0 }}>Contact</Link>
                            <Link to="https://e-recrutement.snrt.ma/contact#contact" target="_blank" rel="noopener" style={{ color: 'white', textDecoration: 'none', fontFamily: '"Inria Sans", sans-serif', fontSize: '18px', fontWeight: 400, letterSpacing: '0.5px', padding: '4px 0', margin: 0 }}>E-recrutement</Link>
                        </Box>
                    </Box>

                    {/* ===== PARTIE DROITE ===== */}
                    {isAuthenticated ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ThemeToggle />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ThemeToggle />
                            <Button
                                component={Link}
                                to="/register"
                                variant="contained"
                                sx={{
                                    backgroundColor: 'white',
                                    color: '#43455a',
                                    borderRadius: '50px',
                                    px: 3,
                                    py: 0.8,
                                    fontFamily: '"Inria Sans", sans-serif',
                                    fontSize: '15px',
                                    fontWeight: 400,
                                    textTransform: 'none',
                                    letterSpacing: '0.5px',
                                    minWidth: '120px',
                                    flexShrink: 0,
                                    '&:hover': { backgroundColor: '#f8f6f5' },
                                    '& i': { color: '#ea7224', marginRight: '10px', fontSize: '16px' }
                                }}
                            >
                                <i className="fa-solid fa-user-plus"></i>
                                S'inscrire
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;
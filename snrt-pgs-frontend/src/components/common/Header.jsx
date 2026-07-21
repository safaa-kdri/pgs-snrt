// src/components/common/Header.jsx
import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container
} from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
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
                    justifyContent: 'space-between',  /* ← ESPACE ENTRE GAUCHE ET DROITE */
                    alignItems: 'center',
                    padding: '0 20px',
                    height: '74px',
                    marginBlockStart: 0,
                    marginBlockEnd: '16px',
                    marginInlineStart: 0,
                    marginInlineEnd: 0,
                    marginTop: 0,
                    marginBottom: '16px'
                }}>

                    {/* ===== PARTIE GAUCHE : E-stages + MENU ===== */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 20,  /* ← ESPACE ENTRE E-stages ET LE MENU */
                        flexShrink: 0  /* ← EMPÊCHE LA ZONE DE RÉTRÉCIR */
                    }}>

                        {/* E-stages */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,  /* ← ESPACE ENTRE LE LOGO ET LE TEXTE */
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

                        {/* MENU */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 5,
                            flexShrink: 0
                        }}>
                            <Link
                                to="/"
                                style={{
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontFamily: '"Inria Sans", sans-serif',
                                    fontSize: '20px',
                                    fontWeight: 200,
                                    letterSpacing: '0.5px',
                                    padding: '4px 0',
                                    margin: 0
                                }}
                            >
                                Accueil
                            </Link>
                            <Link
                                to="/faq"
                                style={{
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontFamily: '"Inria Sans", sans-serif',
                                    fontSize: '18px',
                                    fontWeight: 400,
                                    letterSpacing: '0.5px',
                                    padding: '4px 0',
                                    margin: 0
                                }}
                            >
                                FAQ
                            </Link>
                            <Link
                                to="/contact"
                                style={{
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontFamily: '"Inria Sans", sans-serif',
                                    fontSize: '18px',
                                    fontWeight: 400,
                                    letterSpacing: '0.5px',
                                    padding: '4px 0',
                                    margin: 0
                                }}
                            >
                                Contact
                            </Link>
                            <Link
                                to="https://e-recrutement.snrt.ma/contact#contact"
                                target="_blank"
                                rel="noopener"
                                style={{
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontFamily: '"Inria Sans", sans-serif',
                                    fontSize: '18px',
                                    fontWeight: 400,
                                    letterSpacing: '0.5px',
                                    padding: '4px 0',
                                    margin: 0
                                }}
                            >
                                E-recrutement
                            </Link>
                        </Box>
                    </Box>

                    {/* ===== BOUTON S'INSCRIRE (PARTIE DROITE) ===== */}
                    <Button
                        component={Link}
                        to="/register"
                        variant="contained"
                        sx={{
                            backgroundColor: 'white',
                            color: '#43455a',
                            borderRadius: '50px',
                            px: 3,  /* ← AJUSTE LA LARGEUR DU BOUTON ICI */
                            py: 0.8,  /* ← AJUSTE LA HAUTEUR DU BOUTON ICI */
                            fontFamily: '"Inria Sans", sans-serif',
                            fontSize: '15px',
                            fontWeight: 400,
                            textTransform: 'none',
                            letterSpacing: '0.5px',
                            minWidth: '120px',  /* ← AJUSTE LA LARGEUR MINIMUM */
                            flexShrink: 0,  /* ← EMPÊCHE LE BOUTON DE RÉTRÉCIR */
                            '&:hover': { backgroundColor: '#f8f6f5' },
                            '& i': { color: '#ea7224', marginRight: '10px', fontSize: '16px' }
                        }}
                    >
                        <i className="fa-solid fa-user-plus"></i>
                        S'inscrire
                    </Button>

                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;
// src/components/common/Footer.jsx
import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: '#20252a',
                color: 'white',
                py: 8,
                mt: 'auto',
                textAlign: 'center'
            }}
        >
            <Container maxWidth="xl">
                {/* Logo + E-stages */}
                <Box sx={{ mb: 4 }}>
                    <img
                        src="/logo_snrt_final.png"
                        alt="SNRT"
                        style={{ width: '90px', height: 'auto', display: 'block', margin: '0 auto 12px' }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '26px',
                            fontFamily: '"Open Sans", sans-serif',
                            letterSpacing: '1px'
                        }}
                    >
                        E-stages
                    </Typography>
                </Box>

                {/* Liens */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 8,
                        width: '350px',
                        maxWidth: '90%',
                        margin: '0 auto 24px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid #d8d8d8',
                        flexWrap: 'wrap'
                    }}
                >
                    <Link 
                        component={RouterLink} 
                        to="/" 
                        sx={{ 
                            color: 'white', 
                            textDecoration: 'none', 
                            fontSize: '18px',
                            fontFamily: '"Inria Sans", sans-serif',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        Accueil
                    </Link>
                    <Link 
                        component={RouterLink} 
                        to="/faq" 
                        sx={{ 
                            color: 'white', 
                            textDecoration: 'none', 
                            fontSize: '18px',
                            fontFamily: '"Inria Sans", sans-serif',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        FAQ
                    </Link>
                    <Link 
                        component={RouterLink} 
                        to="/contact" 
                        sx={{ 
                            color: 'white', 
                            textDecoration: 'none', 
                            fontSize: '18px',
                            fontFamily: '"Inria Sans", sans-serif',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        Contact
                    </Link>
                </Box>

                {/* Copyright avec lien vers Termes */}
                <Typography
                    variant="body2"
                    sx={{
                        color: 'white',
                        fontSize: '15px',
                        opacity: 0.8,
                        fontFamily: '"Inria Sans", sans-serif'
                    }}
                >
                    2026 © SNRT · Tous Droits Réservés |{' '}
                    <Link 
                        component={RouterLink} 
                        to="/terms" 
                        sx={{ 
                            color: 'white', 
                            textDecoration: 'underline',
                            '&:hover': { color: '#148aa0' }
                        }}
                    >
                        Termes et conditions
                    </Link>
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
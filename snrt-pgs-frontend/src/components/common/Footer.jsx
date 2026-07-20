// src/components/common/Footer.jsx
import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: '#20252a',
                color: 'white',
                py: 4,
                mt: 'auto',
                textAlign: 'center'
            }}
        >
            <Container maxWidth="xl">
                {/* Logo + E-stages */}
                <Box sx={{ mb: 2 }}>
                    <img
                        src="/logo_snrt_final.png"
                        alt="SNRT"
                        style={{ width: '65px', height: 'auto', display: 'block', margin: '0 auto 8px' }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '18px',
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
                        gap: 4,
                        width: '250px',
                        maxWidth: '90%',
                        margin: '0 auto 16px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #d8d8d8'
                    }}
                >
                    <Link href="/" sx={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                        Accueil
                    </Link>
                    <Link href="#" sx={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                        À propos
                    </Link>
                    <Link href="/contact" sx={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                        Contact
                    </Link>
                </Box>

                {/* Copyright */}
                <Typography
                    variant="body2"
                    sx={{
                        color: 'white',
                        fontSize: '12px',
                        opacity: 0.8
                    }}
                >
                    2026 © SNRT · Tous Droits Réservés | Termes et conditions
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
// src/components/common/Footer.jsx
import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: '#1a237e',
                color: 'white',
                py: 3,
                mt: 'auto'
            }}
        >
            <Container maxWidth="xl">
                <Typography variant="body2" align="center">
                    © {new Date().getFullYear()} SNRT - Plateforme de Gestion des Stages
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
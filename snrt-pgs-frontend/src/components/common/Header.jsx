// src/components/common/Header.jsx
import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
    const theme = useTheme();
    const isAuthenticated = false;

    return (
        <AppBar
            position="sticky"
            sx={{
                backgroundColor: theme.palette.primary.main,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            color: 'white',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        🎯 SNRT - PGS
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button component={Link} to="/offres" sx={{ color: 'white' }}>
                            Offres
                        </Button>
                        <Button component={Link} to="/faq" sx={{ color: 'white' }}>
                            FAQ
                        </Button>
                        <Button component={Link} to="/contact" sx={{ color: 'white' }}>
                            Contact
                        </Button>

                        {isAuthenticated ? (
                            <Button sx={{ color: 'white' }}>Déconnexion</Button>
                        ) : (
                            <>
                                <Button component={Link} to="/login" sx={{ color: 'white' }}>
                                    Connexion
                                </Button>
                                <Button
                                    component={Link}
                                    to="/register"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: 'white',
                                        color: theme.palette.primary.main,
                                        '&:hover': { backgroundColor: '#f0f0f0' }
                                    }}
                                >
                                    S'inscrire
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;
// src/components/public/Home.jsx
import React from 'react';
import { Typography, Box, Button, Container, Grid, Card, CardContent } from '@mui/material';

const Home = () => {
    return (
        <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#06455b' }}>
                    Bienvenue sur la Plateforme de Gestion des Stages
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    SNRT - Société Nationale de Radiodiffusion et de Télévision
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                📋 Offres de stage
                            </Typography>
                            <Typography color="text.secondary">
                                Consultez les offres de stage disponibles et trouvez celle qui correspond à votre profil.
                            </Typography>
                            <Button variant="contained" sx={{ mt: 2, backgroundColor: '#06455b' }} href="/offres">
                                Voir les offres
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                👤 Espace candidat
                            </Typography>
                            <Typography color="text.secondary">
                                Créez votre compte, déposez votre candidature et suivez son évolution en temps réel.
                            </Typography>
                            <Button variant="contained" sx={{ mt: 2, backgroundColor: '#06455b' }} href="/register">
                                S'inscrire
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                📊 Suivi des stages
                            </Typography>
                            <Typography color="text.secondary">
                                Gérez vos stagiaires, évaluez leur progression et validez leurs rapports.
                            </Typography>
                            <Button variant="contained" sx={{ mt: 2, backgroundColor: '#06455b' }} href="/login">
                                Se connecter
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Home;
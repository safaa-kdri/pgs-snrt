// src/components/public/OfferDetail.jsx
import React from 'react';
import { Typography, Box, Container, Card, CardContent, Button, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';

const OfferDetail = () => {
    const { id } = useParams();

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#06455b' }}>
                    Détail de l'offre #{id}
                </Typography>
                <Card>
                    <CardContent>
                        <Typography variant="h5">Stage en Développement Web</Typography>
                        <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
                            <Chip label="PFE" color="primary" />
                            <Chip label="2 postes" variant="outlined" />
                        </Box>
                        <Typography variant="body1" paragraph>
                            Description détaillée de l'offre de stage...
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            📅 Période : Été 2026
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom>
                            🏢 Département : Direction des Systèmes d'Information
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                            <Button variant="contained" sx={{ backgroundColor: '#06455b' }}>
                                Postuler
                            </Button>
                            <Button variant="outlined" sx={{ ml: 2, borderColor: '#06455b', color: '#06455b' }}>
                                Sauvegarder
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default OfferDetail;
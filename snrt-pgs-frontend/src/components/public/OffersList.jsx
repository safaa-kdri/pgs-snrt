// src/components/public/OffersList.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Box, Container, Card, CardContent, Button, TextField, MenuItem, Grid } from '@mui/material';

const OffersList = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simuler le chargement des offres (à remplacer par l'appel API)
        setTimeout(() => {
            setOffers([
                { id: 1, titre: 'Stage en Développement Web', description: 'Développement d\'applications web avec React et Node.js', typeStage: 'PFE', nbPostes: 2 },
                { id: 2, titre: 'Stage en Data Science', description: 'Analyse de données et machine learning', typeStage: 'Master', nbPostes: 1 },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#06455b' }}>
                    Offres de stage
                </Typography>

                {/* Filtres */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField select label="Type de stage" size="small" sx={{ minWidth: 150 }}>
                        <MenuItem value="">Tous</MenuItem>
                        <MenuItem value="PFE">PFE</MenuItem>
                        <MenuItem value="PFA">PFA</MenuItem>
                        <MenuItem value="Master">Master</MenuItem>
                        <MenuItem value="Licence">Licence</MenuItem>
                    </TextField>
                    <TextField label="Rechercher" size="small" placeholder="Titre, description..." sx={{ minWidth: 200 }} />
                    <Button variant="contained" sx={{ backgroundColor: '#06455b' }}>Rechercher</Button>
                </Box>

                {/* Liste des offres */}
                {loading ? (
                    <Typography>Chargement des offres...</Typography>
                ) : offers.length > 0 ? (
                    offers.map((offer) => (
                        <Card key={offer.id} sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6">{offer.titre}</Typography>
                                <Typography color="text.secondary">{offer.description}</Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    <Typography variant="body2" sx={{ backgroundColor: '#e0e0e0', px: 1, borderRadius: 1 }}>
                                        {offer.typeStage}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {offer.nbPostes} poste(s)
                                    </Typography>
                                </Box>
                                <Button variant="outlined" sx={{ mt: 2, borderColor: '#06455b', color: '#06455b' }}>
                                    Voir les détails
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography>Aucune offre disponible actuellement.</Typography>
                )}
            </Box>
        </Container>
    );
};

export default OffersList;
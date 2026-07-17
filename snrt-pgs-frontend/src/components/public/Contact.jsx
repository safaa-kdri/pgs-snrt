// src/components/public/Contact.jsx
import React from 'react';
import { Typography, Box, Container, TextField, Button, Paper, Grid } from '@mui/material';

const Contact = () => {
    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#06455b' }}>
                    Contactez-nous
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Pour toute question ou problème, vous pouvez nous contacter via ce formulaire.
                </Typography>
                <Paper sx={{ p: 4, maxWidth: 600 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Nom" fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Prénom" fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Email" fullWidth size="small" type="email" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Téléphone" fullWidth size="small" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Message" fullWidth multiline rows={4} size="small" />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" sx={{ backgroundColor: '#06455b' }}>
                                Envoyer
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Container>
    );
};

export default Contact;
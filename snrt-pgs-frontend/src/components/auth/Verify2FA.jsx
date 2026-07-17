// src/components/auth/Verify2FA.jsx
import React, { useState } from 'react';
import { Typography, Box, Container, TextField, Button, Paper, Alert } from '@mui/material';

const Verify2FA = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (code.length !== 6) {
            setError('Veuillez saisir un code à 6 chiffres');
            return;
        }
        // TODO: Vérification 2FA
        console.log('Code 2FA:', code);
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center', color: '#06455b' }}>
                        Authentification à 2 facteurs
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                        Un code de vérification a été envoyé à votre email.
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Code de vérification"
                            fullWidth
                            margin="normal"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            inputProps={{ maxLength: 6 }}
                        />
                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, backgroundColor: '#06455b' }}>
                            Vérifier
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Verify2FA;
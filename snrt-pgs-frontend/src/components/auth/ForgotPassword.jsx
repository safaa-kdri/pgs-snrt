// src/components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Typography, Box, Container, TextField, Button, Paper, Alert } from '@mui/material';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Appel API
        setSuccess(true);
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center', color: '#06455b' }}>
                        Mot de passe oublié
                    </Typography>
                    {success ? (
                        <Alert severity="success">
                            Un email de réinitialisation a été envoyé à votre adresse.
                        </Alert>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, backgroundColor: '#06455b' }}>
                                Réinitialiser
                            </Button>
                        </form>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default ForgotPassword;
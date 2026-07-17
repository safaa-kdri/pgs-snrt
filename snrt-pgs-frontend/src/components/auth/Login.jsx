// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { Typography, Box, Container, TextField, Button, Paper, Link, Alert } from '@mui/material';

const Login = () => {
    const [cin, setCin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!cin || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }
        setError('');
        // TODO: Appel API de connexion
        console.log('Connexion avec:', { cin, password });
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center', color: '#06455b' }}>
                        Connexion
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="CIN"
                            fullWidth
                            margin="normal"
                            value={cin}
                            onChange={(e) => setCin(e.target.value)}
                        />
                        <TextField
                            label="Mot de passe"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            sx={{ mt: 2, backgroundColor: '#06455b' }}
                        >
                            Se connecter
                        </Button>
                    </form>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Link href="/forgot-password" underline="hover">
                            Mot de passe oublié ?
                        </Link>
                    </Box>
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                        <Typography variant="body2">
                            Pas encore de compte ? <Link href="/register">S'inscrire</Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
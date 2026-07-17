// src/components/auth/Register.jsx
import React, { useState } from 'react';
import { Typography, Box, Container, TextField, Button, Paper, Alert, Checkbox, FormControlLabel } from '@mui/material';

const Register = () => {
    const [form, setForm] = useState({});
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Appel API d'inscription
        console.log('Inscription:', form);
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: 'center', color: '#06455b' }}>
                        Inscription
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField label="* Civilité" select name="civilite" onChange={handleChange} size="small" />
                            <TextField label="* Nom" name="nom" onChange={handleChange} size="small" required />
                            <TextField label="* Prénom" name="prenom" onChange={handleChange} size="small" required />
                            <TextField label="* Date de naissance" type="date" name="dateNaissance" onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
                            <TextField label="* Email" type="email" name="email" onChange={handleChange} size="small" required />
                            <TextField label="* Confirmation email" type="email" name="emailConfirmation" onChange={handleChange} size="small" required />
                            <TextField label="* CIN" name="cin" onChange={handleChange} size="small" required />
                            <TextField label="* Téléphone" name="telephone" onChange={handleChange} size="small" required />
                            <TextField label="* Adresse" name="adresse" onChange={handleChange} size="small" required />
                            <TextField label="* Ville" name="ville" onChange={handleChange} size="small" required />
                            <TextField label="* Pays" name="pays" onChange={handleChange} size="small" required />
                            <TextField label="* Mot de passe" type="password" name="motDePasse" onChange={handleChange} size="small" required />
                        </Box>
                        <FormControlLabel control={<Checkbox />} label="J'accepte les Termes et Conditions" sx={{ mt: 2 }} />
                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, backgroundColor: '#06455b' }}>
                            S'inscrire
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;
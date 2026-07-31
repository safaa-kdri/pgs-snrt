// src/components/student/Attestation.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, Button, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Download, CheckCircle, ArrowBack } from '@mui/icons-material';
import api from '../../services/api';

const Attestation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const response = await api.get('/internships/download-attestation', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Attestation_Stage.pdf';
            link.click();
        } catch (err) {
            console.error('Erreur téléchargement:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4, borderRadius: '16px', textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 64, color: '#22c55e', mb: 2 }} />
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    Attestation de stage disponible
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Félicitations ! Votre attestation de stage est prête à être téléchargée.
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleDownload}
                    disabled={loading}
                    sx={{ backgroundColor: '#148aa0', '&:hover': { backgroundColor: '#0b7890' } }}
                >
                    {loading ? 'Téléchargement...' : 'Télécharger mon attestation'}
                </Button>
                <Button
                    variant="outlined"
                    sx={{ ml: 2 }}
                    onClick={() => navigate('/dashboard/applications')}
                >
                    Retour
                </Button>
            </Paper>
        </Container>
    );
};

export default Attestation;
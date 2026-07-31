// src/components/student/DepotEngagement.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Paper, Typography, Button, Alert, CircularProgress, Card
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Upload, Download, CheckCircle, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const DepotContainer = styled(Box)({
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px 0',
});

const DepotEngagement = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            setError('');
        } else {
            setError('Veuillez sélectionner un fichier PDF');
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const formData = new FormData();
            formData.append('document', file);

            const response = await api.post('/internships/upload-engagement', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess('Engagement de confidentialité déposé avec succès');
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du dépôt');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/documents/engagement_confidentialite.pdf';
        link.download = 'Engagement_Confidentialite.pdf';
        link.click();
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <DepotContainer>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/applications')} sx={{ mb: 3, textTransform: 'none' }}>
                    Retour
                </Button>

                <Paper sx={{ p: 4, borderRadius: '16px' }}>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                        Dépôt d'engagement de confidentialité
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Téléchargez le document signé et scanné
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                    {!submitted ? (
                        <>
                            <Card sx={{ p: 3, mb: 3, border: '2px dashed #e0e4e8', textAlign: 'center' }}>
                                <Button
                                    component="label"
                                    variant="outlined"
                                    startIcon={<Upload />}
                                    sx={{ py: 2, width: '100%' }}
                                >
                                    {file ? file.name : 'Sélectionner le PDF signé'}
                                    <input type="file" hidden accept=".pdf" onChange={handleFileChange} />
                                </Button>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    Format accepté : PDF (max 5MB)
                                </Typography>
                            </Card>

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Download />}
                                    onClick={handleDownloadTemplate}
                                >
                                    Télécharger le modèle
                                </Button>
                                <Button
                                    variant="contained"
                                    disabled={!file || loading}
                                    onClick={handleSubmit}
                                    sx={{ backgroundColor: '#22c55e', '&:hover': { backgroundColor: '#16a34a' } }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Déposer'}
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CheckCircle sx={{ fontSize: 64, color: '#22c55e', mb: 2 }} />
                            <Typography variant="h6">Document déposé avec succès</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Votre document sera vérifié par le service RH.
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{ mt: 3, backgroundColor: '#148aa0' }}
                                onClick={() => navigate('/dashboard/applications')}
                            >
                                Voir mes candidatures
                            </Button>
                        </Box>
                    )}
                </Paper>
            </DepotContainer>
        </Container>
    );
};

export default DepotEngagement;
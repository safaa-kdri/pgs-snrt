// src/components/student/DepotRapport.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Paper, Typography, Button, Alert, CircularProgress, Card, Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Upload, Download, CheckCircle, ArrowBack, Description } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const DepotContainer = styled(Box)({
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px 0',
});

const DepotRapport = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [internshipId, setInternshipId] = useState(null);

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

            const response = await api.post('/internships/upload-rapport', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess('Rapport de stage déposé avec succès');
            setSubmitted(true);
            if (response.data?.data?._id) {
                setInternshipId(response.data.data._id);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du dépôt du rapport');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/documents/template_rapport_stage.pdf';
        link.download = 'Template_Rapport_Stage.pdf';
        link.click();
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <DepotContainer>
                <Button 
                    startIcon={<ArrowBack />} 
                    onClick={() => navigate('/dashboard/applications')} 
                    sx={{ mb: 3, textTransform: 'none' }}
                >
                    Retour
                </Button>

                <Paper sx={{ p: 4, borderRadius: '16px' }}>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                        Dépôt du rapport de stage
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Téléchargez votre rapport de stage au format PDF
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
                                    {file ? file.name : 'Sélectionner le rapport PDF'}
                                    <input type="file" hidden accept=".pdf" onChange={handleFileChange} />
                                </Button>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    Format accepté : PDF (max 10MB)
                                </Typography>
                            </Card>

                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<Download />}
                                        onClick={handleDownloadTemplate}
                                        sx={{ py: 1.5 }}
                                    >
                                        Télécharger le modèle
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        disabled={!file || loading}
                                        onClick={handleSubmit}
                                        sx={{ 
                                            backgroundColor: '#22c55e', 
                                            '&:hover': { backgroundColor: '#16a34a' },
                                            py: 1.5
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Déposer le rapport'}
                                    </Button>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3, p: 2, bgcolor: '#fef3c7', borderRadius: '8px' }}>
                                <Typography variant="caption" color="#d97706" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Description fontSize="small" />
                                    <span><strong>Conseil :</strong> Assurez-vous que votre rapport respecte les normes de présentation SNRT.</span>
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CheckCircle sx={{ fontSize: 64, color: '#22c55e', mb: 2 }} />
                            <Typography variant="h6">Rapport déposé avec succès</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Votre rapport sera examiné par votre encadrant dans les plus brefs délais.
                            </Typography>
                            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: '#148aa0' }}
                                    onClick={() => navigate('/dashboard/applications')}
                                >
                                    Voir mes candidatures
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Retour au tableau de bord
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </DepotContainer>
        </Container>
    );
};

export default DepotRapport;
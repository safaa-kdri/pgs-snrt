// src/components/student/StudentAttestation.jsx
// ✅ COMPOSANT : AFFICHAGE DE L'ATTESTATION DE STAGE

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    Paper,
    CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    PictureAsPdf,
    Download,
    Visibility,
    CheckCircle,
} from '@mui/icons-material';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const Container = styled(Box)({
    maxWidth: '100%',
});

const SectionTitle = styled(Typography)({
    fontWeight: 600,
    fontSize: '16px',
    color: '#0f172a',
    marginBottom: '16px',
});

const AttestationCard = styled(Paper)({
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: 'none',
    backgroundColor: '#fafbfc',
    textAlign: 'center',
});

const AttestationInfo = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
    flexWrap: 'wrap',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const StudentAttestation = ({ internshipId, internship }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleViewAttestation = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(
                `/internships/${internshipId}/attestation`,
                { responseType: 'blob' }
            );

            const blob = response.data instanceof Blob 
                ? response.data 
                : new Blob([response.data], { type: 'application/pdf' });
            
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => window.URL.revokeObjectURL(url), 5000);
        } catch (error) {
            console.error('Erreur visualisation attestation:', error);
            setError(
                error.response?.data?.message || 
                'Erreur lors de la visualisation de l\'attestation'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadAttestation = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(
                `/internships/${internshipId}/attestation`,
                { responseType: 'blob' }
            );

            const blob = response.data instanceof Blob 
                ? response.data 
                : new Blob([response.data], { type: 'application/pdf' });
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Attestation_Stage_${internshipId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            setSuccess('Attestation téléchargée avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Erreur téléchargement attestation:', error);
            setError(
                error.response?.data?.message || 
                'Erreur lors du téléchargement de l\'attestation'
            );
        } finally {
            setLoading(false);
        }
    };

    const isAttestationAvailable = internship?.attestationGeneree === true;

    return (
        <Container>
            <SectionTitle>Attestation de stage</SectionTitle>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <AttestationCard>
                {isAttestationAvailable ? (
                    <>
                        <AttestationInfo>
                            <PictureAsPdf sx={{ color: '#ef4444', fontSize: 40 }} />
                            <Box sx={{ textAlign: 'left' }}>
                                <Typography variant="body1" fontWeight={600}>
                                    Attestation de stage
                                </Typography>
                                <Typography variant="caption" color="#64748b">
                                    Document officiel validé par le service RH
                                </Typography>
                            </Box>
                            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Visibility />}
                                    onClick={handleViewAttestation}
                                    disabled={loading}
                                    sx={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        borderColor: '#cbd5e1',
                                        color: '#475569',
                                    }}
                                >
                                    Consulter
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<Download />}
                                    onClick={handleDownloadAttestation}
                                    disabled={loading}
                                    sx={{
                                        backgroundColor: '#0f766e',
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        '&:hover': { backgroundColor: '#115e59' },
                                    }}
                                >
                                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Télécharger'}
                                </Button>
                            </Box>
                        </AttestationInfo>

                        <Alert severity="success" sx={{ borderRadius: '8px' }}>
                            <Typography variant="body2">
                                Votre attestation de stage est disponible. Vous pouvez la consulter ou la télécharger.
                            </Typography>
                        </Alert>
                    </>
                ) : (
                    <Box sx={{ py: 4 }}>
                        <PictureAsPdf sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                        <Typography variant="h6" color="#64748b">
                            Attestation non disponible
                        </Typography>
                        <Typography variant="body2" color="#94a3b8">
                            L'attestation sera disponible une fois le stage validé par le service RH.
                        </Typography>
                    </Box>
                )}
            </AttestationCard>
        </Container>
    );
};

export default StudentAttestation;
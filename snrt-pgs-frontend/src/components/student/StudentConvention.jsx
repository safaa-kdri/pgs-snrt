// src/components/student/StudentConvention.jsx
// ✅ VERSION SANS REDONDANCE - UN SEUL MESSAGE DE STATUT

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    CloudUpload,
    Download,
    Visibility,
    PictureAsPdf,
} from '@mui/icons-material';
import api from '../../services/api';

// ============================================
// STYLES MINIMALISTES
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

const StatusMessage = styled(Typography)({
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: 500,
    marginBottom: '4px',
});

const StatusDescription = styled(Typography)({
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '16px',
});

const FileCard = styled(Paper)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: 'none',
    backgroundColor: '#fafbfc',
    marginTop: '12px',
    flexWrap: 'wrap',
    gap: '12px',
});

const FileInfo = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
});

const FileName = styled(Typography)({
    fontSize: '14px',
    fontWeight: 500,
    color: '#0f172a',
});

const FileSize = styled(Typography)({
    fontSize: '12px',
    color: '#94a3b8',
});

const ActionGroup = styled(Box)({
    display: 'flex',
    gap: '8px',
});

const ActionButton = styled(Button)({
    textTransform: 'none',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '13px',
    padding: '6px 16px',
    minWidth: 'unset',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const StudentConvention = ({ internshipId }) => {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [convention, setConvention] = useState(null);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (internshipId) {
            fetchConventionStatus();
        }
    }, [internshipId]);

    const fetchConventionStatus = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/internships/${internshipId}/convention`);
            const data = response.data?.data;
            if (data) {
                setConvention(data);
                const statut = data.statut || '';
                if (statut === 'NonGeneree' || statut === '') {
                    setStatus('');
                    setConvention(null);
                } else {
                    setStatus(statut);
                    setConvention(data);
                }
                if (data.convention && statut !== 'NonGeneree') {
                    setFile(data.convention);
                } else {
                    setFile(null);
                }
            } else {
                setStatus('');
                setConvention(null);
                setFile(null);
            }
        } catch (error) {
            console.error('Erreur chargement statut convention:', error);
            if (error.response?.status === 404) {
                setStatus('');
                setConvention(null);
                setFile(null);
            } else {
                setError('Erreur lors du chargement du statut de la convention');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf') {
            setError('Seuls les fichiers PDF sont acceptés');
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('Le fichier ne doit pas dépasser 5 Mo');
            return;
        }

        setFile(selectedFile);
        setError('');
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('convention', file);

            const response = await api.post(`/internships/${internshipId}/convention`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess('Convention déposée avec succès.');
            setStatus('DeposeeEtudiant');
            setConvention(response.data?.data);
            setFile(null);
            await fetchConventionStatus();
            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            console.error('Erreur dépôt convention:', error);
            setError(error.response?.data?.message || 'Erreur lors du dépôt');
        } finally {
            setUploading(false);
        }
    };

    const openConventionPdf = async () => {
        try {
            const response = await api.get(`/internships/${internshipId}/convention/download`, { responseType: 'blob' });
            const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' });
            const type = blob.type || response.headers?.['content-type'] || '';
            if (!type.includes('pdf')) {
                throw new Error('La réponse serveur n’est pas un PDF valide');
            }
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => window.URL.revokeObjectURL(url), 5000);
            setError('');
        } catch (error) {
            console.error('Erreur consultation:', error);
            setError(error.response?.data?.message || 'Erreur lors de l’ouverture du PDF');
        }
    };

    const handleDownloadConvention = async () => {
        try {
            const response = await api.get(`/internships/${internshipId}/convention/download`, { responseType: 'blob' });
            const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' });
            const type = blob.type || response.headers?.['content-type'] || '';
            if (!type.includes('pdf')) {
                throw new Error('La réponse serveur n’est pas un PDF valide');
            }
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Convention_Stage_${internshipId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setError('');
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            setError(error.response?.data?.message || 'Erreur lors du téléchargement');
        }
    };

    // ✅ Messages uniques et clairs (sans redondance)
    const getStatusDisplay = (s) => {
        const statusMap = {
            'DeposeeEtudiant': {
                message: 'Votre convention a été déposée. Le service RH va la vérifier et la signer.'
            },
            'SigneeRH': {
                message: 'La convention a été signée par le service RH.'
            },
            'EnvoyeeEtudiant': {
                message: 'La convention signée vous a été envoyée. Vous pouvez la consulter ci-dessous.'
            },
            'Cloturee': {
                message: 'Le processus de convention est terminé.'
            },
        };
        return statusMap[s] || { 
            message: 'Déposez votre convention signée par votre établissement.'
        };
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: '#0f766e' }} />
            </Box>
        );
    }

    const hasValidConvention = status && status !== '' && status !== 'NonGeneree';
    const isDeposable = !hasValidConvention;
    const statusDisplay = getStatusDisplay(status);

    return (
        <Container>
            {/* ===== TITRE ===== */}
            <SectionTitle>Convention de stage</SectionTitle>

            {/* ===== ALERTS ===== */}
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

            {/* ===== UN SEUL MESSAGE DE STATUT ===== */}
            <StatusMessage>{statusDisplay.message}</StatusMessage>

            <Divider sx={{ mb: 3 }} />

            {/* ===== DÉPÔT ===== */}
            {isDeposable ? (
                <Box>
                    <Typography variant="body2" color="#64748b" sx={{ mb: 2 }}>
                        PDF uniquement · 5 Mo maximum
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            startIcon={<CloudUpload />}
                            onClick={() => document.getElementById('convention-file-input')?.click()}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                borderColor: '#cbd5e1',
                                color: '#0f172a',
                                fontWeight: 500,
                                '&:hover': { borderColor: '#0f766e', backgroundColor: '#f0fdfa' },
                            }}
                        >
                            {file ? 'Changer le fichier' : 'Sélectionner un fichier'}
                        </Button>

                        {file && (
                            <>
                                <Typography variant="body2" color="#0f172a" sx={{ fontWeight: 500 }}>
                                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} Mo)
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    sx={{
                                        backgroundColor: '#0f766e',
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        '&:hover': { backgroundColor: '#115e59' },
                                    }}
                                >
                                    {uploading ? <CircularProgress size={20} color="inherit" /> : 'Déposer'}
                                </Button>
                            </>
                        )}

                        <input
                            id="convention-file-input"
                            type="file"
                            accept=".pdf"
                            hidden
                            onChange={(e) => handleFileSelect(e.target.files?.[0])}
                        />
                    </Box>
                </Box>
            ) : (
                /* ===== CONVENTION DÉPOSÉE ===== */
                <Box>
                    <FileCard>
                        <FileInfo>
                            <PictureAsPdf sx={{ color: '#ef4444', fontSize: 20 }} />
                            <Box>
                                <FileName>Convention_Stage.pdf</FileName>
                                <FileSize>
                                    {convention?.taille 
                                        ? `${(convention.taille / 1024 / 1024).toFixed(2)} Mo` 
                                        : 'Document PDF'}
                                </FileSize>
                            </Box>
                        </FileInfo>

                        <ActionGroup>
                            <ActionButton
                                variant="outlined"
                                startIcon={<Visibility />}
                                onClick={openConventionPdf}
                                sx={{ borderColor: '#cbd5e1', color: '#475569' }}
                            >
                                Consulter
                            </ActionButton>
                            <ActionButton
                                variant="contained"
                                startIcon={<Download />}
                                onClick={handleDownloadConvention}
                                sx={{ backgroundColor: '#0f766e', '&:hover': { backgroundColor: '#115e59' } }}
                            >
                                Télécharger
                            </ActionButton>
                        </ActionGroup>
                    </FileCard>
                </Box>
            )}
        </Container>
    );
};

export default StudentConvention;
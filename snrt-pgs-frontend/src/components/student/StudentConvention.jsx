// src/components/student/StudentConvention.jsx
// ✅ Composant : Gestion de la convention (dépôt, suivi, téléchargement)

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    Stepper,
    Step,
    StepLabel,
    Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    CloudUpload,
    CheckCircle,
    Download,
    Pending,
    Check,
    PictureAsPdf,
} from '@mui/icons-material';
import { getConventionStatus, uploadConvention, downloadConvention } from '../../services/api';

// ============================================
// STYLES
// ============================================

const DropZone = styled(Box)({
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#fafafa',
    '&:hover': {
        borderColor: '#148aa0',
        backgroundColor: '#f0f7fa',
    },
});

const FileInfo = styled(Paper)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: 'none',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'DeposeeEtudiant': { bg: '#fef3c7', text: '#d97706' },
        'SigneeRH': { bg: '#dbeafe', text: '#1d4ed8' },
        'EnvoyeeEtudiant': { bg: '#d1fae5', text: '#065f46' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
        'EnAttente': { bg: '#f3f4f6', text: '#6b7280' },
    };
    const color = colors[status] || colors['EnAttente'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '12px',
        height: '28px',
    };
});

// ============================================
// COMPOSANT
// ============================================

const StudentConvention = ({ internshipId }) => {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [convention, setConvention] = useState(null);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');

    const steps = ['Déposer la convention', 'Signée par RH', 'Convention finalisée'];

    useEffect(() => {
        fetchConventionStatus();
    }, [internshipId]);

    const fetchConventionStatus = async () => {
        setLoading(true);
        try {
            const data = await getConventionStatus(internshipId);
            if (data) {
                setConvention(data);
                setStatus(data.statut || '');
                if (data.convention) {
                    setFile(data.convention);
                }
            }
        } catch (error) {
            console.error('❌ Erreur chargement convention:', error);
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
        try {
            const result = await uploadConvention(internshipId, file);
            if (result) {
                setSuccess('✅ Convention déposée avec succès ! En attente de signature RH.');
                setStatus('DeposeeEtudiant');
                setFile(null);
                await fetchConventionStatus();
            }
        } catch (error) {
            console.error('❌ Erreur dépôt convention:', error);
            setError(error.response?.data?.message || 'Erreur lors du dépôt');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadConvention = async () => {
        try {
            const blob = await downloadConvention(internshipId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Convention_${internshipId}_signee.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('❌ Erreur téléchargement:', error);
            setError('Erreur lors du téléchargement');
        }
    };

    const getActiveStep = () => {
        if (!status) return 0;
        switch (status) {
            case 'DeposeeEtudiant': return 0;
            case 'SigneeRH': return 1;
            case 'EnvoyeeEtudiant': return 1;
            case 'Cloturee': return 2;
            default: return 0;
        }
    };

    const getStatusMessage = () => {
        switch (status) {
            case 'DeposeeEtudiant':
                return {
                    icon: <Pending sx={{ color: '#d97706', fontSize: 32 }} />,
                    title: 'En attente de signature RH',
                    description: 'Votre convention a été déposée. Le RH va la signer prochainement.',
                };
            case 'SigneeRH':
                return {
                    icon: <Pending sx={{ color: '#1d4ed8', fontSize: 32 }} />,
                    title: 'Convention signée par RH',
                    description: 'La convention a été signée par le RH. Elle va vous être envoyée.',
                };
            case 'EnvoyeeEtudiant':
                return {
                    icon: <Check sx={{ color: '#065f46', fontSize: 32 }} />,
                    title: 'Convention envoyée',
                    description: 'La convention signée vous a été envoyée. Vous pouvez la télécharger ci-dessous.',
                };
            case 'Cloturee':
                return {
                    icon: <CheckCircle sx={{ color: '#22c55e', fontSize: 32 }} />,
                    title: 'Convention clôturée',
                    description: 'Le processus de convention est terminé.',
                };
            default:
                return {
                    icon: <Pending sx={{ color: '#6b7280', fontSize: 32 }} />,
                    title: 'En attente de dépôt',
                    description: 'Déposez votre convention signée par votre établissement.',
                };
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    const statusInfo = getStatusMessage();
    const isDeposable = !status || status === '' || status === 'EnAttente';
    const canDownload = status === 'EnvoyeeEtudiant' || status === 'Cloturee';

    return (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1a2332' }}>
                📄 Convention de stage
            </Typography>

            {/* Stepper */}
            <Stepper activeStep={getActiveStep()} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

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

            {/* Statut */}
            <Box sx={{ mb: 3, p: 3, backgroundColor: '#f7f7f7', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>{statusInfo.icon}</Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                        {statusInfo.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {statusInfo.description}
                    </Typography>
                    {status && (
                        <Box sx={{ mt: 1 }}>
                            <StatusChip label={status} status={status} size="small" />
                        </Box>
                    )}
                </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Dépôt */}
            {isDeposable ? (
                <>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        📤 Déposer votre convention
                    </Typography>
                    <DropZone onClick={() => document.getElementById('convention-file-input')?.click()}>
                        <CloudUpload sx={{ fontSize: 48, color: '#148aa0', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#1a2332' }}>
                            {file ? 'Fichier sélectionné' : 'Déposez votre convention ici'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {file
                                ? `📄 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} Mo)`
                                : 'Glissez-déposez ou cliquez pour sélectionner un fichier PDF'}
                        </Typography>
                        <input
                            id="convention-file-input"
                            type="file"
                            accept=".pdf"
                            hidden
                            onChange={(e) => handleFileSelect(e.target.files?.[0])}
                        />
                    </DropZone>

                    {file && (
                        <FileInfo sx={{ mt: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={500}>
                                    {file.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {(file.size / 1024 / 1024).toFixed(2)} Mo • Prêt à déposer
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleUpload}
                                disabled={uploading}
                                sx={{
                                    backgroundColor: '#148aa0',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#0b7890' },
                                }}
                            >
                                {uploading ? <CircularProgress size={20} color="inherit" /> : 'Déposer'}
                            </Button>
                        </FileInfo>
                    )}
                </>
            ) : (
                <Box sx={{ p: 3, backgroundColor: '#f0fdf4', borderRadius: '12px', textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 40, color: '#22c55e', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={600} color="#065f46">
                        Convention déjà déposée
                    </Typography>
                    <Typography variant="body2" color="#065f46">
                        Vous avez déjà déposé votre convention. Elle est en cours de traitement.
                    </Typography>
                </Box>
            )}

            {/* Téléchargement */}
            {canDownload && (
                <Box sx={{ mt: 3, p: 3, backgroundColor: '#f0f7fa', borderRadius: '12px' }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#1a2332' }}>
                        📎 Convention signée disponible
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        La convention a été signée par le RH. Vous pouvez la télécharger.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={handleDownloadConvention}
                        sx={{
                            backgroundColor: '#148aa0',
                            borderRadius: '8px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#0b7890' },
                        }}
                    >
                        Télécharger la convention signée
                    </Button>
                </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                <strong>📌 Format accepté :</strong> PDF uniquement • <strong>Taille max :</strong> 5 Mo
            </Typography>
        </Box>
    );
};

export default StudentConvention;
// src/components/student/ConventionDepot.jsx
// ✅ ÉTUDIANT - Déposer directement la convention signée depuis son ordinateur

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    CloudUpload,
    CheckCircle,
    Download,
    ArrowBack,
    Pending,
    Check,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const StyledCard = styled(Paper)({
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '800px',
    margin: '0 auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
});

const DropZone = styled(Box)({
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#fafafa',
    '&:hover': {
        borderColor: '#148aa0',
        backgroundColor: '#f0f7fa',
    },
    '&.dragging': {
        borderColor: '#148aa0',
        backgroundColor: '#e8f4f8',
    },
});

const FileInfo = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'DeposeeEtudiant': { bg: '#fef3c7', text: '#d97706' },
        'SigneeRH': { bg: '#dbeafe', text: '#1d4ed8' },
        'EnvoyeeEtudiant': { bg: '#d1fae5', text: '#065f46' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
    };
    const color = colors[status] || colors['DeposeeEtudiant'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '12px',
        height: '28px',
    };
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ConventionDepot = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [convention, setConvention] = useState(null);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');

    const steps = [
        'Déposer la convention',
        'Signée par RH',
        'Convention finalisée',
    ];

    useEffect(() => {
        fetchConventionStatus();
    }, []);

    const fetchConventionStatus = async () => {
        setLoading(true);
        try {
            const response = await api.get('/internships/convention/status');
            const data = response.data?.data;
            if (data) {
                setConvention(data);
                setStatus(data.statut || '');
                if (data.convention) {
                    setFile(data.convention);
                }
            }
        } catch (error) {
            console.error('Erreur chargement statut:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ SÉLECTIONNER LE FICHIER
    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return;
        
        // Vérifier le type de fichier
        if (selectedFile.type !== 'application/pdf') {
            setError('Seuls les fichiers PDF sont acceptés');
            return;
        }

        // Vérifier la taille (max 5 Mo)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('Le fichier ne doit pas dépasser 5 Mo');
            return;
        }

        setFile(selectedFile);
        setError('');
    };

    // ✅ DRAG AND DROP
    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragging');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('dragging');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('dragging');
    };

    // ✅ DÉPOSER LA CONVENTION
    const handleUpload = async () => {
        if (!file) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        setUploading(true);
        setError('');
        
        try {
            const formData = new FormData();
            formData.append('convention', file);

            const response = await api.post('/internships/convention/deposer', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess('✅ Convention déposée avec succès ! En attente de signature RH.');
            setStatus('DeposeeEtudiant');
            setConvention(response.data?.data);
            setFile(null);
            
            // Recharger le statut
            await fetchConventionStatus();
        } catch (error) {
            console.error('Erreur dépôt convention:', error);
            setError(error.response?.data?.message || 'Erreur lors du dépôt');
        } finally {
            setUploading(false);
        }
    };

    // ✅ TÉLÉCHARGER LA CONVENTION SIGNÉE
    const handleDownloadConvention = async () => {
        try {
            const response = await api.get('/internships/convention/download', {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Convention_${user?.nom || 'stage'}_signee.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur téléchargement:', error);
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
                return null;
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#148aa0' }} />
                </Box>
            </Container>
        );
    }

    const statusInfo = getStatusMessage();
    const isDeposable = !status || status === '';
    const isSigned = status === 'SigneeRH' || status === 'EnvoyeeEtudiant' || status === 'Cloturee';
    const canDownload = status === 'EnvoyeeEtudiant' || status === 'Cloturee';

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/dashboard/applications')}
                    sx={{ textTransform: 'none', color: '#666' }}
                >
                    Retour au tableau de bord
                </Button>
            </Box>

            <StyledCard>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1a2332' }}>
                    📄 Convention de stage
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Déposez votre convention de stage signée par votre établissement.
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
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                {/* Statut actuel */}
                {statusInfo && (
                    <Box sx={{ 
                        mb: 3, 
                        p: 3, 
                        backgroundColor: '#f7f7f7', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}>
                        <Box>{statusInfo.icon}</Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {statusInfo.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {statusInfo.description}
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                {/* ZONE DE DÉPÔT */}
                {isDeposable ? (
                    <>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            📤 Déposer votre convention
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Sélectionnez le fichier PDF de votre convention signée par votre établissement.
                        </Typography>

                        <DropZone
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            <CloudUpload sx={{ fontSize: 48, color: '#148aa0', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#1a2332' }}>
                                {file ? 'Fichier sélectionné' : 'Déposez votre convention ici'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {file 
                                    ? `📄 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} Mo)`
                                    : 'Glissez-déposez ou cliquez pour sélectionner un fichier PDF'
                                }
                            </Typography>
                            <input
                                id="fileInput"
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

                {/* Télécharger la convention signée */}
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

                {/* Information */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    <strong>📌 Format accepté :</strong> PDF uniquement • <strong>Taille max :</strong> 5 Mo
                </Typography>
            </StyledCard>
        </Container>
    );
};

export default ConventionDepot;
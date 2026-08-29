// src/components/rh/UploadSignature.jsx
// ✅ Page pour uploader la signature RH

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
    Card,
    CardContent,
    Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    CloudUpload,
    CheckCircle,
    ArrowBack,
    Delete,
    Image,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const PageHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
});

const DropZone = styled(Box)({
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '48px',
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

const SignaturePreview = styled(Box)({
    border: '2px solid #eef1f3',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    backgroundColor: '#fafbfc',
    '& img': {
        maxWidth: '300px',
        maxHeight: '100px',
        objectFit: 'contain',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const UploadSignature = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [signature, setSignature] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchSignature();
    }, []);

    const fetchSignature = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/signature');
            if (response.data?.signature) {
                setSignature(response.data.signature);
            }
        } catch (error) {
            console.error('Erreur chargement signature:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (file) => {
        if (!file) return;
        
        // Vérifier le type
        if (!file.type.startsWith('image/')) {
            setError('Seules les images sont acceptées (PNG, JPG)');
            return;
        }

        // Vérifier la taille (max 2 Mo)
        if (file.size > 2 * 1024 * 1024) {
            setError('Le fichier ne doit pas dépasser 2 Mo');
            return;
        }

        setSelectedFile(file);
        setError('');
    };

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

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('signature', selectedFile);

            const response = await api.post('/users/signature/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data?.success) {
                setSuccess('✅ Signature uploadée avec succès !');
                setSignature(response.data.signature);
                setSelectedFile(null);
                setTimeout(() => setSuccess(''), 4000);
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'upload');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveSignature = async () => {
        if (!window.confirm('Voulez-vous vraiment supprimer votre signature ?')) return;

        try {
            await api.delete('/users/signature');
            setSignature(null);
            setSuccess('✅ Signature supprimée avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Erreur suppression:', error);
            setError('Erreur lors de la suppression');
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

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        ✍️ Ma signature
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Uploader votre signature pour les conventions
                    </Typography>
                </Box>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/rh/dashboard')}
                    sx={{ color: '#6b7280', textTransform: 'none' }}
                >
                    Retour
                </Button>
            </PageHeader>

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

            {/* Signature actuelle */}
            {signature ? (
                <Card sx={{ mb: 4, borderRadius: '16px', border: '1px solid #eef1f3' }}>
                    <CardContent>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            Signature actuelle
                        </Typography>
                        <SignaturePreview>
                            <img 
                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${signature}`} 
                                alt="Signature RH" 
                            />
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                Signature de {user?.prenom || ''} {user?.nom || ''}
                            </Typography>
                        </SignaturePreview>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={handleRemoveSignature}
                            sx={{ mt: 2 }}
                        >
                            Supprimer la signature
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: '10px' }}>
                    Aucune signature trouvée. Veuillez uploader votre signature.
                </Alert>
            )}

            <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid #eef1f3' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Uploader une nouvelle signature
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Format : PNG ou JPG • Taille max : 2 Mo • Fond transparent recommandé
                </Typography>

                <DropZone
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('signature-input')?.click()}
                >
                    <input
                        id="signature-input"
                        type="file"
                        hidden
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    />
                    {selectedFile ? (
                        <>
                            <Image sx={{ fontSize: 48, color: '#148aa0', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#1a2332' }}>
                                {selectedFile.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {(selectedFile.size / 1024).toFixed(0)} KB • Prêt à uploader
                            </Typography>
                        </>
                    ) : (
                        <>
                            <CloudUpload sx={{ fontSize: 48, color: '#148aa0', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#1a2332' }}>
                                Cliquez ou glissez-déposez
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                PNG, JPG • Max 2 Mo
                            </Typography>
                        </>
                    )}
                </DropZone>

                {selectedFile && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={uploading}
                            sx={{
                                backgroundColor: '#148aa0',
                                borderRadius: '8px',
                                textTransform: 'none',
                                padding: '10px 36px',
                                '&:hover': { backgroundColor: '#0b7890' },
                            }}
                        >
                            {uploading ? <CircularProgress size={20} color="inherit" /> : 'Uploader'}
                        </Button>
                    </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    <strong>💡 Astuce :</strong> Utilisez une image avec fond transparent pour un meilleur rendu sur les PDF.
                </Typography>
            </Paper>
        </Container>
    );
};

export default UploadSignature;
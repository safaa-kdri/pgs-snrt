// src/components/student/Documents.jsx
// ✅ CORRECTION : Sélecteur de type avec tous les documents requis

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Grid,
    CircularProgress,
    Tooltip,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from '@mui/material';
import {
    Refresh,
    Upload,
    Delete,
    Download,
    CheckCircle,
    Pending,
    Cancel,
    Description,
    Image,
    PictureAsPdf,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
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

const StyledTableCell = styled(TableCell)({
    fontWeight: 600,
    color: '#1a2332',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        valide: { bg: '#d1fae5', text: '#065f46' },
        en_attente: { bg: '#fef3c7', text: '#d97706' },
        refuse: { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors.en_attente;
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
    };
});

const UploadZone = styled(Box)({
    border: '2px dashed #d1d5db',
    borderRadius: '16px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#fafafa',
    '&:hover': {
        borderColor: '#148aa0',
        backgroundColor: '#f0f7fa',
    },
});

// ✅ TYPES DE DOCUMENTS COMPLETS
const DOCUMENT_TYPES = [
    { value: 'Photo', label: 'Photo d\'identité' },
    { value: 'LettreMotivation', label: 'Lettre de motivation' },
    { value: 'CV', label: 'CV' },
    { value: 'AttestationScolarite', label: 'Attestation de Scolarité' },
    { value: 'LettreRecommandation', label: 'Lettre de recommandation' },
    { value: 'CIN', label: 'Copie CIN' },
    { value: 'Assurance', label: 'Assurance' },
    { value: 'FicheEngagement', label: 'Fiche d\'Engagement' },
    { value: 'Convention', label: 'Convention' },
    { value: 'ReleveNotes', label: 'Relevé de notes' },
    { value: 'Attestation', label: 'Attestation' },
    { value: 'Autre', label: 'Autre' },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Documents = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState([]);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedType, setSelectedType] = useState('');
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [typeError, setTypeError] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/documents', {
                params: { candidatId: user?.id }
            });
            
            const docs = response.data?.data || [];
            setDocuments(docs);
        } catch (error) {
            console.error('Erreur chargement documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (nom) => {
        if (nom?.endsWith('.pdf')) return <PictureAsPdf sx={{ color: '#ef4444' }} />;
        if (nom?.endsWith('.png') || nom?.endsWith('.jpg') || nom?.endsWith('.jpeg') || nom?.endsWith('.gif')) {
            return <Image sx={{ color: '#22c55e' }} />;
        }
        return <Description sx={{ color: '#4f46e5' }} />;
    };

    const getStatusLabel = (status) => {
        const labels = {
            valide: 'Validé',
            en_attente: 'En attente',
            refuse: 'Refusé',
        };
        return labels[status] || status;
    };

    const getTypeLabel = (type) => {
        const found = DOCUMENT_TYPES.find(t => t.value === type);
        return found ? found.label : type;
    };

    const buildFileHref = (doc) => {
        if (!doc) return null;
        const apiRoot = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
        
        if (doc.gridFsId) {
            return `${apiRoot}/api/v1/documents/file/${doc.gridFsId}`;
        }
        if (doc.url) {
            if (doc.url.startsWith('/')) {
                return `${apiRoot}${doc.url}`;
            }
            return doc.url;
        }
        if (doc.chemin) {
            if (doc.chemin.startsWith('/')) {
                return `${apiRoot}${doc.chemin}`;
            }
            return doc.chemin;
        }
        return null;
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setSelectedType('');
            setTypeError('');
            setOpenUploadDialog(true);
        }
    };

    const handleUploadConfirm = async () => {
        if (!selectedFile) return;
        
        // ✅ Vérifier que le type est sélectionné
        if (!selectedType) {
            setTypeError('Veuillez sélectionner un type de document');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');
        setTypeError('');

        try {
            const formData = new FormData();
            formData.append('document', selectedFile);
            formData.append('type', selectedType);

            console.log('📤 [Documents] Upload:', {
                nom: selectedFile.name,
                type: selectedType,
                taille: selectedFile.size
            });

            const response = await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const uploadedDoc = response?.data?.data;

            if (uploadedDoc) {
                setDocuments([uploadedDoc, ...documents]);
            }

            setSuccess(`✅ Document uploadé avec succès ! (${getTypeLabel(selectedType)})`);
            setOpenUploadDialog(false);
            setSelectedFile(null);
            setSelectedType('');
            setTimeout(() => setSuccess(''), 4000);

        } catch (error) {
            console.error('Erreur upload:', error);
            setError(error.response?.data?.message || '❌ Erreur lors de l\'upload du document');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = async (id) => {
        try {
            await api.delete(`/documents/${id}`);
            setDocuments(documents.filter((d) => d._id !== id));
            setSuccess('✅ Document supprimé avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Erreur suppression:', error);
            setError('❌ Erreur lors de la suppression');
        }
    };

    const handleDownloadDocument = (doc) => {
        if (!doc) return;
        const href = buildFileHref(doc);
        
        if (href) {
            const isPdf = doc.mimeType === 'application/pdf' || 
                          doc.nomOriginal?.toLowerCase().endsWith('.pdf') ||
                          doc.nom?.toLowerCase().endsWith('.pdf');
            
            if (isPdf) {
                window.open(href, '_blank');
            } else {
                const link = document.createElement('a');
                link.href = href;
                link.download = doc.nomOriginal || doc.nom || 'document';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } else {
            setError('Impossible de télécharger ce document');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        📁 Mes documents
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {documents.length} document(s) trouvé(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchDocuments}
                        disabled={loading}
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                        Rafraîchir
                    </Button>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<Upload />}
                        sx={{
                            backgroundColor: '#148aa0',
                            borderRadius: '12px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#0b7890' },
                        }}
                    >
                        Uploader un document
                        <input
                            type="file"
                            hidden
                            onChange={handleFileSelect}
                        />
                    </Button>
                </Box>
            </PageHeader>

            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

            {/* ===== ZONE D'UPLOAD RAPIDE ===== */}
            <UploadZone onClick={() => document.getElementById('file-input')?.click()}>
                <input
                    id="file-input"
                    type="file"
                    hidden
                    onChange={handleFileSelect}
                />
                <Typography variant="h6" sx={{ color: '#1a2332' }}>
                    📤 Déposez vos fichiers ici
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Formats acceptés : PDF, DOC, DOCX, PNG, JPG
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Taille max : 5 MB
                </Typography>
            </UploadZone>

            {/* ===== TABLEAU ===== */}
            <TableContainer
                component={Paper}
                sx={{ mt: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                            <StyledTableCell>Document</StyledTableCell>
                            <StyledTableCell>Type</StyledTableCell>
                            <StyledTableCell>Taille</StyledTableCell>
                            <StyledTableCell>Date d'upload</StyledTableCell>
                            <StyledTableCell>Statut</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucun document trouvé
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            documents.map((doc) => (
                                <TableRow key={doc._id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getFileIcon(doc.nomOriginal)}
                                            <Typography variant="body2" fontWeight={500}>
                                                {doc.nomOriginal}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getTypeLabel(doc.type)}
                                            size="small"
                                            sx={{
                                                backgroundColor: doc.type === 'Photo' ? '#fce4ec' : '#e0e7ff',
                                                color: doc.type === 'Photo' ? '#c62828' : '#4338ca',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {Math.round(doc.taille / 1024)} KB
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={getStatusLabel(doc.statut)}
                                            status={doc.statut}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Télécharger">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDownloadDocument(doc)}
                                                sx={{ color: '#148aa0' }}
                                            >
                                                <Download fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Supprimer">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteDocument(doc._id)}
                                                sx={{ color: '#ef4444' }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ===== DIALOG DE CONFIRMATION UPLOAD ===== */}
            <Dialog
                open={openUploadDialog}
                onClose={() => {
                    setOpenUploadDialog(false);
                    setSelectedFile(null);
                    setSelectedType('');
                    setTypeError('');
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle>📤 Confirmer l'upload</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                        {selectedFile && getFileIcon(selectedFile.name)}
                        <Box>
                            <Typography variant="body1" fontWeight={600}>
                                {selectedFile?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {selectedFile && `${Math.round(selectedFile.size / 1024)} KB`}
                            </Typography>
                        </Box>
                    </Box>

                    {/* ✅ SÉLECTEUR DE TYPE DE DOCUMENT */}
                    <FormControl fullWidth sx={{ mt: 2 }} error={!!typeError}>
                        <InputLabel>Type de document *</InputLabel>
                        <Select
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                setTypeError('');
                            }}
                            label="Type de document *"
                        >
                            {DOCUMENT_TYPES.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Select>
                        {typeError && <FormHelperText>{typeError}</FormHelperText>}
                    </FormControl>

                    {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 4 }} />}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={() => {
                            setOpenUploadDialog(false);
                            setSelectedFile(null);
                            setSelectedType('');
                            setTypeError('');
                        }}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                        disabled={uploading}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUploadConfirm}
                        disabled={uploading || !selectedType}
                        sx={{
                            backgroundColor: '#148aa0',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#0b7890' },
                        }}
                    >
                        {uploading ? 'Upload...' : 'Confirmer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Documents;
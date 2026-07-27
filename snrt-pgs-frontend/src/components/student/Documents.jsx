// src/components/student/Documents.jsx
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
} from '@mui/material';
import {
    Refresh,
    Upload,
    Delete,
    Download,
    Visibility,
    CheckCircle,
    Pending,
    Cancel,
    Description,
    Image,
    PictureAsPdf,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../hooks/useAuth';

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
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockDocuments = [
                {
                    id: '1',
                    nom: 'CV_Youssef_EL_HASSANI.pdf',
                    type: 'CV',
                    taille: '245 KB',
                    dateUpload: '2026-07-15',
                    statut: 'valide',
                },
                {
                    id: '2',
                    nom: 'Lettre_motivation.pdf',
                    type: 'Lettre de motivation',
                    taille: '120 KB',
                    dateUpload: '2026-07-14',
                    statut: 'valide',
                },
                {
                    id: '3',
                    nom: 'Releve_notes_Master1.pdf',
                    type: 'Relevé de notes',
                    taille: '890 KB',
                    dateUpload: '2026-07-10',
                    statut: 'en_attente',
                },
                {
                    id: '4',
                    nom: 'Attestation_scolarite.pdf',
                    type: 'Attestation de scolarité',
                    taille: '180 KB',
                    dateUpload: '2026-06-28',
                    statut: 'refuse',
                },
            ];

            setDocuments(mockDocuments);

        } catch (error) {
            console.error('Erreur chargement documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (nom) => {
        if (nom.endsWith('.pdf')) return <PictureAsPdf sx={{ color: '#ef4444' }} />;
        if (nom.endsWith('.png') || nom.endsWith('.jpg') || nom.endsWith('.jpeg')) {
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

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setOpenUploadDialog(true);
        }
    };

    const handleUploadConfirm = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newDoc = {
                id: String(documents.length + 1),
                nom: selectedFile.name,
                type: 'Autre',
                taille: `${Math.round(selectedFile.size / 1024)} KB`,
                dateUpload: new Date().toISOString().split('T')[0],
                statut: 'en_attente',
            };

            setDocuments([...documents, newDoc]);
            setSuccess('✅ Document uploadé avec succès !');
            setOpenUploadDialog(false);
            setSelectedFile(null);
            setTimeout(() => setSuccess(''), 3000);

        } catch (error) {
            console.error('Erreur upload:', error);
            setError('❌ Erreur lors de l\'upload du document');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = (id) => {
        setDocuments(documents.filter((d) => d.id !== id));
        setSuccess('✅ Document supprimé avec succès');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleDownloadDocument = (doc) => {
        // Simulation de téléchargement
        console.log(`📥 Téléchargement de ${doc.nom}`);
        alert(`📥 Téléchargement de ${doc.nom} (simulé)`);
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
            <UploadZone onClick={() => document.getElementById('file-input').click()}>
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
                                <TableRow key={doc.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getFileIcon(doc.nom)}
                                            <Typography variant="body2" fontWeight={500}>
                                                {doc.nom}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={doc.type}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#e0e7ff',
                                                color: '#4338ca',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {doc.taille}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(doc.dateUpload).toLocaleDateString('fr-FR')}
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
                                        <Tooltip title="Voir">
                                            <IconButton
                                                size="small"
                                                sx={{ color: '#4f46e5' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Supprimer">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteDocument(doc.id)}
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
                onClose={() => setOpenUploadDialog(false)}
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
                    {uploading && <LinearProgress sx={{ mt: 2, borderRadius: 4 }} />}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={() => setOpenUploadDialog(false)}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                        disabled={uploading}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUploadConfirm}
                        disabled={uploading}
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
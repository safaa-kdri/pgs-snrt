// src/components/rh/GenerateConvention.jsx
// ✅ CORRECTION : Signature avec positionnement manuel sur le PDF

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
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Divider,
    Slider,
    TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Download,
    Description,
    ArrowBack,
    CheckCircle,
    Visibility,
    PictureAsPdf,
    Send,
    Edit,
    Add,
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

const StyledCard = styled(Card)({
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'DeposeeEtudiant': { bg: '#fef3c7', text: '#d97706' },
        'SigneeRH': { bg: '#dbeafe', text: '#1d4ed8' },
        'EnvoyeeEtudiant': { bg: '#d1fae5', text: '#065f46' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
        'NonGeneree': { bg: '#f3f4f6', text: '#6b7280' },
    };
    const color = colors[status] || colors['DeposeeEtudiant'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
    };
});

const PDFPreview = styled(Box)({
    border: '1px solid #eef1f3',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    backgroundColor: '#fafbfc',
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    '& img': {
        maxWidth: '100%',
        maxHeight: '400px',
        objectFit: 'contain',
    },
});

const SignatureDropZone = styled(Box)({
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    padding: '20px',
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

const GenerateConvention = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [conventions, setConventions] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);

    // États pour la signature
    const [signatureData, setSignatureData] = useState(null);
    const [signatureLoaded, setSignatureLoaded] = useState(false);

    // États pour le positionnement sur le PDF
    const [openSignDialog, setOpenSignDialog] = useState(false);
    const [selectedConvention, setSelectedConvention] = useState(null);
    const [signatureX, setSignatureX] = useState(50);
    const [signatureY, setSignatureY] = useState(280);
    const [signatureWidth, setSignatureWidth] = useState(150);
    const [signatureHeight, setSignatureHeight] = useState(60);
    const [pageNumber, setPageNumber] = useState(0);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
    const [signatureImage, setSignatureImage] = useState(null);

    useEffect(() => {
        fetchSignature();
    }, []);

    useEffect(() => {
        fetchConventions();
    }, []);

    // ✅ Récupérer la signature depuis le backend
    const fetchSignature = async () => {
        try {
            const response = await api.get('/users/signature');
            if (response.data?.signature) {
                setSignatureData(response.data.signature);
                setSignatureLoaded(true);
                // Charger l'image pour la prévisualisation
                const img = new Image();
                img.src = response.data.signature;
                img.onload = () => setSignatureImage(img);
            } else {
                setSignatureLoaded(false);
            }
        } catch (error) {
            setSignatureLoaded(false);
        }
    };

    // ✅ Récupérer les conventions déposées
    const fetchConventions = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/users/conventions');
            const data = response.data?.data || [];
            setConventions(data);
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors du chargement des conventions');
            setConventions([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'DeposeeEtudiant': 'Déposée par l\'étudiant',
            'SigneeRH': 'Signée par RH',
            'EnvoyeeEtudiant': 'Envoyée à l\'étudiant',
            'Cloturee': 'Clôturée',
            'NonGeneree': 'Non générée',
        };
        return labels[status] || status;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const buildFileHref = (file) => {
        if (!file) return null;
        const apiRoot = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
        if (file.gridFsId) {
            return `${apiRoot}/api/v1/documents/file/${file.gridFsId}`;
        }
        if (file.url) {
            if (file.url.startsWith('/')) return `${apiRoot}${file.url}`;
            return file.url;
        }
        if (file.chemin) {
            if (file.chemin.startsWith('/')) return `${apiRoot}${file.chemin}`;
            return file.chemin;
        }
        return null;
    };

    const handleViewConvention = (convention) => {
        const href = buildFileHref(convention.convention);
        if (href) {
            window.open(href, '_blank');
        } else {
            setError('Impossible de visualiser cette convention');
        }
    };

    // ✅ Télécharger la convention
    const handleDownloadConvention = async (convention) => {
        try {
            const response = await api.get(`/users/convention/${convention._id}/download`, {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Convention_${convention.etudiantId?.nom || 'stage'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setError('Erreur lors du téléchargement');
        }
    };

    // ✅ Ouvrir le dialogue de signature avec le PDF
    const handleOpenSignDialog = async (convention) => {
        if (!signatureLoaded || !signatureData) {
            setError('La signature n\'est pas disponible. Veuillez contacter l\'administrateur.');
            return;
        }

        setSelectedConvention(convention);
        setOpenSignDialog(true);

        // Charger le PDF pour prévisualisation
        try {
            const response = await api.get(`/users/convention/${convention._id}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            setPdfPreviewUrl(url);
        } catch (error) {
            setError('Erreur lors du chargement du PDF');
        }
    };

    // ✅ Fermer le dialogue
    const handleCloseDialog = () => {
        setOpenSignDialog(false);
        setError('');
        setPdfPreviewUrl(null);
    };

    // ✅ Appliquer la signature avec la position choisie
    const handleApplySignature = async () => {
        if (!selectedConvention) return;

        setActionLoading(true);
        try {
            // Envoyer la position de la signature
            const response = await api.put(`/users/convention/${selectedConvention._id}/signer`, {
                signature: signatureData,
                position: {
                    x: signatureX,
                    y: signatureY,
                    width: signatureWidth,
                    height: signatureHeight,
                    page: pageNumber || 0
                }
            });

            setSuccess('✅ Convention signée avec succès !');
            setOpenSignDialog(false);
            await fetchConventions();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la signature');
        } finally {
            setActionLoading(false);
        }
    };

    // ✅ Générer le PDF signé
    const handleSignPDF = async (convention) => {
        try {
            setActionLoading(true);
            const response = await api.get(`/users/convention/${convention._id}/sign-pdf`, {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Convention_Signee_${convention.etudiantId?.nom || 'stage'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            setSuccess('✅ PDF signé généré avec succès !');
            setTimeout(() => setSuccess(''), 3000);
            await fetchConventions();
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la signature du PDF');
        } finally {
            setActionLoading(false);
        }
    };

    // ✅ Envoyer la convention à l'étudiant
    const handleSendToStudent = async (convention) => {
        if (!window.confirm('Envoyer la convention signée à l\'étudiant ?')) return;

        setActionLoading(true);
        try {
            const response = await api.put(`/users/convention/${convention._id}/envoyer-etudiant`);
            setSuccess('✅ Convention envoyée à l\'étudiant avec succès');
            await fetchConventions();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de l\'envoi');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && conventions.length === 0) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={44} sx={{ color: '#2d3748' }} />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        📄 Gestion des conventions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {conventions.length} convention(s) déposée(s) par les étudiants
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

            <StyledCard>
                <CardContent sx={{ p: 3 }}>
                    {conventions.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Description sx={{ fontSize: 48, color: '#d1d5db' }} />
                            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                                Aucune convention déposée
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Les conventions apparaîtront ici lorsque les étudiants les déposeront.
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Étudiant</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Stage</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Date de dépôt</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {conventions.map((conv) => {
                                        const status = conv.convention?.statut || 'NonGeneree';
                                        const isDeposee = status === 'DeposeeEtudiant';
                                        const isSignee = status === 'SigneeRH';
                                        const isEnvoyee = status === 'EnvoyeeEtudiant' || status === 'Cloturee';

                                        return (
                                            <TableRow key={conv._id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {conv.etudiantId?.prenom || ''} {conv.etudiantId?.nom || ''}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {conv.etudiantId?.email || ''}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {conv.offreId?.titre || 'Stage sans titre'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {conv.offreId?.typeStage || ''}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {formatDate(conv.convention?.dateDepot)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusChip
                                                        label={getStatusLabel(status)}
                                                        status={status}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                                                        {/* Voir */}
                                                        <Tooltip title="Voir la convention">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewConvention(conv)}
                                                                sx={{ color: '#2d3748' }}
                                                            >
                                                                <Visibility fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        {/* Télécharger */}
                                                        {conv.convention && (
                                                            <Tooltip title="Télécharger">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDownloadConvention(conv)}
                                                                    sx={{ color: '#2d3748' }}
                                                                >
                                                                    <Download fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}

                                                        {/* Signer - uniquement si DeposeeEtudiant */}
                                                        {isDeposee && (
                                                            <>
                                                                <Tooltip title="Signer la convention">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleOpenSignDialog(conv)}
                                                                        sx={{ color: '#1d4ed8' }}
                                                                    >
                                                                        <Edit fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        )}

                                                        {/* Générer PDF signé - si SigneeRH */}
                                                        {isSignee && (
                                                            <Tooltip title="Générer le PDF signé">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleSignPDF(conv)}
                                                                    sx={{ color: '#0b7890' }}
                                                                >
                                                                    <PictureAsPdf fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}

                                                        {/* Envoyer à l'étudiant - si SigneeRH */}
                                                        {isSignee && (
                                                            <Tooltip title="Envoyer à l'étudiant">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleSendToStudent(conv)}
                                                                    sx={{ color: '#065f46' }}
                                                                >
                                                                    <Send fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}

                                                        {/* Déjà envoyée */}
                                                        {isEnvoyee && (
                                                            <Tooltip title="Convention envoyée">
                                                                <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </StyledCard>

            {/* DIALOGUE DE SIGNATURE AVEC POSITIONNEMENT */}
            <Dialog
                open={openSignDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', padding: '8px' } }}
            >
                <DialogTitle>✍️ Signer la convention</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Positionnez votre signature sur le PDF de{' '}
                        <strong>
                            {selectedConvention?.etudiantId?.prenom || ''} {selectedConvention?.etudiantId?.nom || ''}
                        </strong>
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {/* Aperçu du PDF */}
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                        📄 Aperçu du PDF
                    </Typography>
                    <PDFPreview>
                        {pdfPreviewUrl ? (
                            <object
                                data={pdfPreviewUrl}
                                type="application/pdf"
                                width="100%"
                                height="400px"
                            >
                                <embed src={pdfPreviewUrl} type="application/pdf" width="100%" height="400px" />
                            </object>
                        ) : (
                            <CircularProgress size={32} sx={{ color: '#148aa0' }} />
                        )}
                    </PDFPreview>

                    <Divider sx={{ my: 2 }} />

                    {/* Positionnement de la signature */}
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                        🖱️ Position de la signature
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <Typography variant="caption" fontWeight={500}>Position X (px)</Typography>
                            <Slider
                                value={signatureX}
                                onChange={(e, val) => setSignatureX(val)}
                                min={10}
                                max={500}
                                step={5}
                                valueLabelDisplay="auto"
                                sx={{ mt: 1 }}
                            />
                            <TextField
                                size="small"
                                type="number"
                                value={signatureX}
                                onChange={(e) => setSignatureX(Number(e.target.value))}
                                sx={{ width: '100%', mt: 1 }}
                            />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: '200px' }}>
                            <Typography variant="caption" fontWeight={500}>Position Y (px)</Typography>
                            <Slider
                                value={signatureY}
                                onChange={(e, val) => setSignatureY(val)}
                                min={50}
                                max={600}
                                step={5}
                                valueLabelDisplay="auto"
                                sx={{ mt: 1 }}
                            />
                            <TextField
                                size="small"
                                type="number"
                                value={signatureY}
                                onChange={(e) => setSignatureY(Number(e.target.value))}
                                sx={{ width: '100%', mt: 1 }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
                        <Box sx={{ flex: 1, minWidth: '150px' }}>
                            <Typography variant="caption" fontWeight={500}>Largeur (px)</Typography>
                            <Slider
                                value={signatureWidth}
                                onChange={(e, val) => setSignatureWidth(val)}
                                min={80}
                                max={300}
                                step={5}
                                valueLabelDisplay="auto"
                                sx={{ mt: 1 }}
                            />
                            <TextField
                                size="small"
                                type="number"
                                value={signatureWidth}
                                onChange={(e) => setSignatureWidth(Number(e.target.value))}
                                sx={{ width: '100%', mt: 1 }}
                            />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: '150px' }}>
                            <Typography variant="caption" fontWeight={500}>Hauteur (px)</Typography>
                            <Slider
                                value={signatureHeight}
                                onChange={(e, val) => setSignatureHeight(val)}
                                min={30}
                                max={120}
                                step={5}
                                valueLabelDisplay="auto"
                                sx={{ mt: 1 }}
                            />
                            <TextField
                                size="small"
                                type="number"
                                value={signatureHeight}
                                onChange={(e) => setSignatureHeight(Number(e.target.value))}
                                sx={{ width: '100%', mt: 1 }}
                            />
                        </Box>
                    </Box>

                    {/* Aperçu de la signature */}
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#f7f7f7', borderRadius: '8px' }}>
                        <Typography variant="caption" fontWeight={500}>Aperçu de la signature :</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                            <img 
                                src={signatureData} 
                                alt="Signature RH" 
                                style={{ 
                                    maxWidth: `${signatureWidth}px`, 
                                    maxHeight: `${signatureHeight}px`, 
                                    objectFit: 'contain',
                                    border: '1px dashed #d1d5db',
                                    padding: '4px'
                                }}
                            />
                        </Box>
                    </Box>

                    <Alert severity="info" sx={{ mt: 2, borderRadius: '8px' }}>
                        <Typography variant="body2">
                            <strong>💡 Astuce :</strong> Utilisez les curseurs pour positionner la signature sur le PDF. 
                            La position par défaut est en bas à gauche.
                        </Typography>
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                        onClick={handleCloseDialog}
                        sx={{ textTransform: 'none' }}
                        disabled={actionLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApplySignature}
                        disabled={actionLoading || !signatureLoaded}
                        sx={{
                            backgroundColor: '#1d4ed8',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#1e40af' },
                        }}
                    >
                        {actionLoading ? <CircularProgress size={20} color="inherit" /> : '✅ Appliquer la signature'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GenerateConvention;
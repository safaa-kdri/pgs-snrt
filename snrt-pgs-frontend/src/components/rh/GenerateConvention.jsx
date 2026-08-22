// src/components/rh/GenerateConvention.jsx
// ✅ CORRECTION : Endpoints API corrigés (/rh/convention/...)
// ✅ AJOUT : Récupération de la signature depuis le backend

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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Download,
    Description,
    ArrowBack,
    CheckCircle,
    Visibility,
    PictureAsPdf,
    InsertDriveFile,
    Send,
    Edit,
    Refresh,
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

const SignaturePreview = styled(Box)({
    border: '2px solid #eef1f3',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    backgroundColor: '#fafbfc',
    '& img': {
        maxWidth: '200px',
        maxHeight: '80px',
        objectFit: 'contain',
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
    const [openSignDialog, setOpenSignDialog] = useState(false);
    const [selectedConvention, setSelectedConvention] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // État pour la signature
    const [signatureData, setSignatureData] = useState(null);
    const [signatureLoaded, setSignatureLoaded] = useState(false);

    useEffect(() => {
        fetchSignature();
    }, []);

    useEffect(() => {
        fetchConventions();
    }, []);

    // ✅ Récupérer la signature depuis le backend
    const fetchSignature = async () => {
        console.log('🔍 [fetchSignature] Récupération de la signature');
        try {
            const response = await api.get('/rh/signature');
            if (response.data?.signature) {
                setSignatureData(response.data.signature);
                setSignatureLoaded(true);
                console.log('✅ [fetchSignature] Signature chargée avec succès');
            } else {
                console.warn('⚠️ [fetchSignature] Aucune signature trouvée');
                setSignatureLoaded(false);
            }
        } catch (error) {
            console.error('❌ [fetchSignature] Erreur:', error);
            setSignatureLoaded(false);
        }
    };

    // ✅ Récupérer les conventions déposées
    const fetchConventions = async () => {
        console.log('🔍 [fetchConventions] Début');
        setLoading(true);
        setError('');
        try {
            // ✅ ENDPOINT CORRIGÉ
            const response = await api.get('/rh/conventions');
            console.log('🔍 [fetchConventions] Réponse reçue:', response.data);
            const data = response.data?.data || [];
            console.log('🔍 [fetchConventions] Conventions trouvées:', data.length);
            setConventions(data);
        } catch (error) {
            console.error('❌ Erreur chargement conventions:', error);
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
        console.log('🔍 [handleViewConvention] Convention:', convention);
        const href = buildFileHref(convention.convention);
        if (href) {
            window.open(href, '_blank');
        } else {
            setError('Impossible de visualiser cette convention');
        }
    };

    // ✅ Télécharger la convention
    const handleDownloadConvention = async (convention) => {
        console.log('🔍 [handleDownloadConvention] Convention ID:', convention._id);
        try {
            // ✅ ENDPOINT CORRIGÉ
            const response = await api.get(`/rh/convention/${convention._id}/download`, {
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
            console.log('✅ [handleDownloadConvention] Téléchargement réussi');
        } catch (error) {
            console.error('❌ Erreur téléchargement:', error);
            setError('Erreur lors du téléchargement');
        }
    };

    // ✅ Signer la convention
    const handleSignConvention = async () => {
        if (!selectedConvention) return;
        if (!signatureData) {
            setError('Signature non disponible');
            return;
        }

        console.log('🔍 [handleSignConvention] Convention ID:', selectedConvention._id);
        setActionLoading(true);
        try {
            // ✅ ENDPOINT CORRIGÉ
            const response = await api.put(`/rh/convention/${selectedConvention._id}/signer`, {
                signature: signatureData
            });
            console.log('✅ [handleSignConvention] Réponse:', response.data);
            setSuccess('✅ Convention signée avec succès');
            setOpenSignDialog(false);
            await fetchConventions();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('❌ Erreur signature:', error);
            setError(error.response?.data?.message || 'Erreur lors de la signature');
        } finally {
            setActionLoading(false);
        }
    };

    // ✅ Générer le PDF signé
    const handleSignPDF = async (convention) => {
        try {
            setActionLoading(true);
            // ✅ ENDPOINT CORRIGÉ
            const response = await api.get(`/rh/convention/${convention._id}/sign-pdf`, {
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
            console.error('❌ Erreur signature PDF:', error);
            setError(error.response?.data?.message || 'Erreur lors de la signature du PDF');
        } finally {
            setActionLoading(false);
        }
    };

    // ✅ Envoyer la convention à l'étudiant
    const handleSendToStudent = async (convention) => {
        if (!window.confirm('Envoyer la convention signée à l\'étudiant ?')) return;

        console.log('🔍 [handleSendToStudent] Convention ID:', convention._id);
        setActionLoading(true);
        try {
            // ✅ ENDPOINT CORRIGÉ
            const response = await api.put(`/rh/convention/${convention._id}/envoyer-etudiant`);
            console.log('✅ [handleSendToStudent] Réponse:', response.data);
            setSuccess('✅ Convention envoyée à l\'étudiant avec succès');
            await fetchConventions();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('❌ Erreur envoi:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'envoi');
        } finally {
            setActionLoading(false);
        }
    };

    // ✅ Ouvrir le dialogue de signature
    const handleOpenSignDialog = (convention) => {
        console.log('🔍 [handleOpenSignDialog] Convention sélectionnée:', convention);
        if (!signatureLoaded || !signatureData) {
            setError('La signature n\'est pas disponible. Veuillez réessayer.');
            return;
        }
        setSelectedConvention(convention);
        setOpenSignDialog(true);
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchConventions}
                        disabled={loading}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Rafraîchir
                    </Button>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/rh')}
                        sx={{ color: '#6b7280', textTransform: 'none' }}
                    >
                        Retour
                    </Button>
                </Box>
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
                                        const isNonGeneree = status === 'NonGeneree';

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
                                                                <Tooltip title="Générer le PDF signé">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleSignPDF(conv)}
                                                                        sx={{ color: '#0b7890' }}
                                                                    >
                                                                        <PictureAsPdf fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        )}

                                                        {/* Envoyer à l'étudiant - uniquement si SigneeRH */}
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

                                                        {/* Non générée */}
                                                        {isNonGeneree && (
                                                            <Tooltip title="Convention non générée">
                                                                <Box sx={{ color: '#6b7280', fontSize: 12, display: 'flex', alignItems: 'center' }}>
                                                                    En attente
                                                                </Box>
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

            {/* DIALOGUE DE SIGNATURE */}
            <Dialog
                open={openSignDialog}
                onClose={() => {
                    setOpenSignDialog(false);
                    setError('');
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', padding: '8px' } }}
            >
                <DialogTitle>✍️ Signer la convention</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Vous êtes sur le point de signer la convention de{' '}
                        <strong>
                            {selectedConvention?.etudiantId?.prenom || ''} {selectedConvention?.etudiantId?.nom || ''}
                        </strong>
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                        Signature RH :
                    </Typography>
                    
                    {signatureLoaded && signatureData ? (
                        <SignaturePreview>
                            <img src={signatureData} alt="Signature RH" />
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                Signature de {user?.prenom || ''} {user?.nom || ''}
                            </Typography>
                        </SignaturePreview>
                    ) : (
                        <Alert severity="warning" sx={{ borderRadius: '8px' }}>
                            La signature n'est pas disponible. Veuillez contacter l'administrateur.
                        </Alert>
                    )}
                    
                    <Alert severity="info" sx={{ mt: 2, borderRadius: '8px' }}>
                        <Typography variant="body2">
                            <strong>Information :</strong> La signature sera appliquée sur le PDF original.
                        </Typography>
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => {
                            setOpenSignDialog(false);
                            setError('');
                        }}
                        sx={{ textTransform: 'none' }}
                        disabled={actionLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSignConvention}
                        disabled={actionLoading || !signatureLoaded}
                        sx={{
                            backgroundColor: '#1d4ed8',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#1e40af' },
                        }}
                    >
                        {actionLoading ? <CircularProgress size={20} color="inherit" /> : '✍️ Signer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GenerateConvention;
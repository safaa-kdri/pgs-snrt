// src/components/rh/GenerateConvention.jsx
import React, { useState, useEffect, useRef } from 'react';
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
    Grid,
    TextField,
    Divider,
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
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    Download,
    Description,
    ArrowBack,
    CheckCircle,
    Visibility,
    Send,
    Edit,
    Cancel,
    PictureAsPdf,
    InsertDriveFile,
    Refresh,
    Clear,
    Save,
    Person,
    Business,
    CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import SignatureCanvas from 'react-signature-canvas';

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

const PrimaryButton = styled(Button)({
    backgroundColor: '#2d3748',
    color: '#ffffff',
    borderRadius: '10px',
    textTransform: 'none',
    padding: '8px 20px',
    '&:hover': { backgroundColor: '#1a202c' },
    '&:disabled': { backgroundColor: '#999999' },
});

const SignatureBox = styled(Box)({
    border: '2px solid #d1d5db',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#148aa0',
    },
    '&.active': {
        borderColor: '#148aa0',
        boxShadow: '0 0 0 3px rgba(20, 138, 160, 0.1)',
    }
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const GenerateConvention = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const sigCanvas = useRef(null);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [conventions, setConventions] = useState([]);
    const [selectedConvention, setSelectedConvention] = useState(null);
    const [signDialogOpen, setSignDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
    const [signatureData, setSignatureData] = useState(null);
    const [signatureInfo, setSignatureInfo] = useState({
        nom: '',
        fonction: '',
        date: new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }),
        societe: 'SNRT'
    });

    useEffect(() => {
        fetchConventions();
        setSignatureInfo(prev => ({
            ...prev,
            date: new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }));
    }, []);

    const fetchConventions = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/internships/conventions/deposees');
            const data = response.data?.data || [];
            setConventions(data);
        } catch (error) {
            console.error('Erreur chargement conventions:', error);
            setError('Erreur lors du chargement des conventions');
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

    const getFileIcon = (file) => {
        if (!file) return <InsertDriveFile />;
        const name = file.nomOriginal || file.nom || '';
        const ext = name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') {
            return <PictureAsPdf sx={{ color: '#ef4444' }} />;
        }
        return <InsertDriveFile />;
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

    const handleOpenSignDialog = (convention) => {
        setSelectedConvention(convention);
        setSignatureData(null);
        setIsSignatureEmpty(true);
        setSignatureInfo({
            ...signatureInfo,
            nom: user?.prenom + ' ' + user?.nom || '',
            fonction: 'Responsable RH',
            societe: 'SNRT'
        });
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
        setSignDialogOpen(true);
    };

    const handleCloseSignDialog = () => {
        setSignDialogOpen(false);
        setSelectedConvention(null);
        setSignatureData(null);
        setIsSignatureEmpty(true);
    };

    const handleClearSignature = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
            setIsSignatureEmpty(true);
            setSignatureData(null);
        }
    };

    const handleBeginSignature = () => {};

    const handleEndSignature = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            setIsSignatureEmpty(false);
        } else {
            setIsSignatureEmpty(true);
        }
    };

    const handleSaveSignature = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            const signatureImage = sigCanvas.current.toDataURL('image/png');
            
            const completeSignature = {
                signature: signatureImage,
                nom: signatureInfo.nom || 'Signature',
                fonction: signatureInfo.fonction || 'Responsable',
                date: signatureInfo.date,
                societe: signatureInfo.societe,
                timestamp: new Date().toISOString()
            };
            
            setSignatureData(completeSignature);
            setIsSignatureEmpty(false);
        }
    };

    // ✅ SIGNER ET ENVOYER AUTOMATIQUEMENT À L'ÉTUDIANT
    const handleSignAndSend = async () => {
        if (!signatureData) {
            setError('Veuillez dessiner votre signature et la valider');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            // 1. Signer la convention
            await api.post(`/internships/conventions/${selectedConvention._id}/sign`, {
                signature: signatureData.signature,
                signatureComplete: signatureData
            });

            // 2. ✅ Envoyer automatiquement à l'étudiant
            await api.post(`/internships/conventions/${selectedConvention._id}/send-to-student`);

            setSuccess('✅ Convention signée et envoyée à l\'étudiant avec succès');
            handleCloseSignDialog();
            fetchConventions();
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.response?.data?.message || 'Erreur lors de la signature ou de l\'envoi');
        } finally {
            setProcessing(false);
        }
    };

    const renderSignaturePreview = () => {
        if (!signatureData) return null;

        return (
            <Box sx={{ 
                mt: 3, 
                p: 2, 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                position: 'relative'
            }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: '#22c55e', fontSize: 18 }} />
                    Signature validée
                </Typography>
                
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    p: 2,
                    border: '2px solid #148aa0',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff'
                }}>
                    <Box sx={{ 
                        border: '2px solid #148aa0',
                        borderRadius: '50%',
                        width: 70,
                        height: 70,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        backgroundColor: 'rgba(20, 138, 160, 0.05)'
                    }}>
                        <Typography variant="caption" fontWeight={700} color="#148aa0" textAlign="center">
                            {signatureInfo.societe}
                        </Typography>
                    </Box>

                    <img 
                        src={signatureData.signature} 
                        alt="Signature" 
                        style={{ maxHeight: '60px', maxWidth: '100%' }} 
                    />

                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                            {signatureInfo.nom || 'Signature'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {signatureInfo.fonction || 'Responsable'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {signatureInfo.societe} • {signatureInfo.date}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    };

    if (loading) {
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
                        Gestion des conventions
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
                                    {conventions.map((conv) => (
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
                                                    label={getStatusLabel(conv.convention?.statut)}
                                                    status={conv.convention?.statut}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    <Tooltip title="Voir la convention">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewConvention(conv)}
                                                            sx={{ color: '#2d3748' }}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    {conv.convention?.statut === 'DeposeeEtudiant' && (
                                                        <Tooltip title="Signer la convention">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleOpenSignDialog(conv)}
                                                                sx={{ color: '#22c55e' }}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}

                                                    {conv.convention?.statut === 'EnvoyeeEtudiant' && (
                                                        <Tooltip title="Convention envoyée">
                                                            <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </StyledCard>

            {/* ===== DIALOG SIGNATURE AVEC ENVOI AUTOMATIQUE ===== */}
            <Dialog
                open={signDialogOpen}
                onClose={handleCloseSignDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Edit sx={{ color: '#2d3748' }} />
                        Signature électronique
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Dessinez votre signature pour valider la convention de
                        <strong> {selectedConvention?.etudiantId?.prenom || ''} {selectedConvention?.etudiantId?.nom || ''}</strong>.
                        <br />
                        <em style={{ color: '#148aa0' }}>La convention sera automatiquement envoyée à l'étudiant après signature.</em>
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Nom du signataire *"
                                value={signatureInfo.nom}
                                onChange={(e) => setSignatureInfo({ ...signatureInfo, nom: e.target.value })}
                                size="small"
                                fullWidth
                                placeholder="Ex: Dr. Karim BENNANI"
                                InputProps={{
                                    startAdornment: <Person sx={{ color: '#999', fontSize: 18, mr: 1 }} />
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Fonction *"
                                value={signatureInfo.fonction}
                                onChange={(e) => setSignatureInfo({ ...signatureInfo, fonction: e.target.value })}
                                size="small"
                                fullWidth
                                placeholder="Ex: Responsable RH"
                                InputProps={{
                                    startAdornment: <Business sx={{ color: '#999', fontSize: 18, mr: 1 }} />
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Société"
                                value={signatureInfo.societe}
                                onChange={(e) => setSignatureInfo({ ...signatureInfo, societe: e.target.value })}
                                size="small"
                                fullWidth
                                InputProps={{
                                    startAdornment: <Business sx={{ color: '#999', fontSize: 18, mr: 1 }} />
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Date"
                                value={signatureInfo.date}
                                size="small"
                                fullWidth
                                disabled
                                InputProps={{
                                    startAdornment: <CalendarToday sx={{ color: '#999', fontSize: 18, mr: 1 }} />
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Dessinez votre signature (utilisez la souris ou le doigt) :
                    </Typography>
                    
                    <SignatureBox className={!isSignatureEmpty ? 'active' : ''}>
                        <SignatureCanvas
                            ref={sigCanvas}
                            canvasProps={{
                                width: 500,
                                height: 150,
                                className: 'sigCanvas',
                                style: { width: '100%', height: '100%', cursor: 'crosshair' }
                            }}
                            onBegin={handleBeginSignature}
                            onEnd={handleEndSignature}
                            backgroundColor="#ffffff"
                            penColor="#1a2332"
                            dotSize={2}
                            minWidth={1}
                            maxWidth={3}
                        />
                    </SignatureBox>

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Clear />}
                            onClick={handleClearSignature}
                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                        >
                            Effacer
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Save />}
                            onClick={handleSaveSignature}
                            disabled={isSignatureEmpty}
                            sx={{
                                backgroundColor: '#148aa0',
                                borderRadius: '8px',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#0b7890' },
                                '&:disabled': { backgroundColor: '#a0c4cd' }
                            }}
                        >
                            Valider la signature
                        </Button>
                    </Box>

                    {renderSignaturePreview()}

                    {signatureData && (
                        <Alert severity="success" sx={{ mt: 2, borderRadius: '10px' }}>
                            ✅ Signature validée - Cliquez sur "Signer et envoyer" pour finaliser
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseSignDialog}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                        disabled={processing}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSignAndSend}
                        disabled={!signatureData || processing}
                        sx={{
                            backgroundColor: '#22c55e',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#16a34a' },
                            '&:disabled': { backgroundColor: '#999999' }
                        }}
                    >
                        {processing ? <CircularProgress size={20} color="inherit" /> : '✅ Signer et envoyer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GenerateConvention;
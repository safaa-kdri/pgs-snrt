// src/components/rh/GenerateConvention.jsx
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

const SuccessButton = styled(Button)({
    backgroundColor: '#22c55e',
    color: '#ffffff',
    borderRadius: '10px',
    textTransform: 'none',
    padding: '8px 20px',
    '&:hover': { backgroundColor: '#16a34a' },
    '&:disabled': { backgroundColor: '#999999' },
});

const OutlinedButton = styled(Button)({
    borderRadius: '10px',
    borderColor: '#d0d4d8',
    color: '#6b7280',
    textTransform: 'none',
    padding: '8px 20px',
    '&:hover': {
        borderColor: '#2d3748',
        backgroundColor: alpha('#2d3748', 0.04),
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
    const [selectedConvention, setSelectedConvention] = useState(null);
    const [signDialogOpen, setSignDialogOpen] = useState(false);
    const [signature, setSignature] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchConventions();
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
        setSignature('');
        setSignDialogOpen(true);
    };

    const handleCloseSignDialog = () => {
        setSignDialogOpen(false);
        setSelectedConvention(null);
        setSignature('');
    };

    const handleSignConvention = async () => {
        if (!signature.trim()) {
            setError('Veuillez saisir votre signature');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            await api.post(`/internships/conventions/${selectedConvention._id}/sign`, {
                signature: signature,
            });

            setSuccess('Convention signée avec succès');
            handleCloseSignDialog();
            fetchConventions();
        } catch (error) {
            console.error('Erreur signature:', error);
            setError(error.response?.data?.message || 'Erreur lors de la signature');
        } finally {
            setProcessing(false);
        }
    };

    const handleSendToStudent = async (convention) => {
        if (!window.confirm(`Envoyer la convention signée à ${convention.etudiantId?.prenom || ''} ${convention.etudiantId?.nom || ''} ?`)) {
            return;
        }

        setProcessing(true);
        setError('');

        try {
            await api.post(`/internships/conventions/${convention._id}/send-to-student`);

            setSuccess('Convention envoyée à l\'étudiant avec succès');
            fetchConventions();
        } catch (error) {
            console.error('Erreur envoi:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'envoi');
        } finally {
            setProcessing(false);
        }
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

                                                    {conv.convention?.statut === 'SigneeRH' && (
                                                        <Tooltip title="Envoyer à l'étudiant">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleSendToStudent(conv)}
                                                                sx={{ color: '#1d4ed8' }}
                                                            >
                                                                <Send fontSize="small" />
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

            {/* ===== DIALOG SIGNATURE ===== */}
            <Dialog
                open={signDialogOpen}
                onClose={handleCloseSignDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Edit sx={{ color: '#2d3748' }} />
                        Signer la convention
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Saisissez votre signature électronique pour valider la convention de
                        <strong> {selectedConvention?.etudiantId?.prenom || ''} {selectedConvention?.etudiantId?.nom || ''}</strong>.
                    </Typography>
                    <TextField
                        label="Signature *"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Ex: Dr. Karim BENNANI, Responsable RH"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                    <Alert severity="info" sx={{ mt: 2, borderRadius: '10px' }}>
                        Cette signature sera apposée sur la convention avant envoi à l'étudiant.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseSignDialog}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                        disabled={processing}
                    >
                        Annuler
                    </Button>
                    <PrimaryButton
                        onClick={handleSignConvention}
                        disabled={processing || !signature.trim()}
                    >
                        {processing ? <CircularProgress size={20} color="inherit" /> : 'Signer'}
                    </PrimaryButton>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GenerateConvention;
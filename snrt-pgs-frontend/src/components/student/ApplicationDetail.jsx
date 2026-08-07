// src/components/student/ApplicationDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Chip,
    Button,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Tooltip,
    Divider,
    Tabs,
    Tab,
    Card,
    CardContent,
    TextField,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Description,
    CheckCircle,
    Pending,
    Download,
    Timeline,
    Upload,
    PictureAsPdf,
    InsertDriveFile,
    Visibility,
    Send,
    Check,
    Cancel,
    FileCopy,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const DetailCard = styled(Paper)({
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    marginBottom: '24px',
});

const SectionTitle = styled(Typography)({
    fontSize: '18px',
    fontWeight: 700,
    color: '#1a2332',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'Brouillon': { bg: '#e5e7eb', text: '#6b7280' },
        'Soumise': { bg: '#dbeafe', text: '#1d4ed8' },
        'EnAnalyse': { bg: '#fef3c7', text: '#d97706' },
        'Entretien': { bg: '#f3e8ff', text: '#6b21a8' },
        'Acceptee': { bg: '#d1fae5', text: '#065f46' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors['Soumise'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 600,
        fontSize: '12px',
        height: '28px',
        padding: '0 14px',
    };
});

const StyledTabs = styled(Tabs)({
    '& .MuiTabs-indicator': {
        backgroundColor: '#148aa0',
        height: '3px',
    },
});

const StyledTab = styled(Tab)({
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '15px',
    fontFamily: 'Inter, sans-serif',
    minHeight: '48px',
    '&.Mui-selected': {
        color: '#148aa0',
    },
});

const DocumentCard = styled(Paper)({
    padding: '16px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #eef1f3',
    marginBottom: '12px',
    '&:hover': {
        backgroundColor: '#fafbfc',
    },
});

const ConventionStatusChip = styled(Chip)(({ statut }) => {
    const colors = {
        'NonGeneree': { bg: '#e5e7eb', text: '#6b7280' },
        'Generee': { bg: '#dbeafe', text: '#1d4ed8' },
        'EnvoyeeEtudiant': { bg: '#fef3c7', text: '#d97706' },
        'DeposeeEtudiant': { bg: '#f3e8ff', text: '#6b21a8' },
        'SigneeRH': { bg: '#dbeafe', text: '#1d4ed8' },
        'Validee': { bg: '#d1fae5', text: '#065f46' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
    };
    const color = colors[statut] || colors['NonGeneree'];
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

const ApplicationDetailStudent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const [internship, setInternship] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [conventionFile, setConventionFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // ✅ Vérifier si la convention doit être affichée
    const isEligibleForConvention = application?.statut === 'Acceptee' || internship?.statut === 'EnCours';

    useEffect(() => {
        fetchApplicationDetail();
    }, [id]);

    const fetchApplicationDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/applications/${id}`);
            let data = response.data.data || response.data;
            setApplication(data);

            // ✅ Récupérer le stage associé
            if (data._id) {
                try {
                    const stageRes = await api.get(`/internships/application/${data._id}`);
                    if (stageRes.data?.data) {
                        setInternship(stageRes.data.data);
                        
                        // ✅ Récupérer la convention si elle existe
                        if (stageRes.data.data.convention) {
                            setConventionFile(stageRes.data.data.convention);
                        }
                    }
                } catch (e) {
                    console.warn('Aucun stage associé:', e);
                }
            }

            // ✅ Ajouter historique par défaut
            if (data && (!data.historique || data.historique.length === 0)) {
                const defaultHistory = [];
                const isSubmitted = data.statut !== 'Brouillon';
                if (isSubmitted) {
                    defaultHistory.push({
                        date: data.dateSoumission || data.createdAt || new Date(),
                        action: 'Candidature soumise',
                        nouveauStatut: 'Soumise',
                        ancienStatut: 'Brouillon',
                        commentaire: 'Candidature soumise avec succès',
                    });
                }
                if (data.statut && data.statut !== 'Soumise' && data.statut !== 'Brouillon') {
                    defaultHistory.push({
                        date: data.updatedAt || new Date(),
                        action: `Candidature ${getStatusLabel(data.statut).toLowerCase()}`,
                        nouveauStatut: data.statut,
                        ancienStatut: 'Soumise',
                        commentaire: `Statut mis à jour : ${getStatusLabel(data.statut)}`,
                    });
                }
                if (defaultHistory.length > 0) {
                    data.historique = defaultHistory;
                }
            }

            setApplication(data);
        } catch (error) {
            console.error('Erreur chargement:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // FONCTIONS CONVENTION
    // ============================================

    const handleDownloadConvention = async () => {
        try {
            const response = await api.get(`/internships/${internship?._id}/convention/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Convention_Stage.pdf';
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            setError('Erreur lors du téléchargement de la convention');
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setOpenDialog(true);
        } else {
            setError('Veuillez sélectionner un fichier PDF');
        }
    };

    const handleUploadConvention = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('convention', selectedFile);

            const response = await api.post(
                `/internships/${internship?._id}/convention/depot`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data?.success) {
                setSuccess('✅ Convention déposée avec succès !');
                setConventionFile(response.data.data);
                setOpenDialog(false);
                setSelectedFile(null);
                // Rafraîchir les données
                fetchApplicationDetail();
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            setError(error.response?.data?.message || 'Erreur lors du dépôt de la convention');
        } finally {
            setUploading(false);
        }
    };

    const getConventionStatusLabel = (statut) => {
        const labels = {
            'NonGeneree': 'Non générée',
            'Generee': 'Générée par le RH',
            'EnvoyeeEtudiant': 'Envoyée à l\'étudiant',
            'DeposeeEtudiant': 'Déposée par l\'étudiant',
            'SigneeRH': 'Signée par le RH',
            'Validee': 'Validée',
            'Cloturee': 'Clôturée',
        };
        return labels[statut] || statut;
    };

    const getConventionStatusIcon = (statut) => {
        switch (statut) {
            case 'Validee':
            case 'Cloturee':
                return <CheckCircle sx={{ color: '#22c55e' }} />;
            case 'DeposeeEtudiant':
                return <Pending sx={{ color: '#f59e0b' }} />;
            case 'SigneeRH':
                return <Check sx={{ color: '#1d4ed8' }} />;
            default:
                return <FileCopy sx={{ color: '#6b7280' }} />;
        }
    };

    // ============================================
    // FONCTIONS UTILITAIRES
    // ============================================

    const getStatusLabel = (status) => {
        const labels = {
            'Brouillon': 'Brouillon',
            'Soumise': 'Soumise',
            'EnAnalyse': 'En analyse',
            'Entretien': 'Entretien',
            'Acceptee': 'Acceptée',
            'Refusee': 'Refusée',
        };
        return labels[status] || status;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Non défini';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const buildFileHref = (doc) => {
        if (!doc) return null;
        const apiRoot = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
        if (doc.gridFsId) {
            return `${apiRoot}/api/v1/documents/file/${doc.gridFsId}`;
        }
        if (doc.url) {
            return doc.url.startsWith('/') ? `${apiRoot}${doc.url}` : doc.url;
        }
        if (doc.chemin) {
            return doc.chemin.startsWith('/') ? `${apiRoot}${doc.chemin}` : doc.chemin;
        }
        return null;
    };

    const handleDownloadDocument = (doc) => {
        if (!doc) return;
        const href = buildFileHref(doc);
        if (href) {
            window.open(href, '_blank');
        } else {
            setError('Impossible de télécharger ce document');
        }
    };

    // ============================================
    // RENDER ONGLETS
    // ============================================

    const renderHistorique = () => {
        const historique = application?.historique || [];
        return (
            <Box sx={{ position: 'relative', pl: 2 }}>
                {historique.length > 0 ? (
                    historique.map((item, idx) => {
                        let dotColor = '#148aa0';
                        const status = item.nouveauStatut || item.statut;
                        if (status === 'Acceptee') dotColor = '#22c55e';
                        else if (status === 'Refusee') dotColor = '#ef4444';
                        else if (status === 'Brouillon') dotColor = '#6b7280';
                        else if (status === 'Soumise') dotColor = '#1d4ed8';
                        else if (status === 'EnAnalyse') dotColor = '#f59e0b';
                        else if (status === 'Entretien') dotColor = '#8b5cf6';

                        return (
                            <Box key={idx} sx={{
                                display: 'flex',
                                gap: 2,
                                pb: 2.5,
                                borderLeft: idx < historique.length - 1 ? '2px solid #148aa0' : 'none',
                                ml: 1,
                                pl: 3,
                                position: 'relative'
                            }}>
                                <Box sx={{
                                    position: 'absolute',
                                    left: -6,
                                    top: 4,
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: dotColor,
                                    border: '2px solid white',
                                    boxShadow: '0 0 0 2px #148aa0',
                                }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight={600} color="#1a2332">
                                        {item.action || item.nouveauStatut || 'Mise à jour'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {formatDate(item.date || item.createdAt)}
                                    </Typography>
                                    {item.commentaire && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {item.commentaire}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        );
                    })
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                        Aucun historique disponible
                    </Typography>
                )}
            </Box>
        );
    };

    const renderDocuments = () => {
        const documents = application?.documents || [];
        return (
            <>
                {documents.length > 0 ? (
                    <List dense sx={{ p: 0 }}>
                        {documents.map((doc, idx) => (
                            <ListItem key={idx} sx={{
                                px: 0,
                                py: 1.5,
                                borderBottom: idx < documents.length - 1 ? '1px solid #f0f2f5' : 'none',
                                alignItems: 'flex-start'
                            }}>
                                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                    {doc.isVerified ? (
                                        <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
                                    ) : (
                                        <Pending sx={{ color: '#f59e0b', fontSize: 20 }} />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={doc.nomOriginal || doc.nom || 'Document'}
                                    secondary={
                                        <>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {doc.type || 'Non spécifié'} • {doc.isVerified ? 'Validé' : 'En attente'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {doc.dateUpload ? formatDate(doc.dateUpload) : 'Date non spécifiée'}
                                            </Typography>
                                        </>
                                    }
                                />
                                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                                    <Tooltip title="Télécharger">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDownloadDocument(doc)}
                                            sx={{ color: '#4f46e5' }}
                                        >
                                            <Download fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Description sx={{ fontSize: 48, color: '#d1d5db' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Aucun document déposé
                        </Typography>
                    </Box>
                )}
            </>
        );
    };

    // ✅ NOUVEAU : RENDER CONVENTION
    const renderConvention = () => {
        const convention = conventionFile || internship?.convention || {};
        const statut = convention.statut || 'NonGeneree';
        const isDeposee = statut === 'DeposeeEtudiant' || statut === 'SigneeRH' || statut === 'Validee' || statut === 'Cloturee';

        return (
            <Box>
                {/* Informations de la convention */}
                <Card sx={{ mb: 3, p: 2, backgroundColor: '#f7f8fa', borderRadius: '12px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getConventionStatusIcon(statut)}
                        <Box>
                            <Typography variant="body2" fontWeight={600}>
                                Statut : {getConventionStatusLabel(statut)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {statut === 'NonGeneree' && 'La convention n\'a pas encore été générée par le RH'}
                                {statut === 'Generee' && 'La convention a été générée, en attente d\'envoi'}
                                {statut === 'EnvoyeeEtudiant' && 'La convention vous a été envoyée, veuillez la signer et la déposer'}
                                {statut === 'DeposeeEtudiant' && 'Votre convention signée a été déposée, en attente de validation RH'}
                                {statut === 'SigneeRH' && 'La convention a été signée par le RH, en attente de validation finale'}
                                {statut === 'Validee' && '✅ Convention validée, vous pouvez la télécharger'}
                                {statut === 'Cloturee' && '🏁 Convention clôturée'}
                            </Typography>
                        </Box>
                    </Box>
                </Card>

                {/* Télécharger la convention (si générée) */}
                {(statut === 'Generee' || statut === 'EnvoyeeEtudiant' || statut === 'DeposeeEtudiant' || 
                  statut === 'SigneeRH' || statut === 'Validee' || statut === 'Cloturee') && (
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleDownloadConvention}
                        sx={{ mb: 2, borderRadius: '10px', textTransform: 'none' }}
                    >
                        Télécharger la convention
                    </Button>
                )}

                {/* Déposer la convention signée */}
                {statut === 'EnvoyeeEtudiant' && !isDeposee && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            📤 Déposer ma convention signée
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Téléchargez le PDF de votre convention signée.
                        </Typography>

                        <UploadZone onClick={() => document.getElementById('convention-upload')?.click()}>
                            <input
                                id="convention-upload"
                                type="file"
                                hidden
                                accept=".pdf"
                                onChange={handleFileSelect}
                            />
                            <Upload sx={{ fontSize: 40, color: '#148aa0' }} />
                            <Typography variant="body1" sx={{ mt: 1, color: '#1a2332' }}>
                                Cliquez pour sélectionner votre convention signée
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Format PDF uniquement, max 5MB
                            </Typography>
                        </UploadZone>
                    </>
                )}

                {/* Convention déposée */}
                {isDeposee && conventionFile && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            📄 Convention déposée
                        </Typography>
                        <DocumentCard>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <PictureAsPdf sx={{ color: '#ef4444', fontSize: 24 }} />
                                <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                        {conventionFile.nomOriginal || 'Convention_signee.pdf'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Déposé le {formatDate(conventionFile.dateDepot || conventionFile.dateUpload)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box>
                                <Tooltip title="Voir">
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            const href = buildFileHref(conventionFile);
                                            if (href) window.open(href, '_blank');
                                        }}
                                        sx={{ color: '#2d3748' }}
                                    >
                                        <Visibility fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Télécharger">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDownloadDocument(conventionFile)}
                                        sx={{ color: '#4f46e5' }}
                                    >
                                        <Download fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </DocumentCard>

                        {statut === 'Validee' && (
                            <Alert severity="success" sx={{ mt: 2, borderRadius: '10px' }}>
                                ✅ Votre convention a été validée par le RH. Vous pouvez la télécharger.
                            </Alert>
                        )}
                    </>
                )}

                {/* Message si non générée */}
                {statut === 'NonGeneree' && (
                    <Alert severity="info" sx={{ borderRadius: '10px' }}>
                        La convention de stage sera générée prochainement par le service RH.
                    </Alert>
                )}
            </Box>
        );
    };

    // ============================================
    // DIALOG CONFIRMATION UPLOAD
    // ============================================

    const renderUploadDialog = () => (
        <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: '16px', padding: '8px' } }}
        >
            <DialogTitle>📤 Confirmer le dépôt</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                    <PictureAsPdf sx={{ color: '#ef4444', fontSize: 40 }} />
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
                <Alert severity="info" sx={{ mt: 2, borderRadius: '10px' }}>
                    Vérifiez que le fichier est bien votre convention de stage signée.
                </Alert>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button
                    onClick={() => setOpenDialog(false)}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                    disabled={uploading}
                >
                    Annuler
                </Button>
                <Button
                    variant="contained"
                    onClick={handleUploadConvention}
                    disabled={uploading}
                    sx={{
                        backgroundColor: '#148aa0',
                        borderRadius: '10px',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#0b7890' },
                    }}
                >
                    {uploading ? 'Dépôt en cours...' : 'Déposer'}
                </Button>
            </DialogActions>
        </Dialog>
    );

    // ============================================
    // RENDER PRINCIPAL
    // ============================================

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={44} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    if (!application) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                    Candidature non trouvée
                </Alert>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/dashboard/applications')}
                    sx={{ mt: 2, textTransform: 'none' }}
                >
                    Retour à la liste
                </Button>
            </Container>
        );
    }

    const documents = application.documents || [];
    const isConventionVisible = isEligibleForConvention;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/dashboard/applications')}
                    sx={{ mb: 3, textTransform: 'none', color: '#666' }}
                >
                    Retour à la liste
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Suivi de candidature
                    </Typography>
                    <StatusChip label={getStatusLabel(application.statut)} status={application.statut} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {application.offreId?.titre || application.offre || 'Offre sans titre'}
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

            <Paper sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <StyledTabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    sx={{
                        borderBottom: '1px solid #e5e7eb',
                        px: 2,
                    }}
                >
                    <StyledTab
                        icon={<Timeline sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                        label="Avancement"
                    />
                    <StyledTab
                        icon={<Description sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                        label={`Documents (${documents.length})`}
                    />
                    {/* ✅ NOUVEAU TAB CONVENTION - Uniquement si éligible */}
                    {isConventionVisible && (
                        <StyledTab
                            icon={<FileCopy sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label="Convention"
                        />
                    )}
                </StyledTabs>

                <Box sx={{ p: 3 }}>
                    {tabValue === 0 && renderHistorique()}
                    {tabValue === 1 && renderDocuments()}
                    {/* ✅ NOUVEAU TAB CONVENTION */}
                    {tabValue === 2 && isConventionVisible && renderConvention()}
                </Box>
            </Paper>

            {/* Dialog upload */}
            {renderUploadDialog()}
        </Container>
    );
};

export default ApplicationDetailStudent;
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Description,
    CheckCircle,
    Pending,
    Download,
    Timeline,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

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

// ✅ STATUTS ALIGNÉS AVEC LE BACKEND
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

const ApplicationDetailStudent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [application, setApplication] = useState(null);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchApplicationDetail();
    }, [id]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const fetchApplicationDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/applications/${id}`);
            let data = response.data.data || response.data;
            
            if (data) {
                if (!data.historique || data.historique.length === 0) {
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
            }
            
            setApplication(data);
        } catch (error) {
            console.error('Erreur chargement candidature:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement de la candidature');
        } finally {
            setLoading(false);
        }
    };

    // ✅ STATUTS ALIGNÉS AVEC LE BACKEND
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

    const historique = application.historique || application.auditTrail || [];
    const documents = application.documents || [];

    const renderHistorique = () => (
        <Box sx={{ position: 'relative', pl: 2 }}>
            {historique.length > 0 ? (
                historique.map((item, idx) => {
                    let dotColor = '#148aa0';
                    const status = item.nouveauStatut || item.statut;
                    
                    if (status === 'Acceptee') {
                        dotColor = '#22c55e';
                    } else if (status === 'Refusee') {
                        dotColor = '#ef4444';
                    } else if (status === 'Brouillon') {
                        dotColor = '#6b7280';
                    } else if (status === 'Soumise') {
                        dotColor = '#1d4ed8';
                    } else if (status === 'EnAnalyse') {
                        dotColor = '#f59e0b';
                    } else if (status === 'Entretien') {
                        dotColor = '#8b5cf6';
                    }

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
                                    {item.action || item.nouveauStatut || item.ancienStatut || 'Mise à jour'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    {formatDate(item.date || item.createdAt)}
                                </Typography>
                                {item.commentaire && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {item.commentaire}
                                    </Typography>
                                )}
                                {item.ancienStatut && item.nouveauStatut && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        Statut précédent : <strong>{getStatusLabel(item.ancienStatut)}</strong>
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

    const renderDocuments = () => (
        <>
            {documents.length > 0 ? (
                <List dense sx={{ p: 0 }}>
                    {documents.map((doc, idx) => (
                        <ListItem 
                            key={idx} 
                            sx={{ 
                                px: 0, 
                                py: 1.5,
                                borderBottom: idx < documents.length - 1 ? '1px solid #f0f2f5' : 'none',
                                alignItems: 'flex-start'
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                {doc.isVerified ? (
                                    <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
                                ) : (
                                    <Pending sx={{ color: '#f59e0b', fontSize: 20 }} />
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography variant="body2" fontWeight={500} color="#1a2332">
                                        {doc.nomOriginal || doc.nom || 'Document'}
                                    </Typography>
                                }
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

            <Paper sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <StyledTabs
                    value={tabValue}
                    onChange={handleTabChange}
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
                </StyledTabs>

                <Box sx={{ p: 3 }}>
                    {tabValue === 0 ? renderHistorique() : renderDocuments()}
                </Box>
            </Paper>
        </Container>
    );
};

export default ApplicationDetailStudent;
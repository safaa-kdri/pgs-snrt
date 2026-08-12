// src/components/student/ApplicationDetail.jsx
// ✅ AJOUT : Tab Engagement avec gestion des statuts
// ✅ CORRECTION : Engagement avant Documents dans l'ordre des tabs
// ✅ CORRECTION : Ajout de l'historique "Engagement envoyé"
// ✅ CORRECTION : Suppression de la bannière de statut
// ✅ AJOUT : Logs pour déboguer l'upload d'engagement
// ✅ AJOUT : Affichage du document déposé après upload
// ✅ CORRECTION : Téléchargement et visualisation des fichiers d'engagement (URL sans double /uploads/)
// ✅ CORRECTION : isEngagementVisible inclut DemandeEnvoyee
// ✅ CORRECTION : Progression 100% dès que la candidature est acceptée
// ✅ CORRECTION : Affichage du statut du stage dans la page de détails
// ✅ CORRECTION : Libellé "Acceptée" → "Acceptée par le département"
// ✅ AJOUT : Gestion de la convention avec les nouveaux statuts
// ✅ CORRECTION : Affichage des documents populés
// ✅ SUPPRESSION : Onglet Convention (fonctionnalité séparée)

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
    Assignment,
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

// ✅ StatusChip avec tous les statuts du workflow
const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'Brouillon': { bg: '#e5e7eb', text: '#6b7280' },
        'Soumise': { bg: '#dbeafe', text: '#1d4ed8' },
        'EnAnalyse': { bg: '#fef3c7', text: '#d97706' },
        'Entretien': { bg: '#f3e8ff', text: '#6b21a8' },
        'Acceptee': { bg: '#d1fae5', text: '#065f46' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
        // Statuts de stage - Vert pour tous (candidature terminée)
        'EngagementEnvoye': { bg: '#d1fae5', text: '#065f46' },
        'EngagementRecu': { bg: '#d1fae5', text: '#065f46' },
        'EngagementValide': { bg: '#d1fae5', text: '#065f46' },
        'EngagementRejete': { bg: '#fee2e2', text: '#991b1b' },
        'DemandeEnvoyee': { bg: '#d1fae5', text: '#065f46' },
        'ValideParDirecteur': { bg: '#d1fae5', text: '#065f46' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
        'Termine': { bg: '#d1fae5', text: '#065f46' },
        'EnCours': { bg: '#d1fae5', text: '#065f46' },
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

// ✅ STYLE PROFESSIONNEL POUR L'UPLOAD ZONE
const StyledUploadZone = styled(Box)({
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '32px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#fafafa',
    '&:hover': {
        borderColor: '#148aa0',
        backgroundColor: '#f7fbfc',
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
    const [engagementFile, setEngagementFile] = useState(null);
    const [engagementDepose, setEngagementDepose] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadType, setUploadType] = useState('convention');

    // ✅ Vérifier si l'engagement doit être affiché (inclure tous les statuts de stage)
    const isEngagementVisible = internship?.statut === 'EngagementEnvoye' || 
                                internship?.statut === 'EngagementRecu' ||
                                internship?.statut === 'EngagementValide' ||
                                internship?.statut === 'EnAttenteEngagement' ||
                                internship?.statut === 'DemandeEnvoyee' ||
                                internship?.statut === 'ValideParDirecteur' ||
                                internship?.statut === 'Cloturee' ||
                                internship?.statut === 'Termine';

    useEffect(() => {
        fetchApplicationDetail();
    }, [id]);

    const fetchApplicationDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/applications/${id}`);
            let data = response.data.data || response.data;
            
            // ✅ Récupérer les détails des documents si ce sont des IDs
            if (data.documents && data.documents.length > 0 && typeof data.documents[0] === 'string') {
                const docDetails = await Promise.all(
                    data.documents.map(async (docId) => {
                        try {
                            const docRes = await api.get(`/documents/${docId}`);
                            return docRes.data.data;
                        } catch (e) {
                            return null;
                        }
                    })
                );
                data.documents = docDetails.filter(d => d);
            }
            
            setApplication(data);

            if (data._id) {
                try {
                    const stageRes = await api.get(`/internships/application/${data._id}`);
                    if (stageRes.data?.data) {
                        setInternship(stageRes.data.data);
                        
                        console.log('✅ [fetchApplicationDetail] Internship défini:', stageRes.data.data);
                        console.log('✅ [fetchApplicationDetail] Internship._id:', stageRes.data.data._id);
                        console.log('🔍 [fetchApplicationDetail] Livrables:', stageRes.data.data.livrables);
                        
                        // ✅ VÉRIFIER SI L'ENGAGEMENT EST DÉJÀ DÉPOSÉ
                        const engagementLivrable = stageRes.data.data.livrables?.find(
                            l => l.nom === 'Engagement Confidentialité Signé'
                        );
                        
                        console.log('🔍 [fetchApplicationDetail] Engagement trouvé:', engagementLivrable);
                        
                        if (engagementLivrable) {
                            setEngagementDepose(true);
                            setEngagementFile({
                                ...engagementLivrable,
                                nomOriginal: engagementLivrable.nom || 'Engagement_Confidentialite_Signe.pdf',
                                dateDepot: engagementLivrable.dateDepot
                            });
                        }
                        
                        // ✅ AJOUTER : Vérifier si l'engagement a été envoyé
                        if (stageRes.data.data.statut === 'EngagementEnvoye' || 
                            stageRes.data.data.statut === 'EngagementRecu' ||
                            stageRes.data.data.statut === 'EngagementValide' ||
                            stageRes.data.data.statut === 'DemandeEnvoyee') {
                            const hasEngagementHistory = data.historique?.some(
                                h => h.action === 'Engagement de confidentialité envoyé'
                            );
                            
                            if (!hasEngagementHistory) {
                                data.historique = data.historique || [];
                                data.historique.push({
                                    date: new Date(stageRes.data.data.updatedAt || new Date()),
                                    action: 'Engagement de confidentialité envoyé',
                                    nouveauStatut: 'EngagementEnvoye',
                                    ancienStatut: data.statut || 'Acceptee',
                                    commentaire: 'Le document d\'engagement vous a été envoyé par le RH. Veuillez le consulter dans l\'onglet "Engagement".'
                                });
                            }
                        }
                        
                        if (stageRes.data.data.engagement) {
                            setEngagementFile(stageRes.data.data.engagement);
                        }
                    }
                } catch (e) {
                    console.warn('Aucun stage associé:', e);
                }
            }

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
    // ✅ FONCTIONS ENGAGEMENT AVEC LOGS
    // ============================================

    const handleDownloadEngagement = async () => {
        try {
            const stageId = internship?._id;
            if (!stageId) {
                setError('ID du stage non trouvé');
                return;
            }

            const response = await api.get(`/internships/${stageId}/generate-engagement`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Engagement_Confidentialite_SNRT.pdf';
            link.click();
            window.URL.revokeObjectURL(url);

            setSuccess('Engagement de confidentialité téléchargé');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Erreur téléchargement engagement:', error);
            setError('Erreur lors du téléchargement de l\'engagement');
        }
    };

    const handleUploadEngagement = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('document', selectedFile);

            console.log('🔍 [handleUploadEngagement] internship:', internship);
            console.log('🔍 [handleUploadEngagement] internship?._id:', internship?._id);

            const stageId = internship?._id;
            if (!stageId) {
                console.error('❌ [handleUploadEngagement] stageId est undefined');
                setError('ID du stage non trouvé');
                setUploading(false);
                return;
            }

            console.log('✅ [handleUploadEngagement] stageId:', stageId);
            console.log('✅ [handleUploadEngagement] URL:', `/internships/${stageId}/upload-engagement`);
            console.log('✅ [handleUploadEngagement] selectedFile:', selectedFile.name);

            const response = await api.post(
                `/internships/${stageId}/upload-engagement`,
                formData,
                { 
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        console.log('📤 [handleUploadEngagement] Progression:', progressEvent.loaded, '/', progressEvent.total);
                    }
                }
            );

            console.log('✅ [handleUploadEngagement] Réponse:', response.data);

            if (response.data?.success) {
                setSuccess('Engagement déposé avec succès !');
                setEngagementDepose(true);
                setEngagementFile({
                    ...response.data.data,
                    nomOriginal: selectedFile.name,
                    dateDepot: new Date()
                });
                setOpenDialog(false);
                setSelectedFile(null);
                fetchApplicationDetail();
            }
        } catch (error) {
            console.error('❌ Erreur upload engagement:', error);
            console.error('❌ Réponse d\'erreur:', error.response?.data);
            console.error('❌ Statut:', error.response?.status);
            console.error('❌ URL:', error.config?.url);
            setError(error.response?.data?.message || 'Erreur lors du dépôt de l\'engagement');
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (event, type) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setUploadType(type);
            setOpenDialog(true);
        } else {
            setError('Veuillez sélectionner un fichier PDF');
        }
    };

    // ============================================
    // FONCTIONS UTILITAIRES
    // ============================================

    // ✅ Affichage du statut (stage si disponible, sinon application)
    const getDisplayStatus = () => {
        if (internship?.statut) {
            return internship.statut;
        }
        return application?.statut || 'Brouillon';
    };

    // ✅ STATUTS COMPLETS - Libellés professionnels pour l'étudiant
    const getStatusLabel = (status) => {
        const labels = {
            'Brouillon': 'Brouillon',
            'Soumise': 'Soumise',
            'EnAnalyse': 'En cours d\'analyse',
            'Entretien': 'Entretien planifié',
            'Acceptee': 'Acceptée par le département',
            'Refusee': 'Refusée',
            'EngagementEnvoye': 'Engagement envoyé',
            'EngagementRecu': 'Engagement reçu',
            'EngagementValide': 'Engagement validé',
            'EngagementRejete': 'Engagement rejeté',
            'DemandeEnvoyee': 'Demande envoyée',
            'ValideParDirecteur': 'Validé par le Directeur',
            'Cloturee': 'Stage clôturé',
            'Termine': 'Stage terminé',
            'EnCours': 'Stage en cours',
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

    const cleanDocumentType = (type) => {
        if (!type) return 'Autre';
        const typeMap = {
            'CV': 'CV',
            'LettreMotivation': 'Lettre de motivation',
            'LettreRecommandation': 'Lettre de recommandation',
            'ReleveNotes': 'Relevé de notes',
            'Attestation': 'Attestation',
            'Convention': 'Convention',
            'Photo': "Photo d'identité",
            'CIN': 'Copie CIN',
            'Assurance': 'Assurance',
            'FicheDemandeStage': 'Fiche de demande de stage',
            'Autre': 'Autre',
        };
        return typeMap[type] || 'Autre';
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
            let cleanPath = doc.chemin;
            if (cleanPath.startsWith('./')) {
                cleanPath = cleanPath.substring(2);
            }
            if (cleanPath.startsWith('/')) {
                cleanPath = cleanPath.substring(1);
            }
            return `${apiRoot}/${cleanPath}`;
        }
        if (doc.nom && doc.nom.includes('Engagement')) {
            let nom = doc.nom;
            if (nom.startsWith('uploads/')) {
                return `${apiRoot}/${nom}`;
            }
            return `${apiRoot}/uploads/engagements/${nom}`;
        }
        if (doc.nomOriginal) {
            let nom = doc.nomOriginal;
            if (nom.startsWith('uploads/')) {
                return `${apiRoot}/${nom}`;
            }
            return `${apiRoot}/uploads/engagements/${nom}`;
        }
        
        console.warn('⚠️ [buildFileHref] Impossible de construire l\'URL pour:', doc);
        return null;
    };

    const handleDownloadDocument = (doc) => {
        if (!doc) {
            setError('Document non trouvé');
            return;
        }
        
        const href = buildFileHref(doc);
        console.log('🔍 [handleDownloadDocument] href:', href);
        console.log('🔍 [handleDownloadDocument] doc:', doc);
        
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
                        else if (status === 'EngagementValide') dotColor = '#22c55e';
                        else if (status === 'EngagementEnvoye') dotColor = '#22c55e';
                        else if (status === 'EngagementRecu') dotColor = '#22c55e';
                        else if (status === 'Cloturee') dotColor = '#22c55e';

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

    // ✅ RENDER DOCUMENTS - CORRIGÉ AVEC VÉRIFICATION DES POPULATES
    const renderDocuments = () => {
        const documents = application?.documents || [];
        
        // ✅ Vérifier si les documents sont populés (ont un nomOriginal)
        const hasPopulatedDocs = documents.length > 0 && documents[0]?.nomOriginal;
        
        // ✅ Si aucun document
        if (documents.length === 0) {
            return (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Description sx={{ fontSize: 48, color: '#d1d5db' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Aucune pièce justificative déposée
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Les documents déposés lors de l'étape 3 apparaîtront ici
                    </Typography>
                </Box>
            );
        }
        
        // ✅ Si les documents ne sont pas populés (ce sont des IDs)
        if (!hasPopulatedDocs) {
            return (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Description sx={{ fontSize: 48, color: '#d1d5db' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {documents.length} pièce(s) justificative(s) déposée(s)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Chargement des détails des documents...
                    </Typography>
                </Box>
            );
        }
        
        // ✅ Affichage normal des documents populés
        return (
            <List dense sx={{ p: 0 }}>
                {documents.map((doc, idx) => (
                    <ListItem key={doc._id || idx} sx={{
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
                                        {cleanDocumentType(doc.type)} • {doc.isVerified ? 'Validé' : 'En attente'}
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
        );
    };

    // ✅ RENDER ENGAGEMENT - Version avec affichage du document déposé
    const renderEngagement = () => {
        const stageStatut = internship?.statut || 'EnCours';
        const isSent = stageStatut === 'EngagementEnvoye' || 
                       stageStatut === 'EngagementRecu' ||
                       stageStatut === 'EngagementValide' ||
                       stageStatut === 'EnAttenteEngagement' ||
                       stageStatut === 'DemandeEnvoyee' ||
                       stageStatut === 'ValideParDirecteur' ||
                       stageStatut === 'Cloturee' ||
                       stageStatut === 'Termine';

        const hasEngagement = engagementDepose || 
                             (engagementFile && (engagementFile.chemin || engagementFile.gridFsId || engagementFile._id));

        return (
            <Box>
                {isSent && (
                    <>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleDownloadEngagement}
                            sx={{ 
                                mb: 3,
                                borderRadius: '8px',
                                textTransform: 'none',
                                borderColor: '#148aa0',
                                color: '#148aa0',
                                fontWeight: 500,
                                px: 3,
                                py: 1,
                                '&:hover': {
                                    backgroundColor: 'rgba(20, 138, 160, 0.04)',
                                    borderColor: '#0b7890'
                                }
                            }}
                        >
                            Télécharger l'engagement de confidentialité
                        </Button>

                        <Divider sx={{ my: 3 }} />

                        {hasEngagement ? (
                            <Box>
                                <Alert 
                                    severity="success" 
                                    sx={{ 
                                        mb: 2,
                                        borderRadius: '8px',
                                        backgroundColor: '#d1fae5',
                                        '& .MuiAlert-icon': { color: '#16a34a' }
                                    }}
                                >
                                    <Typography variant="body2" color="#065f46">
                                        Votre engagement de confidentialité a été déposé avec succès.
                                    </Typography>
                                </Alert>

                                <Typography variant="subtitle2" fontWeight={600} color="#1a2332" sx={{ mb: 2 }}>
                                    Document déposé
                                </Typography>
                                
                                <DocumentCard>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <PictureAsPdf sx={{ color: '#ef4444', fontSize: 24 }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight={500}>
                                                {engagementFile?.nomOriginal || engagementFile?.nom || 'Engagement_Confidentialite_Signe.pdf'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Déposé le {formatDate(engagementFile?.dateDepot || engagementFile?.createdAt || new Date())}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <Tooltip title="Voir le document">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    const href = buildFileHref(engagementFile);
                                                    if (href) {
                                                        window.open(href, '_blank');
                                                    } else {
                                                        setError('Impossible d\'afficher ce document');
                                                    }
                                                }}
                                                sx={{ color: '#2d3748' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Télécharger">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    const href = buildFileHref(engagementFile);
                                                    if (href) {
                                                        const link = document.createElement('a');
                                                        link.href = href;
                                                        link.download = engagementFile?.nomOriginal || engagementFile?.nom || 'Engagement_Confidentialite.pdf';
                                                        link.target = '_blank';
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    } else {
                                                        setError('Impossible de télécharger ce document');
                                                    }
                                                }}
                                                sx={{ color: '#4f46e5' }}
                                            >
                                                <Download fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </DocumentCard>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} color="#1a2332" sx={{ mb: 0.5 }}>
                                        Déposer le document signé
                                    </Typography>
                                    <Typography variant="body2" color="#687480" sx={{ mb: 2 }}>
                                        Format PDF • Taille max 5 MB
                                    </Typography>
                                </Box>

                                <StyledUploadZone onClick={() => document.getElementById('engagement-upload')?.click()}>
                                    <input
                                        id="engagement-upload"
                                        type="file"
                                        hidden
                                        accept=".pdf"
                                        onChange={(e) => handleFileSelect(e, 'engagement')}
                                    />
                                    <Upload sx={{ fontSize: 32, color: '#9aa4ac' }} />
                                    <Typography variant="body1" sx={{ mt: 1, color: '#1a2332', fontWeight: 500 }}>
                                        Cliquez pour déposer le document signé
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ou glissez-déposez le fichier ici
                                    </Typography>
                                </StyledUploadZone>

                                <Alert 
                                    severity="info" 
                                    sx={{ 
                                        mt: 2, 
                                        borderRadius: '8px',
                                        backgroundColor: '#f0f7fa',
                                        '& .MuiAlert-icon': { color: '#148aa0' }
                                    }}
                                >
                                    <Typography variant="body2" color="#1a2332">
                                        Assurez-vous que le document est bien signé avant de le déposer.
                                    </Typography>
                                </Alert>
                            </>
                        )}
                    </>
                )}

                {!isSent && (
                    <Box sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        backgroundColor: '#fafafa',
                        borderRadius: '10px',
                        border: '1px solid #eef1f3'
                    }}>
                        <Typography variant="body2" color="#687480">
                            L'engagement de confidentialité n'a pas encore été envoyé par le service RH.
                        </Typography>
                        <Typography variant="caption" color="#9aa4ac">
                            Vous serez notifié dès sa disponibilité.
                        </Typography>
                    </Box>
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
            <DialogTitle>
                Confirmer le dépôt du document
            </DialogTitle>
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
                    Vérifiez que le fichier est bien le document à déposer.
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
                    onClick={handleUploadEngagement}
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

    const displayStatus = getDisplayStatus();
    const statusLabel = getStatusLabel(displayStatus);

    const documents = application.documents || [];

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
                    <StatusChip label={statusLabel} status={displayStatus} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {application.offreId?.titre || application.offre || 'Offre sans titre'}
                    {internship && (
                        <Typography variant="caption" color="text.secondary" display="block">
                            Stage: {internship.sujetTitre || 'Sujet non défini'}
                        </Typography>
                    )}
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
                    {isEngagementVisible && (
                        <StyledTab
                            icon={<Assignment sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label="Engagement"
                        />
                    )}
                    <StyledTab
                        icon={<Description sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                        label={`Pièces justificatives (${documents.length})`}
                    />
                    {/* ✅ ONGLET CONVENTION SUPPRIMÉ */}
                </StyledTabs>

                <Box sx={{ p: 3 }}>
                    {tabValue === 0 && renderHistorique()}
                    {tabValue === 1 && isEngagementVisible && renderEngagement()}
                    {tabValue === 2 && renderDocuments()}
                    {/* ✅ RENDU CONVENTION SUPPRIMÉ */}
                </Box>
            </Paper>

            {renderUploadDialog()}
        </Container>
    );
};

export default ApplicationDetailStudent;
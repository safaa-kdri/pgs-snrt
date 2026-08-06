// src/components/public/ApplyPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Paper,
    Chip,
    IconButton,
    Card,
    Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Delete,
    Upload,
    Description,
    ArrowBack,
    Download,
    CheckCircle,
    Person,
    School,
    Badge,
    Assignment,
    HealthAndSafety,
    FilePresent,
    Receipt,
    PictureAsPdf,
    InsertDriveFile,
    Image,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

// ✅ CORRIGÉ - Mapping des types de documents
const mapDocumentType = (docId) => {
    const mapping = {
        photo: 'Photo',                              // ✅ CORRIGÉ
        lettre_motivation: 'LettreMotivation',
        cv: 'CV',
        attestation_scolarite: 'Attestation',
        lettre_recommandation: 'LettreRecommandation',  // ✅ CORRIGÉ
        cin: 'CIN',                                  // ✅ CORRIGÉ
        assurance: 'Assurance',                      // ✅ CORRIGÉ
        fiche_engagement: 'Convention',
    };
    return mapping[docId] || 'Autre';
};

const ApplyContainer = styled(Box)({
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px 0',
});

const PageHeader = styled(Box)({
    marginBottom: '32px',
});

const PageTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '28px',
    color: '#1a2332',
});

const PageSubtitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontSize: '15px',
    color: '#687480',
    marginTop: '4px',
});

const SectionCard = styled(Paper)({
    borderRadius: '14px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #eef1f3',
});

const SectionHeader = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
});

const SectionTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    fontSize: '16px',
    color: '#1a2332',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
});

const DocumentGrid = styled(Box)({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
});

const DocumentItem = styled(Card)(({ uploaded }) => ({
    padding: '16px',
    borderRadius: '12px',
    border: uploaded ? '2px solid #22c55e' : '1px solid #e8edf0',
    backgroundColor: uploaded ? '#f0fdf4' : '#fafafa',
    transition: 'all 0.2s ease',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    },
}));

const DocumentUploadButton = styled(Button)({
    borderRadius: '8px',
    padding: '4px 12px',
    fontSize: '12px',
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#148aa0',
    color: '#148aa0',
    '&:hover': {
        backgroundColor: 'rgba(20, 138, 160, 0.05)',
        borderColor: '#0b7890',
    },
});

const DownloadButton = styled(Button)({
    borderRadius: '10px',
    padding: '10px 20px',
    backgroundColor: '#148aa0',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    '&:hover': { backgroundColor: '#0b7890' },
});

const SubmitButton = styled(Button)({
    borderRadius: '12px',
    padding: '12px 48px',
    backgroundColor: '#22c55e',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    '&:hover': { backgroundColor: '#16a34a' },
    '&:disabled': { backgroundColor: '#a0c4cd' },
});

const FileName = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
    color: '#1a2332',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '120px',
});

// ============================================
// LISTE DES DOCUMENTS REQUIS
// ============================================

const REQUIRED_DOCUMENTS = [
    { id: 'photo', label: "Photo d'identité récente", required: true, icon: <Person /> },
    { id: 'lettre_motivation', label: 'Lettre de motivation', required: true, icon: <Description /> },
    { id: 'cv', label: 'CV', required: true, icon: <FilePresent /> },
    { id: 'attestation_scolarite', label: "Attestation de Scolarité", required: true, icon: <School /> },
    { id: 'lettre_recommandation', label: "Lettre de recommandation de l'Institut", required: true, icon: <Assignment /> },
    { id: 'cin', label: 'Copie CIN', required: true, icon: <Badge /> },
    { id: 'assurance', label: 'Assurance', required: true, icon: <HealthAndSafety /> },
    { id: 'fiche_engagement', label: "Fiche d'Engagement", required: true, icon: <Receipt /> },
];

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ApplyPage = () => {
    const navigate = useNavigate();
    const { offerId } = useParams();
    const { user, isAuthenticated } = useAuth();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [offer, setOffer] = useState(null);
    const [commentaire, setCommentaire] = useState('');
    const [uploadedDocuments, setUploadedDocuments] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/apply/${offerId}` } });
        }
    }, [isAuthenticated, navigate, offerId]);

    useEffect(() => {
        if (isAuthenticated && offerId) {
            fetchOfferAndDocuments();
        }
    }, [isAuthenticated, offerId]);

    const fetchOfferAndDocuments = async () => {
        setLoading(true);
        try {
            const offerRes = await api.get(`/offers/${offerId}`);
            setOffer(offerRes.data.offer);

            const appResponse = await api.get('/applications', {
                params: { etudiantId: user?.id, limit: 1 }
            });
            
            if (appResponse.data?.data?.length > 0) {
                const lastApp = appResponse.data.data[0];
                if (lastApp.documents && lastApp.documents.length > 0) {
                    const docs = {};
                    lastApp.documents.forEach(doc => {
                        const key = Object.keys(REQUIRED_DOCUMENTS).find(
                            k => REQUIRED_DOCUMENTS[k].type === doc.type
                        );
                        if (key) {
                            docs[key] = doc;
                        }
                    });
                    setUploadedDocuments(docs);
                }
            }
            
            setError('');
        } catch (err) {
            console.error('Erreur chargement:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadFiche = () => {
        const link = document.createElement('a');
        link.href = '/documents/fiche_engagement.pdf';
        link.download = 'Fiche_Engagement_SNRT.pdf';
        link.click();
    };

    const handleFileUpload = async (docId, file) => {
        if (!file || !offerId) return;

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('type', mapDocumentType(docId));

            const response = await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const uploadedDoc = response.data.data;
            setUploadedDocuments({
                ...uploadedDocuments,
                [docId]: uploadedDoc
            });
            
            setSuccess(`${docId} ajouté avec succès`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || `Erreur lors de l'upload de ${docId}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDocument = (docId) => {
        const newDocs = { ...uploadedDocuments };
        delete newDocs[docId];
        setUploadedDocuments(newDocs);
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

    const isAllDocumentsUploaded = () => {
        return REQUIRED_DOCUMENTS.every(doc => 
            doc.required && uploadedDocuments[doc.id]
        );
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        try {
            const missingDocs = REQUIRED_DOCUMENTS
                .filter(doc => doc.required && !uploadedDocuments[doc.id])
                .map(doc => doc.label);

            if (missingDocs.length > 0) {
                setError(`Documents manquants : ${missingDocs.join(', ')}`);
                setSubmitting(false);
                return;
            }

            const documentIds = Object.values(uploadedDocuments).map(doc => doc._id);
            console.log('📄 Documents IDs:', documentIds);

            const createResponse = await api.post('/applications', {
                offreId: offerId,
                commentaire: commentaire,
                documents: documentIds,
            });

            const applicationId = createResponse.data.data?._id || createResponse.data?._id;
            
            if (!applicationId) {
                throw new Error('ID de candidature non trouvé');
            }

            await api.patch(`/applications/${applicationId}/submit`);
            
            setSuccess('✅ Candidature envoyée avec succès !');
            
            setTimeout(() => {
                navigate('/dashboard/applications');
            }, 2000);

        } catch (err) {
            console.error('❌ Erreur:', err);
            
            if (err.response?.status === 400 && err.response?.data?.message?.includes('existe déjà')) {
                try {
                    const existingResponse = await api.get('/applications', {
                        params: { offreId: offerId, etudiantId: user?.id }
                    });
                    
                    const existingApp = existingResponse.data?.data?.[0];
                    if (existingApp) {
                        if (existingApp.statut === 'Brouillon') {
                            await api.patch(`/applications/${existingApp._id}/submit`);
                            setSuccess('✅ Candidature envoyée avec succès !');
                            setTimeout(() => navigate('/dashboard/applications'), 2000);
                            return;
                        } else if (existingApp.statut === 'Soumise') {
                            setSuccess('✅ Cette candidature a déjà été soumise !');
                            setTimeout(() => navigate('/dashboard/applications'), 2000);
                            return;
                        }
                    }
                } catch (e) {
                    console.error('Erreur récupération candidature existante:', e);
                }
            }
            
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la candidature');
        } finally {
            setSubmitting(false);
        }
    };

    const getFileIcon = (filename) => {
        if (!filename) return <Description />;
        const ext = filename.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return <PictureAsPdf sx={{ color: '#ef4444' }} />;
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return <Image sx={{ color: '#22c55e' }} />;
        return <InsertDriveFile sx={{ color: '#4f46e5' }} />;
    };

    if (loading) {
        return (
            <ApplyContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#148aa0' }} />
                </Box>
            </ApplyContainer>
        );
    }

    return (
        <ApplyContainer>
            <PageHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/')}
                        sx={{ textTransform: 'none', color: '#687480', fontSize: '14px' }}
                    >
                        Retour
                    </Button>
                </Box>
                <PageTitle>Dépôt de candidature</PageTitle>
                <PageSubtitle>
                    {offer?.titre || 'Offre de stage'} — Téléchargez les documents requis pour postuler
                </PageSubtitle>
            </PageHeader>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
                    {success}
                </Alert>
            )}

            <SectionCard>
                <SectionHeader>
                    <SectionTitle>
                        <Receipt sx={{ color: '#148aa0' }} />
                        Fiche d'Engagement
                    </SectionTitle>
                </SectionHeader>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Téléchargez la fiche d'engagement, imprimez-la, signez-la, puis téléchargez-la scannée.
                </Typography>
                
                {uploadedDocuments['fiche_engagement'] ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, backgroundColor: '#f0fdf4', borderRadius: '10px' }}>
                        <CheckCircle sx={{ color: '#22c55e' }} />
                        <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
                            {uploadedDocuments['fiche_engagement'].nomOriginal || 'Fiche d\'engagement'}
                        </Typography>
                        <Tooltip title="Télécharger la fiche d'engagement">
                            <IconButton size="small" onClick={() => handleDownloadDocument(uploadedDocuments['fiche_engagement'])} sx={{ color: '#4f46e5' }}>
                                <Download fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <IconButton size="small" onClick={() => handleRemoveDocument('fiche_engagement')} sx={{ color: '#ef4444' }}>
                            <Delete fontSize="small" />
                        </IconButton>
                    </Box>
                ) : (
                    <DownloadButton
                        startIcon={<Download />}
                        onClick={handleDownloadFiche}
                    >
                        Télécharger la Fiche d'Engagement
                    </DownloadButton>
                )}
            </SectionCard>

            <SectionCard>
                <SectionHeader>
                    <SectionTitle>
                        <FilePresent sx={{ color: '#148aa0' }} />
                        Pièces à fournir
                    </SectionTitle>
                </SectionHeader>

                <DocumentGrid>
                    {REQUIRED_DOCUMENTS.map((doc) => {
                        const isUploaded = !!uploadedDocuments[doc.id];
                        const docData = uploadedDocuments[doc.id];
                        return (
                            <DocumentItem key={doc.id} uploaded={isUploaded ? "true" : undefined}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    {doc.icon}
                                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                                        {doc.label}
                                    </Typography>
                                    {isUploaded ? (
                                        <CheckCircle sx={{ color: '#22c55e', fontSize: 18 }} />
                                    ) : (
                                        <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #d1d5db' }} />
                                    )}
                                </Box>

                                {isUploaded ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                        {getFileIcon(docData?.nomOriginal)}
                                        <FileName>
                                            {docData?.nomOriginal || 'Document uploadé'}
                                        </FileName>
                                        <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
                                            <Tooltip title="Télécharger le document">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDownloadDocument(docData)}
                                                    sx={{ color: '#4f46e5' }}
                                                >
                                                    <Download fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Supprimer le document">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveDocument(doc.id)}
                                                    sx={{ color: '#ef4444' }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                ) : (
                                    <DocumentUploadButton
                                        component="label"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        startIcon={<Upload />}
                                    >
                                        Uploader
                                        <input
                                            type="file"
                                            hidden
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handleFileUpload(doc.id, e.target.files[0]);
                                                }
                                            }}
                                            accept=".pdf,.doc,.docx,.jpg,.png"
                                        />
                                    </DocumentUploadButton>
                                )}
                            </DocumentItem>
                        );
                    })}
                </DocumentGrid>
            </SectionCard>

            <SectionCard>
                <SectionTitle>
                    <Description sx={{ color: '#148aa0' }} />
                    Informations complémentaires
                </SectionTitle>
                <TextField
                    label="Commentaire (optionnel)"
                    multiline
                    rows={3}
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    fullWidth
                    placeholder="Ajoutez un message à votre candidature..."
                    sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#ffffff' },
                    }}
                />
            </SectionCard>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 2, pt: 1 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/')}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Annuler
                    </Button>
                    <SubmitButton
                        onClick={handleSubmit}
                        disabled={submitting || !isAllDocumentsUploaded()}
                    >
                        {submitting ? (
                            <CircularProgress size={24} sx={{ color: '#ffffff' }} />
                        ) : (
                            'Envoyer ma candidature'
                        )}
                    </SubmitButton>
                </Box>
            </Box>
        </ApplyContainer>
    );
};

export default ApplyPage;
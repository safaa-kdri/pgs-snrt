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
    Divider,
    Paper,
    Chip,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Delete,
    Upload,
    Description,
    ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const ApplyContainer = styled(Box)({
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px 0',
});

const SectionTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '24px',
    color: '#1a2332',
    marginBottom: '8px',
});

const SectionSubtitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    color: '#687480',
    marginBottom: '24px',
});

const DocumentBox = styled(Paper)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '8px',
    backgroundColor: '#f7f7f7',
    border: '1px solid #e8edf0',
});

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#ffffff',
    },
});

const SubmitButton = styled(Button)({
    borderRadius: '12px',
    padding: '12px 40px',
    backgroundColor: '#148aa0',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    '&:hover': { backgroundColor: '#0b7890' },
    '&:disabled': { backgroundColor: '#a0c4cd' },
});

const ApplyPage = () => {
    const navigate = useNavigate();
    const { offerId } = useParams();
    const { user, isAuthenticated } = useAuth();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [offer, setOffer] = useState(null);
    const [commentaire, setCommentaire] = useState('');
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // ✅ Si non connecté, rediriger vers login
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/apply/${offerId}` } });
        }
    }, [isAuthenticated, navigate, offerId]);

    // ✅ Charger l'offre et les documents
    useEffect(() => {
        if (isAuthenticated && offerId) {
            fetchOfferAndDocuments();
        }
    }, [isAuthenticated, offerId]);

    const fetchOfferAndDocuments = async () => {
        setLoading(true);
        try {
            // Charger l'offre
            const offerRes = await api.get(`/offers/${offerId}`);
            setOffer(offerRes.data.offer);

            // Charger les documents de l'utilisateur
            const docsRes = await api.get('/documents/user');
            if (docsRes.data?.data?.length > 0) {
                setDocuments(docsRes.data.data);
            }
        } catch (err) {
            console.error('Erreur chargement:', err);
            setError('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('type', 'CV');

            const response = await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setDocuments([...documents, response.data.data]);
            setSuccess('Document ajouté avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'upload');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDocument = (docId) => {
        setDocuments(documents.filter(doc => doc._id !== docId));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        try {
            if (documents.length === 0) {
                setError('Vous devez joindre au moins un document (CV)');
                setSubmitting(false);
                return;
            }

            await api.post('/applications', {
                offreId: offerId,
                commentaire: commentaire,
                documents: documents.map(doc => doc._id),
            });

            setSuccess('✅ Candidature envoyée avec succès !');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            if (err.response?.status === 400) {
                setError(err.response?.data?.message || 'Vous avez déjà postulé à cette offre');
            } else {
                setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
            }
        } finally {
            setSubmitting(false);
        }
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
            {/* ===== EN-TÊTE ===== */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/')}
                    sx={{ textTransform: 'none', color: '#687480' }}
                >
                    Retour
                </Button>
            </Box>

            <SectionTitle>📄 Postuler à cette offre</SectionTitle>
            <SectionSubtitle>
                {offer?.titre || 'Offre de stage'} - Complétez votre candidature
            </SectionSubtitle>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>
                    {success}
                </Alert>
            )}

            {/* ===== DOCUMENTS ===== */}
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Documents joints
            </Typography>

            {documents.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3, color: '#999', border: '1px dashed #e0e4e8', borderRadius: '10px', mb: 2 }}>
                    <Description sx={{ fontSize: 48, color: '#ccc' }} />
                    <Typography variant="body2" color="text.secondary">
                        Aucun document joint
                    </Typography>
                </Box>
            ) : (
                documents.map((doc) => (
                    <DocumentBox key={doc._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Description sx={{ color: '#148aa0' }} />
                            <Typography variant="body2">{doc.nomOriginal || doc.nom}</Typography>
                            <Chip
                                label={doc.type}
                                size="small"
                                sx={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}
                            />
                        </Box>
                        <IconButton
                            size="small"
                            onClick={() => handleRemoveDocument(doc._id)}
                            sx={{ color: '#ef4444' }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </DocumentBox>
                ))
            )}

            {/* ===== UPLOAD ===== */}
            <Box sx={{ mt: 2, mb: 3 }}>
                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<Upload />}
                    disabled={loading}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                    Ajouter un document
                    <input
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.jpg,.png"
                    />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Formats acceptés : PDF, DOC, DOCX, JPG, PNG (max 5MB)
                </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* ===== COMMENTAIRE ===== */}
            <StyledTextField
                label="Commentaire (optionnel)"
                multiline
                rows={3}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                fullWidth
                placeholder="Ajoutez un message à votre candidature..."
                sx={{ mb: 3 }}
            />

            {/* ===== BOUTONS ===== */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                    Annuler
                </Button>
                <SubmitButton
                    onClick={handleSubmit}
                    disabled={submitting || documents.length === 0}
                >
                    {submitting ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        '📤 Envoyer ma candidature'
                    )}
                </SubmitButton>
            </Box>
        </ApplyContainer>
    );
};

export default ApplyPage;
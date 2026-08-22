// src/components/public/ResultDetail.jsx
// VERSION FINALE : Design professionnel avec onglets comme dans l'accueil

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Container,
    Button,
    Paper,
    CircularProgress,
    Alert,
    Link,
    Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const PageContainer = styled(Box)({
    padding: '20px 0',
    maxWidth: '100%',
});

const JobTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '32px',
    color: '#20252B',
    textAlign: 'center',
    marginBottom: '24px',
    lineHeight: 1.2,
});

// ✅ ONGLETS COMME DANS L'ACCUEIL
const StyledTabButton = styled(Button)(({ active }) => ({
    backgroundColor: active ? '#148aa0' : 'transparent',
    color: active ? '#ffffff' : '#148aa0',
    border: active ? 'none' : '1px solid #148aa0',
    borderRadius: '4px',
    padding: '6px 20px',
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'none',
    fontFamily: 'Arial, Helvetica, sans-serif',
    '&:hover': {
        backgroundColor: active ? '#0b7890' : 'rgba(20, 138, 160, 0.05)',
    }
}));

const InfoCard = styled(Paper)({
    backgroundColor: '#F8F7F7',
    borderRadius: '20px',
    padding: '28px 32px',
    boxShadow: 'none',
    width: '100%',
    marginBottom: '24px',
});

const InfoRow = styled(Box)({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '6px 0',
    gap: '12px',
});

const InfoLabel = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '15px',
    color: '#222222',
    minWidth: '160px',
});

const InfoValue = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    fontSize: '15px',
    color: '#1a2332',
});

const InfoDivider = styled(Box)({
    width: '100%',
    height: '1px',
    backgroundColor: '#D9D9D9',
    margin: '14px 0',
});

const SectionTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '18px',
    color: '#1F2937',
    marginTop: '32px',
    marginBottom: '12px',
});

const DescriptionText = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: '15px',
    lineHeight: '28px',
    color: '#2D3748',
    textAlign: 'justify',
    whiteSpace: 'pre-wrap',
    marginBottom: '8px',
});

const PdfSection = styled(Box)({
    marginTop: '32px',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '24px',
});

const PdfTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '18px',
    color: '#1F2937',
    marginBottom: '16px',
});

// ✅ STYLE POUR LE PDF - COMME DANS LE CODE FOURNI
const DocumentCard = styled(Box)({
    width: '320px',
    height: '72px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #0F8DB5',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
        backgroundColor: '#F4FBFD',
    },
});

const PdfIcon = styled(Box)({
    width: '38px',
    height: '44px',
    backgroundColor: '#E53935',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 700,
    flexShrink: 0,
});

const DocTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '15px',
    color: '#222222',
});

const BackLink = styled(Link)({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#6d7884',
    textDecoration: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '24px',
    '&:hover': {
        color: '#148aa0',
    },
});

const LoadingContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ResultDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [resultData, setResultData] = useState(null);
    const [error, setError] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {
        fetchResultData();
    }, [id]);

    // Fonction utilitaire pour construire l'URL complète
    const getFullPdfUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:5000';
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const fetchResultData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/offers/${id}/results`);
            if (response.data?.success) {
                const data = response.data.data;
                setResultData(data);
                
                // Construire l'URL du PDF
                if (data.offer?.resultatsPdfPath) {
                    const fullUrl = getFullPdfUrl(data.offer.resultatsPdfPath);
                    setPdfUrl(fullUrl);
                    console.log('[ResultDetail] PDF URL:', fullUrl);
                } else {
                    console.warn('[ResultDetail] Aucun PDF trouvé pour cette offre');
                }
            }
        } catch (err) {
            console.error('Erreur chargement resultats:', err);
            setError(err.response?.data?.message || 'Erreur lors du chargement des resultats');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPdf = () => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <LoadingContainer>
                    <CircularProgress sx={{ color: '#148aa0' }} />
                </LoadingContainer>
            </Container>
        );
    }

    if (error || !resultData) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mt: 2, mb: 3, borderRadius: '12px' }}>
                    {error || 'Resultat non trouve'}
                </Alert>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    sx={{
                        color: '#148aa0',
                        borderColor: '#148aa0',
                        textTransform: 'none',
                        borderRadius: '8px',
                    }}
                >
                    Retour à l'accueil
                </Button>
            </Container>
        );
    }

    const { offer } = resultData;
    const description = offer?.resultatsDescription || '';

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            <PageContainer>
                {/* ===== TITRE ===== */}
                <JobTitle>{offer?.titre || 'Offre sans titre'}</JobTitle>

                {/* ===== ONGLETS COMME DANS L'ACCUEIL ===== */}
                <Box sx={{ display: 'flex', gap: '2px', mb: 3 }}>
                    <StyledTabButton
                        active={0}
                        // ✅ REDIRIGE VERS L'ACCUEIL (/) au lieu de /offres
                        onClick={() => navigate('/')}
                    >
                        Offres
                    </StyledTabButton>
                    <StyledTabButton
                        active={1}
                        // ✅ REDIRIGE VERS LA PAGE DES RÉSULTATS
                        onClick={() => navigate('/resultats')}
                    >
                        Résultats
                    </StyledTabButton>
                </Box>

                {/* ===== BLOC INFORMATIONS ===== */}
                <InfoCard>
                    <InfoRow>
                        <InfoLabel>Type de stage :</InfoLabel>
                        <InfoValue>{offer?.typeStage || 'Stage'}</InfoValue>
                    </InfoRow>

                    <InfoDivider />

                    <InfoRow>
                        <InfoLabel>Nombre de postes :</InfoLabel>
                        <InfoValue>{offer?.nbPostes || 0}</InfoValue>
                    </InfoRow>
                </InfoCard>

                {/* ===== DESCRIPTION - UNIQUEMENT SI REMPLIE ===== */}
                {description && description.trim().length > 0 && (
                    <>
                        <SectionTitle>Description de l'offre :</SectionTitle>
                        <DescriptionText>{description}</DescriptionText>
                    </>
                )}

                {/* ===== SECTION PDF ===== */}
                <PdfSection>
                    <PdfTitle>Avis des resultats</PdfTitle>

                    {pdfUrl ? (
                        <DocumentCard onClick={handleOpenPdf}>
                            <PdfIcon>PDF</PdfIcon>
                            <DocTitle>
                                Avis des résultats - {offer?.titre || 'Stage'}
                            </DocTitle>
                        </DocumentCard>
                    ) : (
                        <Alert severity="info" sx={{ borderRadius: '8px' }}>
                            Le PDF des resultats n'est pas encore disponible.
                        </Alert>
                    )}
                </PdfSection>

                {/* ===== RETOUR ===== */}
                <BackLink onClick={() => navigate('/resultats')}>
                    Retour aux resultats
                </BackLink>
            </PageContainer>
        </Container>
    );
};

export default ResultDetail;
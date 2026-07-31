// src/components/public/OfferDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography,
    Box,
    Container,
    Grid,
    Button,
    Card,
    Chip,
    Divider,
    Paper,
    CircularProgress,
    Alert,
    Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchOfferById, clearSelectedOffer } from '../../store/slices/offerSlice';

// ============================================
// STYLES SPÉCIFIQUES OFFER DETAIL - TAILLE RÉDUITE
// ============================================

const DetailContainer = styled(Box)({
    maxWidth: '100%',
    padding: '20px 0',
});

const JobTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '32px',
    color: '#20252B',
    textAlign: 'center',
    marginBottom: '32px',
    lineHeight: 1.2,
});

const InfoCard = styled(Paper)({
    backgroundColor: '#F8F7F7',
    borderRadius: '20px',
    padding: '28px 32px',
    boxShadow: 'none',
    width: '100%',
    minHeight: '160px',
});

const InfoRow = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    flexWrap: 'wrap',
    gap: '8px',
});

const InfoText = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '17px',
    color: '#222222',
});

const InfoDivider = styled(Box)({
    width: '100%',
    height: '1px',
    backgroundColor: '#D9D9D9',
    margin: '18px 0',
});

// ============================================
// BOUTON POSTULER - COULEUR DU THEME (#148aa0)
// ============================================

const PostulerButton = styled(Button)(({ submitted }) => ({
    width: '200px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: submitted ? '#2E7D32' : '#148aa0',
    color: '#FFFFFF',
    border: 'none',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '16px',
    textTransform: 'none',
    boxShadow: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: submitted ? '#2E7D32' : '#0b7890',
        boxShadow: 'none',
    },
    '&:disabled': {
        backgroundColor: '#2E7D32',
        color: '#FFFFFF',
        opacity: 1,
    },
}));

const SectionTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '28px',
    color: '#1F2937',
    marginBottom: '20px',
    marginTop: '40px',
});

const SubSectionTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '20px',
    color: '#1F2937',
    textDecoration: 'underline',
    marginBottom: '12px',
    marginTop: '24px',
});

const Paragraph = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '28px',
    color: '#2D3748',
    marginBottom: '12px',
    textAlign: 'justify',
});

// ✅ CORRIGÉ : Activités en lignes séparées
const ActivityItem = styled(Box)({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '12px',
    paddingLeft: '8px',
});

const ActivityBullet = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '16px',
    color: '#148aa0',
    minWidth: '20px',
});

const ActivityText = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '28px',
    color: '#2D3748',
});

const BulletItem = styled(Box)({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '16px',
});

const BulletTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '16px',
    color: '#1F2937',
    minWidth: 'fit-content',
});

const BulletDescription = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '28px',
    color: '#2D3748',
});

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

const LoadingContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
});

const ErrorContainer = styled(Box)({
    padding: '20px',
    textAlign: 'center',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const OfferDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [submitted, setSubmitted] = useState(false);

    const { selectedOffer, loading, error } = useSelector((state) => state.offers);
    const { isAuthenticated: authIsAuthenticated } = useSelector((state) => state.auth);
    
    // ✅ UNIQUEMENT le user (pas de token)
    const isAuthenticated = authIsAuthenticated || !!localStorage.getItem('user');

    useEffect(() => {
        if (id) {
            dispatch(fetchOfferById(id));
        }
        return () => {
            dispatch(clearSelectedOffer());
        };
    }, [dispatch, id]);

    // ✅ BOUTON POSTULER FONCTIONNEL
    const handlePostuler = () => {
        if (!isAuthenticated) {
            // Rediriger vers login avec le chemin de retour
            navigate('/login', { 
                state: { from: `/apply/${id}` } 
            });
            return;
        }
        // Rediriger vers la page de candidature
        navigate(`/apply/${id}`);
    };

    const handleGoBack = () => {
        navigate('/');
    };

    const handleDownload = () => {
        alert('📄 Téléchargement du document...');
    };

    const offer = selectedOffer;

    // ========================================== //
    // AFFICHAGE CHARGEMENT
    // ========================================== //
    
    if (loading) {
        return (
            <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
                <LoadingContainer>
                    <CircularProgress sx={{ color: '#148aa0' }} />
                </LoadingContainer>
            </Box>
        );
    }

    // ========================================== //
    // AFFICHAGE ERREUR
    // ========================================== //

    if (error || !offer) {
        return (
            <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
                <ErrorContainer>
                    <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
                        {error || 'Offre non trouvée'}
                    </Alert>
                    <Button 
                        variant="outlined"
                        onClick={() => navigate('/offres')} 
                        sx={{ 
                            color: '#0F8DB5', 
                            borderColor: '#0F8DB5',
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: '#0b7890',
                                backgroundColor: 'rgba(20, 138, 160, 0.05)'
                            }
                        }}
                    >
                        ← Retour aux offres
                    </Button>
                </ErrorContainer>
            </Box>
        );
    }

    // ========================================== //
    // AFFICHAGE PRINCIPAL
    // ========================================== //

    return (
        <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <DetailContainer>
                <JobTitle>{offer.titre}</JobTitle>

                <InfoCard>
                    <InfoRow>
                        <InfoText>Type de stage : {offer.typeStage || 'Stage'}</InfoText>
                    </InfoRow>

                    <InfoDivider />

                    <InfoRow>
                        <InfoText>Nombre de postes : {offer.nbPostes || 1}</InfoText>
                        <PostulerButton
                            onClick={handlePostuler}
                            submitted={submitted}
                            disabled={submitted}
                            disableRipple={true}
                        >
                            {submitted ? '✓ Candidature envoyée' : '+ Postuler'}
                        </PostulerButton>
                    </InfoRow>
                </InfoCard>

                <SectionTitle>Description de l'offre :</SectionTitle>

                <SubSectionTitle>Mission :</SubSectionTitle>
                <Paragraph>{offer.description}</Paragraph>

                <SubSectionTitle>Activités</SubSectionTitle>

                {offer.sujets && offer.sujets.length > 0 ? (
                    <Box sx={{ mb: 2 }}>
                        {offer.sujets.map((sujet, index) => (
                            <ActivityItem key={index}>
                                <ActivityBullet>•</ActivityBullet>
                                <ActivityText>
                                    <strong>{sujet.titre}</strong> : {sujet.description}
                                </ActivityText>
                            </ActivityItem>
                        ))}
                    </Box>
                ) : (
                    <Paragraph>Aucune activité spécifiée pour cette offre.</Paragraph>
                )}

                <Box sx={{ mt: 5 }}>
                    <SubSectionTitle>Documents joints</SubSectionTitle>

                    <DocumentCard onClick={handleDownload}>
                        <PdfIcon>PDF</PdfIcon>
                        <DocTitle>Arrêté d'ouverture du concours</DocTitle>
                    </DocumentCard>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Button
                        onClick={handleGoBack}
                        sx={{ 
                            color: '#6d7884', 
                            textTransform: 'none', 
                            fontFamily: 'Inter, sans-serif',
                            '&:hover': {
                                backgroundColor: 'rgba(20, 138, 160, 0.05)'
                            }
                        }}
                    >
                        ← Retour
                    </Button>
                </Box>
            </DetailContainer>
        </Box>
    );
};

export default OfferDetail;
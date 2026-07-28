// src/components/public/ResultDetail.jsx
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
import { fetchResultById, clearSelectedResult } from '../../store/slices/resultSlice';

// ============================================
// STYLES SPÉCIFIQUES RESULT DETAIL
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
// BOUTON "Voir résultat" - COULEUR DU THEME
// ============================================

const ResultButton = styled(Button)({
    width: '220px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#148aa0',
    color: '#FFFFFF',
    border: 'none',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '16px',
    textTransform: 'none',
    boxShadow: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: '#0b7890',
        boxShadow: 'none',
    },
});

const StatusBadge = styled(Chip)(({ status }) => {
    const colors = {
        'Présélection': { bg: '#fff4e5', color: '#c77700' },
        'Entretien': { bg: '#e5f3ff', color: '#0b7890' },
        'Final': { bg: '#e6f7ec', color: '#1a8a4a' },
        'Retenu': { bg: '#e6f7ec', color: '#1a8a4a' },
        'Non retenu': { bg: '#fdeaea', color: '#c0392b' },
        'En attente': { bg: '#f0f0f0', color: '#6d7884' },
    };
    const style = colors[status] || { bg: '#e8edf0', color: '#4b5563' };
    return {
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 600,
        fontSize: '14px',
        padding: '4px 16px',
        borderRadius: '6px',
        height: '32px',
        fontFamily: 'Inter, sans-serif',
    };
});

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

const ResultDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { selectedResult, loading, error } = useSelector((state) => state.results);

    useEffect(() => {
        if (id) {
            dispatch(fetchResultById(id));
        }
        return () => {
            dispatch(clearSelectedResult());
        };
    }, [dispatch, id]);

    const handleDownload = () => {
        alert('📄 Téléchargement du document...');
    };

    const result = selectedResult;

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

    if (error || !result) {
        return (
            <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
                <ErrorContainer>
                    <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
                        {error || 'Résultat non trouvé'}
                    </Alert>
                    <Button 
                        variant="outlined"
                        onClick={() => navigate('/')} 
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
                        ← Retour à l'accueil
                    </Button>
                </ErrorContainer>
            </Box>
        );
    }

    // ========================================== //
    // AFFICHAGE PRINCIPAL
    // ========================================== //

    const status = result.statut || result.status || 'En attente';

    return (
        <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <DetailContainer>
                <JobTitle>{result.titreOffre || result.offre?.titre || 'Offre sans titre'}</JobTitle>

                <InfoCard>
                    <InfoRow>
                        <InfoText>Candidat : {result.candidatNom || 'Non spécifié'}</InfoText>
                        <StatusBadge status={status} label={status} />
                    </InfoRow>

                    <InfoDivider />

                    <InfoRow>
                        <InfoText>Date du résultat : {result.dateResultat ? new Date(result.dateResultat).toLocaleDateString('fr-FR') : 'Non spécifiée'}</InfoText>
                        <ResultButton
                            onClick={handleDownload}
                            disableRipple={true}
                        >
                            Voir le résultat
                        </ResultButton>
                    </InfoRow>
                </InfoCard>

                <SectionTitle>Détails du résultat</SectionTitle>

                <SubSectionTitle>Statut de la candidature</SubSectionTitle>
                <Paragraph>
                    Le candidat <strong>{result.candidatNom || 'Non spécifié'}</strong> a été 
                    <strong> {status}</strong> pour le poste de <strong>{result.titreOffre || result.offre?.titre || 'Offre sans titre'}</strong>.
                </Paragraph>

                <SubSectionTitle>Commentaires</SubSectionTitle>
                <Paragraph>
                    {result.commentaires || 'Aucun commentaire disponible pour ce résultat.'}
                </Paragraph>

                <Box sx={{ mt: 5 }}>
                    <SubSectionTitle>Documents joints</SubSectionTitle>

                    <DocumentCard onClick={handleDownload}>
                        <PdfIcon>PDF</PdfIcon>
                        <DocTitle>Résultat de l'entretien</DocTitle>
                    </DocumentCard>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Button
                        onClick={() => navigate('/')}
                        sx={{ 
                            color: '#6d7884', 
                            textTransform: 'none', 
                            fontFamily: 'Inter, sans-serif',
                            '&:hover': {
                                backgroundColor: 'rgba(20, 138, 160, 0.05)'
                            }
                        }}
                    >
                        ← Retour à l'accueil
                    </Button>
                </Box>
            </DetailContainer>
        </Box>
    );
};

export default ResultDetail;
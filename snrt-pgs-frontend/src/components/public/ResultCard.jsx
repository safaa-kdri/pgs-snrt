// src/components/public/ResultCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';

// ============================================
// STYLES - IDENTIQUES À OfferCard
// ============================================

const CardWrapper = styled(Box)({
    backgroundColor: '#fbf9f9',
    borderRadius: '8px',
    padding: '20px 24px',
    marginBottom: '16px',
    border: '1px solid #e8edf0',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
        borderColor: '#148aa0',
        backgroundColor: '#f8f9fa',
    },
});

const ResultTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '18px',
    color: '#1a1a2e',
    marginBottom: '4px',
    '& a': {
        color: '#1a1a2e',
        textDecoration: 'none',
        '&:hover': { color: '#148aa0' }
    }
});

const InfoText = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: '14px',
    color: '#555',
    lineHeight: 1.6,
});

// ============================================
// BOUTON "Voir résultat"
// ============================================

const ResultButton = styled(Button)({
    borderRadius: '30px',
    padding: '6px 10px',
    minWidth: '120px',
    height: '32px',
    backgroundColor: '#FFFFFF',
    color: '#0F8DB5',
    border: '1px solid #0F8DB5',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '14px',
    textTransform: 'none',
    boxShadow: 'none !important',
    transition: 'none',
    '&:hover, &:active, &:focus': {
        backgroundColor: '#FFFFFF !important',
        border: '1px solid #0F8DB5 !important',
        boxShadow: 'none !important',
    },
});

// ============================================
// COULEURS DES TYPES DE STAGE
// ============================================

const getTypeColor = (type) => {
    const colors = {
        'PFE': { bg: '#dbeafe', color: '#1d4ed8' },
        'PFA': { bg: '#dcfce7', color: '#15803d' },
        'Initiation': { bg: '#fef3c7', color: '#b45309' },
        'Ete': { bg: '#fce4ec', color: '#b91c1c' },
        'Master': { bg: '#e0e7ff', color: '#4338ca' },
        'Licence': { bg: '#f3e8ff', color: '#7c3aed' },
        'Technicien': { bg: '#e8edf0', color: '#4b5563' },
    };
    return colors[type] || { bg: '#e8edf0', color: '#4b5563' };
};

const TypeBadge = styled(Badge)(({ type }) => {
    const colors = getTypeColor(type);
    return {
        backgroundColor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        fontSize: '12px',
        padding: '4px 12px',
        borderRadius: '4px',
        fontFamily: 'Inter, sans-serif',
        float: 'right',
        marginTop: '4px',
    };
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ResultCard = ({ result }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/resultats/${result._id || result.id}`);
    };

    const handleVoirResultat = (e) => {
        e.stopPropagation();
        navigate(`/resultats/${result._id || result.id}`);
    };

    const formatDate = (date) => {
        if (!date) return 'Non spécifiée';
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getTypeLabel = () => {
        const types = {
            'PFE': 'PFE',
            'PFA': 'PFA',
            'Initiation': 'Initiation',
            'Ete': 'Ete',
            'Master': 'Master',
            'Licence': 'Licence',
            'Technicien': 'Technicien'
        };
        return types[result.typeStage] || result.typeStage || 'Stage';
    };

    return (
        <CardWrapper onClick={handleClick}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                    <ResultTitle>
                        <a href={`/resultats/${result._id || result.id}`}>
                            {result.titreOffre || result.offre?.titre || 'Offre sans titre'}
                        </a>
                    </ResultTitle>
                    <InfoText>
                        Candidat : {result.candidatNom || 'Non spécifié'}
                        <br />
                        Date : {formatDate(result.dateResultat || result.datePublication || result.createdAt)}
                    </InfoText>
                    <ResultButton 
                        onClick={handleVoirResultat}
                        disableRipple={true}
                        disableFocusRipple={true}
                        disableElevation={true}
                        sx={{ mt: 1 }}
                    >
                        Voir résultat
                    </ResultButton>
                </Box>
                <TypeBadge type={result.typeStage}>
                    {getTypeLabel()}
                </TypeBadge>
            </Box>
        </CardWrapper>
    );
};

export default ResultCard;
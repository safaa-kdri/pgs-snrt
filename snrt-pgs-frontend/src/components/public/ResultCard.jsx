// src/components/public/ResultCard.jsx
// ✅ MODIFICATION : Carte style OfferCard avec bouton "Voir résultat" en bas à gauche

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add } from '@mui/icons-material';

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
// BADGE TYPE DE STAGE - IDENTIQUE À OfferCard
// ============================================

const BadgeStyled = styled(Badge)(({ type }) => {
    const colors = {
        'PFE': { bg: '#dbeafe', color: '#1d4ed8' },
        'PFA': { bg: '#dcfce7', color: '#15803d' },
        'Initiation': { bg: '#fef3c7', color: '#b45309' },
        'Ete': { bg: '#fce4ec', color: '#b91c1c' },
        'Master': { bg: '#e0e7ff', color: '#4338ca' },
        'Licence': { bg: '#f3e8ff', color: '#7c3aed' },
        'Technicien': { bg: '#e8edf0', color: '#4b5563' },
    };
    const style = colors[type] || { bg: '#e8edf0', color: '#2d3748' };
    return {
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 500,
        fontSize: '13px',
        padding: '4px 12px',
        borderRadius: '4px',
        fontFamily: 'Inter, sans-serif',
        float: 'right',
        marginTop: '4px',
    };
});

// ============================================
// BOUTON "VOIR RÉSULTAT" - STYLE IDENTIQUE À POSTULER
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
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&:hover, &:active, &:focus': {
        backgroundColor: '#f0f7fa !important',
        border: '1px solid #0F8DB5 !important',
        boxShadow: 'none !important',
    },
    '& .MuiButton-startIcon': {
        margin: 0,
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ResultCard = ({ result }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/resultats/${result._id || result.id}`);
    };

    const handleViewResult = (e) => {
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

    const titre = result.titreOffre || result.offre?.titre || 'Offre sans titre';
    const typeLabel = getTypeLabel();
    const nbPostes = result.nbPostes || 0;
    const dateCloture = result.dateCloture || result.updatedAt;

    return (
        <CardWrapper onClick={handleClick}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                    <ResultTitle>
                        <a href={`/resultats/${result._id || result.id}`}>{titre}</a>
                    </ResultTitle>
                    <InfoText>
                        Nombre postes : {nbPostes}
                        <br />
                        Délai dépôt : {formatDate(dateCloture)}
                    </InfoText>
                    
                    {/* ✅ BOUTON "VOIR RÉSULTAT" EN BAS À GAUCHE */}
                    <ResultButton
                        onClick={handleViewResult}
                        startIcon={<Add sx={{ fontSize: 16 }} />}
                        disableRipple={true}
                        disableFocusRipple={true}
                        disableElevation={true}
                        sx={{ mt: 1 }}
                    >
                        Voir résultat
                    </ResultButton>
                </Box>

                {/* ✅ BADGE TYPE DE STAGE EN HAUT À DROITE */}
                <BadgeStyled type={result.typeStage}>
                    {typeLabel}
                </BadgeStyled>
            </Box>
        </CardWrapper>
    );
};

export default ResultCard;
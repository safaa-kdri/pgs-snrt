// src/components/public/OfferCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';

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

const OfferTitle = styled(Typography)({
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

const BadgeStyled = styled(Badge)({
    backgroundColor: '#e8edf0',
    color: '#2d3748',
    fontWeight: 500,
    fontSize: '13px',
    padding: '4px 12px',
    borderRadius: '4px',
    fontFamily: 'Inter, sans-serif',
    float: 'right',
    marginTop: '4px',
});

const PostulerButton = styled(Button)(({ submitted }) => ({
    borderRadius: '30px',
    padding: '6px 10px',
    minWidth: '120px',
    height: '32px',
    backgroundColor: submitted ? '#2E7D32' : '#FFFFFF',
    color: submitted ? '#FFFFFF' : '#0F8DB5',
    border: submitted ? 'none' : '1px solid #0F8DB5',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '14px',
    textTransform: 'none',
    boxShadow: 'none !important',
    // ✅ Désactive TOUS les effets avec !important
    '&:hover, &:active, &:focus, &.Mui-focusVisible, &.MuiButton-root:hover': {
        backgroundColor: submitted ? '#2E7D32 !important' : '#FFFFFF !important',
        border: submitted ? 'none !important' : '1px solid #0F8DB5 !important',
        boxShadow: 'none !important',
    },
    '&:disabled': {
        backgroundColor: '#2E7D32 !important',
        color: '#FFFFFF !important',
        border: 'none !important',
        opacity: 1,
    },
}));

const OfferCard = ({ offer }) => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);

    const handleClick = () => {
        navigate(`/offres/${offer._id || offer.id}`);
    };

    const handlePostuler = async (e) => {
        e.stopPropagation();
        e.preventDefault(); // ✅ Empêche tout comportement par défaut
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSubmitted(true);
        } catch (error) {
            console.error('Erreur lors de la candidature:', error);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Non spécifiée';
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getBadgeLabel = () => {
        const types = {
            'PFE': 'PFE',
            'PFA': 'PFA',
            'Initiation': 'Initiation',
            'Ete': 'Ete',
            'Master': 'Master',
            'Licence': 'Licence',
            'Technicien': 'Technicien'
        };
        return types[offer.typeStage] || offer.typeStage || 'Stage';
    };

    const getButtonText = () => {
        if (submitted) return '✓ Candidature envoyée';
        return '+ Postuler';
    };

    return (
        <CardWrapper onClick={handleClick}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                    <OfferTitle>
                        <a href={`/offres/${offer._id || offer.id}`}>{offer.titre}</a>
                    </OfferTitle>
                    <InfoText>
                        Nombre postes : {offer.nbPostes || 1}
                        <br />
                        Délai dépôt : {formatDate(offer.dateLimiteCandidature || offer.dateFin)}
                    </InfoText>
                    <PostulerButton 
                        onClick={handlePostuler} 
                        submitted={submitted}
                        disabled={submitted}
                        disableRipple={true}
                        disableFocusRipple={true}
                        disableElevation={true}
                        sx={{ mt: 1 }}
                    >
                        {getButtonText()}
                    </PostulerButton>
                </Box>
                <BadgeStyled>
                    {getBadgeLabel()}
                </BadgeStyled>
            </Box>
        </CardWrapper>
    );
};

export default OfferCard;
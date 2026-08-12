// src/components/public/ApplyPage.jsx
// ✅ REDIRECTION VERS LE NOUVEAU WORKFLOW

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

const ApplyPage = () => {
    const navigate = useNavigate();
    const { offerId } = useParams();

    useEffect(() => {
        // ✅ Rediriger vers le nouveau workflow avec l'ID de l'offre
        navigate('/depot-candidature', { 
            state: { offreId: offerId },
            replace: true 
        });
    }, [navigate, offerId]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress sx={{ color: '#148aa0' }} />
            <Typography sx={{ ml: 2, color: '#687480' }}>
                Redirection vers le dépôt de candidature...
            </Typography>
        </Box>
    );
};

export default ApplyPage;
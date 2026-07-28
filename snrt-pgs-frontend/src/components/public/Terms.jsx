// src/components/public/Terms.jsx
import React from 'react';
import {
    Typography,
    Box,
    Container,
    Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// ============================================
// STYLES TERMS
// ============================================

const PageTitle = styled(Typography)({
    textAlign: 'center',
    fontSize: '28px',
    fontWeight: 700,
    color: '#252930',
    margin: '0 auto 20px',
    maxWidth: '700px',
    lineHeight: 1.3,
    fontFamily: '"Inria Sans", sans-serif',
});

const TitleLine = styled(Box)({
    height: '2px',
    background: '#0b7890',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto 20px',
});

const TermsContent = styled(Box)({
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px',
    textAlign: 'justify',
    '& p': {
        fontSize: '15px',
        lineHeight: 1.8,
        color: '#333',
        marginBottom: '16px',
        fontFamily: 'Arial, Helvetica, sans-serif',
    },
    '& strong': {
        color: '#06445b',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Terms = () => {
    return (
        <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <PageTitle>Termes et Conditions du service</PageTitle>
            <TitleLine />

            <TermsContent>
                <p>
                    Par le biais de ce formulaire, la <strong>SNRT</strong> collecte vos données personnelles en vue de traiter votre candidature pour le recrutement. Ce traitement a fait l'objet d'une autorisation auprès de la <strong>CNDP</strong> n°A-RH-306/2018, ayant pour finalité : <strong>la Gestion des ressources humaines</strong>.
                </p>
                <p>
                    La SNRT prend toutes les précautions utiles pour préserver la sécurité et la confidentialité des données traitées et notamment pour empêcher qu'elles soient détruites, déformées, endommagées ou que des tiers non autorisés puissent en prendre connaissance, conformément à la <strong>loi 09-08</strong>.
                </p>
                <p>
                    Vous pouvez vous adresser à l'adresse suivante : <strong>e-recrutement@snrt.ma</strong> pour exercer vos droits d'accès, de rectification et d'opposition conformément aux dispositions de la <strong>loi 09-08</strong>.
                </p>
            </TermsContent>
        </Box>
    );
};

export default Terms;
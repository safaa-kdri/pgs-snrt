// src/components/public/Terms.jsx
import React from 'react';
import {
    Typography,
    Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// ============================================
// STYLES TERMS - Version Recrutement (reproduite)
// ============================================

const PageTitle = styled(Typography)({
    textAlign: 'left',
    fontSize: '42px',
    fontWeight: 700,
    color: '#252930',
    margin: '0 0 20px 23px',  // ✅ Espace titre → ligne
    maxWidth: 'none',
    lineHeight: 1.2,
    fontFamily: '"Inria Sans", sans-serif',
    '@media (max-width: 768px)': {
        fontSize: '32px',
        margin: '0 0 16px 20px',
    },
    '@media (max-width: 480px)': {
        fontSize: '24px',
        margin: '0 0 12px 16px',
    },
});

const TitleLine = styled(Box)({
    height: '1px',
    background: '#0b7890',
    width: 'calc(100% - 10px)',  // ✅ Ligne presque pleine largeur
    margin: '0 5px 0',
    '@media (max-width: 768px)': {
        width: 'calc(100% - 24px)',
        margin: '0 12px 0',
    },
    '@media (max-width: 480px)': {
        width: 'calc(100% - 20px)',
        margin: '0 10px 0',
    },
});

const TermsContent = styled(Box)({
    width: 'calc(100% - 40px)',  // ✅ Encore plus large
    margin: '40px 20px 0 20px',  // ✅ Marges minimales
    padding: 0,
    textAlign: 'left',

    '& p': {
        fontSize: '15.2px',          // ✅ 16px (était 15px)
        lineHeight: 1.5,           // ✅ 1.5 (était 1.8)
        color: '#333333',
        margin: '0 0 27px 0',      // ✅ 27px (était 16px)
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontWeight: 400,
        textAlign: 'left',         // ✅ left (était justify)
        '@media (max-width: 480px)': {
            fontSize: '14px',
            lineHeight: 1.6,
            margin: '0 0 20px 0',
        },
    },

    '& a': {
        color: '#1387A7',
        textDecoration: 'underline',
        cursor: 'pointer',
        fontWeight: 400,
        '&:hover': {
            color: '#0b5f7a',
        },
    },

    '@media (max-width: 768px)': {
        width: 'calc(100% - 40px)',
        margin: '35px 20px 0 20px',
    },

    '@media (max-width: 480px)': {
        width: 'calc(100% - 32px)',
        margin: '30px 16px 0 16px',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Terms = () => {
    return (
        <Box sx={{ width: '100%', py: { xs: 0, md: 0 } }}>  {/* ✅ Pas d'espace header → titre */}

            <PageTitle>
                Termes et conditions du service
            </PageTitle>

            <TitleLine />

            <TermsContent>

                <p>
                    Par le biais de ce formulaire, la SNRT collecte
                    vos données personnelles en vue de traiter votre candidature
                    pour le stage. Ce traitement a fait l'objet d'une autorisation
                    auprès de la CNDP n°A-RH-306/2018, ayant pour
                    finalité : la Gestion des ressources humaines.La SNRT prend toutes les précautions utiles pour préserver
                    la sécurité et la confidentialité des données traitées et
                    notamment pour empêcher qu'elles soient détruites, déformées,
                    endommagées ou que des tiers non autorisés puissent en prendre
                    connaissance, conformément à la loi 09-08.
                </p>

                <p>
                    Vous pouvez vous adresser à l'adresse suivante :{' '}
                    <a href="mailto:e-recrutement@snrt.ma">
                        e-recrutement@snrt.ma
                    </a>{' '}
                    pour exercer vos droits d'accès, de rectification et
                    d'opposition conformément aux dispositions de la{' '}
                    loi 09-08.
                </p>

            </TermsContent>

        </Box>
    );
};

export default Terms;
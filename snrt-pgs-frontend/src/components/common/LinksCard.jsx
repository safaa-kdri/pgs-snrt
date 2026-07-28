// src/components/common/LinksCard.jsx
import React from 'react';
import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';

const LinksCardStyled = styled(Card)({
    marginTop: '48px',
    padding: '40px 32px',
    backgroundColor: '#f7f7f7',
    borderRadius: '19px',
    textAlign: 'left',
    boxShadow: 'none',
    '& a': {
        display: 'block',
        margin: '0 0 22px',
        color: '#000',
        textDecoration: 'none',
        fontSize: '17px',
        lineHeight: 1.4,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        '&:last-child': { marginBottom: 0 },
    },
});

const LinksCard = () => {
    return (
        <LinksCardStyled>
            <a href="https://www.snrt.ma/" target="_blank" rel="noopener noreferrer">snrt.ma</a>
            <a href="https://e-depot.snrt.ma/" target="_blank" rel="noopener noreferrer">e-dépôt des projets</a>
            <a href="https://e-facture.snrt.ma/" target="_blank" rel="noopener noreferrer">e-facture</a>
            <a href="https://www.regiesnrt.ma/fr" target="_blank" rel="noopener noreferrer">Régie publicitaire</a>
        </LinksCardStyled>
    );
};

export default LinksCard;
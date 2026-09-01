// src/components/public/FAQ.jsx
// ✅ VERSION AVEC TITRE STYLE CONTACT

import React, { useState } from 'react';
import {
    Typography,
    Box,
    Container,
    Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// ============================================
// STYLES FAQ - ALIGNÉ AVEC CONTACT
// ============================================

const PageTitle = styled(Typography)({
    textAlign: 'center',
    fontSize: '42px',
    fontWeight: 700,
    color: '#252930',
    margin: '0 0 16px 0',
    maxWidth: 'none',
    lineHeight: 1.2,
    fontFamily: '"Inria Sans", sans-serif',
    '@media (max-width: 768px)': {
        fontSize: '32px',
        margin: '0 0 12px 0',
    },
    '@media (max-width: 480px)': {
        fontSize: '24px',
        margin: '0 0 10px 0',
    },
});

const TitleLine = styled(Box)({
    height: '1px',
    background: '#0b7890',
    width: 'calc(100% - 10px)',
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

const FaqBox = styled(Box)({
    width: 'calc(100% - 10px)',
    margin: '28px 5px 0 5px',
    border: '1px solid #d4dbe2',
    borderRadius: '5px',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
        width: 'calc(100% - 24px)',
        margin: '28px 12px 0 12px',
    },
    '@media (max-width: 480px)': {
        width: 'calc(100% - 20px)',
        margin: '20px 10px 0 10px',
    },
});

const FaqItem = styled(Box)(({ open }) => ({
    borderBottom: '1px solid #d4dbe2',
    '&:last-child': {
        borderBottom: 0,
    },
    '& .faq-question': {
        minHeight: '50px',
        padding: '14px 48px 14px 18px',
        position: 'relative',
        color: open ? '#075de9' : '#06101b',
        fontSize: '15px',
        lineHeight: 1.4,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'Arial, Helvetica, sans-serif',
        backgroundColor: open ? '#e8f2ff' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        '&::after': {
            content: open ? '"▲"' : '"▼"',
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: open ? '#075de9' : '#111',
            fontSize: '18px',
            fontWeight: 700,
        },
    },
    '& .faq-answer': {
        display: open ? 'block' : 'none',
        padding: '14px 18px 16px',
        color: '#06101b',
        fontSize: '14px',
        lineHeight: 1.6,
        fontFamily: 'Arial, Helvetica, sans-serif',
    },
}));

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: "Comment s'inscrire sur la plateforme E-stages SNRT ?",
            answer: "En vous inscrivant sur la plateforme E-stages SNRT, un message de confirmation sera envoyé à votre adresse email. Si vous ne recevez pas le mail de confirmation juste après votre inscription, veuillez vérifier dans votre boîte SPAM."
        },
        {
            question: "Quels types de fichiers sont supportés pour une candidature de stage ?",
            answer: "Les formats acceptés sont : PDF, DOC, DOCX, PNG et JPG. La taille maximale autorisée est de 5 Mo par fichier."
        },
        {
            question: "Comment suivre le résultat de ma demande de stage ?",
            answer: "Connectez-vous à votre compte E-stages, rendez-vous dans la section 'Mes candidatures' pour suivre l'évolution de votre demande en temps réel."
        }
    ];

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <PageTitle>Foire aux questions</PageTitle>
            <TitleLine />

            <FaqBox>
                {faqs.map((faq, index) => (
                    <FaqItem key={index} open={openIndex === index}>
                        <div className="faq-question" onClick={() => toggleFaq(index)}>
                            {faq.question}
                        </div>
                        <div className="faq-answer">
                            {faq.answer}
                        </div>
                    </FaqItem>
                ))}
            </FaqBox>
        </Box>
    );
};

export default FAQ;
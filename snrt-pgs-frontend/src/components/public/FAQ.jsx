// src/components/public/FAQ.jsx
import React, { useState } from 'react';
import { Typography, Box, Container, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQ = () => {
    const faqs = [
        { question: 'Comment s\'inscrire sur la plateforme ?', answer: 'Rendez-vous sur la page Inscription et remplissez le formulaire avec vos informations personnelles.' },
        { question: 'Quels documents sont nécessaires pour postuler ?', answer: 'Vous devez fournir votre CV, une lettre de motivation et les documents demandés par l\'offre.' },
        { question: 'Comment suivre l\'état de ma candidature ?', answer: 'Connectez-vous à votre compte et consultez la section "Mes candidatures".' },
        { question: 'Que faire si j\'ai oublié mon mot de passe ?', answer: 'Utilisez la fonction "Mot de passe oublié" sur la page de connexion.' },
    ];

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#06455b' }}>
                    Foire aux questions
                </Typography>
                {faqs.map((item, index) => (
                    <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1" fontWeight="bold">{item.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography color="text.secondary">{item.answer}</Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Container>
    );
};

export default FAQ;
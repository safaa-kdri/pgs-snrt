// src/components/public/Contact.jsx
import React from 'react';
import {
    Typography,
    Box,
    Container,
    Grid,
    Button,
    Card,
    TextField,
    MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// ============================================
// STYLES CONTACT
// ============================================

const PageTitle = styled(Typography)({
    textAlign: 'center',
    fontSize: '32px',
    fontWeight: 700,
    color: '#252930',
    margin: '0 auto 10px',
    maxWidth: '600px',
    lineHeight: 1.2,
    fontFamily: '"Inria Sans", sans-serif',
});

const TitleLine = styled(Box)({
    height: '2px',
    background: '#0b7890',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto 10px',
});

const ContactIntro = styled(Box)({
    textAlign: 'center',
});

const AgencyName = styled(Typography)({
    margin: '8px auto 25px',
    maxWidth: '500px',
    color: '#148aa0',
    fontSize: '26px',
    lineHeight: 1.3,
    fontWeight: 500,
    fontFamily: '"Inria Sans", sans-serif',
});

const Address = styled(Typography)({
    margin: '0 0 25px',
    color: '#000',
    fontSize: '18px',
    fontFamily: '"Inria Sans", sans-serif',
});

const ContactCard = styled(Card)({
    maxWidth: '600px',
    margin: '0 auto',
    padding: '28px 28px 24px',
    backgroundColor: '#fbf9f9',
    borderRadius: '22px',
    textAlign: 'center',
    boxShadow: 'none',
});

const ContactField = styled(TextField)({
    width: '100%',
    marginBottom: '8px',
    '& .MuiOutlinedInput-root': {
        height: '38px',
        borderRadius: '10px',
        backgroundColor: '#fff',
        '& fieldset': { borderColor: '#dfe5ea' },
        '&:hover fieldset': { borderColor: '#dfe5ea' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 20px',
        fontSize: '14px',
        color: '#707b86',
    },
});

const ContactSelect = styled(TextField)({
    width: '100%',
    marginBottom: '8px',
    '& .MuiOutlinedInput-root': {
        height: '38px',
        borderRadius: '10px',
        backgroundColor: '#fff',
        '& fieldset': { borderColor: '#dfe5ea' },
        '&:hover fieldset': { borderColor: '#dfe5ea' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 20px',
        fontSize: '14px',
        color: '#101820',
    },
});

const ContactTextarea = styled(TextField)({
    width: '100%',
    marginBottom: '8px',
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#fff',
        '& fieldset': { borderColor: '#dfe5ea' },
        '&:hover fieldset': { borderColor: '#dfe5ea' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '10px 20px',
        fontSize: '14px',
        color: '#707b86',
        minHeight: '55px',
    },
});

const SendButton = styled(Button)({
    width: '150px',
    height: '38px',
    borderRadius: '5px',
    backgroundColor: '#148aa0',
    color: '#fff',
    fontWeight: 700,
    fontSize: '14px',
    textTransform: 'none',
    marginLeft: 'auto',
    display: 'block',
    '&:hover': {
        background: '#0b7890',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Contact = () => {
    return (
        <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <PageTitle>Contactez-nous</PageTitle>
            <TitleLine />

            <ContactIntro>
                <AgencyName>Société Nationale de Radiodiffusion et de Télévision</AgencyName>
                <Address>1 Rue El Brihi Avenue Moulay Abdelaziz -hassan -Rabat</Address>
            </ContactIntro>

            <ContactCard>
                <Typography sx={{ maxWidth: '500px', margin: '0 auto 24px', color: '#000', fontSize: '14px', lineHeight: 1.5 }}>
                    Pour toute question ou problème, vous pouvez nous contacter via ce formulaire ou envoyer un email directement à <strong>stages@snrt.ma.</strong>
                </Typography>

                <ContactField placeholder="* Nom" variant="outlined" />
                <ContactField placeholder="* Prénom" variant="outlined" />
                <ContactField placeholder="* Adresse e-mail" type="email" variant="outlined" />
                <ContactField placeholder="* Téléphone" type="tel" variant="outlined" />

                <ContactSelect select variant="outlined" defaultValue="">
                    <MenuItem value="">* Choisir un sujet</MenuItem>
                    <MenuItem value="Inscription">Inscription</MenuItem>
                    <MenuItem value="Candidature de stage">Candidature de stage</MenuItem>
                    <MenuItem value="Résultat">Résultat</MenuItem>
                    <MenuItem value="Autre">Autre</MenuItem>
                </ContactSelect>

                <ContactTextarea placeholder="* Message" multiline rows={3} variant="outlined" />

                <SendButton>envoyer</SendButton>
            </ContactCard>
        </Box>
    );
};

export default Contact;
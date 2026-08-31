// src/components/public/Contact.jsx
import React from 'react';
import {
    Typography,
    Box,
    Button,
    Card,
    TextField,
    MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// ============================================
// STYLES CONTACT - Aligné avec Terms (titre centré)
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

const ContactIntro = styled(Box)({
    width: 'calc(100% - 10px)',
    margin: '15px 5px 0 5px',
    textAlign: 'center',
    '@media (max-width: 768px)': {
        width: 'calc(100% - 24px)',
        margin: '15px 12px 0 12px',
    },
    '@media (max-width: 480px)': {
        width: 'calc(100% - 20px)',
        margin: '15px 10px 0 10px',
    },
});

const AgencyName = styled(Typography)({
    margin: '0 0 4px 0',
    color: '#148aa0',
    fontSize: '27px',
    lineHeight: 1.3,
    fontWeight: 400,
    fontFamily: '"Inria Sans", sans-serif',
    width: '100%',
    textAlign: 'center',
    display: 'block',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    '@media (max-width: 768px)': {
        fontSize: '18px',
        width: '100%',
    },
    '@media (max-width: 480px)': {
        fontSize: '16px',
        width: '100%',
    },
});


const Address = styled(Typography)({
    margin: '48px 0 55px 0',
    color: '#333333',
    fontSize: '16px',
    fontFamily: '"Inria Sans", sans-serif',
    '@media (max-width: 480px)': {
        fontSize: '14px',
    },
});

const ContactCard = styled(Card)({
    width: 'calc(100% - 10px)',
    margin: '0 5px 0 5px',
    padding: '28px 28px 24px',
    backgroundColor: '#fbf9f9',
    borderRadius: '22px',
    textAlign: 'left',
    boxShadow: 'none',
    '@media (max-width: 768px)': {
        width: 'calc(100% - 24px)',
        margin: '0 12px 0 12px',
    },
    '@media (max-width: 480px)': {
        width: 'calc(100% - 20px)',
        margin: '0 10px 0 10px',
        padding: '20px 16px',
    },
});

const ContactDescription = styled(Typography)({
    textAlign: 'center',
    maxWidth: '100%',
    margin: '16px 0 50px 15px',
    color: '#333333',
    fontSize: '15.2px',
    lineHeight: 1.5,
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 400,
    '& strong': {
        fontWeight: 700,
        color: '#333333',
    },
    '@media (max-width: 480px)': {
        fontSize: '14px',
        lineHeight: 1.6,
    },
});

const ContactField = styled(TextField)({
    width: '90%',
    marginBottom: '10px',
    '& .MuiOutlinedInput-root': {
        height: '48px',
        borderRadius: '10px',
        backgroundColor: '#fff',
        '& fieldset': { borderColor: '#dfe5ea' },
        '&:hover fieldset': { borderColor: '#dfe5ea' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 28px',
        fontSize: '15px',
        color: '#6d7884',
        '&::placeholder': {
            color: '#888888',
            opacity: 1,
        },
    },
});

const ContactSelect = styled(TextField)({
    width: '90%',
    marginBottom: '18px',
    '& .MuiOutlinedInput-root': {
        height: '48px',
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
    marginBottom: '18px',
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#fff',
        '& fieldset': { borderColor: '#dfe5ea' },
        '&:hover fieldset': { borderColor: '#dfe5ea' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '14px 20px',
        fontSize: '14px',
        color: '#707b86',
        minHeight: '60px',
    },
});

const SendButton = styled(Button)({
    width: '160px',
    height: '46px',
    borderRadius: '8px',
    backgroundColor: '#17a2b8',
    color: '#fff',
    fontWeight: 700,
    fontSize: '14px',
    textTransform: 'none',
    marginLeft: 'auto',
    display: 'block',
    '&:hover': {
        background: '#148aa0',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Contact = () => {
    return (
        <Box sx={{ width: '100%', py: { xs: 0, md: 0 } }}>

            <PageTitle>
                Contactez-nous
            </PageTitle>

            <TitleLine />

            <ContactIntro>
                <AgencyName>
                    Société Nationale de Radiodiffusion et de Télévision
                </AgencyName>
                <Address>
                    1 Rue El Brihi Avenue Moulay Abdelaziz -hassan -Rabat
                </Address>
            </ContactIntro>

            <ContactCard>
                <ContactDescription>
                    Pour toute question ou problème, vous pouvez nous contacter via ce formulaire ou envoyer un email directement à <strong>stages@snrt.ma.</strong>
                </ContactDescription>

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
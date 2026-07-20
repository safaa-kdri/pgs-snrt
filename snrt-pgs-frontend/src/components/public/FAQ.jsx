// src/components/public/FAQ.jsx
import React, { useState } from 'react';
import {
    Typography,
    Box,
    Container,
    Grid,
    Button,
    Card,
    InputAdornment,
    TextField,
    MenuItem,
    Link
} from '@mui/material';
import { styled } from '@mui/material/styles';

// ============================================
// STYLES PERSONNALISÉS (IDENTIQUE À HOME)
// ============================================

const SideCard = styled(Card)({
    backgroundColor: '#f7f7f7',
    borderRadius: '19px',
    padding: '32px 20px 20px',
    textAlign: 'center',
    minHeight: '480px',
    boxShadow: 'none',
    '& h2': {
        margin: '0 0 18px',
        color: '#07111b',
        fontSize: '18px',
        lineHeight: 1.2,
        fontWeight: 400,
    },
});

const AttemptsText = styled(Typography)({
    margin: '0 0 18px',
    color: '#687480',
    fontSize: '13px',
    lineHeight: 1.5,
    '& strong': { fontWeight: 700 },
});

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '27px',
        backgroundColor: '#ffffff',
        height: '42px',
        '& fieldset': { borderColor: '#e1e6eb' },
        '&:hover fieldset': { borderColor: '#e1e6eb' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 20px 0 45px',
        fontSize: '15px',
        color: '#6d7884',
    },
    '& .MuiInputAdornment-root': {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#aab1b8',
        zIndex: 1,
        pointerEvents: 'none',
    },
    width: '100%',
    maxWidth: '220px',
    margin: '0 auto 10px',
    display: 'block',
});

const CaptchaBox = styled(Box)({
    height: '42px',
    margin: '6px 0',
    background: '#e8e8e8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '6px',
    '& svg': {
        width: '140px',
        height: '40px',
    },
});

const CaptchaInput = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '6px',
        height: '36px',
        backgroundColor: '#ffffff',
        '& fieldset': { borderColor: '#e1e6eb' },
    },
    '& .MuiInputBase-input': {
        padding: '0 14px',
        fontSize: '14px',
        color: '#6d7884',
    },
    width: '120px',
});

const GrayButton = styled(Button)({
    height: '36px',
    border: 0,
    borderRadius: '5px',
    padding: '0 12px',
    backgroundColor: '#68727c',
    color: '#fff',
    fontSize: '12px',
    fontFamily: 'Arial, Helvetica, sans-serif',
    textTransform: 'none',
    minWidth: '80px',
    '&:hover': { backgroundColor: '#555' },
});

const LoginButton = styled(Button)({
    width: '100%',
    height: '42px',
    marginBottom: '8px',
    maxWidth: '220px',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: '23px',
    backgroundColor: '#148aa0',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    textTransform: 'none',
    '&:hover': { backgroundColor: '#0b7890' },
    '& i': { marginRight: '8px' },
});

const ForgotLink = styled(Link)({
    color: '#075fff',
    fontSize: '14px',
    textDecoration: 'underline',
    display: 'block',
    marginBottom: '12px',
    cursor: 'pointer',
});

const TermsText = styled(Typography)({
    width: '120px',
    margin: '0 auto',
    color: '#000',
    fontSize: '12px',
    lineHeight: 1.5,
    '& a': { color: '#075fff' },
});

const LinksCard = styled(Card)({
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
        '&:last-child': { marginBottom: 0 },
    },
});

const SearchCard = styled(Card)({
    backgroundColor: '#f7f7f7',
    borderRadius: '19px',
    padding: '32px 20px 20px',
    textAlign: 'center',
    minHeight: '480px',
    boxShadow: 'none',
    '& h2': {
        margin: '0 0 18px',
        color: '#07111b',
        fontSize: '18px',
        lineHeight: 1.2,
        fontWeight: 400,
        fontFamily: '"Inria Sans", sans-serif',
        whiteSpace: 'nowrap',
    },
});

const SearchField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '27px',
        backgroundColor: '#ffffff',
        height: '42px',
        '& fieldset': { borderColor: '#e1e6eb' },
        '&:hover fieldset': { borderColor: '#e1e6eb' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 28px',
        fontSize: '15px',
        color: '#6d7884',
    },
    width: '100%',
    maxWidth: '220px',
    margin: '0 auto 10px',
    display: 'block',
});

const DateField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '27px',
        backgroundColor: '#ffffff',
        height: '42px',
        '& fieldset': { borderColor: '#e1e6eb' },
        '&:hover fieldset': { borderColor: '#e1e6eb' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 45px 0 28px',
        fontSize: '15px',
        color: '#6d7884',
    },
    width: '100%',
    maxWidth: '220px',
    margin: '0 auto 10px',
    display: 'block',
});

const SearchButton = styled(Button)({
    width: '200px',
    height: '42px',
    marginTop: '2px',
    borderRadius: '23px',
    backgroundColor: '#148aa0',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    textTransform: 'none',
    '&:hover': { backgroundColor: '#0b7890' },
});

const PageTitle = styled(Typography)({
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 700,
    color: '#252930',
    margin: '0 auto 10px',
    maxWidth: '600px',
    lineHeight: 1.2,
});

const TitleLine = styled(Box)({
    height: '2px',
    background: '#0b7890',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto 10px',
});

const FaqBox = styled(Box)({
    maxWidth: '600px',
    margin: '28px auto 0',
    border: '1px solid #d4dbe2',
    borderRadius: '5px',
    overflow: 'hidden',
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
        <Container maxWidth="xl" sx={{
            padding: 0,
            margin: 0,
            maxWidth: '100%'
        }}>
            <Grid container spacing={0}>
                {/* ===== SIDEBAR GAUCHE ===== */}
                <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                    <SideCard>
                        <h2>Authentification</h2>

                        <AttemptsText>
                            Vous avez <strong>3 tentatives</strong> pour
                            entrer un mot de passe
                            correct. Après la 3ème
                            tentative incorrecte, votre
                            compte sera <strong>bloqué pendant
                            60 minutes.</strong>
                        </AttemptsText>

                        <StyledTextField
                            placeholder="CIN"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <i className="fa-solid fa-envelope" style={{ fontSize: 16 }}></i>
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                        />

                        <StyledTextField
                            placeholder="Mot de passe"
                            type="password"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <i className="fa-solid fa-lock" style={{ fontSize: 16 }}></i>
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                        />

                        <CaptchaBox>
                            <svg viewBox="0 0 240 70" aria-hidden="true">
                                <path d="M8 25 C54 5, 111 44, 230 16" fill="none" stroke="#65b0ff" strokeWidth="2"/>
                                <path d="M10 50 C77 25, 153 64, 232 42" fill="none" stroke="#71d744" strokeWidth="2"/>
                                <text x="18" y="53" fontSize="50" fontFamily="Trebuchet MS" fill="#66dc52">h</text>
                                <text x="56" y="53" fontSize="50" fontFamily="Trebuchet MS" fill="#ef58ba">4</text>
                                <text x="94" y="53" fontSize="50" fontFamily="Trebuchet MS" fill="#ef9d43">U</text>
                                <text x="136" y="53" fontSize="50" fontFamily="Trebuchet MS" fill="#ff5db7">F</text>
                                <text x="176" y="53" fontSize="50" fontFamily="Trebuchet MS" fill="#64e1d6">s</text>
                                <text x="210" y="53" fontSize="50" fontFamily="Trebuchet MS" fill="#5bdd52">0</text>
                            </svg>
                        </CaptchaBox>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center' }}>
                            <CaptchaInput placeholder="Saisisse" variant="outlined" />
                            <GrayButton>Régénérer</GrayButton>
                        </Box>

                        <LoginButton>
                            <i className="fa-solid fa-arrow-right-to-bracket"></i> Se connecter
                        </LoginButton>

                        <ForgotLink href="#">Mot de passe oublié !</ForgotLink>

                        <TermsText>
                            En vous connectant, vous acceptez nos <a href="#">Termes et Conditions</a> du service
                        </TermsText>
                    </SideCard>

                    <LinksCard sx={{ display: { xs: 'none', md: 'block' } }}>
                        <a href="https://www.snrt.ma/" target="_blank" rel="noopener noreferrer">snrt.ma</a>
                        <a href="https://e-depot.snrt.ma/" target="_blank" rel="noopener noreferrer">e-dépôt des projets</a>
                        <a href="https://e-facture.snrt.ma/" target="_blank" rel="noopener noreferrer">e-facture</a>
                        <a href="https://www.regiesnrt.ma/fr" target="_blank" rel="noopener noreferrer">Régie publicitaire</a>
                    </LinksCard>
                </Grid>

                {/* ===== CONTENU PRINCIPAL ===== */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        px: { xs: 2, md: 3 },
                        py: { xs: 2, md: 3 },
                        borderLeft: { md: '1px solid #cfd5da' },
                        borderRight: { md: '1px solid #cfd5da' },
                    }}
                >
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
                </Grid>

                {/* ===== SIDEBAR DROITE ===== */}
                <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                    <SearchCard>
                        <h2>Recherche les résultats</h2>

                        <SearchField placeholder="Profil" variant="outlined" />

                        <SearchField
                            select
                            variant="outlined"
                            defaultValue=""
                            sx={{
                                '& .MuiInputBase-input': { color: '#111' },
                            }}
                        >
                            <MenuItem value="">* Sélectionne</MenuItem>
                            <MenuItem value="Informatique">Informatique</MenuItem>
                            <MenuItem value="Audiovisuel">Audiovisuel</MenuItem>
                            <MenuItem value="Gestion">Gestion</MenuItem>
                            <MenuItem value="Communication">Communication</MenuItem>
                        </SearchField>

                        <DateField
                            placeholder="dd/mm/yy"
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end" sx={{ position: 'absolute', right: '16px', color: '#333' }}>
                                        <i className="fa-solid fa-calendar"></i>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <SearchButton>Rechercher</SearchButton>
                    </SearchCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default FAQ;
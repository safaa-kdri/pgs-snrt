// src/components/public/Contact.jsx
import React from 'react';
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
// STYLES
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

// ✅ SEARCH CARD - Exactement comme Home.jsx
const SearchCard = styled(Card)({
    backgroundColor: '#f7f7f7',
    borderRadius: '19px',
    padding: '32px 20px 20px',
    minHeight: '400px',
    maxHeight: '560px',
    position: 'sticky',
    top: '20px',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
    '& h2': {
        marginBottom: '18px',
        color: '#07111b',
        fontSize: '18px',
        fontWeight: 400,
        textAlign: 'center',
        fontFamily: '"Inria Sans", sans-serif',
        flexShrink: 0,
    },
});

const SearchField = styled(TextField)({
    width: '100%',
    maxWidth: '220px',
    marginBottom: '10px',
    flexShrink: 0,
    '& .MuiOutlinedInput-root': {
        height: '42px',
        borderRadius: '27px',
        background: '#fff',
        '& fieldset': { borderColor: '#e1e6eb' },
        '&:hover fieldset': { borderColor: '#e1e6eb' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 28px',
        fontSize: '15px',
        color: '#6d7884',
    },
});

const DateField = styled(TextField)({
    width: '100%',
    maxWidth: '220px',
    marginBottom: '10px',
    flexShrink: 0,
    '& .MuiOutlinedInput-root': {
        height: '42px',
        borderRadius: '27px',
        background: '#fff',
        '& fieldset': { borderColor: '#e1e6eb' },
        '&:hover fieldset': { borderColor: '#e1e6eb' },
        '&.Mui-focused fieldset': { borderColor: '#148aa0' },
    },
    '& .MuiInputBase-input': {
        padding: '0 45px 0 28px',
        fontSize: '15px',
        color: '#6d7884',
    },
});

const SearchButton = styled(Button)({
    width: '200px',
    height: '42px',
    marginTop: '2px',
    borderRadius: '23px',
    background: '#148aa0',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    textTransform: 'none',
    flexShrink: 0,
    '&:hover': { background: '#0b7890' },
});

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
        <Container maxWidth="xl" sx={{ padding: 0, margin: 0, maxWidth: '100%' }}>
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
                                <path d="M7 50 C70 19, 124 63, 232 30" fill="none" stroke="#8add49" strokeWidth="2"/>
                                <path d="M10 18 C80 40, 137 8, 228 42" fill="none" stroke="#61a5ff" strokeWidth="2"/>
                                <text x="13" y="52" fontSize="48" fontFamily="Trebuchet MS" fill="#8add49">E</text>
                                <text x="50" y="52" fontSize="48" fontFamily="Trebuchet MS" fill="#62dccd">Q</text>
                                <text x="91" y="52" fontSize="48" fontFamily="Trebuchet MS" fill="#ff65ba">N</text>
                                <text x="132" y="52" fontSize="48" fontFamily="Trebuchet MS" fill="#fb8f3a">E</text>
                                <text x="171" y="52" fontSize="48" fontFamily="Trebuchet MS" fill="#58a0ff">c</text>
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
                            En vous connectant, vous acceptez nos <a href="/terms">Termes et Conditions</a> du service
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
                </Grid>

                {/* ===== SIDEBAR DROITE - STICKY ===== */}
                <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                    <SearchCard>
                        <h2>Recherche les résultats</h2>

                        <SearchField
                            placeholder="Profil"
                            variant="outlined"
                        />

                        <SearchField
                            select
                            defaultValue=""
                            variant="outlined"
                        >
                            <MenuItem value="">* Sélectionner</MenuItem>
                            <MenuItem value="Informatique">Informatique</MenuItem>
                            <MenuItem value="Audiovisuel">Audiovisuel</MenuItem>
                            <MenuItem value="Gestion">Gestion</MenuItem>
                            <MenuItem value="Communication">Communication</MenuItem>
                        </SearchField>

                        <DateField
                            placeholder="jj/mm/aaaa"
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment
                                        position="end"
                                        sx={{
                                            position: 'absolute',
                                            right: 16,
                                            color: '#333'
                                        }}
                                    >
                                        <i className="fa-solid fa-calendar"></i>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <SearchButton>
                            Rechercher
                        </SearchButton>
                    </SearchCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Contact;
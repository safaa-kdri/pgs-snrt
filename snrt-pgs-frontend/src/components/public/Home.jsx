// src/components/public/Home.jsx
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
// STYLES PERSONNALISÉS
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

const HeroTitle = styled(Typography)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '38px',
    fontWeight: 700,
    color: '#222',
    lineHeight: 1.2,
    margin: '5px auto 8px',
    maxWidth: '100%',
    '& span': {
        color: '#168eb4',
        fontWeight: 700,
        fontStyle: 'italic',
    },
    [theme.breakpoints.down('md')]: { fontSize: '32px' },
    [theme.breakpoints.down('sm')]: { fontSize: '24px' },
}));

const HeroDivider = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    margin: '6px 0 8px',
    width: '100%',
    '& hr': {
        flex: 1,
        maxWidth: '100%',
        border: 'none',
        borderTop: '2px solid #168eb4',
    },
    '& i': {
        color: '#178fb5',
        fontSize: '24px',
    },
});

const HeroSubtitle = styled(Typography)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: '0 0 10px',
    fontSize: '18px',
    color: '#555',
});

const TabButton = styled(Button)(({ active }) => ({
    width: '110px',
    height: '34px',
    borderRadius: '8px',
    border: '1px solid #168eb4',
    fontSize: '15px',
    fontWeight: 600,
    textTransform: 'none',
    fontFamily: 'Arial, Helvetica, sans-serif',
    backgroundColor: active ? '#148aa0' : 'transparent',
    color: active ? '#fff' : '#168eb4',
    '&:hover': {
        backgroundColor: active ? '#0b7890' : 'rgba(20, 138, 160, 0.1)',
    },
}));

const EmptyBox = styled(Box)({
    width: '100%',
    maxWidth: '600px',
    minHeight: '40px',
    margin: '0 auto 4px',
    borderRadius: '19px',
    backgroundColor: '#fbf9f9',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 14px',
    color: '#081323',
    fontSize: '14px',
    fontWeight: 700,
    '& i': {
        fontSize: '18px',
        color: '#168eb4',
    },
    '& h3': {
        margin: 0,
        fontSize: '16px',
        fontWeight: 700,
    },
    '& p': {
        margin: '1px 0 0',
        fontSize: '14px',
        fontWeight: 400,
        color: '#555',
    },
});

const PagerBox = styled(Box)({
    width: '70px',
    marginLeft: 'calc((100% - min(600px, 100%)) / 2)',
    display: 'flex',
    border: '1px solid #d9dee3',
    borderRadius: '6px',
    overflow: 'hidden',
    marginTop: '2px',
    '& button': {
        width: '35px',
        height: '28px',
        border: 0,
        borderRight: '1px solid #d9dee3',
        background: '#fff',
        color: '#f05f1c',
        fontSize: '11px',
        cursor: 'pointer',
        fontFamily: 'Arial, Helvetica, sans-serif',
        '&:last-child': { borderRight: 0 },
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Home = () => {
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
                                <path d="M7 17 C45 35, 82 2, 132 25 S205 12, 232 32" fill="none" stroke="#589dff" strokeWidth="2"/>
                                <path d="M10 48 C64 28, 115 58, 230 17" fill="none" stroke="#ef5fb0" strokeWidth="2"/>
                                <text x="15" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#75e45e" transform="rotate(-4 15 50)">0</text>
                                <text x="53" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#65e4d6" transform="rotate(6 53 50)">v</text>
                                <text x="91" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#59e2d8" transform="rotate(-7 91 50)">t</text>
                                <text x="124" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#3364f0" transform="rotate(9 124 50)">y</text>
                                <text x="162" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#ff65c8" transform="rotate(-5 162 50)">6</text>
                                <text x="200" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#65e45e" transform="rotate(7 200 50)">d</text>
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
                    <HeroTitle>
                        Bienvenue sur l'espace
                        <br />
                        <span>stages</span> de la SNRT
                    </HeroTitle>

                    <HeroDivider>
                        <hr />
                        <i className="fa-solid fa-graduation-cap"></i>
                        <hr />
                    </HeroDivider>

                    <HeroSubtitle>
                        Votre passerelle vers l'expérience professionnelle
                    </HeroSubtitle>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TabButton active={true}>Offres</TabButton>
                        <TabButton active={false}>Résultats</TabButton>
                    </Box>

                    <EmptyBox>
                        <i className="fa-solid fa-circle-info"></i>
                        <Box>
                            <h3>Aucune offre de stage disponible</h3>
                            <p>Restez connecté. Les nouvelles offres de stage seront bientôt publiées.</p>
                        </Box>
                    </EmptyBox>

                    <PagerBox>
                        <button type="button">&lt; &lt;</button>
                        <button type="button">&gt; &gt;</button>
                    </PagerBox>
                </Grid>

                {/* ===== SIDEBAR DROITE ===== */}
                <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                    <SearchCard>
                        <h2>Recherche les offres</h2>

                        <SearchField placeholder="Profil" variant="outlined" />

                        <SearchField
                            select
                            variant="outlined"
                            defaultValue=""
                            sx={{
                                '& .MuiInputBase-input': { color: '#111' },
                            }}
                        >
                            <MenuItem value="">* Séléctionne</MenuItem>
                            <MenuItem value="Informatique">Informatique</MenuItem>
                            <MenuItem value="Audiovisuel">Audiovisuel</MenuItem>
                            <MenuItem value="Gestion">Gestion</MenuItem>
                            <MenuItem value="Communication">Communication</MenuItem>
                        </SearchField>

                        <DateField
                            placeholder="jj/mm/aaa"
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end" sx={{ position: 'absolute', right: '16px', color: '#333' }}>
                                        <i className="fa-solid fa-calendar"></i>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <SearchButton>Recherche</SearchButton>
                    </SearchCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Home;
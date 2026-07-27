// src/components/public/OfferDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography,
    Box,
    Container,
    Grid,
    Button,
    Card,
    Chip,
    Divider,
    Paper,
    CircularProgress,
    Alert,
    Link,
    InputAdornment,
    TextField,
    MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchOfferById, clearSelectedOffer } from '../../store/slices/offerSlice';

// ============================================
// STYLES - IDENTIQUES À HOME
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
        fontFamily: '"Inter", sans-serif',
    },
});

const AttemptsText = styled(Typography)({
    margin: '0 0 18px',
    color: '#687480',
    fontSize: '13px',
    lineHeight: 1.5,
    fontFamily: 'Inter, sans-serif',
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
        fontFamily: 'Inter, sans-serif',
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
        fontFamily: 'Inter, sans-serif',
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
    fontFamily: 'Inter, sans-serif',
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
    fontFamily: 'Inter, sans-serif',
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
    fontFamily: 'Inter, sans-serif',
});

const TermsText = styled(Typography)({
    width: '120px',
    margin: '0 auto',
    color: '#000',
    fontSize: '12px',
    lineHeight: 1.5,
    fontFamily: 'Inter, sans-serif',
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
        fontFamily: 'Inter, sans-serif',
        '&:last-child': { marginBottom: 0 },
    },
});

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
        fontFamily: '"Inter", sans-serif',
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
        fontFamily: 'Inter, sans-serif',
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
        fontFamily: 'Inter, sans-serif',
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
    fontFamily: 'Inter, sans-serif',
    '&:hover': { background: '#0b7890' },
});

// ============================================
// STYLES SPÉCIFIQUES OFFER DETAIL - TAILLE RÉDUITE
// ============================================

const DetailContainer = styled(Box)({
    maxWidth: '100%',
    padding: '20px 0',
});

const JobTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '32px',
    color: '#20252B',
    textAlign: 'center',
    marginBottom: '32px',
    lineHeight: 1.2,
});

const InfoCard = styled(Paper)({
    backgroundColor: '#F8F7F7',
    borderRadius: '20px',
    padding: '28px 32px',
    boxShadow: 'none',
    width: '100%',
    minHeight: '160px',
});

const InfoRow = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
});

const InfoText = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '17px',
    color: '#222222',
});

const InfoDivider = styled(Box)({
    width: '100%',
    height: '1px',
    backgroundColor: '#D9D9D9',
    margin: '18px 0',
});

// ============================================
// BOUTON POSTULER - COULEUR DU THEME (#148aa0)
// ============================================

const PostulerButton = styled(Button)(({ submitted }) => ({
    width: '200px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: submitted ? '#2E7D32' : '#148aa0',
    color: '#FFFFFF',
    border: 'none',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '16px',
    textTransform: 'none',
    boxShadow: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: submitted ? '#2E7D32' : '#0b7890',
        boxShadow: 'none',
    },
    '&:disabled': {
        backgroundColor: '#2E7D32',
        color: '#FFFFFF',
        opacity: 1,
    },
}));

const SectionTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '28px',
    color: '#1F2937',
    marginBottom: '20px',
    marginTop: '40px',
});

const SubSectionTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '20px',
    color: '#1F2937',
    textDecoration: 'underline',
    marginBottom: '12px',
    marginTop: '24px',
});

const Paragraph = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '28px',
    color: '#2D3748',
    marginBottom: '12px',
    textAlign: 'justify',
});

const BulletItem = styled(Box)({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '16px',
});

const BulletTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
    fontSize: '16px',
    color: '#1F2937',
    minWidth: 'fit-content',
});

const BulletDescription = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '28px',
    color: '#2D3748',
});

const DocumentCard = styled(Box)({
    width: '320px',
    height: '72px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #0F8DB5',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
        backgroundColor: '#F4FBFD',
    },
});

const PdfIcon = styled(Box)({
    width: '38px',
    height: '44px',
    backgroundColor: '#E53935',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 700,
    flexShrink: 0,
});

const DocTitle = styled(Typography)({
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '15px',
    color: '#222222',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const OfferDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [submitted, setSubmitted] = useState(false);

    const { selectedOffer, loading, error } = useSelector((state) => state.offers);
    const isAuthenticated = !!localStorage.getItem('token');

    useEffect(() => {
        if (id) {
            dispatch(fetchOfferById(id));
        }
        return () => {
            dispatch(clearSelectedOffer());
        };
    }, [dispatch, id]);

    const handlePostuler = async () => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSubmitted(true);
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const handleDownload = () => {
        alert('📄 Téléchargement du document...');
    };

    const offer = selectedOffer;

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ padding: 0, margin: 0, maxWidth: '100%' }}>
                <Grid container spacing={0}>
                    <Grid item xs={12} md={3} sx={{ px: 1, py: 3 }}><SideCard><h2>Authentification</h2></SideCard></Grid>
                    <Grid item xs={12} md={6} sx={{ px: 3, py: 3, borderLeft: '1px solid #cfd5da', borderRight: '1px solid #cfd5da' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress sx={{ color: '#148aa0' }} />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ px: 1, py: 3 }}><SearchCard><h2>Recherche</h2></SearchCard></Grid>
                </Grid>
            </Container>
        );
    }

    if (error || !offer) {
        return (
            <Container maxWidth="xl" sx={{ padding: 0, margin: 0, maxWidth: '100%' }}>
                <Grid container spacing={0}>
                    <Grid item xs={12} md={3} sx={{ px: 1, py: 3 }}><SideCard><h2>Authentification</h2></SideCard></Grid>
                    <Grid item xs={12} md={6} sx={{ px: 3, py: 3, borderLeft: '1px solid #cfd5da', borderRight: '1px solid #cfd5da' }}>
                        <Alert severity="error" sx={{ mt: 2 }}>{error || 'Offre non trouvée'}</Alert>
                        <Button sx={{ mt: 2, color: '#0F8DB5' }} onClick={() => navigate('/offres')}>← Retour aux offres</Button>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ px: 1, py: 3 }}><SearchCard><h2>Recherche</h2></SearchCard></Grid>
                </Grid>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ padding: 0, margin: 0, maxWidth: '100%' }}>
            <Grid container spacing={0}>
                {/* ===== SIDEBAR GAUCHE ===== */}
                <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                    <SideCard>
                        <h2>Authentification</h2>
                        <AttemptsText>
                            Vous avez <strong>3 tentatives</strong> pour entrer un mot de passe
                            correct. Après la 3ème tentative incorrecte, votre compte sera <strong>bloqué pendant 60 minutes.</strong>
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
                                <path d="M7 17 C45 35, 82 2, 132 25 S205 12, 232 32" fill="none" stroke="#589dff" strokeWidth="2" />
                                <path d="M10 48 C64 28, 115 58, 230 17" fill="none" stroke="#ef5fb0" strokeWidth="2" />
                                <text x="15" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#75e45e" transform="rotate(-4 15 50)">X</text>
                                <text x="53" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#65e4d6" transform="rotate(6 53 50)">h</text>
                                <text x="91" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#59e2d8" transform="rotate(-7 91 50)">F</text>
                                <text x="124" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#3364f0" transform="rotate(9 124 50)">0</text>
                                <text x="162" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#ff65c8" transform="rotate(-5 162 50)">M</text>
                                <text x="200" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#65e45e" transform="rotate(7 200 50)">Z</text>
                            </svg>
                        </CaptchaBox>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center' }}>
                            <CaptchaInput placeholder="Saisissez" variant="outlined" />
                            <GrayButton>Régénérer</GrayButton>
                        </Box>

                        <LoginButton>
                            <i className="fa-solid fa-arrow-right-to-bracket"></i> Se connecter
                        </LoginButton>

                        <ForgotLink href="/forgot-password">Mot de passe oublié !</ForgotLink>

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
                <Grid item xs={12} md={6} sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, borderLeft: { md: '1px solid #cfd5da' }, borderRight: { md: '1px solid #cfd5da' } }}>
                    <DetailContainer>
                        <JobTitle>{offer.titre}</JobTitle>

                        <InfoCard>
                            <InfoRow>
                                <InfoText>Type de recrutement : {offer.typeStage || 'Stage'}</InfoText>
                            </InfoRow>

                            <InfoDivider />

                            <InfoRow>
                                <InfoText>Nombre de postes : {offer.nbPostes || 1}</InfoText>
                                <PostulerButton
                                    onClick={handlePostuler}
                                    submitted={submitted}
                                    disabled={submitted}
                                    disableRipple={true}
                                >
                                    {submitted ? '✓ Candidature envoyée' : '+ Postuler'}
                                </PostulerButton>
                            </InfoRow>
                        </InfoCard>

                        <SectionTitle>Description de l'offre :</SectionTitle>

                        <SubSectionTitle>Mission :</SubSectionTitle>
                        <Paragraph>{offer.description}</Paragraph>

                        <SubSectionTitle>Activités</SubSectionTitle>

                        {offer.sujets && offer.sujets.length > 0 ? (
                            offer.sujets.map((sujet, index) => (
                                <BulletItem key={index}>
                                    <BulletTitle>• {sujet.titre} :</BulletTitle>
                                    <BulletDescription>{sujet.description}</BulletDescription>
                                </BulletItem>
                            ))
                        ) : (
                            <Paragraph>Aucune activité spécifiée pour cette offre.</Paragraph>
                        )}

                        <Box sx={{ mt: 5 }}>
                            <SubSectionTitle>Documents joints</SubSectionTitle>

                            <DocumentCard onClick={handleDownload}>
                                <PdfIcon>PDF</PdfIcon>
                                <DocTitle>Arrêté d'ouverture du concours</DocTitle>
                            </DocumentCard>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                            <Button
                                onClick={() => navigate('/offres')}
                                sx={{ color: '#6d7884', textTransform: 'none', fontFamily: 'Inter, sans-serif' }}
                            >
                                ← Retour aux offres
                            </Button>
                        </Box>
                    </DetailContainer>
                </Grid>

                {/* ===== SIDEBAR DROITE ===== */}
                <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                    <SearchCard>
                        <h2>Recherche les résultats</h2>

                        <SearchField placeholder="Profil" variant="outlined" />

                        <SearchField select defaultValue="" variant="outlined">
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
                                    <InputAdornment position="end" sx={{ position: 'absolute', right: 16, color: '#333' }}>
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

export default OfferDetail;
// src/components/public/OffersList.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
    Typography,
    Box,
    Container,
    Grid,
    Button,
    Card,
    TextField,
    MenuItem,
    CircularProgress,
    Pagination,
    Alert,
    InputAdornment,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { fetchOffers, fetchDepartments, setFilter, setPage, resetFilters } from '../../store/slices/offerSlice';
import OfferCard from './OfferCard';

// ============================================
// STYLES (IDENTIQUES À HOME)
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
    minHeight: '400px',
    position: 'sticky',
    top: '20px',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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

const PageTitle = styled(Typography)({
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 700,
    color: '#252930',
    margin: '0 auto 10px',
});

const TitleLine = styled(Box)({
    height: '2px',
    background: '#cfd5da',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto 10px',
});

const ResultsCount = styled(Typography)({
    textAlign: 'center',
    color: '#6d7884',
    fontSize: '14px',
    marginBottom: '16px',
});

const NoResultsBox = styled(Box)({
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6d7884',
});

const FilterChip = styled(Chip)({
    borderRadius: '6px',
    fontSize: '12px',
    height: '28px',
    backgroundColor: '#eef3f7',
    color: '#2d3748',
    '& .MuiChip-deleteIcon': {
        fontSize: '16px',
        color: '#6d7884',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const OffersList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { offers, loading, error, total, page, pages, filters, types, departments } = useSelector(
        (state) => state.offers
    );

    // État local pour les filtres (formulaire)
    const [localFilters, setLocalFilters] = useState({
        statut: 'Publiée',
        typeStage: '',
        departementId: '',
        search: ''
    });

    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;

    // Charger les offres au montage ET quand les filtres changent
    useEffect(() => {
        const params = { ...filters, page, limit: 10 };
        dispatch(fetchOffers(params));
        dispatch(fetchDepartments());
    }, [dispatch, filters, page]);

    // Gérer la soumission du formulaire
    const handleSearch = (e) => {
        e.preventDefault();
        Object.keys(localFilters).forEach(key => {
            dispatch(setFilter({ key, value: localFilters[key] }));
        });
    };

    // Gérer le changement de page
    const handlePageChange = (event, value) => {
        dispatch(setPage(value));
    };

    // Gérer la réinitialisation
    const handleReset = () => {
        setLocalFilters({ statut: 'Publiée', typeStage: '', departementId: '', search: '' });
        dispatch(resetFilters());
    };

    // Supprimer un filtre
    const handleRemoveFilter = (key) => {
        dispatch(setFilter({ key, value: '' }));
        setLocalFilters({ ...localFilters, [key]: '' });
    };

    // Afficher les filtres actifs
    const activeFilters = [];
    if (filters.typeStage) activeFilters.push({ key: 'typeStage', label: `Type: ${filters.typeStage}` });
    if (filters.departementId) {
        const dept = departments.find(d => d._id === filters.departementId);
        if (dept) activeFilters.push({ key: 'departementId', label: `Département: ${dept.nom}` });
    }
    if (filters.search) activeFilters.push({ key: 'search', label: `🔍 ${filters.search}` });

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

                        <LoginButton onClick={() => navigate('/')}>
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
                    <PageTitle>Recherche des offres de stage</PageTitle>
                    <TitleLine />

                    {/* === STATUS : NON CONNECTÉ === */}
                    {!isAuthenticated ? (
                        <Alert 
                            severity="info" 
                            sx={{ mt: 2, borderRadius: '10px' }}
                            action={
                                <Button 
                                    color="inherit" 
                                    size="small" 
                                    onClick={() => navigate('/')}
                                    sx={{ fontWeight: 600 }}
                                >
                                    Se connecter
                                </Button>
                            }
                        >
                            Connectez-vous pour consulter les offres de stage.
                        </Alert>
                    ) : (
                        <>
                            {/* === FILTRES ACTIFS === */}
                            {activeFilters.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, mb: 2 }}>
                                    {activeFilters.map((filter) => (
                                        <FilterChip
                                            key={filter.key}
                                            label={filter.label}
                                            onDelete={() => handleRemoveFilter(filter.key)}
                                        />
                                    ))}
                                    <FilterChip
                                        label="Réinitialiser tout"
                                        onClick={handleReset}
                                        sx={{ 
                                            backgroundColor: '#fee2e2', 
                                            color: '#b91c1c',
                                            cursor: 'pointer',
                                            '&:hover': { backgroundColor: '#fecaca' }
                                        }}
                                    />
                                </Box>
                            )}

                            {/* === LISTE DES OFFRES === */}
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress sx={{ color: '#148aa0' }} />
                                </Box>
                            ) : error ? (
                                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                            ) : offers.length === 0 ? (
                                <NoResultsBox>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        🕵️ Aucune offre trouvée
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Essayez de modifier vos critères de recherche.
                                    </Typography>
                                </NoResultsBox>
                            ) : (
                                <>
                                    <ResultsCount>
                                        {total} offre(s) trouvée(s)
                                    </ResultsCount>

                                    {offers.map((offer) => (
                                        <OfferCard key={offer._id} offer={offer} />
                                    ))}

                                    {pages > 1 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                            <Pagination
                                                count={pages}
                                                page={page}
                                                onChange={handlePageChange}
                                                sx={{
                                                    '& .MuiPaginationItem-root.Mui-selected': {
                                                        backgroundColor: '#148aa0',
                                                        color: '#fff',
                                                    }
                                                }}
                                            />
                                        </Box>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </Grid>

                {/* ===== SIDEBAR DROITE (FILTRES) ===== */}
                <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                    <SearchCard>
                        <h2>Recherche les résultats</h2>

                        <form onSubmit={handleSearch} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <SearchField
                                placeholder="🔍 Profil"
                                variant="outlined"
                                value={localFilters.search}
                                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                disabled={!isAuthenticated}
                            />

                            <SearchField
                                select
                                value={localFilters.typeStage}
                                onChange={(e) => setLocalFilters({ ...localFilters, typeStage: e.target.value })}
                                variant="outlined"
                                SelectProps={{ displayEmpty: true }}
                                disabled={!isAuthenticated}
                            >
                                <MenuItem value="">* Sélectionner</MenuItem>
                                {types.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </SearchField>

                            <SearchField
                                select
                                value={localFilters.departementId}
                                onChange={(e) => setLocalFilters({ ...localFilters, departementId: e.target.value })}
                                variant="outlined"
                                SelectProps={{ displayEmpty: true }}
                                disabled={!isAuthenticated}
                            >
                                <MenuItem value="">* Sélectionner</MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept._id || dept.id} value={dept._id || dept.id}>
                                        {dept.nom}
                                    </MenuItem>
                                ))}
                            </SearchField>

                            <DateField
                                placeholder="dd/mm/yyyy"
                                variant="outlined"
                                disabled={!isAuthenticated}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end" sx={{ position: 'absolute', right: 16, color: '#333' }}>
                                            <i className="fa-solid fa-calendar"></i>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <SearchButton type="submit" disabled={!isAuthenticated}>
                                Rechercher
                            </SearchButton>
                        </form>
                    </SearchCard>
                </Grid>
            </Grid>
        </Container>
    );
};

export default OffersList;
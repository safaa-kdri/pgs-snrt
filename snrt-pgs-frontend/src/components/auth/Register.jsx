// src/components/auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Typography,
    Box,
    Container,
    Grid,
    TextField,
    Button,
    Paper,
    Card,
    Alert,
    Checkbox,
    FormControlLabel,
    MenuItem,
    CircularProgress,
    Link,
    InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { authService } from '../../services/auth';

// ============================================
// STYLES SIDEBARS
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
        fontFamily: '"Inria Sans", sans-serif',
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

const DateFieldSearch = styled(TextField)({
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
// STYLES REGISTER
// ============================================

const PageTitle = styled(Typography)({
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 700,
    color: '#252930',
    margin: '0 auto 10px',
    maxWidth: '600px',
    lineHeight: 1.2,
    fontFamily: '"Inria Sans", sans-serif',
});

const TitleLine = styled(Box)({
    height: '2px',
    background: '#cfd5da',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto 10px',
});

const RegisterNote = styled(Typography)({
    textAlign: 'center',
    color: '#06101b',
    fontSize: '14px',
    margin: '0 auto 28px',
    maxWidth: '600px',
    fontFamily: '"Inria Sans", sans-serif',
});

const RegisterCard = styled(Paper)({
    backgroundColor: '#fbf9f9',
    borderRadius: '19px',
    padding: '28px 28px 30px',
    boxShadow: 'none',
    maxWidth: '800px',
    margin: '0 auto',
});

// ============================================
// STYLES POUR TOUS LES CHAMPS (inchangés)
// ============================================

const RegisterField = styled(TextField)({
    width: '100%',
    marginBottom: '8px',

    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        height: '40px',

        '& fieldset': {
            borderColor: '#dfe5ea',
        },

        '&:hover fieldset': {
            borderColor: '#dfe5ea',
        },

        '&.Mui-focused fieldset': {
            borderColor: '#148aa0',
        },
    },

    '& .MuiInputBase-input': {
        padding: '0 14px',
        fontSize: '14px',
        height: '40px',
        lineHeight: '40px',
        boxSizing: 'border-box',
    },

    '& .MuiSelect-select': {
        padding: '0 14px !important',
        height: '40px !important',
        lineHeight: '40px !important',
        display: 'flex',
        alignItems: 'center',
    },

    '& .MuiInputLabel-root': {
        transform: 'translate(14px, 10px) scale(1)',
        fontSize: '14px',
        '&.Mui-focused, &.MuiFormLabel-filled': {
            transform: 'translate(14px, -8px) scale(0.75)',
        },
    },
});

// ============================================
// STYLE UNIQUEMENT POUR LE CHAMP DATE
// ============================================

const DateField = styled(TextField)({
    width: '100%',
    marginBottom: '8px',

    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        height: '72px',

        '& fieldset': {
            borderColor: '#dfe5ea',
        },

        '&:hover fieldset': {
            borderColor: '#dfe5ea',
        },

        '&.Mui-focused fieldset': {
            borderColor: '#148aa0',
        },
    },

    '& .MuiInputBase-input': {
        padding: '28px 14px 10px 14px',
        fontSize: '14px',
        color: '#222222',
        height: 'auto',
        lineHeight: '1.4',
        boxSizing: 'border-box',
    },

    '& .MuiInputLabel-root': {
        transform: 'translate(14px, 8px) scale(1)',
        fontSize: '14px',
        color: '#6d7884',
        '&.Mui-focused, &.MuiFormLabel-filled': {
            transform: 'translate(14px, 4px) scale(0.75)',
        },
    },

    '& input[type="date"]': {
        padding: '28px 14px 10px 14px !important',
        height: 'auto !important',
        minHeight: 'auto !important',
        lineHeight: '1.4 !important',
        '&::-webkit-calendar-picker-indicator': {
            opacity: 0.6,
            padding: '4px',
            marginRight: '4px',
        },
        '&::-webkit-datetime-edit': {
            padding: 0,
        },
        '&::-webkit-datetime-edit-fields-wrapper': {
            padding: 0,
        },
        '&::-webkit-datetime-edit-text': {
            padding: '0 2px',
        },
    },
});

const AddButton = styled(Button)({
    width: '180px',
    height: '38px',
    marginLeft: 'auto',
    display: 'block',
    border: '2px solid #777',
    borderRadius: '5px',
    background: 'transparent',
    color: '#777',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '14px',
    textTransform: 'none',
    '&:hover': {
        borderColor: '#148aa0',
        color: '#148aa0',
        backgroundColor: 'transparent',
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        civilite: '',
        nom: '',
        prenom: '',
        dateNaissance: '',
        email: '',
        emailConfirmation: '',
        cin: '',
        telephone: '',
        adresse: '',
        ville: '',
        pays: '',
        motDePasse: '',
        confirmationMotDePasse: '',
        acceptTerms: false
    });

    const [errors, setErrors] = useState({});

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token || isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
        setError('');
    };

    const validate = () => {
        const newErrors = {};

        if (!form.civilite) newErrors.civilite = 'La civilité est obligatoire';
        if (!form.nom) newErrors.nom = 'Le nom est obligatoire';
        if (!form.prenom) newErrors.prenom = 'Le prénom est obligatoire';
        if (!form.dateNaissance) newErrors.dateNaissance = 'La date de naissance est obligatoire';
        if (!form.email) newErrors.email = 'L\'email est obligatoire';
        if (form.email !== form.emailConfirmation) {
            newErrors.emailConfirmation = 'Les emails ne correspondent pas';
        }
        if (!form.cin) newErrors.cin = 'Le CIN est obligatoire';
        if (!form.telephone) newErrors.telephone = 'Le téléphone est obligatoire';
        if (!form.adresse) newErrors.adresse = 'L\'adresse est obligatoire';
        if (!form.ville) newErrors.ville = 'La ville est obligatoire';
        if (!form.pays) newErrors.pays = 'Le pays est obligatoire';
        if (!form.motDePasse || form.motDePasse.length < 16) {
            newErrors.motDePasse = 'Le mot de passe doit contenir au moins 16 caractères';
        }
        if (form.motDePasse !== form.confirmationMotDePasse) {
            newErrors.confirmationMotDePasse = 'Les mots de passe ne correspondent pas';
        }
        if (!form.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setError('');

        try {
            await authService.register(form);
            setSuccess(true);

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error('🔴 Erreur inscription:', err);
            setError(err.response?.data?.message || 'Erreur d\'inscription');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Container maxWidth="xl" sx={{ padding: 0, margin: 0, maxWidth: '100%' }}>
                <Grid container spacing={0}>
                    <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                        <SideCard><h2>Authentification</h2></SideCard>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
                        <RegisterCard>
                            <Typography variant="h5" sx={{ textAlign: 'center', color: '#148aa0', mb: 2 }}>
                                ✅ Inscription réussie !
                            </Typography>
                            <Typography variant="body1" sx={{ textAlign: 'center' }}>
                                Vous allez être redirigé vers la page de connexion.
                            </Typography>
                        </RegisterCard>
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                        <SearchCard><h2>Recherche</h2></SearchCard>
                    </Grid>
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
                                <text x="15" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#75e45e" transform="rotate(-4 15 50)">X</text>
                                <text x="53" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#65e4d6" transform="rotate(6 53 50)">h</text>
                                <text x="91" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#59e2d8" transform="rotate(-7 91 50)">F</text>
                                <text x="124" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#3364f0" transform="rotate(9 124 50)">0</text>
                                <text x="162" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#ff65c8" transform="rotate(-5 162 50)">M</text>
                                <text x="200" y="50" fontSize="50" fontFamily="Trebuchet MS" fill="#65e45e" transform="rotate(7 200 50)">Z</text>
                            </svg>
                        </CaptchaBox>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center' }}>
                            <CaptchaInput placeholder="Saisisse" variant="outlined" />
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
                    <PageTitle>Inscription</PageTitle>
                    <TitleLine />
                    <RegisterNote>
                        Ces informations vous permettront d'accéder à votre compte par la suite
                    </RegisterNote>

                    <RegisterCard>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <form onSubmit={handleSubmit}>
                            <RegisterField
                                select
                                label="* Civilité"
                                name="civilite"
                                value={form.civilite}
                                onChange={handleChange}
                                error={!!errors.civilite}
                                helperText={errors.civilite}
                                disabled={loading}
                            >
                                <MenuItem value="">Sélectionner</MenuItem>
                                <MenuItem value="M.">M.</MenuItem>
                                <MenuItem value="Mme">Mme</MenuItem>
                                <MenuItem value="Mlle">Mlle</MenuItem>
                            </RegisterField>

                            <RegisterField
                                label="* Nom"
                                name="nom"
                                value={form.nom}
                                onChange={handleChange}
                                error={!!errors.nom}
                                helperText={errors.nom}
                                disabled={loading}
                            />

                            <RegisterField
                                label="* Prénom"
                                name="prenom"
                                value={form.prenom}
                                onChange={handleChange}
                                error={!!errors.prenom}
                                helperText={errors.prenom}
                                disabled={loading}
                            />

                            {/* ✅ SEUL LE CHAMP DATE UTILISE DateField */}
                            <DateField
                                label="* Date de naissance"
                                type="date"
                                name="dateNaissance"
                                value={form.dateNaissance}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                error={!!errors.dateNaissance}
                                helperText={errors.dateNaissance}
                                disabled={loading}
                            />

                            <RegisterField
                                label="* Email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                disabled={loading}
                            />

                            <RegisterField
                                label="* Confirmation email"
                                type="email"
                                name="emailConfirmation"
                                value={form.emailConfirmation}
                                onChange={handleChange}
                                error={!!errors.emailConfirmation}
                                helperText={errors.emailConfirmation}
                                disabled={loading}
                            />

                            <RegisterField
                                label="* CIN"
                                name="cin"
                                value={form.cin}
                                onChange={handleChange}
                                error={!!errors.cin}
                                helperText={errors.cin}
                                disabled={loading}
                            />

                            <RegisterField
                                label="* Téléphone"
                                name="telephone"
                                value={form.telephone}
                                onChange={handleChange}
                                error={!!errors.telephone}
                                helperText={errors.telephone}
                                disabled={loading}
                            />

                            <RegisterField
                                label="* Adresse"
                                name="adresse"
                                value={form.adresse}
                                onChange={handleChange}
                                error={!!errors.adresse}
                                helperText={errors.adresse}
                                disabled={loading}
                            />

                            <RegisterField
                                label="* Ville"
                                name="ville"
                                value={form.ville}
                                onChange={handleChange}
                                error={!!errors.ville}
                                helperText={errors.ville}
                                disabled={loading}
                            />

                            <RegisterField
                                label="* Pays"
                                name="pays"
                                value={form.pays}
                                onChange={handleChange}
                                error={!!errors.pays}
                                helperText={errors.pays}
                                disabled={loading}
                            />

                            <RegisterField
                                label="* Mot de passe"
                                type="password"
                                name="motDePasse"
                                value={form.motDePasse}
                                onChange={handleChange}
                                error={!!errors.motDePasse}
                                helperText={errors.motDePasse}
                                disabled={loading}
                            />

                            <RegisterField
                                label="* Confirmation mot de passe"
                                type="password"
                                name="confirmationMotDePasse"
                                value={form.confirmationMotDePasse}
                                onChange={handleChange}
                                error={!!errors.confirmationMotDePasse}
                                helperText={errors.confirmationMotDePasse}
                                disabled={loading}
                            />

                            <Box sx={{ mt: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="acceptTerms"
                                            checked={form.acceptTerms}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    }
                                    label="En cochant cette case, vous acceptez nos Termes et Conditions du service."
                                />
                                {errors.acceptTerms && (
                                    <Typography color="error" variant="caption" display="block">
                                        {errors.acceptTerms}
                                    </Typography>
                                )}
                            </Box>

                            <AddButton type="submit" disabled={loading}>
                                {loading ? <CircularProgress size={20} color="inherit" /> : "Ajouter"}
                            </AddButton>
                        </form>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2">
                                Déjà un compte ?{' '}
                                <Link component={RouterLink} to="/login" sx={{ color: '#075fff', fontWeight: 600 }}>
                                    Se connecter
                                </Link>
                            </Typography>
                        </Box>
                    </RegisterCard>
                </Grid>

                {/* ===== SIDEBAR DROITE ===== */}
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

                        <DateFieldSearch
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

export default Register;
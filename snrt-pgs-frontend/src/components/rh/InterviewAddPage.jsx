// src/components/rh/InterviewAddPage.jsx
// ✅ VERSION ULTRA-SÉCURISÉE

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    IconButton,
    Chip,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Checkbox,
    Tooltip,
    Badge,
    Collapse,
    Fade,
    alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Save,
    Event,
    VideoCall,
    LocationOn,
    Schedule,
    Business,
    CheckCircle,
    Cancel,
    CalendarToday,
    AccessTime,
    People,
    Send,
    Verified,
    Pending,
} from '@mui/icons-material';
import api from '../../services/api';

// ============================================
// STYLES
// ============================================

const PageContainer = styled(Container)({
    py: 4,
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
});

const PageHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
});

const HeaderTitle = styled(Typography)({
    fontWeight: 700,
    color: '#0f172a',
    fontSize: '28px',
    letterSpacing: '-0.5px',
});

const HeaderSubtitle = styled(Typography)({
    color: '#64748b',
    fontSize: '15px',
    fontWeight: 400,
    marginTop: '4px',
});

const StyledPaper = styled(Paper)({
    borderRadius: '16px',
    padding: '28px 32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    border: '1px solid #f1f5f9',
    backgroundColor: '#ffffff',
    height: '100%',
});

const SectionTitle = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
});

const SectionTitleText = styled(Typography)({
    fontWeight: 600,
    fontSize: '16px',
    color: '#0f172a',
    letterSpacing: '-0.3px',
});

const StepBadge = styled(Box)(({ active, completed }) => ({
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    backgroundColor: completed ? '#22c55e' : active ? '#0f172a' : '#e2e8f0',
    color: completed || active ? '#ffffff' : '#94a3b8',
    flexShrink: 0,
}));

const CandidateItem = styled(ListItem)(({ selected }) => ({
    borderRadius: '10px',
    marginBottom: '6px',
    padding: '8px 12px',
    backgroundColor: selected ? alpha('#0f172a', 0.05) : 'transparent',
    border: selected ? '1px solid #0f172a' : '1px solid transparent',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: alpha('#0f172a', 0.04),
    },
}));

const SummaryCard = styled(Paper)({
    padding: '16px 20px',
    marginTop: '20px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #f1f5f9',
});

const SummaryRow = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 0',
    '& .MuiSvgIcon-root': {
        color: '#64748b',
        fontSize: '18px',
    },
});

const EmptyState = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px dashed #e2e8f0',
});

const SaveButtonStyled = styled(Button)({
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderRadius: '10px',
    textTransform: 'none',
    padding: '10px 36px',
    fontWeight: 600,
    fontSize: '15px',
    '&:hover': {
        backgroundColor: '#1e293b',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
    },
    '&:disabled': {
        backgroundColor: '#94a3b8',
        color: '#ffffff',
    },
});

const CancelButtonStyled = styled(Button)({
    borderRadius: '10px',
    textTransform: 'none',
    padding: '10px 28px',
    fontWeight: 500,
    fontSize: '15px',
    color: '#64748b',
    borderColor: '#e2e8f0',
    '&:hover': {
        borderColor: '#94a3b8',
        backgroundColor: alpha('#0f172a', 0.04),
    },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const InterviewAddPage = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [loadingOffers, setLoadingOffers] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [offers, setOffers] = useState([]);
    const [selectedOfferId, setSelectedOfferId] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);

    const [formData, setFormData] = useState({
        date: '',
        heure: '',
        duree: 30,
        type: 'presentiel',
        lieu: '',
        lienVisio: '',
        commentaires: '',
    });

    const [currentStep, setCurrentStep] = useState(1);

    const typeOptions = [
        { value: 'presentiel', label: 'Présentiel', icon: <LocationOn />, description: 'En personne' },
        { value: 'visio', label: 'Visio', icon: <VideoCall />, description: 'À distance' },
        { value: 'telephonique', label: 'Téléphonique', icon: <Schedule />, description: 'Par téléphone' },
    ];

    // ============================================
    // CHARGER LES OFFRES
    // ============================================

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        setLoadingOffers(true);
        try {
            const response = await api.get('/offers', {
                params: { statut: 'Publiee' }
            });
            
            const offersData = response.data?.offers || [];
            
            const offersWithCandidates = await Promise.all(
                offersData.map(async (offer) => {
                    try {
                        const candidatesRes = await api.get(`/interviews/candidates/by-offer/${offer._id}`);
                        return {
                            ...offer,
                            candidateCount: candidatesRes.data?.candidates?.length || 0,
                        };
                    } catch {
                        return { ...offer, candidateCount: 0 };
                    }
                })
            );

            setOffers(offersWithCandidates.filter(o => o.candidateCount > 0));
        } catch (error) {
            console.error('Erreur chargement offres:', error);
            setOffers([]);
        } finally {
            setLoadingOffers(false);
        }
    };

    // ============================================
    // CHARGER LES CANDIDATS PAR OFFRE
    // ============================================

    useEffect(() => {
        if (selectedOfferId) {
            fetchCandidatesByOffer(selectedOfferId);
            setCurrentStep(2);
        } else {
            setCandidates([]);
            setSelectedCandidates([]);
            setCurrentStep(1);
        }
    }, [selectedOfferId]);

    const fetchCandidatesByOffer = async (offerId) => {
        setLoading(true);
        try {
            const response = await api.get(`/interviews/candidates/by-offer/${offerId}`);
            const candidatesData = response.data?.candidates || [];
            setCandidates(candidatesData);
            setSelectedCandidates([]);
        } catch (error) {
            console.error('Erreur chargement candidats:', error);
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // SÉLECTION DES CANDIDATS
    // ============================================

    const toggleCandidate = (candidate) => {
        setSelectedCandidates(prev => {
            const exists = prev.find(c => c.applicationId === candidate.applicationId);
            if (exists) {
                return prev.filter(c => c.applicationId !== candidate.applicationId);
            }
            return [...prev, candidate];
        });
    };

    const isCandidateSelected = (applicationId) => {
        return selectedCandidates.some(c => c.applicationId === applicationId);
    };

    const toggleSelectAll = () => {
        if (selectedCandidates.length === candidates.length) {
            setSelectedCandidates([]);
        } else {
            setSelectedCandidates([...candidates]);
        }
    };

    // ============================================
    // SOUMISSION
    // ============================================

    const validateForm = () => {
        const errors = [];
        if (!selectedOfferId) errors.push('Veuillez sélectionner une offre');
        if (selectedCandidates.length === 0) errors.push('Veuillez sélectionner au moins un candidat');
        if (!formData.date) errors.push('La date est requise');
        if (!formData.heure) errors.push("L'heure est requise");
        
        if (formData.type === 'visio' && !formData.lienVisio) {
            errors.push('Un lien de visioconférence est requis');
        }
        if (formData.type === 'presentiel' && !formData.lieu) {
            errors.push('Un lieu est requis pour un entretien présentiel');
        }
        
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (errors.length > 0) {
            setError(errors.join('. '));
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            // ✅ Extraction sécurisée des CIN
            const cins = selectedCandidates
                .map(c => {
                    const etudiant = c?.etudiant || c?.etudiantId || {};
                    return etudiant?.cin || c?.cin || null;
                })
                .filter(Boolean);

            if (cins.length === 0) {
                setError('Aucun CIN valide trouvé pour les candidats sélectionnés');
                setSubmitting(false);
                return;
            }

            const payload = {
                offreId: selectedOfferId,
                cins,
                date: formData.date,
                heure: formData.heure,
                duree: parseInt(formData.duree),
                type: formData.type,
                lieu: formData.type === 'presentiel' ? formData.lieu : null,
                lienVisio: formData.type === 'visio' ? formData.lienVisio : null,
                commentaires: formData.commentaires || null,
            };

            const response = await api.post('/interviews', payload);
            
            setSuccess(
                response.data?.message || 
                `✅ Entretien planifié pour ${selectedCandidates.length} candidat(s) !`
            );
            
            setTimeout(() => {
                navigate('/rh/interviews');
            }, 2000);
        } catch (error) {
            console.error('Erreur création:', error);
            setError(
                error.response?.data?.message || 
                'Erreur lors de la planification de l\'entretien'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        navigate('/rh/interviews');
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    };

    const handleOfferChange = (offerId) => {
        setSelectedOfferId(offerId);
        setFormData({
            ...formData,
            date: '',
            heure: '',
            duree: 30,
            type: 'presentiel',
            lieu: '',
            lienVisio: '',
            commentaires: '',
        });
    };

    // ============================================
    // RENDER
    // ============================================

    const selectedOffer = offers.find(o => o._id === selectedOfferId);
    const hasSelectedCandidates = selectedCandidates.length > 0;
    const showDetails = !!selectedOfferId && hasSelectedCandidates;

    // ✅ Fonctions sécurisées
    const safeString = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return '';
        return String(value);
    };

    const getEtudiant = (candidate) => {
        if (!candidate) return {};
        return candidate?.etudiant || candidate?.etudiantId || {};
    };

    const getFullName = (candidate) => {
        const etudiant = getEtudiant(candidate);
        const prenom = safeString(etudiant?.prenom);
        const nom = safeString(etudiant?.nom);
        const fullName = `${prenom} ${nom}`.trim();
        return fullName || 'Candidat';
    };

    const getCIN = (candidate) => {
        const etudiant = getEtudiant(candidate);
        const cin = safeString(etudiant?.cin || candidate?.cin);
        return cin || '---';
    };

    const getEmail = (candidate) => {
        const etudiant = getEtudiant(candidate);
        return safeString(etudiant?.email);
    };

    const getInitials = (candidate) => {
        const etudiant = getEtudiant(candidate);
        const prenom = safeString(etudiant?.prenom);
        const nom = safeString(etudiant?.nom);
        const initial = `${(prenom || '?')[0]}${(nom || '')[0]}`.toUpperCase();
        return initial || '?';
    };

    // ✅ Titre de l'offre sécurisé
    const offerTitle = safeString(selectedOffer?.titre);

    return (
        <PageContainer maxWidth="xl">
            {/* ===== HEADER ===== */}
            <PageHeader>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton 
                            onClick={handleBack} 
                            sx={{ 
                                color: '#64748b',
                                '&:hover': { backgroundColor: alpha('#0f172a', 0.05) },
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <HeaderTitle>Planifier un entretien</HeaderTitle>
                            <HeaderSubtitle>
                                {currentStep === 1 
                                    ? 'Étape 1 : Sélectionnez une offre' 
                                    : currentStep === 2 && !hasSelectedCandidates
                                    ? 'Étape 2 : Sélectionnez les candidats'
                                    : 'Étape 3 : Configurez les détails de l\'entretien'}
                            </HeaderSubtitle>
                        </Box>
                    </Box>
                </Box>
                <Badge 
                    badgeContent={selectedCandidates.length} 
                    color="primary"
                    sx={{ '& .MuiBadge-badge': { backgroundColor: '#0f172a' } }}
                >
                    <Chip 
                        icon={<People />} 
                        label={`${selectedCandidates.length} sélectionné(s)`}
                        variant="outlined"
                        sx={{ borderRadius: '8px', borderColor: '#e2e8f0' }}
                    />
                </Badge>
            </PageHeader>

            {/* ===== ALERTS ===== */}
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 3, borderRadius: '12px' }}
                    icon={<Cancel />}
                >
                    {error}
                </Alert>
            )}
            {success && (
                <Alert 
                    severity="success" 
                    sx={{ mb: 3, borderRadius: '12px' }}
                    icon={<CheckCircle />}
                >
                    {success}
                </Alert>
            )}

            {/* ===== MAIN CONTENT ===== */}
            <Grid container spacing={3}>
                {/* ÉTAPE 1 : OFFRE */}
                <Grid item xs={12}>
                    <StyledPaper>
                        <SectionTitle>
                            <StepBadge active={!selectedOfferId} completed={!!selectedOfferId}>
                                {!!selectedOfferId ? <CheckCircle sx={{ fontSize: 14 }} /> : 1}
                            </StepBadge>
                            <SectionTitleText>Sélectionner l'offre</SectionTitleText>
                            {selectedOfferId && (
                                <Chip 
                                    label="Étape complétée" 
                                    size="small"
                                    sx={{ 
                                        backgroundColor: '#dcfce7', 
                                        color: '#166534',
                                        fontSize: '11px',
                                        height: 20,
                                    }}
                                />
                            )}
                        </SectionTitle>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel sx={{ fontWeight: 500 }}>Offre *</InputLabel>
                            <Select
                                value={selectedOfferId}
                                onChange={(e) => handleOfferChange(e.target.value)}
                                label="Offre *"
                                sx={{ 
                                    borderRadius: '10px',
                                    backgroundColor: '#fafbfc',
                                }}
                                disabled={loadingOffers}
                            >
                                <MenuItem value="">
                                    <em style={{ color: '#94a3b8' }}>Sélectionnez une offre</em>
                                </MenuItem>
                                {offers.map((offer) => (
                                    <MenuItem key={offer._id} value={offer._id}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Business sx={{ color: '#64748b', fontSize: 18 }} />
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {safeString(offer.titre)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {safeString(offer.typeStage) || 'Stage'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Chip 
                                                label={`${offer.candidateCount || 0} candidat(s)`} 
                                                size="small" 
                                                sx={{ 
                                                    backgroundColor: '#f1f5f9',
                                                    color: '#475569',
                                                    fontSize: '11px',
                                                    height: 22,
                                                }}
                                            />
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {loadingOffers && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                <CircularProgress size={28} sx={{ color: '#0f172a' }} />
                            </Box>
                        )}

                        {offers.length === 0 && !loadingOffers && (
                            <Alert 
                                severity="info" 
                                sx={{ borderRadius: '10px' }}
                                icon={<Pending />}
                            >
                                Aucune offre avec des candidats validés.
                            </Alert>
                        )}
                    </StyledPaper>
                </Grid>

                {/* ÉTAPE 2 : CANDIDATS */}
                {selectedOfferId && (
                    <Grid item xs={12}>
                        <Collapse in={!!selectedOfferId} timeout="auto">
                            <StyledPaper>
                                <SectionTitle>
                                    <StepBadge active={!hasSelectedCandidates} completed={hasSelectedCandidates}>
                                        {hasSelectedCandidates ? <CheckCircle sx={{ fontSize: 14 }} /> : 2}
                                    </StepBadge>
                                    <SectionTitleText>Sélectionner les candidats</SectionTitleText>
                                    {hasSelectedCandidates && (
                                        <Chip 
                                            label={`${selectedCandidates.length} sélectionné(s)`} 
                                            size="small"
                                            sx={{ 
                                                backgroundColor: '#0f172a', 
                                                color: '#ffffff',
                                                fontSize: '11px',
                                                height: 20,
                                            }}
                                        />
                                    )}
                                </SectionTitle>

                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress size={32} sx={{ color: '#0f172a' }} />
                                    </Box>
                                ) : candidates.length === 0 ? (
                                    <EmptyState>
                                        <Pending sx={{ color: '#94a3b8', fontSize: 40, mb: 2 }} />
                                        <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                            Aucun candidat validé
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Les candidats doivent d'abord être validés par le RH
                                        </Typography>
                                    </EmptyState>
                                ) : (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {candidates.length} candidat(s) validé(s)
                                            </Typography>
                                            <Button
                                                size="small"
                                                onClick={toggleSelectAll}
                                                sx={{ 
                                                    textTransform: 'none', 
                                                    color: '#0f172a',
                                                    fontWeight: 500,
                                                    fontSize: '13px',
                                                    '&:hover': { backgroundColor: alpha('#0f172a', 0.05) },
                                                }}
                                            >
                                                {selectedCandidates.length === candidates.length 
                                                    ? 'Désélectionner tout' 
                                                    : 'Tout sélectionner'}
                                            </Button>
                                        </Box>

                                        <List sx={{ p: 0 }}>
                                            {candidates.map((candidate) => (
                                                <CandidateItem
                                                    key={candidate.applicationId || candidate._id}
                                                    selected={isCandidateSelected(candidate.applicationId)}
                                                    onClick={() => toggleCandidate(candidate)}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                                        <Checkbox
                                                            edge="start"
                                                            checked={isCandidateSelected(candidate.applicationId)}
                                                            sx={{ 
                                                                color: '#94a3b8',
                                                                '&.Mui-checked': { color: '#0f172a' },
                                                                padding: '4px',
                                                            }}
                                                        />
                                                    </ListItemIcon>
                                                    <Avatar 
                                                        sx={{ 
                                                            width: 34, 
                                                            height: 34, 
                                                            fontSize: 13, 
                                                            bgcolor: '#0f172a',
                                                            color: '#ffffff',
                                                            mr: 1.5,
                                                        }}
                                                    >
                                                        {getInitials(candidate)}
                                                    </Avatar>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                                                <Typography variant="body2" fontWeight={500} color="#0f172a">
                                                                    {getFullName(candidate)}
                                                                </Typography>
                                                                <Chip
                                                                    label={getCIN(candidate)}
                                                                    size="small"
                                                                    sx={{ 
                                                                        fontSize: '10px', 
                                                                        height: 18,
                                                                        backgroundColor: '#f1f5f9',
                                                                        color: '#475569',
                                                                    }}
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Typography variant="caption" color="#94a3b8">
                                                                {getEmail(candidate)}
                                                            </Typography>
                                                        }
                                                    />
                                                    <Tooltip title="Statut validé">
                                                        <Verified sx={{ color: '#22c55e', fontSize: 16, ml: 1 }} />
                                                    </Tooltip>
                                                </CandidateItem>
                                            ))}
                                        </List>
                                    </>
                                )}
                            </StyledPaper>
                        </Collapse>
                    </Grid>
                )}

                {/* ÉTAPE 3 : DÉTAILS */}
                {showDetails && (
                    <Grid item xs={12}>
                        <Fade in={showDetails} timeout={400}>
                            <StyledPaper>
                                <SectionTitle>
                                    <Event sx={{ color: '#0f172a', fontSize: 20 }} />
                                    <SectionTitleText>Détails de l'entretien</SectionTitleText>
                                    <Chip 
                                        label="Étape 3" 
                                        size="small"
                                        sx={{ 
                                            backgroundColor: '#0f172a', 
                                            color: '#ffffff',
                                            fontSize: '11px',
                                            height: 20,
                                        }}
                                    />
                                </SectionTitle>

                                <Grid container spacing={2.5}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Date *"
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleFormChange}
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ 
                                                '& .MuiOutlinedInput-root': { 
                                                    borderRadius: '10px',
                                                    backgroundColor: '#fafbfc',
                                                }
                                            }}
                                            InputProps={{
                                                startAdornment: <CalendarToday sx={{ color: '#94a3b8', mr: 1, fontSize: 18 }} />,
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Heure *"
                                            type="time"
                                            name="heure"
                                            value={formData.heure}
                                            onChange={handleFormChange}
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ 
                                                '& .MuiOutlinedInput-root': { 
                                                    borderRadius: '10px',
                                                    backgroundColor: '#fafbfc',
                                                }
                                            }}
                                            InputProps={{
                                                startAdornment: <AccessTime sx={{ color: '#94a3b8', mr: 1, fontSize: 18 }} />,
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Durée (minutes)"
                                            type="number"
                                            name="duree"
                                            value={formData.duree}
                                            onChange={handleFormChange}
                                            fullWidth
                                            InputProps={{ 
                                                inputProps: { min: 15, max: 180, step: 5 },
                                            }}
                                            helperText="Entre 15 et 180 minutes"
                                            sx={{ 
                                                '& .MuiOutlinedInput-root': { 
                                                    borderRadius: '10px',
                                                    backgroundColor: '#fafbfc',
                                                }
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Type *</InputLabel>
                                            <Select
                                                name="type"
                                                value={formData.type}
                                                onChange={handleFormChange}
                                                label="Type *"
                                                sx={{ 
                                                    borderRadius: '10px',
                                                    backgroundColor: '#fafbfc',
                                                }}
                                            >
                                                {typeOptions.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            {option.icon}
                                                            <Box>
                                                                <Typography variant="body2">{option.label}</Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {option.description}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {formData.type === 'presentiel' && (
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Lieu *"
                                                name="lieu"
                                                value={formData.lieu}
                                                onChange={handleFormChange}
                                                fullWidth
                                                placeholder="Adresse, salle, bâtiment..."
                                                helperText="Indiquez l'adresse complète du lieu"
                                                sx={{ 
                                                    '& .MuiOutlinedInput-root': { 
                                                        borderRadius: '10px',
                                                        backgroundColor: '#fafbfc',
                                                    }
                                                }}
                                                InputProps={{
                                                    startAdornment: <LocationOn sx={{ color: '#94a3b8', mr: 1, fontSize: 18 }} />,
                                                }}
                                            />
                                        </Grid>
                                    )}

                                    {formData.type === 'visio' && (
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Lien Visio *"
                                                name="lienVisio"
                                                value={formData.lienVisio}
                                                onChange={handleFormChange}
                                                fullWidth
                                                placeholder="https://meet.google.com/..."
                                                helperText="Entrez le lien de la réunion"
                                                sx={{ 
                                                    '& .MuiOutlinedInput-root': { 
                                                        borderRadius: '10px',
                                                        backgroundColor: '#fafbfc',
                                                    }
                                                }}
                                                InputProps={{
                                                    startAdornment: <VideoCall sx={{ color: '#94a3b8', mr: 1, fontSize: 18 }} />,
                                                }}
                                            />
                                        </Grid>
                                    )}

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Commentaires (optionnel)"
                                            name="commentaires"
                                            value={formData.commentaires}
                                            onChange={handleFormChange}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            placeholder="Informations supplémentaires pour les candidats..."
                                            sx={{ 
                                                '& .MuiOutlinedInput-root': { 
                                                    borderRadius: '10px',
                                                    backgroundColor: '#fafbfc',
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* ===== RÉSUMÉ ===== */}
                                <SummaryCard>
                                    <Typography variant="subtitle2" fontWeight={600} color="#0f172a" sx={{ mb: 1.5 }}>
                                        Résumé de la planification
                                    </Typography>
                                    <Grid container spacing={0.5}>
                                        <Grid item xs={12}>
                                            <SummaryRow>
                                                <Business />
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Offre :</strong> {offerTitle || 'Non sélectionnée'}
                                                </Typography>
                                            </SummaryRow>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <SummaryRow>
                                                <People />
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Candidats :</strong> {selectedCandidates.length} sélectionné(s)
                                                </Typography>
                                            </SummaryRow>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <SummaryRow>
                                                <CalendarToday />
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Date :</strong> {formData.date ? new Date(formData.date).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    }) : 'Non définie'}
                                                </Typography>
                                            </SummaryRow>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <SummaryRow>
                                                <AccessTime />
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Heure :</strong> {formData.heure || 'Non définie'} ({formData.duree} min)
                                                </Typography>
                                            </SummaryRow>
                                        </Grid>
                                    </Grid>
                                </SummaryCard>

                                {/* ===== BOUTONS ===== */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                                    <CancelButtonStyled variant="outlined" onClick={handleBack}>
                                        Annuler
                                    </CancelButtonStyled>
                                    <SaveButtonStyled
                                        variant="contained"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                    >
                                        {submitting ? 'Planification...' : `Planifier (${selectedCandidates.length})`}
                                    </SaveButtonStyled>
                                </Box>
                            </StyledPaper>
                        </Fade>
                    </Grid>
                )}
            </Grid>
        </PageContainer>
    );
};

export default InterviewAddPage;
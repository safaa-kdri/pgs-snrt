// src/components/rh/CandidatureManagement.jsx
// NOUVEAU MODULE : Gestion des candidatures - Espace RH
// Navigation hierarchique : Departement → Offre → Candidatures
// Interface compacte, moderne et professionnelle
// TRI : Departements tries par nombre d'offres decroissant
// TRI : Offres tries par nombre de candidatures decroissant
// AJOUT : Integration de l'API de cloture
// AJOUT : Panel de finalisation des resultats avec description
// MODIFICATION : Affichage du PDF avec boutons Ouvrir, Telecharger et Regenerer
// CORRECTION : Construction de l'URL complète pour le PDF
// CORRECTION : Nettoyer l'URL du PDF
// REDESIGN : Cartes "Offres" repensees avec anneau circulaire radial à droite
// AJOUT : Bouton "Nettoyer" pour corriger les anciennes données (occupes > demandes)
// CORRECTION : Condition d'affichage du bouton "Clôturer" - UNIQUEMENT si quota atteint

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Chip,
    Button,
    Card,
    CardContent,
    Avatar,
    Divider,
    CircularProgress,
    Alert,
    TextField,
    MenuItem,
    InputAdornment,
    IconButton,
    Tooltip,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Breadcrumbs,
    Link,
    Stack,
    Pagination,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    ArrowBack,
    Search,
    Visibility,
    People,
    Business,
    Work,
    CheckCircle,
    Pending,
    Cancel,
    Send,
    Warning,
    Close as CloseIcon,
    ArrowForward,
    Apartment,
    AccountBalance,
    Download,
    PictureAsPdf,
    Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================
// STYLES
// ============================================

const PageContainer = styled(Container)({
    paddingTop: '32px',
    paddingBottom: '32px',
});

const PageTitle = styled(Typography)({
    fontWeight: 700,
    fontSize: '28px',
    color: '#1a2332',
    marginBottom: '8px',
});

const PageSubtitle = styled(Typography)({
    color: '#687480',
    fontSize: '14px',
    marginBottom: '24px',
});

const DepartmentCard = styled(Card)(({ clickable }) => ({
    borderRadius: '10px',
    border: '1px solid #eef1f3',
    boxShadow: 'none',
    cursor: clickable ? 'pointer' : 'default',
    transition: 'all 0.25s ease',
    height: '100%',
    minHeight: '88px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#ffffff',
    '&:hover': clickable ? {
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        borderColor: '#148aa0',
        transform: 'translateY(-2px)',
    } : {},
    '& .MuiCardContent-root': {
        padding: '16px 20px',
        width: '100%',
        '&:last-child': {
            paddingBottom: '16px',
        },
    },
}));

const DepartmentCardEmpty = styled(DepartmentCard)({
    opacity: 0.7,
    '&:hover': {
        boxShadow: 'none',
        borderColor: '#eef1f3',
        transform: 'none',
    },
});

const DepartmentIcon = styled(Box)({
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: alpha('#148aa0', 0.08),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#148aa0',
    flexShrink: 0,
    '& svg': {
        fontSize: '20px',
    },
});

const ArrowIcon = styled(ArrowForward)(({ hovered }) => ({
    color: '#9aa4ac',
    fontSize: '18px',
    transition: 'all 0.25s ease',
    transform: hovered ? 'translateX(4px)' : 'translateX(0)',
    flexShrink: 0,
    marginLeft: '8px',
}));

const SectionTitle = styled(Typography)({
    fontWeight: 600,
    fontSize: '13px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '16px',
});

const SearchField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#fafbfc',
        height: '42px',
        '& fieldset': {
            borderColor: '#e5e7eb',
        },
        '&:hover fieldset': {
            borderColor: '#d1d5db',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#148aa0',
        },
    },
    '& .MuiInputBase-input': {
        padding: '0 14px',
        fontSize: '14px',
        color: '#1a2332',
        '&::placeholder': {
            color: '#9aa4ac',
            opacity: 1,
        },
    },
    '& .MuiInputAdornment-root': {
        '& .MuiSvgIcon-root': {
            color: '#9aa4ac',
            fontSize: '18px',
        },
    },
});

// --- Nouveaux styles pour la carte "Offre" redessinee ---------------------

// Palette de statut : couleur de bordure gauche + chip associe
const OFFER_STATUS_META = {
    ResultatsPublies: { label: 'Résultats publiés', color: '#22c55e', bg: '#ecfdf5', text: '#0f6b3f' },
    Publiee: { label: 'Publiée', color: '#148aa0', bg: '#e6f5f8', text: '#0b6579' },
    default: { label: 'En cours', color: '#94a3b8', bg: '#f1f5f9', text: '#475569' },
};

const OfferCard = styled(Card)(({ statuscolor }) => ({
    borderRadius: '12px',
    border: '1px solid #eef1f3',
    borderLeft: `3px solid ${statuscolor || '#94a3b8'}`,
    boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    '&:hover': {
        boxShadow: '0 10px 28px rgba(15,23,42,0.08)',
        transform: 'translateY(-2px)',
        borderColor: '#c9d5da',
        borderLeftColor: statuscolor || '#94a3b8',
    },
}));

const NeutralChip = styled(Chip)({
    backgroundColor: '#f1f5f9',
    color: '#51606b',
    fontSize: '11.5px',
    height: '22px',
    fontWeight: 500,
    '& .MuiChip-label': { padding: '0 8px' },
});

const ActionRequiredBadge = styled(Box)({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    alignSelf: 'flex-start',
    backgroundColor: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde3b0',
    borderRadius: '999px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 600,
    marginBottom: '10px',
});

// ============================================
// COMPOSANT ANNEAU CIRCULAIRE (RADIAL GAUGE)
// ============================================

const RadialProgress = ({ value, total, size = 56, thickness = 6 }) => {
    // Calcul du pourcentage
    const percent = total > 0 ? Math.min(100, (value / total) * 100) : 0;
    
    // Couleurs selon le pourcentage
    const getColor = () => {
        if (percent >= 100) return '#22c55e'; // Vert
        if (percent >= 70) return '#22c55e';
        if (percent >= 40) return '#f59e0b'; // Orange
        return '#f87171'; // Rouge
    };

    const color = getColor();

    return (
        <Box sx={{ 
            position: 'relative', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
        }}>
            <CircularProgress
                variant="determinate"
                value={percent}
                size={size}
                thickness={thickness}
                sx={{
                    color: color,
                    '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                    },
                }}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                <Typography 
                    variant="caption" 
                    fontWeight={700} 
                    color="#1a2332"
                    sx={{ fontSize: '14px', lineHeight: 1 }}
                >
                    {value}
                </Typography>
                <Typography 
                    variant="caption" 
                    color="#9aa4ac"
                    sx={{ fontSize: '9px', lineHeight: 1 }}
                >
                    /{total}
                </Typography>
            </Box>
        </Box>
    );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const CandidatureManagement = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Etats de navigation
    const [view, setView] = useState('departments');
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);

    // Etats des donnees
    const [departments, setDepartments] = useState([]);
    const [offers, setOffers] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredCard, setHoveredCard] = useState(null);

    // Etats pour les offres et candidatures
    const [statusFilter, setStatusFilter] = useState('all');
    const [offerStatusFilter, setOfferStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [postes, setPostes] = useState({
        demandes: 0,
        occupes: 0,
        restants: 0,
    });
    const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
    const [openClosureDialog, setOpenClosureDialog] = useState(false);
    const [acceptingApplication, setAcceptingApplication] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [closing, setClosing] = useState(false);
    const [isOfferClosed, setIsOfferClosed] = useState(false);
    const [offerResults, setOfferResults] = useState(null);
    const [regenerating, setRegenerating] = useState(false);

    // ✅ Etat pour le nettoyage des anciennes données
    const [cleaning, setCleaning] = useState(false);
    const [openCleanDialog, setOpenCleanDialog] = useState(false);

    // Panel de finalisation
    const [showFinalizationPanel, setShowFinalizationPanel] = useState(false);
    const [resultsDescription, setResultsDescription] = useState('');
    const [closingResult, setClosingResult] = useState(null);
    const [publishing, setPublishing] = useState(false);

    const limit = 10;

    // ============================================
    // FONCTION UTILITAIRE : Construire l'URL complète du PDF
    // ============================================
    const getFullPdfUrl = (pdfPath) => {
        if (!pdfPath) return null;

        // Si c'est déjà une URL complète
        if (pdfPath.startsWith('http://') || pdfPath.startsWith('https://')) {
            return pdfPath;
        }

        // Nettoyer le chemin : enlever les parties de chemin Windows
        let cleanPath = pdfPath;

        // Enlever les préfixes de chemin Windows (D:/, C:/, etc.)
        cleanPath = cleanPath.replace(/^[A-Z]:\\/i, '');
        cleanPath = cleanPath.replace(/^[A-Z]:\//i, '');

        // Remplacer les backslashes par des slashes
        cleanPath = cleanPath.replace(/\\/g, '/');

        // S'assurer que le chemin commence par /uploads/
        if (!cleanPath.startsWith('/uploads/')) {
            // Si le chemin contient déjà 'uploads/resultats' mais sans le slash initial
            if (cleanPath.includes('uploads/resultats')) {
                const index = cleanPath.indexOf('uploads/resultats');
                cleanPath = '/' + cleanPath.substring(index);
            } else if (cleanPath.includes('resultats')) {
                const index = cleanPath.indexOf('resultats');
                cleanPath = '/uploads/' + cleanPath.substring(index);
            } else {
                cleanPath = `/uploads/${cleanPath}`;
            }
        }

        const baseUrl = process.env.REACT_APP_API_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:5000';
        return `${baseUrl}${cleanPath}`;
    };

    // ============================================
    // FONCTIONS UTILITAIRES : Redesign carte Offre
    // ============================================

    // Renvoie une date relative courte ("il y a 3 j", "aujourd'hui")
    const getRelativeDate = (dateValue) => {
        if (!dateValue) return null;
        try {
            const date = new Date(dateValue);
            if (Number.isNaN(date.getTime())) return null;
            const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
            if (diffDays <= 0) return "aujourd'hui";
            if (diffDays === 1) return 'hier';
            return `il y a ${diffDays} j`;
        } catch (e) {
            return null;
        }
    };

    // Determine si une offre necessite une action RH (quota atteint + dossiers en attente)
    const offerNeedsAction = (offer) => {
        const quotaAtteint = (offer.nbPostes || 0) > 0 && (offer.acceptees || 0) >= offer.nbPostes;
        const enSuspens = (offer.enAnalyse || 0) + (offer.enAttente || 0) > 0;
        const estCloturee = offer.statut === 'ResultatsPublies' || offer.resultatsPublies === true;
        return quotaAtteint && enSuspens && !estCloturee;
    };

    const getOfferStatusMeta = (offer) => {
        if (offer.statut === 'ResultatsPublies' || offer.resultatsPublies === true) {
            return OFFER_STATUS_META.ResultatsPublies;
        }
        if (offer.statut === 'Publiee') {
            return OFFER_STATUS_META.Publiee;
        }
        return { ...OFFER_STATUS_META.default, label: offer.statut || 'En cours' };
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // ============================================
    // CHARGEMENT DES DEPARTEMENTS
    // ============================================

    const fetchDepartments = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('[fetchDepartments] Chargement des departements...');
            const response = await api.get('/departments');
            let data = response.data?.data || response.data || [];

            const departmentsWithStats = await Promise.all(
                data.map(async (dept) => {
                    try {
                        const offersRes = await api.get('/offers', {
                            params: { departementId: dept._id }
                        });
                        const offersData = offersRes.data?.data || offersRes.data?.offers || [];

                        let totalCandidatures = 0;
                        for (const offer of offersData) {
                            const appsRes = await api.get('/applications', {
                                params: { offreId: offer._id }
                            });
                            const appsData = appsRes.data?.data || appsRes.data?.applications || [];
                            totalCandidatures += appsData.length;
                        }

                        return {
                            ...dept,
                            offreCount: offersData.length,
                            candidatureCount: totalCandidatures,
                            hasOffers: offersData.length > 0,
                        };
                    } catch (e) {
                        return {
                            ...dept,
                            offreCount: 0,
                            candidatureCount: 0,
                            hasOffers: false,
                        };
                    }
                })
            );

            const sortedDepartments = departmentsWithStats.sort((a, b) => {
                if (a.offreCount !== b.offreCount) {
                    return b.offreCount - a.offreCount;
                }
                if (a.candidatureCount !== b.candidatureCount) {
                    return b.candidatureCount - a.candidatureCount;
                }
                const nameA = (a.nom || a.name || '').toLowerCase();
                const nameB = (b.nom || b.name || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });

            setDepartments(sortedDepartments);
            console.log(`[fetchDepartments] ${sortedDepartments.length} departements charges et tries`);
        } catch (error) {
            console.error('Erreur chargement departements:', error);
            setError('Erreur lors du chargement des departements');
            setDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // CHARGEMENT DES OFFRES
    // ============================================

    const fetchOffersByDepartment = async (departmentId) => {
        setLoading(true);
        setError('');
        try {
            console.log(`[fetchOffersByDepartment] Chargement des offres du departement ${departmentId}...`);

            const response = await api.get('/offers', {
                params: { departementId: departmentId }
            });

            const data = response.data?.data || response.data?.offers || [];

            const offersWithStats = await Promise.all(
                data.map(async (offer) => {
                    try {
                        const appsRes = await api.get('/applications', {
                            params: { offreId: offer._id }
                        });
                        const appsData = appsRes.data?.data || appsRes.data?.applications || [];

                        const acceptees = appsData.filter(a => a.statut === 'Acceptee').length;
                        const enAnalyse = appsData.filter(a => a.statut === 'EnAnalyse').length;
                        const refusees = appsData.filter(a => a.statut === 'Refusee').length;
                        const enAttente = appsData.filter(a => a.statut === 'Soumise').length;

                        return {
                            ...offer,
                            candidatureCount: appsData.length,
                            acceptees,
                            enAnalyse,
                            refusees,
                            enAttente,
                        };
                    } catch (e) {
                        return {
                            ...offer,
                            candidatureCount: 0,
                            acceptees: 0,
                            enAnalyse: 0,
                            refusees: 0,
                            enAttente: 0,
                        };
                    }
                })
            );

            const sortedOffers = offersWithStats.sort((a, b) => {
                if (a.candidatureCount !== b.candidatureCount) {
                    return b.candidatureCount - a.candidatureCount;
                }
                if (a.acceptees !== b.acceptees) {
                    return b.acceptees - a.acceptees;
                }
                return (a.titre || '').localeCompare(b.titre || '');
            });

            setOffers(sortedOffers);
            console.log(`[fetchOffersByDepartment] ${sortedOffers.length} offres chargees et triees par candidatures`);
        } catch (error) {
            console.error('Erreur chargement offres:', error);
            setError('Erreur lors du chargement des offres');
            setOffers([]);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // CHARGEMENT DES CANDIDATURES
    // ============================================

    const fetchApplicationsByOffer = async (offerId) => {
        setLoading(true);
        setError('');
        try {
            console.log(`[fetchApplicationsByOffer] Chargement des candidatures de l'offre ${offerId}...`);

            const response = await api.get('/applications', {
                params: { offreId: offerId }
            });

            const data = response.data?.data || response.data?.applications || [];

            const appsWithDetails = await Promise.all(
                data.map(async (app) => {
                    try {
                        let docCount = 0;
                        if (app.documents && app.documents.length > 0) {
                            docCount = app.documents.length;
                        }
                        return {
                            ...app,
                            documentCount: docCount,
                        };
                    } catch (e) {
                        return {
                            ...app,
                            documentCount: 0,
                        };
                    }
                })
            );

            setApplications(appsWithDetails);

            const acceptees = appsWithDetails.filter(a => a.statut === 'Acceptee').length;

            const offer = offers.find(o => o._id === offerId);
            if (offer) {
                const nbPostes = offer.nbPostes || 0;
                setPostes({
                    demandes: nbPostes,
                    occupes: acceptees,
                    restants: Math.max(0, nbPostes - acceptees),
                });

                setIsOfferClosed(offer.statut === 'ResultatsPublies' || offer.resultatsPublies === true);

                if (offer.statut === 'ResultatsPublies' || offer.resultatsPublies === true) {
                    try {
                        const resultsRes = await api.get(`/offers/${offerId}/results`);
                        if (resultsRes.data?.success) {
                            setOfferResults({
                                acceptees: resultsRes.data.data.acceptees || [],
                                refusees: resultsRes.data.data.refusees || [],
                                nbAcceptes: resultsRes.data.data.offer.nbAcceptes || 0,
                                nbRefuses: resultsRes.data.data.offer.nbRefuses || 0,
                                resultatsPdfPath: resultsRes.data.data.offer.resultatsPdfPath || null,
                                dateCloture: resultsRes.data.data.offer.dateCloture || null,
                            });
                            setIsOfferClosed(true);
                        }
                    } catch (resultsError) {
                        console.warn('Erreur recuperation resultats:', resultsError);
                    }
                }
            }

            console.log(`[fetchApplicationsByOffer] ${appsWithDetails.length} candidatures chargees`);
        } catch (error) {
            console.error('Erreur chargement candidatures:', error);
            setError('Erreur lors du chargement des candidatures');
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // FILTRAGE DES DEPARTEMENTS
    // ============================================

    const getFilteredDepartments = () => {
        if (!searchTerm.trim()) return departments;
        const term = searchTerm.toLowerCase().trim();
        return departments.filter(dept =>
            (dept.nom || dept.name || '').toLowerCase().includes(term)
        );
    };

    const filteredDepartments = getFilteredDepartments();

    // ============================================
    // FILTRAGE DES OFFRES (recherche + statut)
    // ============================================

    const getFilteredOffers = () => {
        let filtered = [...offers];

        if (offerStatusFilter === 'enCours') {
            filtered = filtered.filter(o => !(o.statut === 'ResultatsPublies' || o.resultatsPublies === true));
        } else if (offerStatusFilter === 'cloturees') {
            filtered = filtered.filter(o => o.statut === 'ResultatsPublies' || o.resultatsPublies === true);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(o => (o.titre || '').toLowerCase().includes(term));
        }

        return filtered;
    };

    // ============================================
    // NAVIGATION
    // ============================================

    const handleSelectDepartment = (dept) => {
        if (!dept.hasOffers) return;
        setSelectedDepartment(dept);
        setView('offers');
        setSearchTerm('');
        setOfferStatusFilter('all');
        fetchOffersByDepartment(dept._id);
    };

    const handleSelectOffer = (offer) => {
        setSelectedOffer(offer);
        setView('applications');
        setSearchTerm('');
        setStatusFilter('all');
        setPage(1);
        setIsOfferClosed(false);
        setOfferResults(null);
        setShowFinalizationPanel(false);
        setResultsDescription('');
        setClosingResult(null);
        fetchApplicationsByOffer(offer._id);
    };

    const handleBackToDepartments = () => {
        setView('departments');
        setSelectedDepartment(null);
        setSelectedOffer(null);
        setOffers([]);
        setApplications([]);
        setSearchTerm('');
        setStatusFilter('all');
        setOfferStatusFilter('all');
        setPage(1);
        setIsOfferClosed(false);
        setOfferResults(null);
        setShowFinalizationPanel(false);
        setResultsDescription('');
        setClosingResult(null);
        fetchDepartments();
    };

    const handleBackToOffers = () => {
        setView('offers');
        setSelectedOffer(null);
        setApplications([]);
        setSearchTerm('');
        setStatusFilter('all');
        setPage(1);
        setIsOfferClosed(false);
        setOfferResults(null);
        setShowFinalizationPanel(false);
        setResultsDescription('');
        setClosingResult(null);
        if (selectedDepartment) {
            fetchOffersByDepartment(selectedDepartment._id);
        }
    };

    // ============================================
    // ACTIONS SUR LES CANDIDATURES
    // ============================================

    const handleAcceptApplication = (app) => {
        setAcceptingApplication(app);
        setOpenAcceptDialog(true);
    };

    const confirmAcceptApplication = async () => {
        if (!acceptingApplication) return;
        setSubmitting(true);
        setError('');
        try {
            if (postes.occupes >= postes.demandes) {
                setError(`Nombre de postes atteint (${postes.demandes}/${postes.demandes}).`);
                setSubmitting(false);
                return;
            }

            await api.patch(`/applications/${acceptingApplication._id}/status`, {
                statut: 'Acceptee',
                commentaire: 'Accepte par le RH',
            });

            setSuccess(`${acceptingApplication.etudiantId?.prenom || ''} ${acceptingApplication.etudiantId?.nom || ''} accepte avec succes`);
            setOpenAcceptDialog(false);
            setAcceptingApplication(null);

            await fetchApplicationsByOffer(selectedOffer._id);

            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Erreur acceptation:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'acceptation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenClosureDialog = () => {
        setOpenClosureDialog(true);
    };

    // ============================================
    // handleConfirmClosure - MODIFIEE avec panel de finalisation
    // ============================================
    const handleConfirmClosure = async () => {
        setClosing(true);
        setError('');
        try {
            const response = await api.post(`/applications/offer/${selectedOffer._id}/close`);

            if (response.data.success) {
                setClosingResult(response.data.data);
                setShowFinalizationPanel(true);
                setOpenClosureDialog(false);

                if (response.data.data.offer?.resultatsDescription) {
                    setResultsDescription(response.data.data.offer.resultatsDescription);
                }

                await fetchApplicationsByOffer(selectedOffer._id);
                await fetchOffersByDepartment(selectedDepartment._id);
            }
        } catch (error) {
            console.error('Erreur cloture:', error);
            setError(error.response?.data?.message || 'Erreur lors de la cloture');
        } finally {
            setClosing(false);
        }
    };

    const handleViewApplication = (appId) => {
        navigate(`/rh/application/${appId}`);
    };

    // ============================================
    // handlePublishResults - Publier les resultats
    // ============================================
    const handlePublishResults = async () => {
        if (!resultsDescription.trim()) {
            setError('La description de l\'offre est obligatoire.');
            return;
        }

        setPublishing(true);
        setError('');
        try {
            await api.put(`/offers/${selectedOffer._id}/results/description`, {
                description: resultsDescription.trim()
            });

            await fetchApplicationsByOffer(selectedOffer._id);

            setSuccess('Resultats publies avec succes. Description enregistree.');
            setShowFinalizationPanel(false);
            setIsOfferClosed(true);

            setTimeout(() => setSuccess(''), 5000);
        } catch (error) {
            console.error('Erreur publication:', error);
            setError(error.response?.data?.message || 'Erreur lors de la publication');
        } finally {
            setPublishing(false);
        }
    };

    // ============================================
    // handleRegeneratePdf - Regenerer le PDF des resultats
    // ============================================
    const handleRegeneratePdf = async () => {
        if (!selectedOffer?._id) {
            setError('Aucune offre sélectionnée');
            return;
        }

        setRegenerating(true);
        setError('');
        setSuccess('');

        try {
            console.log('[handleRegeneratePdf] Regeneration du PDF pour l\'offre:', selectedOffer._id);

            const response = await api.post(`/offers/${selectedOffer._id}/regenerate-results`);

            if (response.data.success) {
                setSuccess('PDF régénéré avec succès');

                // Mettre à jour les résultats avec le nouveau chemin
                if (response.data.data) {
                    setOfferResults(prev => ({
                        ...prev,
                        resultatsPdfPath: response.data.data.pdfPath || prev.resultatsPdfPath
                    }));
                }

                // Rafraîchir les données
                await fetchApplicationsByOffer(selectedOffer._id);

                setTimeout(() => setSuccess(''), 4000);
            } else {
                setError(response.data.message || 'Erreur lors de la régénération du PDF');
            }
        } catch (error) {
            console.error('[handleRegeneratePdf] Erreur:', error);
            setError(error.response?.data?.message || 'Erreur lors de la régénération du PDF');
        } finally {
            setRegenerating(false);
        }
    };

    // ============================================
    // handleCleanOverAccepted - Nettoyer les anciennes données
    // ============================================
    const handleCleanOverAccepted = async () => {
        if (!selectedOffer?._id) {
            setError('Aucune offre sélectionnée');
            return;
        }

        setCleaning(true);
        setError('');
        setSuccess('');

        try {
            console.log('[handleCleanOverAccepted] Nettoyage de l\'offre:', selectedOffer._id);

            const response = await api.post(`/applications/offer/${selectedOffer._id}/clean-over-accepted`);

            if (response.data.success) {
                const { acceptesRestants, refuseesCount, nbPostes } = response.data.data;
                setSuccess(`Nettoyage effectué : ${acceptesRestants} candidats acceptés conservés, ${refuseesCount} candidats refusés.`);
                
                // Rafraîchir les données
                await fetchApplicationsByOffer(selectedOffer._id);
                await fetchOffersByDepartment(selectedDepartment._id);
                
                setTimeout(() => setSuccess(''), 6000);
            } else {
                setError(response.data.message || 'Erreur lors du nettoyage');
            }
        } catch (error) {
            console.error('[handleCleanOverAccepted] Erreur:', error);
            setError(error.response?.data?.message || 'Erreur lors du nettoyage');
        } finally {
            setCleaning(false);
            setOpenCleanDialog(false);
        }
    };

    // ============================================
    // RENDER FINALIZATION PANEL
    // ============================================
    const renderFinalizationPanel = () => (
        <Paper sx={{ p: 4, mt: 3, borderRadius: '12px', border: '1px solid #eef1f3', backgroundColor: '#f8fafc' }}>
            <Typography variant="h6" fontWeight={700} color="#1a2332" sx={{ mb: 2 }}>
                Finalisation des resultats
            </Typography>

            <Typography variant="body2" color="#687480" sx={{ mb: 3 }}>
                Offre : <strong>{closingResult?.offer?.titre || selectedOffer?.titre}</strong>
                <br />
                {closingResult?.acceptees || 0} candidat(s) acceptes sur {closingResult?.offer?.nbPostes || 0} poste(s)
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} color="#1a2332" sx={{ mb: 1 }}>
                Description de l'offre
            </Typography>
            <Typography variant="caption" color="#687480" sx={{ mb: 2, display: 'block' }}>
                Cette description sera affichee dans le detail du resultat de l'offre.
            </Typography>

            <TextField
                fullWidth
                multiline
                rows={6}
                placeholder="Decrivez ici l'offre de stage, ses missions, les competences recherchees, etc."
                value={resultsDescription}
                onChange={(e) => setResultsDescription(e.target.value)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        backgroundColor: '#ffffff',
                        '& textarea': {
                            padding: '14px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            lineHeight: 1.6,
                            color: '#1a2332',
                        },
                    },
                }}
            />

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => setShowFinalizationPanel(false)}
                    sx={{ borderRadius: '8px', textTransform: 'none', color: '#6b7280', borderColor: '#d1d5db' }}
                >
                    Annuler
                </Button>
                <Button
                    variant="contained"
                    onClick={handlePublishResults}
                    disabled={publishing || !resultsDescription.trim()}
                    sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        backgroundColor: '#148aa0',
                        '&:hover': { backgroundColor: '#0b7890' },
                        '&:disabled': { backgroundColor: '#a0c4cd' },
                    }}
                >
                    {publishing ? <CircularProgress size={20} color="inherit" /> : 'Publier les resultats'}
                </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 3, borderRadius: '8px' }}>
                Les resultats seront visibles par les etudiants dans l'onglet "Resultats" apres publication.
            </Alert>
        </Paper>
    );

    // ============================================
    // FILTRAGE DES CANDIDATURES
    // ============================================

    const getFilteredApplications = () => {
        let filtered = [...applications];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(a => a.statut === statusFilter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(a => {
                const nom = a.etudiantId?.nom || '';
                const prenom = a.etudiantId?.prenom || '';
                const email = a.etudiantId?.email || '';
                return nom.toLowerCase().includes(term) ||
                       prenom.toLowerCase().includes(term) ||
                       email.toLowerCase().includes(term);
            });
        }

        const order = { 'Acceptee': 0, 'EnAnalyse': 1, 'Soumise': 2, 'Refusee': 3 };
        filtered.sort((a, b) => {
            const orderA = order[a.statut] ?? 2;
            const orderB = order[b.statut] ?? 2;
            return orderA - orderB;
        });

        return filtered;
    };

    // ============================================
    // RENDER - DEPARTEMENTS
    // ============================================

    const renderDepartments = () => {
        const hasResults = filteredDepartments.length > 0;

        return (
            <>
                <PageTitle>Gestion des candidatures</PageTitle>
                <PageSubtitle>
                    Selectionnez un departement pour consulter ses offres et leurs candidatures.
                </PageSubtitle>

                <Box sx={{ mb: 3, maxWidth: '420px' }}>
                    <SearchField
                        placeholder="Rechercher un departement..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <SectionTitle>
                    Departements {departments.length > 0 && `(${departments.length})`}
                </SectionTitle>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress size={36} sx={{ color: '#148aa0' }} />
                    </Box>
                ) : !hasResults ? (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px', backgroundColor: '#fafbfc' }}>
                        <Typography variant="body1" color="text.secondary">
                            {searchTerm ? 'Aucun departement ne correspond a votre recherche.' : 'Aucun departement trouve.'}
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {filteredDepartments.map((dept, index) => {
                            const isClickable = dept.hasOffers;
                            const displayName = dept.nom || dept.name || 'Departement sans nom';
                            const offreText = dept.offreCount === 0 ? '0 offre' : `${dept.offreCount} offre${dept.offreCount > 1 ? 's' : ''}`;
                            const candidatureText = dept.candidatureCount === 0 ? '0 candidature' : `${dept.candidatureCount} candidature${dept.candidatureCount > 1 ? 's' : ''}`;
                            const isHovered = hoveredCard === dept._id;

                            const CardComponent = isClickable ? DepartmentCard : DepartmentCardEmpty;

                            return (
                                <Grid item xs={12} sm={6} md={4} key={dept._id}>
                                    <CardComponent
                                        clickable={isClickable}
                                        onClick={() => handleSelectDepartment(dept)}
                                        onMouseEnter={() => setHoveredCard(dept._id)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                    >
                                        <CardContent>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                            }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    minWidth: 0,
                                                    flex: 1,
                                                }}>
                                                    <DepartmentIcon>
                                                        <Apartment />
                                                    </DepartmentIcon>

                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={600}
                                                        color="#1a2332"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            wordBreak: 'break-word',
                                                            lineHeight: 1.3,
                                                            flex: 1,
                                                        }}
                                                    >
                                                        {displayName}
                                                    </Typography>
                                                </Box>

                                                {isClickable ? (
                                                    <ArrowIcon hovered={isHovered} />
                                                ) : (
                                                    <Box sx={{ width: '18px', flexShrink: 0 }} />
                                                )}
                                            </Box>

                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                mt: 1.5,
                                                ml: 7,
                                            }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px' }}>
                                                    {offreText}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px' }}>
                                                    •
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px' }}>
                                                    {candidatureText}
                                                </Typography>

                                                {!isClickable && (
                                                    <Chip
                                                        label="Aucune offre"
                                                        size="small"
                                                        sx={{
                                                            ml: 1,
                                                            backgroundColor: '#f3f4f6',
                                                            color: '#6b7280',
                                                            fontSize: '10px',
                                                            height: '18px',
                                                            '& .MuiChip-label': {
                                                                px: 1,
                                                                fontSize: '10px',
                                                            },
                                                        }}
                                                    />
                                                )}

                                                {isClickable && dept.offreCount > 0 && (
                                                    <Chip
                                                        label={`#${index + 1}`}
                                                        size="small"
                                                        sx={{
                                                            ml: 0.5,
                                                            backgroundColor: alpha('#148aa0', 0.1),
                                                            color: '#148aa0',
                                                            fontSize: '10px',
                                                            height: '18px',
                                                            minWidth: '20px',
                                                            '& .MuiChip-label': {
                                                                px: 0.5,
                                                                fontSize: '10px',
                                                                fontWeight: 600,
                                                            },
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </CardContent>
                                    </CardComponent>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </>
        );
    };

    // ============================================
    // RENDER - OFFRES (redessine avec anneau circulaire à droite)
    // ============================================

    const renderOffers = () => {
        const filteredOffers = getFilteredOffers();
        const actionCount = offers.filter(offerNeedsAction).length;

        return (
            <>
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link onClick={handleBackToDepartments} sx={{ cursor: 'pointer', color: '#148aa0', textDecoration: 'none' }}>
                        Gestion des candidatures
                    </Link>
                    <Typography color="#1a2332" fontWeight={600}>
                        {selectedDepartment?.nom || selectedDepartment?.name || 'Departement'}
                    </Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, mb: 3 }}>
                    <Box>
                        <PageTitle sx={{ mb: '4px !important' }}>Offres de stage</PageTitle>
                        <Typography variant="body2" color="#687480">
                            {offers.length} offre{offers.length > 1 ? 's' : ''}
                            {actionCount > 0 && (
                                <> · <Box component="span" sx={{ color: '#b45309', fontWeight: 600 }}>
                                    {actionCount} nécessite{actionCount > 1 ? 'nt' : ''} une action
                                </Box></>
                            )}
                        </Typography>
                    </Box>
                </Box>

                {/* Recherche + filtres de statut */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3, alignItems: 'center' }}>
                    <SearchField
                        placeholder="Rechercher une offre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ maxWidth: '320px', flex: '1 1 240px' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Stack direction="row" spacing={1}>
                        {[
                            { key: 'all', label: 'Toutes' },
                            { key: 'enCours', label: 'En cours' },
                            { key: 'cloturees', label: 'Clôturées' },
                        ].map((f) => (
                            <Chip
                                key={f.key}
                                label={f.label}
                                onClick={() => setOfferStatusFilter(f.key)}
                                sx={{
                                    borderRadius: '8px',
                                    fontWeight: 500,
                                    fontSize: '12.5px',
                                    height: '34px',
                                    cursor: 'pointer',
                                    backgroundColor: offerStatusFilter === f.key ? '#1a2332' : '#ffffff',
                                    color: offerStatusFilter === f.key ? '#ffffff' : '#51606b',
                                    border: '1px solid',
                                    borderColor: offerStatusFilter === f.key ? '#1a2332' : '#e5e7eb',
                                    '&:hover': {
                                        backgroundColor: offerStatusFilter === f.key ? '#1a2332' : '#fafbfc',
                                    },
                                }}
                            />
                        ))}
                    </Stack>
                </Box>

                {filteredOffers.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px', border: '1px dashed #e5e7eb', boxShadow: 'none' }}>
                        <Typography variant="body1" color="text.secondary">
                            {offers.length === 0 ? 'Aucune offre trouvee pour ce departement.' : 'Aucune offre ne correspond a votre recherche.'}
                        </Typography>
                        {offers.length === 0 && (
                            <Button
                                variant="outlined"
                                onClick={handleBackToDepartments}
                                sx={{ mt: 2, borderRadius: '8px', textTransform: 'none' }}
                            >
                                Retour aux departements
                            </Button>
                        )}
                    </Paper>
                ) : (
                    <Grid container spacing={2.5}>
                        {filteredOffers.map((offer) => {
                            const meta = getOfferStatusMeta(offer);
                            const needsAction = offerNeedsAction(offer);
                            const total = offer.nbPostes || (offer.acceptees + offer.enAnalyse + offer.refusees + offer.enAttente) || 1;
                            const relativeDate = getRelativeDate(offer.createdAt || offer.datePublication);
                            const quotaFull = (offer.nbPostes || 0) > 0 && offer.acceptees >= offer.nbPostes;

                            return (
                                <Grid item xs={12} md={6} key={offer._id}>
                                    <OfferCard statuscolor={meta.color} onClick={() => handleSelectOffer(offer)}>
                                        <CardContent sx={{ p: '20px', display: 'flex', flexDirection: 'column', flex: 1, '&:last-child': { pb: '20px' } }}>

                                            {needsAction && (
                                                <ActionRequiredBadge>
                                                    <Warning sx={{ fontSize: '13px' }} />
                                                    Action requise — quota atteint
                                                </ActionRequiredBadge>
                                            )}

                                            {/* En-tete : titre + statut */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                                                <Typography variant="body1" fontWeight={600} color="#1a2332" sx={{ fontSize: '15px', lineHeight: 1.35 }}>
                                                    {offer.titre || 'Offre sans titre'}
                                                </Typography>
                                                <Chip
                                                    label={meta.label}
                                                    size="small"
                                                    sx={{
                                                        flexShrink: 0,
                                                        backgroundColor: meta.bg,
                                                        color: meta.text,
                                                        fontWeight: 500,
                                                        fontSize: '11px',
                                                        height: '24px',
                                                    }}
                                                />
                                            </Box>

                                            {/* Metadonnees neutres */}
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 2, rowGap: 0.5 }}>
                                                <NeutralChip label={offer.typeStage || 'Stage'} size="small" />
                                                <Typography variant="caption" sx={{ color: '#cbd5e1' }}>•</Typography>
                                                <Typography variant="caption" color="#687480">
                                                    {offer.nbPostes || 0} poste{(offer.nbPostes || 0) > 1 ? 's' : ''}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#cbd5e1' }}>•</Typography>
                                                <Typography variant="caption" color="#687480">
                                                    {offer.candidatureCount || 0} candidature{(offer.candidatureCount || 0) > 1 ? 's' : ''}
                                                </Typography>
                                                {relativeDate && (
                                                    <>
                                                        <Typography variant="caption" sx={{ color: '#cbd5e1' }}>•</Typography>
                                                        <Typography variant="caption" color="#687480">
                                                            publiée {relativeDate}
                                                        </Typography>
                                                    </>
                                                )}
                                            </Stack>

                                            {/* ✅ ANNEAU CIRCULAIRE À DROITE AVEC STATS EN LIGNE */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                                {/* Stats en ligne à gauche */}
                                                <Stack direction="row" spacing={2.5}>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <CheckCircle sx={{ fontSize: '14px', color: '#22c55e' }} />
                                                        <Typography variant="caption" fontWeight={700} color="#1a2332">{offer.acceptees || 0}</Typography>
                                                        <Typography variant="caption" color="#9aa4ac">acceptées</Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <Pending sx={{ fontSize: '14px', color: '#d97706' }} />
                                                        <Typography variant="caption" fontWeight={700} color="#1a2332">{offer.enAnalyse || 0}</Typography>
                                                        <Typography variant="caption" color="#9aa4ac">en analyse</Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <Cancel sx={{ fontSize: '14px', color: '#ef4444' }} />
                                                        <Typography variant="caption" fontWeight={700} color="#1a2332">{offer.refusees || 0}</Typography>
                                                        <Typography variant="caption" color="#9aa4ac">refusées</Typography>
                                                    </Stack>
                                                </Stack>

                                                {/* Anneau circulaire à droite */}
                                                <RadialProgress 
                                                    value={offer.acceptees || 0} 
                                                    total={offer.nbPostes || 0} 
                                                    size={48} 
                                                    thickness={5}
                                                />
                                            </Box>

                                            {/* Indicateur "Complet" si quota atteint */}
                                            {quotaFull && (
                                                <Typography variant="caption" color="#22c55e" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                                    ✓ Complet
                                                </Typography>
                                            )}

                                            {/* Pied de carte */}
                                            <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" color="#9aa4ac">
                                                    {offer.enAttente > 0 ? `${offer.enAttente} en attente` : 'Aucune en attente'}
                                                </Typography>
                                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#148aa0' }}>
                                                    <Typography variant="caption" fontWeight={600}>Consulter</Typography>
                                                    <ArrowForward sx={{ fontSize: '14px' }} />
                                                </Stack>
                                            </Box>
                                        </CardContent>
                                    </OfferCard>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </>
        );
    };

    // ============================================
    // RENDER - CANDIDATURES
    // ============================================

    const renderApplications = () => {
        // ✅ Condition : quota atteint = nombre de postes = nombre de candidatures acceptées
        const isQuotaAtteint = postes.occupes >= postes.demandes && postes.demandes > 0;
        const isSelectionCloturee = isOfferClosed || applications.every(a => a.statut === 'Acceptee' || a.statut === 'Refusee');

        // ✅ NOUVELLE CONDITION : Le bouton "Clôturer" s'affiche UNIQUEMENT si :
        // - L'offre n'est pas déjà clôturée
        // - ET le nombre de postes = nombre de candidatures acceptées (quota atteint)
        // (Peu importe s'il y a des candidatures en attente ou refusées)
        const isCloturePossible = !isOfferClosed && isQuotaAtteint;

        const filteredApps = getFilteredApplications();
        const totalPages = Math.ceil(filteredApps.length / limit) || 1;
        const paginatedApps = filteredApps.slice((page - 1) * limit, page * limit);

        return (
            <>
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link onClick={handleBackToDepartments} sx={{ cursor: 'pointer', color: '#148aa0', textDecoration: 'none' }}>
                        Gestion des candidatures
                    </Link>
                    <Link onClick={handleBackToOffers} sx={{ cursor: 'pointer', color: '#148aa0', textDecoration: 'none' }}>
                        {selectedDepartment?.nom || 'Departement'}
                    </Link>
                    <Typography color="#1a2332" fontWeight={600}>
                        {selectedOffer?.titre || 'Offre'}
                    </Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <PageTitle>{selectedOffer?.titre || 'Offre'}</PageTitle>
                        <PageSubtitle>
                            Departement : {selectedDepartment?.nom || selectedDepartment?.name || '-'}
                            {selectedOffer?.typeStage && ` • ${selectedOffer.typeStage}`}
                            {selectedOffer?.candidatureCount !== undefined && ` • ${selectedOffer.candidatureCount} candidature(s)`}
                            {isOfferClosed && (
                                <Chip
                                    label="Cloturee"
                                    size="small"
                                    sx={{ ml: 1, backgroundColor: '#d1fae5', color: '#065f46' }}
                                />
                            )}
                        </PageSubtitle>
                    </Box>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            onClick={handleBackToOffers}
                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                        >
                            Retour aux offres
                        </Button>
                    </Box>
                </Box>

                {/* Suivi des postes */}
                <Paper sx={{
                    p: 3, mb: 3, borderRadius: '12px',
                    border: '1px solid #eef1f3',
                    borderLeft: `3px solid ${postes.occupes >= postes.demandes && postes.demandes > 0 ? '#22c55e' : '#148aa0'}`,
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '12px', color: '#6b7280' }}>
                            Suivi des postes
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {postes.occupes >= postes.demandes && postes.demandes > 0 && (
                                <Chip
                                    icon={<CheckCircle sx={{ fontSize: '14px !important', color: '#059669 !important' }} />}
                                    label="Selection complete"
                                    size="small"
                                    sx={{ backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 600, fontSize: '11px', border: '1px solid #a7f3d0' }}
                                />
                            )}
                            
                            {/* ✅ BOUTON DE NETTOYAGE - visible SEULEMENT si occupes > demandes */}
                            {postes.occupes > postes.demandes && postes.demandes > 0 && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Warning sx={{ color: '#d97706' }} />}
                                    onClick={() => setOpenCleanDialog(true)}
                                    sx={{
                                        borderRadius: '6px',
                                        textTransform: 'none',
                                        fontSize: '11px',
                                        borderColor: '#d97706',
                                        color: '#d97706',
                                        '&:hover': {
                                            backgroundColor: 'rgba(217, 119, 6, 0.04)',
                                            borderColor: '#b45309',
                                            color: '#b45309',
                                        }
                                    }}
                                >
                                    Nettoyer ({postes.occupes}/{postes.demandes})
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 3, sm: 5 } }}>
                        {/* Anneau de progression */}
                        <Box sx={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
                            <CircularProgress
                                variant="determinate"
                                value={100}
                                size={96}
                                thickness={4}
                                sx={{ color: '#eef1f3', position: 'absolute' }}
                            />
                            <CircularProgress
                                variant="determinate"
                                value={postes.demandes > 0 ? Math.min(100, (postes.occupes / postes.demandes) * 100) : 0}
                                size={96}
                                thickness={4}
                                sx={{
                                    color: postes.occupes >= postes.demandes && postes.demandes > 0 ? '#22c55e' : '#148aa0',
                                    position: 'absolute',
                                    '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                                }}
                            />
                            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1a2332', lineHeight: 1 }}>
                                    {postes.occupes}<Typography component="span" sx={{ fontSize: '13px', fontWeight: 500, color: '#9aa4ac' }}>/{postes.demandes}</Typography>
                                </Typography>
                                <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#9aa4ac', textTransform: 'uppercase', letterSpacing: '0.5px', mt: 0.5 }}>
                                    postes
                                </Typography>
                            </Box>
                        </Box>

                        {/* Metriques */}
                        <Stack direction="row" spacing={{ xs: 3, sm: 5 }} divider={<Divider orientation="vertical" flexItem sx={{ borderColor: '#f1f5f9' }} />}>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#9aa4ac', fontSize: '11.5px' }}>Postes demandes</Typography>
                                <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#1a2332', lineHeight: 1.2 }}>{postes.demandes}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#9aa4ac', fontSize: '11.5px' }}>Postes occupes</Typography>
                                <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#059669', lineHeight: 1.2 }}>{postes.occupes}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#9aa4ac', fontSize: '11.5px' }}>Postes restants</Typography>
                                <Typography sx={{ fontSize: '22px', fontWeight: 700, color: postes.restants > 0 ? '#0b7890' : '#1a2332', lineHeight: 1.2 }}>{postes.restants}</Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {postes.occupes > postes.demandes && postes.demandes > 0 && (
                        <Typography variant="caption" color="#d97706" sx={{ display: 'block', mt: 2 }}>
                            ⚠️ {postes.occupes} candidats acceptés pour {postes.demandes} poste(s). Utilisez le bouton "Nettoyer" pour corriger.
                        </Typography>
                    )}

                    {isQuotaAtteint && postes.occupes <= postes.demandes && applications.some(a => a.statut !== 'Acceptee' && a.statut !== 'Refusee') && (
                        <Typography variant="caption" color="#b45309" sx={{ display: 'block', mt: 2 }}>
                            Quota atteint — il reste des candidatures en analyse/en attente à traiter.
                        </Typography>
                    )}
                </Paper>

                {/* Recherche et filtres */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', backgroundColor: '#fafbfc', border: '1px solid #eef1f3' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={7}>
                            <SearchField
                                placeholder="Rechercher un candidat..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search sx={{ color: '#999', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <TextField
                                select
                                label="Statut"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                size="small"
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }}
                            >
                                <MenuItem value="all">Tous les statuts</MenuItem>
                                <MenuItem value="Acceptee">Acceptees</MenuItem>
                                <MenuItem value="EnAnalyse">En analyse</MenuItem>
                                <MenuItem value="Soumise">En attente</MenuItem>
                                <MenuItem value="Refusee">Refusees</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </Paper>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

                {/* Tableau des candidatures */}
                <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#1a2332', fontSize: '13px' }}>Candidat</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a2332', fontSize: '13px' }}>Date</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#1a2332', fontSize: '13px' }}>Documents</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#1a2332', fontSize: '13px' }}>Statut</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: '#1a2332', fontSize: '13px' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedApps.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            {searchTerm || statusFilter !== 'all'
                                                ? 'Aucune candidature ne correspond a vos criteres'
                                                : 'Aucune candidature pour cette offre'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedApps.map((app) => {
                                    const isAccepted = app.statut === 'Acceptee';
                                    const isRefused = app.statut === 'Refusee';
                                    const canAccept = !isAccepted && !isRefused && !isSelectionCloturee && !isQuotaAtteint;

                                    return (
                                        <TableRow key={app._id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#2d3748', color: '#fff', fontSize: 14 }}>
                                                        {app.etudiantId?.prenom?.[0] || ''}{app.etudiantId?.nom?.[0] || ''}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {app.etudiantId?.prenom || ''} {app.etudiantId?.nom || ''}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {app.etudiantId?.email || ''}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {format(new Date(app.createdAt || app.dateSoumission), 'dd/MM/yyyy')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    icon={<Work sx={{ fontSize: '13px !important', color: '#94a3b8 !important' }} />}
                                                    label={app.documentCount || 0}
                                                    size="small"
                                                    sx={{ backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 500 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={app.statut || 'Soumise'}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: app.statut === 'Acceptee' ? '#d1fae5' :
                                                                      app.statut === 'Refusee' ? '#fee2e2' :
                                                                      app.statut === 'EnAnalyse' ? '#fef3c7' :
                                                                      '#dbeafe',
                                                        color: app.statut === 'Acceptee' ? '#065f46' :
                                                               app.statut === 'Refusee' ? '#991b1b' :
                                                               app.statut === 'EnAnalyse' ? '#d97706' :
                                                               '#1d4ed8',
                                                        fontWeight: 500,
                                                        fontSize: '11px',
                                                        height: '24px',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    <Tooltip title="Voir le detail">
                                                        <IconButton size="small" onClick={() => handleViewApplication(app._id)} sx={{ color: '#2d3748' }}>
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {canAccept && (
                                                        <Tooltip title="Accepter">
                                                            <IconButton size="small" onClick={() => handleAcceptApplication(app)} sx={{ color: '#22c55e' }}>
                                                                <CheckCircle fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {!isAccepted && !isRefused && isSelectionCloturee && (
                                                        <Tooltip title="Cloture">
                                                            <IconButton size="small" disabled sx={{ color: '#9aa4ac' }}>
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, v) => setPage(v)}
                            sx={{ '& .MuiPaginationItem-root.Mui-selected': { backgroundColor: '#2d3748', color: '#ffffff' } }}
                        />
                    </Box>
                )}

                {/* ============================================ */}
                {/* SECTION PDF - BOUTONS OUVRIR, TELECHARGER ET REGENERER */}
                {/* ============================================ */}
                {isSelectionCloturee && offerResults?.resultatsPdfPath && (
                    <Box sx={{ mt: 2 }}>
                        <Card
                            sx={{
                                p: 2,
                                borderRadius: '10px',
                                border: '1px solid #eef1f3',
                                backgroundColor: '#fafbfc',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <PictureAsPdf sx={{ color: '#ef4444', fontSize: 32 }} />
                                    <Typography variant="body2" fontWeight={600} color="#1a2332">
                                        Avis des resultats
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, flexWrap: 'wrap' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Visibility />}
                                        onClick={() => {
                                            const pdfUrl = getFullPdfUrl(offerResults.resultatsPdfPath);
                                            if (pdfUrl) window.open(pdfUrl, '_blank');
                                        }}
                                        sx={{
                                            borderRadius: '6px',
                                            textTransform: 'none',
                                            borderColor: '#2d3748',
                                            color: '#2d3748',
                                            '&:hover': {
                                                backgroundColor: 'rgba(45, 55, 72, 0.04)',
                                            },
                                        }}
                                    >
                                        Ouvrir
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<Download />}
                                        onClick={() => {
                                            const pdfUrl = getFullPdfUrl(offerResults.resultatsPdfPath);
                                            if (pdfUrl) {
                                                const link = document.createElement('a');
                                                link.href = pdfUrl;
                                                link.download = `RESULTATS_${selectedOffer?.titre?.replace(/\s/g, '_').toUpperCase() || 'STAGE'}.pdf`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }
                                        }}
                                        sx={{
                                            borderRadius: '6px',
                                            textTransform: 'none',
                                            backgroundColor: '#148aa0',
                                            '&:hover': { backgroundColor: '#0b7890' },
                                        }}
                                    >
                                        Telecharger
                                    </Button>
                                    <Button
                                        variant="text"
                                        size="small"
                                        startIcon={<Refresh />}
                                        onClick={handleRegeneratePdf}
                                        disabled={regenerating}
                                        sx={{
                                            borderRadius: '6px',
                                            textTransform: 'none',
                                            color: '#94a3b8',
                                            '&:hover': {
                                                backgroundColor: '#f8fafc',
                                                color: '#64748b',
                                            },
                                            '&:disabled': {
                                                opacity: 0.5,
                                            },
                                        }}
                                    >
                                        {regenerating ? 'Regeneration...' : 'Regenerer'}
                                    </Button>
                                </Box>
                            </Box>
                        </Card>
                    </Box>
                )}

                {/* ============================================ */}
                {/* PANEL DE FINALISATION */}
                {/* ============================================ */}
                {showFinalizationPanel && renderFinalizationPanel()}

                {/* ✅ Bouton de cloture - visible UNIQUEMENT si quota atteint */}
                {isCloturePossible && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<Send />}
                            onClick={handleOpenClosureDialog}
                            sx={{ borderRadius: '8px', textTransform: 'none', backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
                        >
                            Cloturer les candidatures
                        </Button>
                    </Box>
                )}

                {/* Alerte quota atteint */}
                {isQuotaAtteint && !isCloturePossible && !isOfferClosed && applications.some(a => a.statut !== 'Acceptee' && a.statut !== 'Refusee') && (
                    <Alert severity="warning" sx={{ mt: 2, borderRadius: '10px' }}>
                        Nombre de postes atteint ({postes.occupes}/{postes.demandes}).
                        <Button variant="text" size="small" onClick={handleOpenClosureDialog} sx={{ ml: 1, color: '#ef4444', textTransform: 'none' }}>
                            Cloturer la selection
                        </Button>
                    </Alert>
                )}

                {/* Dialog Acceptation */}
                <Dialog open={openAcceptDialog} onClose={() => setOpenAcceptDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', padding: '8px' } }}>
                    <DialogTitle>Accepter le candidat</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Etes-vous sur de vouloir accepter la candidature de{' '}
                            <strong>{acceptingApplication?.etudiantId?.prenom || ''} {acceptingApplication?.etudiantId?.nom || ''}</strong>
                            {' '}pour l'offre <strong>{selectedOffer?.titre || ''}</strong> ?
                        </Typography>
                        <Alert severity="info" sx={{ borderRadius: '10px' }}>
                            {postes.occupes} poste(s) occupe(s) sur {postes.demandes}
                        </Alert>
                        {postes.restants === 0 && (
                            <Alert severity="warning" sx={{ mt: 2, borderRadius: '10px' }}>
                                Tous les postes sont deja occupes.
                            </Alert>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 0 }}>
                        <Button onClick={() => setOpenAcceptDialog(false)} sx={{ borderRadius: '10px', textTransform: 'none' }} disabled={submitting}>
                            Annuler
                        </Button>
                        <Button
                            variant="contained"
                            onClick={confirmAcceptApplication}
                            disabled={submitting || postes.restants === 0}
                            sx={{ backgroundColor: '#22c55e', borderRadius: '10px', textTransform: 'none', '&:hover': { backgroundColor: '#16a34a' } }}
                        >
                            {submitting ? 'Traitement...' : 'Accepter'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog Cloture */}
                <Dialog open={openClosureDialog} onClose={() => setOpenClosureDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px', padding: '8px' } }}>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Warning sx={{ color: '#ef4444' }} />
                            Cloturer les candidatures ?
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Offre : <strong>{selectedOffer?.titre || ''}</strong>
                        </Typography>
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: '10px', border: '1px solid #22c55e' }}>
                            <Typography variant="body2">{postes.occupes} / {postes.demandes} postes occupes</Typography>
                        </Box>
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#fffbeb', borderRadius: '10px', border: '1px solid #d97706' }}>
                            <Typography variant="body2">
                                {applications.filter(a => a.statut !== 'Acceptee' && a.statut !== 'Refusee').length} candidatures encore en analyse/en attente
                            </Typography>
                        </Box>
                        <Alert severity="warning" sx={{ mt: 2, borderRadius: '10px' }}>
                            <Typography variant="body2"><strong>Action irreversible</strong></Typography>
                            <Typography variant="body2">
                                Les candidatures restantes (non acceptees et non refusees) passeront automatiquement au statut <strong>« Refusee »</strong>.
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Cette action confirme la fin de la selection pour cette offre.
                            </Typography>
                        </Alert>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 0 }}>
                        <Button onClick={() => setOpenClosureDialog(false)} sx={{ borderRadius: '10px', textTransform: 'none' }} disabled={closing}>
                            Annuler
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleConfirmClosure}
                            disabled={closing}
                            sx={{ backgroundColor: '#ef4444', borderRadius: '10px', textTransform: 'none', '&:hover': { backgroundColor: '#dc2626' } }}
                        >
                            {closing ? 'Traitement...' : 'Confirmer la cloture'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ✅ Dialog Nettoyage des anciennes données */}
                <Dialog
                    open={openCleanDialog}
                    onClose={() => setOpenCleanDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: '16px', padding: '8px' } }}
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Warning sx={{ color: '#d97706' }} />
                            Nettoyer les anciennes données
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Offre : <strong>{selectedOffer?.titre || ''}</strong>
                        </Typography>
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#fffbeb', borderRadius: '10px', border: '1px solid #fde3b0' }}>
                            <Typography variant="body2">
                                <strong>⚠️ Action importante</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Cette offre a <strong>{postes.occupes}</strong> candidats acceptés pour seulement <strong>{postes.demandes}</strong> poste(s).
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Seuls les <strong>{postes.demandes}</strong> premiers candidats acceptés seront conservés.
                                Les autres passeront au statut <strong>« Refusée »</strong>.
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, color: '#b45309' }}>
                                Cette action est irréversible.
                            </Typography>
                        </Box>
                        <Alert severity="warning" sx={{ mt: 2, borderRadius: '10px' }}>
                            <Typography variant="body2">
                                Les candidats seront conservés dans l'ordre de leur date d'acceptation.
                            </Typography>
                        </Alert>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 0 }}>
                        <Button
                            onClick={() => setOpenCleanDialog(false)}
                            sx={{ borderRadius: '10px', textTransform: 'none' }}
                            disabled={cleaning}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCleanOverAccepted}
                            disabled={cleaning}
                            sx={{
                                backgroundColor: '#d97706',
                                borderRadius: '10px',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#b45309' },
                            }}
                        >
                            {cleaning ? 'Traitement...' : 'Confirmer le nettoyage'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    };

    // ============================================
    // RENDER PRINCIPAL
    // ============================================

    if (loading && departments.length === 0) {
        return (
            <PageContainer maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress size={44} sx={{ color: '#148aa0' }} />
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="xl">
            {view === 'departments' && renderDepartments()}
            {view === 'offers' && renderOffers()}
            {view === 'applications' && renderApplications()}
        </PageContainer>
    );
};

export default CandidatureManagement;
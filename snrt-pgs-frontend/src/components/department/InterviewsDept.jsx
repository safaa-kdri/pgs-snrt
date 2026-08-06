// src/components/department/InterviewsDept.jsx
// ✅ VERSION AVEC FILTRES AU-DESSUS DES CARTES - SANS BOUTON RÉINITIALISER

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Chip,
    Avatar,
    IconButton,
    Grid,
    CircularProgress,
    InputAdornment,
    Tooltip,
    MenuItem,
    Alert,
    Pagination,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    Search,
    Refresh,
    Event,
    Visibility,
    Edit,
    VideoCall,
    LocationOn,
    Schedule,
    Cancel,
    ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================
// STYLES
// ============================================

const PageHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
});

const StyledTableCell = styled(TableCell)({
    fontWeight: 600,
    color: '#1a2332',
    fontSize: '13px',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'Planifie': { bg: '#dbeafe', text: '#1d4ed8' },
        'Realise': { bg: '#d1fae5', text: '#065f46' },
        'Annule': { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors['Planifie'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
    };
});

const TypeChip = styled(Chip)(({ type }) => {
    const colors = {
        'presentiel': { bg: '#f3e8ff', text: '#6b21a8' },
        'visio': { bg: '#dbeafe', text: '#1d4ed8' },
        'telephonique': { bg: '#fef3c7', text: '#d97706' },
    };
    const color = colors[type] || colors['presentiel'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
    };
});

// ✅ Carte statistique avec état actif
const StatCard = styled(Card)(({ active, color }) => ({
    borderRadius: '10px',
    border: `1px solid ${active ? color : '#eef1f3'}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: active ? alpha(color, 0.05) : '#ffffff',
    boxShadow: active ? `0 4px 12px ${alpha(color, 0.15)}` : 'none',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transform: 'translateY(-2px)',
    },
}));

// ✅ Filtres Container
const FiltersContainer = styled(Paper)({
    padding: '16px 20px',
    marginBottom: '24px',
    borderRadius: '12px',
    backgroundColor: '#fafbfc',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const InterviewsDept = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // ✅ Lire le statut depuis l'URL
    const queryParams = new URLSearchParams(location.search);
    const initialStatus = queryParams.get('statut') || 'all';

    const [loading, setLoading] = useState(true);
    const [allInterviews, setAllInterviews] = useState([]);
    const [filteredInterviews, setFilteredInterviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // ✅ STATS FIXES
    const [stats, setStats] = useState({
        total: 0,
        planifies: 0,
        realises: 0,
        annules: 0,
    });

    // Dialog states
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        date: '',
        heure: '',
        duree: 30,
        type: 'presentiel',
        lieu: '',
        lienVisio: '',
        commentaires: '',
        resultat: 'EnAttente',
    });

    const limit = 10;

    // ✅ Synchroniser statusFilter avec l'URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const statusFromUrl = params.get('statut') || 'all';
        if (statusFromUrl !== statusFilter) {
            setStatusFilter(statusFromUrl);
        }
    }, [location.search]);

    // ✅ Charger TOUS les entretiens une seule fois
    useEffect(() => {
        fetchAllInterviews();
    }, []);

    // ✅ Filtrer quand le filtre ou la recherche change
    useEffect(() => {
        filterInterviews();
    }, [allInterviews, searchTerm, statusFilter]);

    // ============================================
    // ✅ CHARGEMENT DE TOUS LES ENTRETIENS - STATS FIXES
    // ============================================
    const fetchAllInterviews = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: 1,
                limit: 1000,
            };

            console.log('📤 [InterviewsDept] Chargement de tous les entretiens...');

            const response = await api.get('/interviews/department', { params });
            
            let data = [];
            let pagination = {};
            
            if (response.data?.interviews) {
                data = response.data.interviews;
                pagination = response.data.pagination || {};
            } else if (response.data?.data) {
                data = response.data.data;
                pagination = response.data.pagination || {};
            } else if (Array.isArray(response.data)) {
                data = response.data;
            }

            // ✅ Transformer les données pour le frontend
            const formattedData = data.map(interview => ({
                ...interview,
                _id: interview._id || interview.id,
                candidat: interview.candidat || interview.etudiantId || {},
                offre: interview.offre || interview.offreId || {},
                statut: interview.statut || 'Planifie',
                type: interview.type || 'presentiel',
            }));

            console.log(`📥 [InterviewsDept] ${formattedData.length} entretiens chargés`);

            setAllInterviews(formattedData);
            setFilteredInterviews(formattedData);
            setTotal(pagination.total || formattedData.length || 0);
            setTotalPages(Math.ceil((pagination.total || formattedData.length) / limit) || 1);

            // ✅ Calculer les stats UNE FOIS sur toutes les données
            setStats({
                total: pagination.total || formattedData.length || 0,
                planifies: formattedData.filter(i => i.statut === 'Planifie').length,
                realises: formattedData.filter(i => i.statut === 'Realise').length,
                annules: formattedData.filter(i => i.statut === 'Annule').length,
            });

        } catch (error) {
            console.error('❌ Erreur chargement entretiens:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
            setAllInterviews([]);
            setFilteredInterviews([]);
            setTotal(0);
            setTotalPages(1);
            setStats({
                total: 0,
                planifies: 0,
                realises: 0,
                annules: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // ✅ FILTRER PAR RECHERCHE ET STATUT
    // ============================================
    const filterInterviews = () => {
        let filtered = [...allInterviews];

        // ✅ Filtrer par statut
        if (statusFilter !== 'all') {
            filtered = filtered.filter((i) => i.statut === statusFilter);
        }

        // ✅ Filtrer par recherche
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (i) =>
                    (i.candidat?.nom || i.candidat || '').toLowerCase().includes(term) ||
                    (i.candidat?.prenom || '').toLowerCase().includes(term) ||
                    (i.offre?.titre || i.offre || '').toLowerCase().includes(term)
            );
        }

        // ✅ Mettre à jour le total affiché
        setTotal(filtered.length);
        setFilteredInterviews(filtered);
        
        // ✅ Recalculer la pagination
        const totalPages = Math.ceil(filtered.length / limit) || 1;
        setTotalPages(totalPages);
        if (page > totalPages) {
            setPage(1);
        }
    };

    // ============================================
    // ✅ CHANGER LE STATUT - MET À JOUR L'URL
    // ============================================
    const handleStatusFilterChange = (newStatus) => {
        setStatusFilter(newStatus);
        setPage(1);
        
        const params = new URLSearchParams();
        if (newStatus !== 'all') {
            params.set('statut', newStatus);
        }
        navigate(`/department/interviews${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
    };

    // ============================================
    // ✅ CHANGER DE PAGE
    // ============================================
    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ============================================
    // UTILITAIRES
    // ============================================

    const getStatusLabel = (status) => {
        const labels = {
            'Planifie': 'Planifié',
            'Realise': 'Réalisé',
            'Annule': 'Annulé',
        };
        return labels[status] || status;
    };

    const getTypeLabel = (type) => {
        const labels = {
            'presentiel': 'Présentiel',
            'visio': 'Visio',
            'telephonique': 'Téléphonique',
        };
        return labels[type] || type;
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'visio': return <VideoCall fontSize="small" />;
            case 'presentiel': return <LocationOn fontSize="small" />;
            default: return <Schedule fontSize="small" />;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr });
    };

    const getInitials = (nom, prenom) => {
        if (!nom && !prenom) return '?';
        return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase() || '?';
    };

    // ✅ Déterminer si une carte est active
    const isCardActive = (statutKey) => {
        if (statutKey === 'all') return statusFilter === 'all';
        return statusFilter === statutKey;
    };

    // ✅ Obtenir les éléments paginés
    const getPaginatedData = () => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return filteredInterviews.slice(start, end);
    };

    const paginatedData = getPaginatedData();

    // ============================================
    // ACTIONS
    // ============================================

    const handleView = (interview) => {
        setSelectedInterview(interview);
        setOpenViewDialog(true);
    };

    const handleCloseView = () => {
        setOpenViewDialog(false);
        setSelectedInterview(null);
    };

    const handleEdit = (interview) => {
        setSelectedInterview(interview);
        setFormData({
            date: interview.date ? format(new Date(interview.date), 'yyyy-MM-dd') : '',
            heure: interview.heure || '',
            duree: interview.duree || 30,
            type: interview.type || 'presentiel',
            lieu: interview.lieu || '',
            lienVisio: interview.lienVisio || '',
            commentaires: interview.commentaires || '',
            resultat: interview.resultat || 'EnAttente',
        });
        setOpenEditDialog(true);
    };

    const handleCloseEdit = () => {
        setOpenEditDialog(false);
        setSelectedInterview(null);
        setError('');
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    };

    const handleSaveEdit = async () => {
        if (!formData.date || !formData.heure) {
            setError('La date et l\'heure sont obligatoires');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await api.put(`/interviews/${selectedInterview._id}`, formData);
            setSuccess('✅ Entretien modifié avec succès');
            setOpenEditDialog(false);
            fetchAllInterviews();
        } catch (error) {
            console.error('❌ Erreur modification:', error);
            setError(error.response?.data?.message || 'Erreur lors de la modification');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelInterview = async (id) => {
        if (!window.confirm('Voulez-vous vraiment annuler cet entretien ?')) return;
        try {
            await api.put(`/interviews/${id}/cancel`);
            setSuccess('✅ Entretien annulé avec succès');
            fetchAllInterviews();
        } catch (error) {
            console.error('❌ Erreur annulation:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'annulation');
        }
    };

    // ============================================
    // OPTIONS
    // ============================================

    const statusOptions = [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'Planifie', label: 'Planifié' },
        { value: 'Realise', label: 'Réalisé' },
        { value: 'Annule', label: 'Annulé' },
    ];

    const typeOptions = [
        { value: 'presentiel', label: 'Présentiel' },
        { value: 'visio', label: 'Visio' },
        { value: 'telephonique', label: 'Téléphonique' },
    ];

    const resultatOptions = [
        { value: 'EnAttente', label: 'En attente' },
        { value: 'Positive', label: 'Positif' },
        { value: 'Negative', label: 'Négatif' },
    ];

    // ============================================
    // RENDER
    // ============================================

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={44} sx={{ color: '#000000' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Entretiens
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredInterviews.length} entretien(s) trouvé(s)
                        {statusFilter !== 'all' && ` • Filtré par : ${getStatusLabel(statusFilter)}`}
                    </Typography>
                </Box>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

            {/* ========================================== */}
            {/* ✅ FILTRES - AU-DESSUS DES CARTES */}
            {/* ========================================== */}
            <FiltersContainer>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                        <TextField
                            placeholder="Rechercher par nom, offre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: '#999', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    backgroundColor: '#fff',
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            label="Statut"
                            value={statusFilter}
                            onChange={(e) => handleStatusFilterChange(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' },
                            }}
                        >
                            {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </FiltersContainer>

            {/* ===== STATS RAPIDES AVEC ÉTAT ACTIF - STATS FIXES ===== */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <StatCard 
                        active={isCardActive('all')}
                        color="#2d3748"
                        onClick={() => handleStatusFilterChange('all')}
                    >
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="text.secondary">Total</Typography>
                            <Typography variant="h6" fontWeight={700}>{stats.total}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard 
                        active={isCardActive('Planifie')}
                        color="#1d4ed8"
                        onClick={() => handleStatusFilterChange('Planifie')}
                    >
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="#1d4ed8">Planifiés</Typography>
                            <Typography variant="h6" fontWeight={700} color="#1d4ed8">{stats.planifies}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard 
                        active={isCardActive('Realise')}
                        color="#065f46"
                        onClick={() => handleStatusFilterChange('Realise')}
                    >
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="#065f46">Réalisés</Typography>
                            <Typography variant="h6" fontWeight={700} color="#065f46">{stats.realises}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard 
                        active={isCardActive('Annule')}
                        color="#991b1b"
                        onClick={() => handleStatusFilterChange('Annule')}
                    >
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="#991b1b">Annulés</Typography>
                            <Typography variant="h6" fontWeight={700} color="#991b1b">{stats.annules}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
            </Grid>

            {/* ===== TABLEAU ===== */}
            <TableContainer
                component={Paper}
                sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                            <StyledTableCell>Candidat</StyledTableCell>
                            <StyledTableCell>Offre</StyledTableCell>
                            <StyledTableCell>Type</StyledTableCell>
                            <StyledTableCell>Date / Heure</StyledTableCell>
                            <StyledTableCell>Lieu / Lien</StyledTableCell>
                            <StyledTableCell>Statut</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {statusFilter !== 'all' 
                                            ? `Aucun entretien avec le statut "${getStatusLabel(statusFilter)}"`
                                            : 'Aucun entretien trouvé'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((interview) => (
                                <TableRow key={interview._id || interview.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                sx={{
                                                    backgroundColor: '#000000',
                                                    width: 36,
                                                    height: 36,
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: '#fff',
                                                }}
                                            >
                                                {getInitials(
                                                    interview.candidat?.nom || interview.nom,
                                                    interview.candidat?.prenom || interview.prenom
                                                )}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {interview.candidat?.prenom || interview.prenom || ''} 
                                                    {interview.candidat?.nom || interview.nom || ''}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {interview.offre?.titre || interview.offre || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <TypeChip
                                            icon={getTypeIcon(interview.type)}
                                            label={getTypeLabel(interview.type)}
                                            type={interview.type}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(interview.date)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {interview.heure} ({interview.duree} min)
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {interview.type === 'visio' ? (
                                            <Tooltip title={interview.lienVisio}>
                                                <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
                                                    🔗 Lien
                                                </Typography>
                                            </Tooltip>
                                        ) : (
                                            <Typography variant="body2">{interview.lieu || '-'}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={getStatusLabel(interview.statut)}
                                            status={interview.statut}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleView(interview)}
                                                sx={{ color: '#000000' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {interview.statut === 'Planifie' && (
                                            <>
                                                <Tooltip title="Modifier">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(interview)}
                                                        sx={{ color: '#4f46e5' }}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Annuler">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleCancelInterview(interview._id)}
                                                        sx={{ color: '#ef4444' }}
                                                    >
                                                        <Cancel fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        sx={{
                            '& .MuiPaginationItem-root.Mui-selected': {
                                backgroundColor: '#000000',
                                color: '#ffffff',
                            },
                        }}
                    />
                </Box>
            )}

            {/* ========================================== */}
            {/* DIALOG VISUALISATION */}
            {/* ========================================== */}

            <Dialog
                open={openViewDialog}
                onClose={handleCloseView}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Event sx={{ color: '#000000' }} />
                    Détails de l'entretien
                </DialogTitle>
                <DialogContent>
                    {selectedInterview && (
                        <Box sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">Candidat</Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {selectedInterview.candidat?.prenom || ''} {selectedInterview.candidat?.nom || ''}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">Offre</Typography>
                                    <Typography variant="body1">
                                        {selectedInterview.offre?.titre || '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Date</Typography>
                                    <Typography variant="body1">{formatDate(selectedInterview.date)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Heure</Typography>
                                    <Typography variant="body1">{selectedInterview.heure}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Durée</Typography>
                                    <Typography variant="body1">{selectedInterview.duree} minutes</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Type</Typography>
                                    <Typography variant="body1">{getTypeLabel(selectedInterview.type)}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedInterview.type === 'visio' ? 'Lien' : 'Lieu'}
                                    </Typography>
                                    <Typography variant="body1">
                                        {selectedInterview.type === 'visio' ? selectedInterview.lienVisio : selectedInterview.lieu || '-'}
                                    </Typography>
                                </Grid>
                                {selectedInterview.commentaires && (
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">Commentaires</Typography>
                                        <Typography variant="body2">{selectedInterview.commentaires}</Typography>
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">Statut</Typography>
                                    <StatusChip
                                        label={getStatusLabel(selectedInterview.statut)}
                                        status={selectedInterview.statut}
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleCloseView} sx={{ borderRadius: '10px', textTransform: 'none' }}>
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ========================================== */}
            {/* DIALOG MODIFICATION */}
            {/* ========================================== */}

            <Dialog
                open={openEditDialog}
                onClose={handleCloseEdit}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Edit sx={{ color: '#4f46e5' }} />
                    Modifier l'entretien
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Date *"
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleFormChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
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
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
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
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleFormChange}
                                    label="Type"
                                    sx={{ borderRadius: '10px' }}
                                >
                                    {typeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {formData.type === 'presentiel' && (
                            <Grid item xs={12}>
                                <TextField
                                    label="Lieu"
                                    name="lieu"
                                    value={formData.lieu}
                                    onChange={handleFormChange}
                                    fullWidth
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                        )}
                        {formData.type === 'visio' && (
                            <Grid item xs={12}>
                                <TextField
                                    label="Lien Visio"
                                    name="lienVisio"
                                    value={formData.lienVisio}
                                    onChange={handleFormChange}
                                    fullWidth
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                label="Commentaires"
                                name="commentaires"
                                value={formData.commentaires}
                                onChange={handleFormChange}
                                fullWidth
                                multiline
                                rows={2}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Résultat</InputLabel>
                                <Select
                                    name="resultat"
                                    value={formData.resultat}
                                    onChange={handleFormChange}
                                    label="Résultat"
                                    sx={{ borderRadius: '10px' }}
                                >
                                    {resultatOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleCloseEdit} sx={{ borderRadius: '10px', textTransform: 'none' }}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveEdit}
                        disabled={submitting}
                        sx={{
                            backgroundColor: '#000000',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#333333' },
                        }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Enregistrer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ===== LIEN RETOUR ===== */}
            <Box sx={{ mt: 3 }}>
                <Button
                    variant="text"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/department')}
                    sx={{ color: '#666', textTransform: 'none' }}
                >
                    Retour au tableau de bord
                </Button>
            </Box>
        </Container>
    );
};

export default InterviewsDept;
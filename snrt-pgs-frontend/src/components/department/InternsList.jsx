// src/components/department/InternsList.jsx
// ✅ VERSION AVEC STATS FIXES ET CARTES CLIQUABLES

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
    LinearProgress,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    Search,
    Visibility,
    Refresh,
    FilterList,
    School,
    Person,
    Work,
    CalendarToday,
    TrendingUp,
    CheckCircle,
    Pending,
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
        'EnCours': { bg: '#dbeafe', text: '#1d4ed8' },
        'Termine': { bg: '#d1fae5', text: '#065f46' },
        'Annule': { bg: '#fee2e2', text: '#991b1b' },
        'EnAttente': { bg: '#fef3c7', text: '#d97706' },
        'ValideParDirecteur': { bg: '#d1fae5', text: '#065f46' },
        'DemandeEnvoyee': { bg: '#fef3c7', text: '#d97706' },
        'EngagementEnvoye': { bg: '#dbeafe', text: '#1d4ed8' },
        'EngagementValide': { bg: '#d1fae5', text: '#065f46' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
    };
    const color = colors[status] || colors['EnAttente'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
    };
});

// ✅ Carte statistique avec état actif (comme dans CandidaturesList)
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

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const InternsList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const queryParams = new URLSearchParams(location.search);
    const initialStatus = queryParams.get('statut') || 'all';

    const [loading, setLoading] = useState(true);
    const [allInternships, setAllInternships] = useState([]); // ✅ TOUS les stages
    const [filteredInternships, setFilteredInternships] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // ✅ STATS FIXES (calculées une fois sur tous les stages)
    const [stats, setStats] = useState({
        total: 0,
        enCours: 0,
        termines: 0,
        enAttente: 0,
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

    // ✅ Charger TOUS les stages une seule fois
    useEffect(() => {
        fetchAllInternships();
    }, []);

    // ✅ Filtrer quand le filtre ou la recherche change
    useEffect(() => {
        filterInternships();
    }, [allInternships, searchTerm, statusFilter]);

    // ============================================
    // ✅ CHARGEMENT DE TOUS LES STAGES - STATS FIXES
    // ============================================
    const fetchAllInternships = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: 1,
                limit: 1000, // ✅ Récupérer tous les stages pour les stats
            };

            console.log('📤 [InternsList] Chargement de tous les stages...');

            let response;
            try {
                response = await api.get('/internships/department', { params });
            } catch (err) {
                console.warn('⚠️ Route /department non trouvée, fallback sur /internships');
                response = await api.get('/internships', { params });
            }
            
            let data = [];
            let pagination = {};
            
            if (response.data?.data) {
                data = response.data.data;
                pagination = response.data.pagination || {};
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data?.internships) {
                data = response.data.internships;
                pagination = response.data.pagination || {};
            }

            console.log(`📥 [InternsList] ${data.length} stages chargés`);

            setAllInternships(data);
            setFilteredInternships(data);
            setTotal(pagination.total || data.length || 0);
            setTotalPages(Math.ceil((pagination.total || data.length) / limit) || 1);

            // ✅ Calculer les stats UNE FOIS sur toutes les données
            setStats({
                total: pagination.total || data.length || 0,
                enCours: data.filter(i => i.statut === 'EnCours').length,
                termines: data.filter(i => i.statut === 'Termine' || i.statut === 'Cloturee').length,
                enAttente: data.filter(i => i.statut === 'EnAttente' || i.statut === 'DemandeEnvoyee' || i.statut === 'EngagementEnvoye').length,
            });

        } catch (error) {
            console.error('❌ Erreur chargement stages:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
            setAllInternships([]);
            setFilteredInternships([]);
            setTotal(0);
            setTotalPages(1);
            setStats({
                total: 0,
                enCours: 0,
                termines: 0,
                enAttente: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // ✅ FILTRER PAR RECHERCHE ET STATUT
    // ============================================
    const filterInternships = () => {
        let filtered = [...allInternships];

        // ✅ Filtrer par statut
        if (statusFilter !== 'all') {
            filtered = filtered.filter((i) => i.statut === statusFilter);
        }

        // ✅ Filtrer par recherche
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (i) =>
                    (i.etudiantId?.nom || '').toLowerCase().includes(term) ||
                    (i.etudiantId?.prenom || '').toLowerCase().includes(term) ||
                    (i.offreId?.titre || '').toLowerCase().includes(term) ||
                    (i.encadrantId?.nom || '').toLowerCase().includes(term)
            );
        }

        // ✅ Mettre à jour le total affiché
        setTotal(filtered.length);
        setFilteredInternships(filtered);
        
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
        navigate(`/department/interns${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
    };

    // ============================================
    // ✅ CHANGER DE PAGE
    // ============================================
    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ============================================
    // ✅ UTILITAIRES
    // ============================================
    const getStatusLabel = (status) => {
        const labels = {
            'EnCours': 'En cours',
            'Termine': 'Terminé',
            'Annule': 'Annulé',
            'EnAttente': 'En attente',
            'ValideParDirecteur': 'Validé par Directeur',
            'DemandeEnvoyee': 'Demande envoyée',
            'EngagementEnvoye': 'Engagement envoyé',
            'EngagementValide': 'Engagement validé',
            'Cloturee': 'Clôturé',
        };
        return labels[status] || status;
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return '#22c55e';
        if (progress >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr });
    };

    const getInitials = (nom, prenom) => {
        if (!nom && !prenom) return '?';
        return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase() || '?';
    };

    const handleViewInternship = (id) => {
        navigate(`/department/intern/${id}`);
    };

    const statusOptions = [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'EnCours', label: 'En cours' },
        { value: 'EnAttente', label: 'En attente' },
        { value: 'Termine', label: 'Terminé' },
        { value: 'Cloturee', label: 'Clôturé' },
        { value: 'Annule', label: 'Annulé' },
    ];

    // ✅ Déterminer si une carte est active
    const isCardActive = (statutKey) => {
        if (statutKey === 'all') return statusFilter === 'all';
        return statusFilter === statutKey;
    };

    // ✅ Obtenir les éléments paginés
    const getPaginatedData = () => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return filteredInternships.slice(start, end);
    };

    const paginatedData = getPaginatedData();

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
                        Stages du département
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredInternships.length} stage(s) trouvé(s)
                        {statusFilter !== 'all' && ` • Filtré par : ${getStatusLabel(statusFilter)}`}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchAllInternships}
                        disabled={loading}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            borderColor: '#e0e4e8',
                            color: '#20242b',
                            '&:hover': { borderColor: '#000000', backgroundColor: '#f5f5f5' },
                        }}
                    >
                        Rafraîchir
                    </Button>
                </Box>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

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
                        active={isCardActive('EnCours')}
                        color="#1d4ed8"
                        onClick={() => handleStatusFilterChange('EnCours')}
                    >
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="#1d4ed8">En cours</Typography>
                            <Typography variant="h6" fontWeight={700} color="#1d4ed8">{stats.enCours}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard 
                        active={isCardActive('Termine') || isCardActive('Cloturee')}
                        color="#065f46"
                        onClick={() => handleStatusFilterChange('Termine')}
                    >
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="#065f46">Terminés</Typography>
                            <Typography variant="h6" fontWeight={700} color="#065f46">{stats.termines}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard 
                        active={isCardActive('EnAttente') || isCardActive('DemandeEnvoyee') || isCardActive('EngagementEnvoye')}
                        color="#d97706"
                        onClick={() => handleStatusFilterChange('EnAttente')}
                    >
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="#d97706">En attente</Typography>
                            <Typography variant="h6" fontWeight={700} color="#d97706">{stats.enAttente}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
            </Grid>

            {/* ===== FILTRES ===== */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', backgroundColor: '#fafbfc' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
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
                    <Grid item xs={12} sm={4}>
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
                    <Grid item xs={12} sm={4}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={() => {
                                setSearchTerm('');
                                handleStatusFilterChange('all');
                            }}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                borderColor: '#ddd',
                                color: '#666',
                                backgroundColor: '#fff',
                                '&:hover': { borderColor: '#000000', backgroundColor: '#f5f5f5' },
                            }}
                        >
                            Réinitialiser
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* ===== TABLEAU ===== */}
            <TableContainer
                component={Paper}
                sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                            <StyledTableCell>Stagiaire</StyledTableCell>
                            <StyledTableCell>Offre</StyledTableCell>
                            <StyledTableCell>Encadrant</StyledTableCell>
                            <StyledTableCell>Période</StyledTableCell>
                            <StyledTableCell>Progression</StyledTableCell>
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
                                            ? `Aucun stage avec le statut "${getStatusLabel(statusFilter)}"`
                                            : 'Aucun stage trouvé'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((internship) => (
                                <TableRow key={internship._id || internship.id} hover>
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
                                                    internship.etudiantId?.nom || internship.nom,
                                                    internship.etudiantId?.prenom || internship.prenom
                                                )}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {internship.etudiantId?.prenom || internship.prenom || ''} 
                                                    {internship.etudiantId?.nom || internship.nom || ''}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {internship.etudiantId?.email || internship.email || ''}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {internship.offreId?.titre || internship.offre || 'Offre sans titre'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {internship.offreId?.typeStage || internship.typeStage || 'Stage'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {internship.encadrantId ? (
                                            <Box>
                                                <Typography variant="body2">
                                                    {internship.encadrantId.prenom || ''} {internship.encadrantId.nom || ''}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Encadrant
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Chip
                                                label="Non affecté"
                                                size="small"
                                                sx={{ backgroundColor: '#fef3c7', color: '#d97706' }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(internship.dateDebut)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            au {formatDate(internship.dateFin)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 120 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={internship.progression || 0}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        backgroundColor: '#e5e7eb',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: getProgressColor(internship.progression || 0),
                                                            borderRadius: 3,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="caption" fontWeight={500}>
                                                {internship.progression || 0}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={getStatusLabel(internship.statut)}
                                            status={internship.statut}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir le détail">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewInternship(internship._id || internship.id)}
                                                sx={{ color: '#000000' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
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

            {/* ===== LIEN RETOUR ===== */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
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

export default InternsList;
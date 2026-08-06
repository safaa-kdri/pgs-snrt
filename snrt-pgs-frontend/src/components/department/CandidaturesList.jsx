// src/components/department/CandidaturesList.jsx
// ✅ VERSION SANS BOUTON RÉINITIALISER

import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    Search,
    Visibility,
    Refresh,
    FilterList,
    CheckCircle,
    Cancel,
    Pending,
    Event,
    Description,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

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
        'Brouillon': { bg: '#e5e7eb', text: '#6b7280' },
        'Soumise': { bg: '#dbeafe', text: '#1d4ed8' },
        'EnAnalyse': { bg: '#fef3c7', text: '#d97706' },
        'Entretien': { bg: '#f3e8ff', text: '#6b21a8' },
        'Acceptee': { bg: '#d1fae5', text: '#065f46' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors['Soumise'];
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

const CandidaturesList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // ✅ Lire le statut depuis l'URL
    const queryParams = new URLSearchParams(location.search);
    const initialStatus = queryParams.get('statut') || 'all';

    const [loading, setLoading] = useState(true);
    const [allApplications, setAllApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // ✅ STATS FIXES (calculées une fois sur toutes les candidatures)
    const [stats, setStats] = useState({
        total: 0,
        enAttente: 0,
        acceptees: 0,
        refusees: 0,
        entretien: 0,
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

    // ✅ Charger TOUTES les candidatures une seule fois
    useEffect(() => {
        fetchAllApplications();
    }, []);

    // ✅ Filtrer quand le filtre ou la recherche change
    useEffect(() => {
        filterApplications();
    }, [allApplications, searchTerm, statusFilter]);

    // ============================================
    // ✅ CHARGEMENT DE TOUTES LES CANDIDATURES - STATS FIXES
    // ============================================
    const fetchAllApplications = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: 1,
                limit: 1000, // ✅ Récupérer toutes les candidatures pour les stats
            };

            console.log('📤 [CandidaturesList] Chargement de toutes les candidatures...');

            const response = await api.get('/applications/department', { params });
            
            let data = [];
            let pagination = {};
            
            if (response.data?.data) {
                data = response.data.data;
                pagination = response.data.pagination || {};
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data?.applications) {
                data = response.data.applications;
                pagination = response.data.pagination || {};
            }

            // ✅ S'assurer que chaque application a un statut valide
            data = data.map(app => ({
                ...app,
                statut: app.statut || 'Soumise',
            }));

            console.log(`📥 [CandidaturesList] ${data.length} candidatures chargées`);

            setAllApplications(data);
            setFilteredApplications(data);
            setTotal(pagination.total || data.length || 0);
            setTotalPages(Math.ceil((pagination.total || data.length) / limit) || 1);

            // ✅ Calculer les stats UNE FOIS sur toutes les données
            setStats({
                total: pagination.total || data.length || 0,
                enAttente: data.filter(a => a.statut === 'Soumise' || a.statut === 'EnAnalyse').length,
                acceptees: data.filter(a => a.statut === 'Acceptee').length,
                refusees: data.filter(a => a.statut === 'Refusee').length,
                entretien: data.filter(a => a.statut === 'Entretien').length,
            });

        } catch (error) {
            console.error('❌ Erreur chargement candidatures:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
            setAllApplications([]);
            setFilteredApplications([]);
            setTotal(0);
            setTotalPages(1);
            setStats({
                total: 0,
                enAttente: 0,
                acceptees: 0,
                refusees: 0,
                entretien: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // ✅ FILTRER PAR RECHERCHE ET STATUT
    // ============================================
    const filterApplications = () => {
        let filtered = [...allApplications];

        // ✅ Filtrer par statut
        if (statusFilter !== 'all') {
            filtered = filtered.filter((a) => a.statut === statusFilter);
        }

        // ✅ Filtrer par recherche
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (a) =>
                    (a.etudiantId?.nom || '').toLowerCase().includes(term) ||
                    (a.etudiantId?.prenom || '').toLowerCase().includes(term) ||
                    (a.etudiantId?.email || '').toLowerCase().includes(term) ||
                    (a.offreId?.titre || '').toLowerCase().includes(term)
            );
        }

        // ✅ Mettre à jour le total affiché
        setTotal(filtered.length);
        setFilteredApplications(filtered);
        
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
        
        // ✅ Mettre à jour l'URL avec le nouveau paramètre
        const params = new URLSearchParams();
        if (newStatus !== 'all') {
            params.set('statut', newStatus);
        }
        navigate(`/department/candidatures${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
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
            'Brouillon': 'Brouillon',
            'Soumise': 'Soumise',
            'EnAnalyse': 'En analyse',
            'Entretien': 'Entretien',
            'Acceptee': 'Acceptée',
            'Refusee': 'Refusée',
        };
        return labels[status] || status;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getInitials = (nom, prenom) => {
        if (!nom && !prenom) return '?';
        return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase() || '?';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Acceptee': return <CheckCircle sx={{ fontSize: 14 }} />;
            case 'Refusee': return <Cancel sx={{ fontSize: 14 }} />;
            case 'Entretien': return <Event sx={{ fontSize: 14 }} />;
            case 'EnAnalyse': return <Pending sx={{ fontSize: 14 }} />;
            default: return <Pending sx={{ fontSize: 14 }} />;
        }
    };

    const handleViewCandidature = (id) => {
        navigate(`/department/candidature/${id}`);
    };

    const statusOptions = [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'Soumise', label: 'En attente' },
        { value: 'EnAnalyse', label: 'En analyse' },
        { value: 'Entretien', label: 'Entretien' },
        { value: 'Acceptee', label: 'Acceptée' },
        { value: 'Refusee', label: 'Refusée' },
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
        return filteredApplications.slice(start, end);
    };

    const paginatedData = getPaginatedData();

    // ============================================
    // ✅ RENDER
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
                        Candidatures reçues
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredApplications.length} candidature(s) trouvée(s)
                        {statusFilter !== 'all' && ` • Filtré par : ${getStatusLabel(statusFilter)}`}
                    </Typography>
                </Box>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

            {/* ========================================== */}
            {/* ✅ FILTRES - SANS BOUTON RÉINITIALISER */}
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
                        active={isCardActive('Soumise') || isCardActive('EnAnalyse')}
                        color="#d97706"
                        onClick={() => handleStatusFilterChange('Soumise')}
                    >
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="#d97706">En attente</Typography>
                            <Typography variant="h6" fontWeight={700} color="#d97706">{stats.enAttente}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard 
                        active={isCardActive('Acceptee')}
                        color="#065f46"
                        onClick={() => handleStatusFilterChange('Acceptee')}
                    >
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="#065f46">Acceptées</Typography>
                            <Typography variant="h6" fontWeight={700} color="#065f46">{stats.acceptees}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard 
                        active={isCardActive('Refusee')}
                        color="#991b1b"
                        onClick={() => handleStatusFilterChange('Refusee')}
                    >
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="#991b1b">Refusées</Typography>
                            <Typography variant="h6" fontWeight={700} color="#991b1b">{stats.refusees}</Typography>
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
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell>Documents</StyledTableCell>
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
                                            ? `Aucune candidature avec le statut "${getStatusLabel(statusFilter)}"`
                                            : searchTerm
                                                ? 'Aucune candidature ne correspond à votre recherche'
                                                : 'Aucune candidature trouvée'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((app) => (
                                <TableRow key={app._id || app.id} hover>
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
                                                    app.etudiantId?.nom || app.nom,
                                                    app.etudiantId?.prenom || app.prenom
                                                )}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {app.etudiantId?.prenom || app.prenom || ''} 
                                                    {app.etudiantId?.nom || app.nom || ''}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {app.etudiantId?.email || app.email || ''}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {app.offreId?.titre || app.offre || 'Offre sans titre'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={app.offreId?.typeStage || app.typeStage || 'Stage'}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#e0e7ff',
                                                color: '#4338ca',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(app.createdAt || app.dateSoumission)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={`${app.documents?.length || 0} document(s)`}>
                                            <Chip
                                                label={app.documents?.length || 0}
                                                size="small"
                                                icon={<Description sx={{ fontSize: 14 }} />}
                                                sx={{
                                                    backgroundColor: '#f3e8ff',
                                                    color: '#6b21a8',
                                                    fontWeight: 500,
                                                }}
                                            />
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            icon={getStatusIcon(app.statut)}
                                            label={getStatusLabel(app.statut)}
                                            status={app.statut}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir le détail">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewCandidature(app._id || app.id)}
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
        </Container>
    );
};

export default CandidaturesList;
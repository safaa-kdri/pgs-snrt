// src/components/rh/ApplicationsList.jsx
// ✅ VERSION AVEC FILTRES AU-DESSUS DES CARTES - SANS BOUTON RÉINITIALISER
// ✅ MODIFICATION : "En attente" inclut tous les statuts SAUF Acceptee et Refusee

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
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    Search,
    Visibility,
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
        'EngagementEnvoye': { bg: '#dbeafe', text: '#1d4ed8' },
        'EngagementValide': { bg: '#d1fae5', text: '#065f46' },
        'DemandeEnvoyee': { bg: '#fef3c7', text: '#d97706' },
        'ValideParDirecteur': { bg: '#d1fae5', text: '#065f46' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
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

const FiltersContainer = styled(Paper)({
    padding: '16px 20px',
    marginBottom: '24px',
    borderRadius: '12px',
    backgroundColor: '#fafbfc',
    border: '1px solid #eef1f3',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ApplicationsList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

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

    const [stats, setStats] = useState({
        total: 0,
        enAttente: 0,
        acceptees: 0,
        refusees: 0,
        entretien: 0,
        engagement: 0,
    });

    const limit = 10;

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const statusFromUrl = params.get('statut') || 'all';
        if (statusFromUrl !== statusFilter) {
            setStatusFilter(statusFromUrl);
        }
    }, [location.search]);

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        filterApplications();
    }, [allApplications, searchTerm, statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: 1,
                limit: 1000,
            };

            console.log('📤 [ApplicationsList] Chargement des candidatures...');

            const response = await api.get('/applications', { params });
            
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

            data = data.map(app => ({
                ...app,
                statut: app.statut || 'Soumise',
            }));

            console.log(`📥 [ApplicationsList] ${data.length} candidatures chargees`);

            setAllApplications(data);
            setFilteredApplications(data);
            setTotal(pagination.total || data.length || 0);
            setTotalPages(pagination.pages || Math.ceil((pagination.total || data.length) / limit) || 1);

            // ✅ Mise à jour des stats - enAttente = tout sauf Acceptee et Refusee
            setStats({
                total: pagination.total || data.length || 0,
                enAttente: data.filter(a => a.statut !== 'Acceptee' && a.statut !== 'Refusee').length,
                acceptees: data.filter(a => a.statut === 'Acceptee').length,
                refusees: data.filter(a => a.statut === 'Refusee').length,
                entretien: data.filter(a => a.statut === 'Entretien').length,
                engagement: data.filter(a => a.statut === 'EngagementEnvoye' || a.statut === 'EngagementValide').length,
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
                engagement: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    // ✅ MODIFICATION : filtre "enAttente" = tous les statuts SAUF Acceptee et Refusee
    const filterApplications = () => {
        let filtered = [...allApplications];

        if (statusFilter !== 'all') {
            if (statusFilter === 'enAttente') {
                // ✅ "En attente" = tous les statuts SAUF Acceptee et Refusee
                filtered = filtered.filter(a => a.statut !== 'Acceptee' && a.statut !== 'Refusee');
            } else {
                filtered = filtered.filter((a) => a.statut === statusFilter);
            }
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (a) =>
                    (a.etudiantId?.nom || a.candidat?.nom || '').toLowerCase().includes(term) ||
                    (a.etudiantId?.prenom || a.candidat?.prenom || '').toLowerCase().includes(term) ||
                    (a.etudiantId?.email || a.candidat?.email || '').toLowerCase().includes(term) ||
                    (a.offreId?.titre || a.offre || '').toLowerCase().includes(term)
            );
        }

        setTotal(filtered.length);
        setFilteredApplications(filtered);
        
        const totalPages = Math.ceil(filtered.length / limit) || 1;
        setTotalPages(totalPages);
        if (page > totalPages) {
            setPage(1);
        }
    };

    const handleStatusFilterChange = (newStatus) => {
        setStatusFilter(newStatus);
        setPage(1);
        
        const params = new URLSearchParams();
        if (newStatus !== 'all') {
            params.set('statut', newStatus);
        }
        navigate(`/rh/applications${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getStatusLabel = (status) => {
        const labels = {
            'Brouillon': 'Brouillon',
            'Soumise': 'Soumise',
            'EnAnalyse': 'En analyse',
            'Entretien': 'Entretien',
            'Acceptee': 'Acceptee',
            'Refusee': 'Refusee',
            'EngagementEnvoye': 'Engagement envoye',
            'EngagementValide': 'Engagement valide',
            'DemandeEnvoyee': 'Demande envoyee',
            'ValideParDirecteur': 'Valide par Directeur',
            'Cloturee': 'Cloturee',
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
            case 'EngagementEnvoye':
            case 'EngagementValide': return <Description sx={{ fontSize: 14 }} />;
            default: return <Pending sx={{ fontSize: 14 }} />;
        }
    };

    const handleViewApplication = (id) => {
        navigate(`/rh/application/${id}`);
    };

    // ✅ NOUVELLE LISTE DES STATUTS AVEC "enAttente"
    const statusOptions = [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'enAttente', label: 'En attente' },
        { value: 'Soumise', label: 'Soumise' },
        { value: 'EnAnalyse', label: 'En analyse' },
        { value: 'Entretien', label: 'Entretien' },
        { value: 'Acceptee', label: 'Acceptee' },
        { value: 'Refusee', label: 'Refusee' },
        { value: 'EngagementEnvoye', label: 'Engagement envoye' },
        { value: 'EngagementValide', label: 'Engagement valide' },
    ];

    const isCardActive = (statutKey) => {
        if (statutKey === 'all') return statusFilter === 'all';
        return statusFilter === statutKey;
    };

    const getPaginatedData = () => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return filteredApplications.slice(start, end);
    };

    const paginatedData = getPaginatedData();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={44} sx={{ color: '#2d3748' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TETE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Gestion des candidatures
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredApplications.length} candidature(s) trouvee(s)
                        {statusFilter !== 'all' && ` • Filtre par : ${statusFilter === 'enAttente' ? 'En attente' : getStatusLabel(statusFilter)}`}
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
                    <Grid item xs={12} sm={7}>
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
                    <Grid item xs={12} sm={5}>
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

            {/* ===== STATS RAPIDES AVEC ETAT ACTIF ===== */}
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
                        active={isCardActive('enAttente')}
                        color="#d97706"
                        onClick={() => handleStatusFilterChange('enAttente')}
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
                            <Typography variant="caption" color="#065f46">Acceptees</Typography>
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
                            <Typography variant="caption" color="#991b1b">Refusees</Typography>
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
                                            ? `Aucune candidature avec le statut "${statusFilter === 'enAttente' ? 'En attente' : getStatusLabel(statusFilter)}"`
                                            : searchTerm
                                                ? 'Aucune candidature ne correspond à votre recherche'
                                                : 'Aucune candidature trouvee'}
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
                                                    backgroundColor: '#2d3748',
                                                    width: 36,
                                                    height: 36,
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: '#fff',
                                                }}
                                            >
                                                {getInitials(
                                                    app.etudiantId?.nom || app.candidat?.nom || app.nom,
                                                    app.etudiantId?.prenom || app.candidat?.prenom || app.prenom
                                                )}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {app.etudiantId?.prenom || app.candidat?.prenom || app.prenom || ''} 
                                                    {app.etudiantId?.nom || app.candidat?.nom || app.nom || ''}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {app.etudiantId?.email || app.candidat?.email || ''}
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
                                        <Tooltip title="Voir le detail">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewApplication(app._id || app.id)}
                                                sx={{ color: '#2d3748' }}
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
                                backgroundColor: '#2d3748',
                                color: '#ffffff',
                            },
                        }}
                    />
                </Box>
            )}
        </Container>
    );
};

export default ApplicationsList;
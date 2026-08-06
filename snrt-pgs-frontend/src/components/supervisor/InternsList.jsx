// src/components/supervisor/InternsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Description,
    TrendingUp,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
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
        'EnCours': { bg: '#dbeafe', text: '#1d4ed8' },
        'Termine': { bg: '#d1fae5', text: '#065f46' },
        'Annule': { bg: '#fee2e2', text: '#991b1b' },
        'Cloturee': { bg: '#d1fae5', text: '#065f46' },
        'EngagementEnvoye': { bg: '#dbeafe', text: '#1d4ed8' },
        'EngagementRecu': { bg: '#d1fae5', text: '#065f46' },
        'EnAttenteValidationDirecteur': { bg: '#fef3c7', text: '#d97706' },
        'ValideParDirecteur': { bg: '#d1fae5', text: '#065f46' },
        'DemandeEnvoyee': { bg: '#fef3c7', text: '#d97706' },
    };
    const color = colors[status] || colors['EnCours'];
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

const InternsList = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(true);
    const [interns, setInterns] = useState([]);
    const [filteredInterns, setFilteredInterns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [stats, setStats] = useState({
        total: 0,
        enCours: 0,
        termines: 0,
        annules: 0,
    });

    const limit = 10;

    useEffect(() => {
        fetchInterns();
    }, []);

    useEffect(() => {
        filterInterns();
    }, [interns, searchTerm, statusFilter]);

    const fetchInterns = async () => {
        setLoading(true);
        setError('');
        try {
            // ✅ Route correcte : /internships/my-internships
            const response = await api.get('/internships/my-internships');
            
            let data = [];
            if (response.data?.data) {
                data = response.data.data;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            }

            const formattedData = data.map((intern) => ({
                ...intern,
                _id: intern._id || intern.id,
                etudiant: intern.etudiantId || intern.etudiant || {},
                offre: intern.offreId || intern.offre || {},
                statut: intern.statut || 'EnCours',
                livrables: intern.livrables || [],
            }));

            setInterns(formattedData);
            setFilteredInterns(formattedData);
            setTotal(formattedData.length || 0);

            const totalPages = Math.ceil(formattedData.length / limit) || 1;
            setTotalPages(totalPages);

            setStats({
                total: formattedData.length || 0,
                enCours: formattedData.filter(i => i.statut === 'EnCours').length,
                termines: formattedData.filter(i => i.statut === 'Termine' || i.statut === 'Cloturee').length,
                annules: formattedData.filter(i => i.statut === 'Annule').length,
            });

        } catch (error) {
            console.error('Erreur chargement stagiaires:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
            setInterns([]);
            setFilteredInterns([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const filterInterns = () => {
        let filtered = [...interns];

        if (statusFilter !== 'all') {
            filtered = filtered.filter((i) => i.statut === statusFilter);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (i) =>
                    (i.etudiant?.nom || '').toLowerCase().includes(term) ||
                    (i.etudiant?.prenom || '').toLowerCase().includes(term) ||
                    (i.offre?.titre || '').toLowerCase().includes(term) ||
                    (i.etudiant?.email || '').toLowerCase().includes(term)
            );
        }

        setTotal(filtered.length);
        setFilteredInterns(filtered);

        const totalPages = Math.ceil(filtered.length / limit) || 1;
        setTotalPages(totalPages);
        if (page > totalPages) {
            setPage(1);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'EnCours': 'En cours',
            'Termine': 'Terminé',
            'Annule': 'Annulé',
            'Cloturee': 'Clôturé',
            'EngagementEnvoye': 'Engagement envoyé',
            'EngagementRecu': 'Engagement reçu',
            'EnAttenteValidationDirecteur': 'En attente validation Directeur',
            'ValideParDirecteur': 'Validé par Directeur',
            'DemandeEnvoyee': 'Demande envoyée',
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

    const isCardActive = (statutKey) => {
        if (statutKey === 'all') return statusFilter === 'all';
        return statusFilter === statutKey;
    };

    const handleStatusFilterChange = (newStatus) => {
        setStatusFilter(newStatus);
        setPage(1);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getPaginatedData = () => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return filteredInterns.slice(start, end);
    };

    const paginatedData = getPaginatedData();

    const statusOptions = [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'EnCours', label: 'En cours' },
        { value: 'Termine', label: 'Terminé' },
        { value: 'Annule', label: 'Annulé' },
        { value: 'Cloturee', label: 'Clôturé' },
    ];

    if (loading && interns.length === 0) {
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
                        Mes stagiaires
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredInterns.length} stagiaire(s) trouvé(s)
                        {statusFilter !== 'all' && ` • Filtre par : ${getStatusLabel(statusFilter)}`}
                    </Typography>
                </Box>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

            {/* ===== FILTRES ===== */}
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
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    backgroundColor: '#fff',
                                },
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

            {/* ===== STATS RAPIDES ===== */}
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
                        active={isCardActive('Termine')}
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
                            <StyledTableCell>Stagiaire</StyledTableCell>
                            <StyledTableCell>Stage</StyledTableCell>
                            <StyledTableCell>Début</StyledTableCell>
                            <StyledTableCell>Fin</StyledTableCell>
                            <StyledTableCell>Livrables</StyledTableCell>
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
                                            ? `Aucun stagiaire avec le statut "${getStatusLabel(statusFilter)}"`
                                            : 'Aucun stagiaire trouvé'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((intern) => (
                                <TableRow key={intern._id || intern.id} hover>
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
                                                    intern.etudiant?.nom,
                                                    intern.etudiant?.prenom
                                                )}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {intern.etudiant?.prenom || ''} {intern.etudiant?.nom || ''}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {intern.etudiant?.email || ''}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {intern.offre?.titre || 'Stage sans titre'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(intern.dateDebut)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(intern.dateFin)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={`${intern.livrables?.length || 0} livrable(s)`}>
                                            <Chip
                                                label={intern.livrables?.length || 0}
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
                                            label={getStatusLabel(intern.statut)}
                                            status={intern.statut}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir le détail">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/supervisor/stagiaire/${intern._id || intern.id}`)}
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

export default InternsList;
// src/components/supervisor/SupervisorInternshipsList.jsx
// ✅ Page : Liste de tous les stages de l'encadrant
// ✅ Accès : /supervisor/stages

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
    People,
    Refresh,
    FilterList,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { getSupervisorInternships } from '../../services/api';

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
        'EnAttenteValidation': { bg: '#fef3c7', text: '#d97706' },
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

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const SupervisorInternshipsList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [internships, setInternships] = useState([]);
    const [filteredInternships, setFilteredInternships] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [stats, setStats] = useState({
        total: 0,
        enCours: 0,
        termines: 0,
        annules: 0,
    });

    const limit = 10;

    useEffect(() => {
        fetchInternships();
    }, []);

    useEffect(() => {
        filterInternships();
    }, [internships, searchTerm, statusFilter]);

    const fetchInternships = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getSupervisorInternships();
            setInternships(data);
            setFilteredInternships(data);
            setStats({
                total: data.length || 0,
                enCours: data.filter(i => i.statut === 'EnCours').length,
                termines: data.filter(i => i.statut === 'Termine' || i.statut === 'Cloturee').length,
                annules: data.filter(i => i.statut === 'Annule').length,
            });
            const totalPages = Math.ceil(data.length / limit) || 1;
            setTotalPages(totalPages);
        } catch (error) {
            console.error('❌ Erreur chargement stages:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
            setInternships([]);
            setFilteredInternships([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const filterInternships = () => {
        let filtered = [...internships];
        if (statusFilter !== 'all') {
            filtered = filtered.filter((i) => i.statut === statusFilter);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (i) =>
                    (i.etudiantId?.nom || '').toLowerCase().includes(term) ||
                    (i.etudiantId?.prenom || '').toLowerCase().includes(term) ||
                    (i.sujetTitre || '').toLowerCase().includes(term) ||
                    (i.offreId?.titre || '').toLowerCase().includes(term)
            );
        }
        setFilteredInternships(filtered);
        const totalPages = Math.ceil(filtered.length / limit) || 1;
        setTotalPages(totalPages);
        if (page > totalPages) setPage(1);
    };

    const getStatusLabel = (status) => {
        const labels = {
            'EnCours': 'En cours',
            'Termine': 'Terminé',
            'Annule': 'Annulé',
            'Cloturee': 'Clôturé',
            'EnAttenteValidation': 'En attente validation',
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
        return filteredInternships.slice(start, end);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={44} sx={{ color: '#2d3748' }} />
            </Box>
        );
    }

    const paginatedData = getPaginatedData();

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        👥 Suivi des stages
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredInternships.length} stage(s) trouvé(s)
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchInternships}
                    disabled={loading}
                    sx={{ borderRadius: '12px', textTransform: 'none' }}
                >
                    Rafraîchir
                </Button>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <StatCard active={isCardActive('all')} color="#2d3748" onClick={() => handleStatusFilterChange('all')}>
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="text.secondary">Total</Typography>
                            <Typography variant="h6" fontWeight={700}>{stats.total}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard active={isCardActive('EnCours')} color="#1d4ed8" onClick={() => handleStatusFilterChange('EnCours')}>
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="#1d4ed8">En cours</Typography>
                            <Typography variant="h6" fontWeight={700} color="#1d4ed8">{stats.enCours}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard active={isCardActive('Termine')} color="#065f46" onClick={() => handleStatusFilterChange('Termine')}>
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="#065f46">Terminés</Typography>
                            <Typography variant="h6" fontWeight={700} color="#065f46">{stats.termines}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard active={isCardActive('Annule')} color="#991b1b" onClick={() => handleStatusFilterChange('Annule')}>
                        <CardContent sx={{ py: 1.5, px: 2 }}>
                            <Typography variant="caption" color="#991b1b">Annulés</Typography>
                            <Typography variant="h6" fontWeight={700} color="#991b1b">{stats.annules}</Typography>
                        </CardContent>
                    </StatCard>
                </Grid>
            </Grid>

            {/* Filtres */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', backgroundColor: '#fafbfc', border: '1px solid #eef1f3' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={7}>
                        <TextField
                            placeholder="Rechercher par stagiaire ou stage..."
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }}
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' } }}
                        >
                            <MenuItem value="all">Tous les statuts</MenuItem>
                            <MenuItem value="EnCours">En cours</MenuItem>
                            <MenuItem value="Termine">Terminé</MenuItem>
                            <MenuItem value="Annule">Annulé</MenuItem>
                            <MenuItem value="Cloturee">Clôturé</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            {/* Tableau */}
            <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                            <StyledTableCell>Stagiaire</StyledTableCell>
                            <StyledTableCell>Stage</StyledTableCell>
                            <StyledTableCell>Début</StyledTableCell>
                            <StyledTableCell>Fin</StyledTableCell>
                            <StyledTableCell>Statut</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {statusFilter !== 'all'
                                            ? `Aucun stage avec le statut "${getStatusLabel(statusFilter)}"`
                                            : 'Aucun stage trouvé'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((intern) => (
                                <TableRow key={intern._id} hover>
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
                                                {getInitials(intern.etudiantId?.nom, intern.etudiantId?.prenom)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {intern.etudiantId?.prenom || ''} {intern.etudiantId?.nom || ''}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {intern.etudiantId?.email || ''}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {intern.sujetTitre || intern.offreId?.titre || 'Stage sans titre'}
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
                                        <StatusChip label={getStatusLabel(intern.statut)} status={intern.statut} size="small" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir le détail">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/supervisor/stage/${intern._id}`)}
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

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        sx={{ '& .MuiPaginationItem-root.Mui-selected': { backgroundColor: '#2d3748', color: '#fff' } }}
                    />
                </Box>
            )}
        </Container>
    );
};

export default SupervisorInternshipsList;
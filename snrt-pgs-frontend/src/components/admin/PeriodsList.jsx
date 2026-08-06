// src/components/admin/PeriodsList.jsx
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
    IconButton,
    Alert,
    CircularProgress,
    InputAdornment,
    Tooltip,
    Grid,
    MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Search,
    Add,
    Edit,
    Event,
    Refresh,
    FilterList,
    CheckCircle,
    Block,
    Visibility,
    Archive,
    Restore,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        active: { bg: '#d1fae5', text: '#065f46' },
        inactive: { bg: '#fee2e2', text: '#991b1b' },
        upcoming: { bg: '#dbeafe', text: '#1d4ed8' },
        past: { bg: '#fef3c7', text: '#d97706' },
    };
    const color = colors[status] || colors.active;
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '12px',
        height: '24px',
    };
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const PeriodsList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ Détection des pages
    const isViewPage = location.pathname.startsWith('/admin/periods/view/');
    const isEditPage = location.pathname.startsWith('/admin/periods/edit/');
    const isAddPage = location.pathname === '/admin/periods/add';

    const [loading, setLoading] = useState(true);
    const [periods, setPeriods] = useState([]);
    const [filteredPeriods, setFilteredPeriods] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isViewPage && !isEditPage && !isAddPage) {
            fetchPeriods();
        }
    }, [isViewPage, isEditPage, isAddPage]);

    useEffect(() => {
        filterPeriods();
    }, [periods, searchTerm, statusFilter]);

    // ✅ CHARGER DEPUIS L'API
    const fetchPeriods = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/periods');
            
            let data = [];
            if (response.data?.data) {
                data = response.data.data;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data?.periods) {
                data = response.data.periods;
            }

            const formattedData = data.map(period => ({
                id: period._id || period.id,
                nom: period.nom || 'Sans nom',
                dateDebut: period.dateDebut || '',
                dateFin: period.dateFin || '',
                dateOuvertureCandidatures: period.dateOuvertureCandidatures || '',
                dateFermetureCandidatures: period.dateFermetureCandidatures || '',
                actif: period.actif !== undefined ? period.actif : true,
                status: getStatusFromDates(period),
            }));
            
            setPeriods(formattedData);
            setFilteredPeriods(formattedData);
        } catch (error) {
            console.error('Erreur chargement periodes:', error);
            setError('Erreur lors du chargement des periodes');
            setPeriods([]);
            setFilteredPeriods([]);
        } finally {
            setLoading(false);
        }
    };

    const filterPeriods = () => {
        let filtered = [...periods];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (p) => p.nom.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((p) => p.status === statusFilter);
        }

        setFilteredPeriods(filtered);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr });
        } catch {
            return dateStr;
        }
    };

    const getStatusFromDates = (period) => {
        const now = new Date();
        const debut = new Date(period.dateDebut);
        const fin = new Date(period.dateFin);

        if (!period.actif) return 'inactive';
        if (now > fin) return 'past';
        if (now < debut) return 'upcoming';
        return 'active';
    };

    const getStatusLabel = (status) => {
        const labels = {
            active: 'Actif',
            upcoming: 'À venir',
            past: 'Passé',
            inactive: 'Inactif',
        };
        return labels[status] || status;
    };

    const handleToggleStatus = async (period) => {
        const newStatus = period.actif ? false : true;
        const action = newStatus ? 'restaurer' : 'archiver';
        if (!window.confirm(`Voulez-vous vraiment ${action} cette période ?`)) return;
        
        try {
            await api.put(`/periods/${period.id}`, { actif: newStatus });
            fetchPeriods();
        } catch (error) {
            console.error('Erreur changement statut:', error);
            setError('Erreur lors du changement de statut');
        }
    };

    // ============================================
    // RENDU DES PAGES
    // ============================================

    // ✅ Si c'est la page de détail
    if (isViewPage) {
        const PeriodDetailPage = require('./PeriodDetailPage').default;
        return <PeriodDetailPage />;
    }

    // ✅ Si c'est la page de modification
    if (isEditPage) {
        const PeriodEditPage = require('./PeriodEditPage').default;
        return <PeriodEditPage />;
    }

    // ✅ Si c'est la page d'ajout
    if (isAddPage) {
        const PeriodAddPage = require('./PeriodAddPage').default;
        return <PeriodAddPage />;
    }

    // ============================================
    // AFFICHAGE : LISTE DES PERIODES
    // ============================================

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Gestion des périodes de stage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredPeriods.length} période(s) trouvée(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchPeriods}
                        disabled={loading}
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                        Rafraîchir
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        sx={{
                            backgroundColor: '#2d3748',
                            borderRadius: '12px',
                            textTransform: 'none',
                            color: '#ffffff',
                            '&:hover': { backgroundColor: '#1a2332' },
                        }}
                        onClick={() => navigate('/admin/periods/add')}
                    >
                        Ajouter une période
                    </Button>
                </Box>
            </PageHeader>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
                    {error}
                </Alert>
            )}

            {/* ===== FILTRES ===== */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', backgroundColor: '#f7f7f7' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                        <TextField
                            placeholder="Rechercher..."
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
                            onChange={(e) => setStatusFilter(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' },
                            }}
                        >
                            <MenuItem value="all">Tous les statuts</MenuItem>
                            <MenuItem value="active">Actif</MenuItem>
                            <MenuItem value="upcoming">À venir</MenuItem>
                            <MenuItem value="past">Passé</MenuItem>
                            <MenuItem value="inactive">Inactif</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                            }}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                borderColor: '#ddd',
                                color: '#666',
                                backgroundColor: '#fff',
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
                            <StyledTableCell>Période</StyledTableCell>
                            <StyledTableCell>Début</StyledTableCell>
                            <StyledTableCell>Fin</StyledTableCell>
                            <StyledTableCell>Ouverture candidatures</StyledTableCell>
                            <StyledTableCell>Fermeture candidatures</StyledTableCell>
                            <StyledTableCell>Statut</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: '#148aa0' }} />
                                </TableCell>
                            </TableRow>
                        ) : filteredPeriods.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucune période trouvée
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPeriods.map((period) => (
                                <TableRow key={period.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Event sx={{ color: '#148aa0', fontSize: 20 }} />
                                            <Typography variant="body2" fontWeight={600}>
                                                {period.nom}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(period.dateDebut)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(period.dateFin)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(period.dateOuvertureCandidatures)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(period.dateFermetureCandidatures)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={getStatusLabel(period.status)}
                                            status={period.status}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Voir">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/admin/periods/view/${period.id}`)}
                                            >
                                                <Visibility sx={{ fontSize: 18, color: '#148aa0' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Modifier">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/admin/periods/edit/${period.id}`)}
                                            >
                                                <Edit sx={{ fontSize: 18, color: '#4f46e5' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={period.actif ? 'Archiver' : 'Restaurer'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleStatus(period)}
                                            >
                                                {period.actif ? (
                                                    <Archive sx={{ fontSize: 18, color: '#f59e0b' }} />
                                                ) : (
                                                    <Restore sx={{ fontSize: 18, color: '#22c55e' }} />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default PeriodsList;
// src/components/student/Applications.jsx
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
    Button,
    TextField,
    Chip,
    IconButton,
    Grid,
    CircularProgress,
    InputAdornment,
    Tooltip,
    MenuItem,
    LinearProgress,
} from '@mui/material';
import {
    Search,
    Visibility,
    Refresh,
    FilterList,
    CheckCircle,
    Pending,
    Cancel,
    Event,
    Description,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../hooks/useAuth';

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
        brouillon: { bg: '#e5e7eb', text: '#6b7280' },
        soumise: { bg: '#dbeafe', text: '#1d4ed8' },
        en_analyse: { bg: '#fef3c7', text: '#d97706' },
        entretien: { bg: '#f3e8ff', text: '#6b21a8' },
        acceptee: { bg: '#d1fae5', text: '#065f46' },
        refuse: { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors.brouillon;
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
    };
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Applications = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        filterApplications();
    }, [applications, searchTerm, statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockApplications = [
                {
                    id: '1',
                    offre: 'Stage Développement Web',
                    entreprise: 'DSI - SNRT',
                    dateSoumission: '2026-07-15',
                    statut: 'acceptee',
                    typeStage: 'PFE',
                    progression: 100,
                },
                {
                    id: '2',
                    offre: 'Stage Data Science',
                    entreprise: 'DSI - SNRT',
                    dateSoumission: '2026-07-10',
                    statut: 'entretien',
                    typeStage: 'Master',
                    progression: 75,
                },
                {
                    id: '3',
                    offre: 'Stage Cybersécurité',
                    entreprise: 'DSI - SNRT',
                    dateSoumission: '2026-07-01',
                    statut: 'en_analyse',
                    typeStage: 'PFE',
                    progression: 50,
                },
                {
                    id: '4',
                    offre: 'Stage Marketing Digital',
                    entreprise: 'Direction Marketing',
                    dateSoumission: '2026-06-20',
                    statut: 'refuse',
                    typeStage: 'Licence',
                    progression: 100,
                },
                {
                    id: '5',
                    offre: 'Stage DevOps',
                    entreprise: 'DSI - SNRT',
                    dateSoumission: '2026-06-15',
                    statut: 'soumise',
                    typeStage: 'PFA',
                    progression: 25,
                },
            ];

            setApplications(mockApplications);
            setFilteredApplications(mockApplications);

        } catch (error) {
            console.error('Erreur chargement candidatures:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterApplications = () => {
        let filtered = [...applications];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (a) =>
                    a.offre.toLowerCase().includes(term) ||
                    a.entreprise.toLowerCase().includes(term) ||
                    a.typeStage.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((a) => a.statut === statusFilter);
        }

        setFilteredApplications(filtered);
    };

    const getStatusLabel = (status) => {
        const labels = {
            brouillon: 'Brouillon',
            soumise: 'Soumise',
            en_analyse: 'En analyse',
            entretien: 'Entretien',
            acceptee: 'Acceptée',
            refuse: 'Refusée',
        };
        return labels[status] || status;
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return '#22c55e';
        if (progress >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const statusOptions = [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'brouillon', label: 'Brouillon' },
        { value: 'soumise', label: 'Soumise' },
        { value: 'en_analyse', label: 'En analyse' },
        { value: 'entretien', label: 'Entretien' },
        { value: 'acceptee', label: 'Acceptée' },
        { value: 'refuse', label: 'Refusée' },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        📄 Mes candidatures
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredApplications.length} candidature(s) trouvée(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchApplications}
                        disabled={loading}
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                        Rafraîchir
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#148aa0',
                            borderRadius: '12px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#0b7890' },
                        }}
                        onClick={() => navigate('/offres')}
                    >
                        Postuler à une offre
                    </Button>
                </Box>
            </PageHeader>

            {/* ===== FILTRES ===== */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', backgroundColor: '#f7f7f7' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
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
                            {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
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
                            <StyledTableCell>Offre</StyledTableCell>
                            <StyledTableCell>Entreprise</StyledTableCell>
                            <StyledTableCell>Type</StyledTableCell>
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell>Progression</StyledTableCell>
                            <StyledTableCell>Statut</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: '#148aa0' }} />
                                </TableCell>
                            </TableRow>
                        ) : filteredApplications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucune candidature trouvée
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredApplications.map((app) => (
                                <TableRow key={app.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {app.offre}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{app.entreprise}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={app.typeStage}
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
                                            {new Date(app.dateSoumission).toLocaleDateString('fr-FR')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 120 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ flex: 1 }}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={app.progression}
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        backgroundColor: '#e5e7eb',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: getProgressColor(app.progression),
                                                            borderRadius: 3,
                                                        },
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="caption" fontWeight={500}>
                                                {app.progression}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={getStatusLabel(app.statut)}
                                            status={app.statut}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir les détails">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/dashboard/application/${app.id}`)}
                                                sx={{ color: '#148aa0' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {app.statut === 'entretien' && (
                                            <Tooltip title="Voir l'entretien">
                                                <IconButton
                                                    size="small"
                                                    sx={{ color: '#8b5cf6' }}
                                                >
                                                    <Event fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {app.statut === 'acceptee' && (
                                            <Tooltip title="Voir la convention">
                                                <IconButton
                                                    size="small"
                                                    sx={{ color: '#22c55e' }}
                                                >
                                                    <Description fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
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

export default Applications;
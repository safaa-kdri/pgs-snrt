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
    Button,
    TextField,
    Chip,
    Avatar,
    IconButton,
    Grid,
    CircularProgress,
    InputAdornment,
    Tooltip,
    LinearProgress,
} from '@mui/material';
import {
    Search,
    Visibility,
    Refresh,
    FilterList,
    School,
    Assessment,
    CheckCircle,
    Pending,
    Cancel,
    TrendingUp,
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
        active: { bg: '#d1fae5', text: '#065f46' },
        pending: { bg: '#fef3c7', text: '#d97706' },
        completed: { bg: '#dbeafe', text: '#1d4ed8' },
        cancelled: { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors.pending;
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

const InternsList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [interns, setInterns] = useState([]);
    const [filteredInterns, setFilteredInterns] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchInterns();
    }, []);

    useEffect(() => {
        filterInterns();
    }, [interns, searchTerm, statusFilter]);

    const fetchInterns = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockInterns = [
                {
                    id: '1',
                    nom: 'EL HASSANI',
                    prenom: 'Youssef',
                    email: 'youssef@test.ma',
                    stage: 'Stage Développement Web',
                    department: 'DSI',
                    progress: 75,
                    status: 'active',
                    startDate: '2026-06-01',
                    endDate: '2026-08-31',
                    evaluation: { note: null, status: 'pending' },
                },
                {
                    id: '2',
                    nom: 'BENNANI',
                    prenom: 'Fatima',
                    email: 'fatima@test.ma',
                    stage: 'Stage Data Science',
                    department: 'DSI',
                    progress: 100,
                    status: 'completed',
                    startDate: '2026-03-01',
                    endDate: '2026-05-31',
                    evaluation: { note: 18, status: 'done' },
                },
                {
                    id: '3',
                    nom: 'ALAMI',
                    prenom: 'Ahmed',
                    email: 'ahmed@test.ma',
                    stage: 'Stage Cybersécurité',
                    department: 'DSI',
                    progress: 45,
                    status: 'active',
                    startDate: '2026-07-01',
                    endDate: '2026-09-30',
                    evaluation: { note: null, status: 'pending' },
                },
                {
                    id: '4',
                    nom: 'CHERKAOUI',
                    prenom: 'Mohamed',
                    email: 'mohamed@test.ma',
                    stage: 'Stage DevOps',
                    department: 'Technique',
                    progress: 90,
                    status: 'pending',
                    startDate: '2026-05-15',
                    endDate: '2026-08-15',
                    evaluation: { note: null, status: 'pending' },
                },
                {
                    id: '5',
                    nom: 'ALAOUI',
                    prenom: 'Khadija',
                    email: 'khadija@test.ma',
                    stage: 'Stage Marketing Digital',
                    department: 'Marketing',
                    progress: 30,
                    status: 'cancelled',
                    startDate: '2026-06-15',
                    endDate: '2026-08-15',
                    evaluation: { note: null, status: 'cancelled' },
                },
            ];

            setInterns(mockInterns);
            setFilteredInterns(mockInterns);

        } catch (error) {
            console.error('Erreur chargement stagiaires:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterInterns = () => {
        let filtered = [...interns];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (i) =>
                    i.nom.toLowerCase().includes(term) ||
                    i.prenom.toLowerCase().includes(term) ||
                    i.stage.toLowerCase().includes(term) ||
                    i.department.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((i) => i.status === statusFilter);
        }

        setFilteredInterns(filtered);
    };

    const getInitials = (nom, prenom) => {
        return `${prenom[0]}${nom[0]}`.toUpperCase();
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Actif';
            case 'pending': return 'En attente';
            case 'completed': return 'Terminé';
            case 'cancelled': return 'Annulé';
            default: return 'Inconnu';
        }
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return '#22c55e';
        if (progress >= 50) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        👥 Mes stagiaires
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredInterns.length} stagiaire(s) trouvé(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchInterns}
                        disabled={loading}
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                        Rafraîchir
                    </Button>
                </Box>
            </PageHeader>

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
                            <MenuItem value="pending">En attente</MenuItem>
                            <MenuItem value="completed">Terminé</MenuItem>
                            <MenuItem value="cancelled">Annulé</MenuItem>
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
                            <StyledTableCell>Stagiaire</StyledTableCell>
                            <StyledTableCell>Stage</StyledTableCell>
                            <StyledTableCell>Département</StyledTableCell>
                            <StyledTableCell>Progression</StyledTableCell>
                            <StyledTableCell>Statut</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: '#148aa0' }} />
                                </TableCell>
                            </TableRow>
                        ) : filteredInterns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucun stagiaire trouvé
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInterns.map((intern) => (
                                <TableRow key={intern.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                sx={{
                                                    backgroundColor: '#148aa0',
                                                    width: 36,
                                                    height: 36,
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    color: '#fff',
                                                }}
                                            >
                                                {getInitials(intern.nom, intern.prenom)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {intern.prenom} {intern.nom}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {intern.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{intern.stage}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={intern.department}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#e0e7ff',
                                                color: '#4338ca',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ width: '100%', minWidth: 100 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" fontWeight={500}>
                                                    {intern.progress}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={intern.progress}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    backgroundColor: '#e5e7eb',
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: getProgressColor(intern.progress),
                                                        borderRadius: 3,
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={getStatusLabel(intern.status)}
                                            status={intern.status}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir le détail">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/supervisor/interns/${intern.id}`)}
                                                sx={{ color: '#148aa0' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Évaluer">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/supervisor/evaluate/${intern.id}`)}
                                                sx={{ color: '#f59e0b' }}
                                            >
                                                <Assessment fontSize="small" />
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

export default InternsList;
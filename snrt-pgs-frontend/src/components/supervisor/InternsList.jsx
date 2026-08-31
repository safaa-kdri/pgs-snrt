// src/components/supervisor/InternsList.jsx
// ✅ VERSION PROFESSIONNELLE - STATISTIQUES COMPACTES

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
    Stack,
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
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
});

const PageTitle = styled(Typography)({
    fontWeight: 700,
    fontSize: '24px',
    color: '#1a2332',
    letterSpacing: '-0.02em',
});

const PageSubtitle = styled(Typography)({
    color: '#687480',
    fontSize: '14px',
    marginTop: '2px',
});

// ✅ Statistiques compactes
const StatsContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '12px 0',
    marginBottom: '16px',
    flexWrap: 'wrap',
});

const StatItem = styled(Box)(({ active, color }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '4px 12px',
    borderRadius: '20px',
    backgroundColor: active ? alpha(color, 0.08) : 'transparent',
    border: active ? `1px solid ${color}` : '1px solid transparent',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: active ? alpha(color, 0.12) : alpha('#1a2332', 0.04),
    },
}));

const StatNumber = styled(Typography)({
    fontWeight: 700,
    fontSize: '16px',
    color: '#1a2332',
});

const StatLabel = styled(Typography)({
    fontSize: '13px',
    color: '#687480',
    fontWeight: 500,
});

const StatDot = styled(Box)(({ color }) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color,
}));

const StyledTableCell = styled(TableCell)({
    fontWeight: 600,
    color: '#1a2332',
    fontSize: '13px',
    borderBottom: '1px solid #eef1f3',
});

const StyledTableRow = styled(TableRow)({
    '&:hover': {
        backgroundColor: '#f8f9fa',
    },
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
        borderRadius: '12px',
    };
});

const ReportChip = styled(Chip)(({ hasReport, needsAction }) => ({
    backgroundColor: needsAction ? '#fef3c7' : hasReport ? '#dbeafe' : '#f1f5f9',
    color: needsAction ? '#d97706' : hasReport ? '#1d4ed8' : '#94a3b8',
    fontWeight: 500,
    fontSize: '11px',
    height: '24px',
    borderRadius: '12px',
}));

const FiltersContainer = styled(Paper)({
    padding: '12px 16px',
    marginBottom: '20px',
    borderRadius: '10px',
    backgroundColor: '#fafbfc',
    border: '1px solid #eef1f3',
});

const ActionButton = styled(IconButton)({
    color: '#687480',
    '&:hover': {
        backgroundColor: alpha('#1a2332', 0.06),
        color: '#1a2332',
    },
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
                    <PageTitle>Mes stagiaires</PageTitle>
                    <PageSubtitle>
                        Suivi des stagiaires qui vous sont affectés
                    </PageSubtitle>
                </Box>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

            {/* ===== STATISTIQUES COMPACTES ===== */}
            <StatsContainer>
                <StatItem
                    active={statusFilter === 'all'}
                    color="#1a2332"
                    onClick={() => handleStatusFilterChange('all')}
                >
                    <StatNumber>{stats.total}</StatNumber>
                    <StatLabel>Total</StatLabel>
                </StatItem>

                <StatItem
                    active={statusFilter === 'EnCours'}
                    color="#1d4ed8"
                    onClick={() => handleStatusFilterChange('EnCours')}
                >
                    <StatDot color="#1d4ed8" />
                    <StatNumber>{stats.enCours}</StatNumber>
                    <StatLabel>En cours</StatLabel>
                </StatItem>

                <StatItem
                    active={statusFilter === 'Termine'}
                    color="#16a34a"
                    onClick={() => handleStatusFilterChange('Termine')}
                >
                    <StatDot color="#16a34a" />
                    <StatNumber>{stats.termines}</StatNumber>
                    <StatLabel>Terminés</StatLabel>
                </StatItem>

                <StatItem
                    active={statusFilter === 'Annule'}
                    color="#dc2626"
                    onClick={() => handleStatusFilterChange('Annule')}
                >
                    <StatDot color="#dc2626" />
                    <StatNumber>{stats.annules}</StatNumber>
                    <StatLabel>Annulés</StatLabel>
                </StatItem>
            </StatsContainer>

            {/* ===== FILTRES ===== */}
            <FiltersContainer>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={7}>
                        <TextField
                            placeholder="Rechercher un stagiaire ou un stage..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: '#94a3b8', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    backgroundColor: '#ffffff',
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
                                    backgroundColor: '#ffffff',
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

            {/* ===== TABLEAU ===== */}
            <TableContainer
                component={Paper}
                sx={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eef1f3' }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f7f8fa' }}>
                            <StyledTableCell>STAGIAIRE</StyledTableCell>
                            <StyledTableCell>STAGE</StyledTableCell>
                            <StyledTableCell>PÉRIODE</StyledTableCell>
                            <StyledTableCell>RAPPORT</StyledTableCell>
                            <StyledTableCell>STATUT</StyledTableCell>
                            <StyledTableCell align="center">ACTION</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {statusFilter !== 'all'
                                            ? `Aucun stagiaire avec le statut "${getStatusLabel(statusFilter)}"`
                                            : 'Aucun stagiaire trouvé'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((intern) => {
                                const reports = intern.livrables?.filter(
                                    (l) => l.type === 'Rapport' && (l.gridFsId || l.chemin)
                                ) || [];
                                const hasReport = reports.length > 0;
                                const needsAction = hasReport && reports.some(r => !r.statut || r.statut === 'EnAttente' || r.valide === false);
                                const latestReport = reports.length > 0 ? reports[0] : null;
                                const isRejected = latestReport?.statut === 'Rejete';

                                return (
                                    <StyledTableRow key={intern._id || intern.id}>
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
                                                    {getInitials(intern.etudiant?.nom, intern.etudiant?.prenom)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {intern.etudiant?.prenom || ''} {intern.etudiant?.nom || ''}
                                                    </Typography>
                                                    <Typography variant="caption" color="#94a3b8" display="block">
                                                        {intern.etudiant?.email || ''}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500}>
                                                {intern.offre?.titre || 'Stage sans titre'}
                                            </Typography>
                                            <Typography variant="caption" color="#94a3b8" display="block">
                                                {intern.offre?.typeStage || ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(intern.dateDebut)} → {formatDate(intern.dateFin)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <ReportChip
                                                label={
                                                    isRejected ? 'Rejeté' :
                                                    needsAction ? 'À valider' :
                                                    hasReport ? `${reports.length} rapport` :
                                                    '0 rapport'
                                                }
                                                hasReport={hasReport}
                                                needsAction={needsAction}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip
                                                label={getStatusLabel(intern.statut)}
                                                status={intern.statut}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Consulter le dossier">
                                                <ActionButton
                                                    size="small"
                                                    onClick={() => navigate(`/supervisor/stagiaire/${intern._id || intern.id}`)}
                                                >
                                                    <Visibility fontSize="small" />
                                                </ActionButton>
                                            </Tooltip>
                                        </TableCell>
                                    </StyledTableRow>
                                );
                            })
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
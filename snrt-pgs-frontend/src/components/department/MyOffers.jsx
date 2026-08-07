// src/components/department/MyOffers.jsx
// ✅ VERSION SANS BOUTON RÉINITIALISER

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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Pagination,
    LinearProgress,
} from '@mui/material';
import {
    Search,
    Add,
    Visibility,
    Edit,
    Delete,
    Refresh,
    FilterList,
    CheckCircle,
    Pending,
    Cancel,
    Send,
    Work,
    People,
    CalendarToday,
    ArrowBack,  
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
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
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'Brouillon': { bg: '#e5e7eb', text: '#6b7280' },
        'EnAttente': { bg: '#fef3c7', text: '#d97706' },
        'Publiee': { bg: '#d1fae5', text: '#065f46' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
        'Archivee': { bg: '#f3f4f6', text: '#6b7280' },
    };
    const color = colors[status] || colors['Brouillon'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
    };
});

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

const MyOffers = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [offers, setOffers] = useState([]);
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Dialog states
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const limit = 10;

    // ✅ CHARGEMENT DES OFFRES - API RÉELLE
    useEffect(() => {
        fetchOffers();
    }, [page, statusFilter]);

    useEffect(() => {
        filterOffers();
    }, [offers, searchTerm]);

    const fetchOffers = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page,
                limit,
            };
            
            // ✅ Filtrer par statut si nécessaire
            if (statusFilter !== 'all') {
                params.statut = statusFilter;
            }

            // ✅ Récupérer les offres du département
            const response = await api.get('/offers', { params });
            
            // ✅ Gérer toutes les structures possibles
            let data = [];
            let pagination = {};
            
            if (response.data?.offers) {
                data = response.data.offers;
                pagination = response.data.pagination || {};
            } else if (response.data?.data) {
                data = response.data.data;
                pagination = response.data.pagination || {};
            } else if (Array.isArray(response.data)) {
                data = response.data;
            }

            setOffers(data);
            setFilteredOffers(data);
            setTotal(pagination.total || data.length || 0);
            setTotalPages(pagination.pages || Math.ceil((pagination.total || data.length) / limit) || 1);

        } catch (error) {
            console.error('❌ Erreur chargement offres:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
            setOffers([]);
            setFilteredOffers([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const filterOffers = () => {
        let filtered = [...offers];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (o) =>
                    o.titre?.toLowerCase().includes(term) ||
                    o.description?.toLowerCase().includes(term) ||
                    o.typeStage?.toLowerCase().includes(term)
            );
        }

        setFilteredOffers(filtered);
    };

    const getStatusLabel = (status) => {
        const labels = {
            'Brouillon': 'Brouillon',
            'EnAttente': 'En attente',
            'Publiee': 'Publiée',
            'Refusee': 'Refusée',
            'Archivee': 'Archivée',
        };
        return labels[status] || status;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Publiee': return <CheckCircle sx={{ fontSize: 14 }} />;
            case 'EnAttente': return <Pending sx={{ fontSize: 14 }} />;
            case 'Refusee': return <Cancel sx={{ fontSize: 14 }} />;
            case 'Brouillon': return <Edit sx={{ fontSize: 14 }} />;
            default: return <Pending sx={{ fontSize: 14 }} />;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // ============================================
    // ACTIONS
    // ============================================

    const handleViewOffer = (offer) => {
        navigate(`/department/offer/${offer._id || offer.id}`);
    };

    const handleEditOffer = (offer) => {
        navigate(`/department/offer/edit/${offer._id || offer.id}`);
    };

    const handleDeleteClick = (offer) => {
        setSelectedOffer(offer);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedOffer) return;
        
        setSubmitting(true);
        setError('');
        try {
            await api.delete(`/offers/${selectedOffer._id || selectedOffer.id}`);
            setSuccess('✅ Offre supprimée avec succès');
            setOpenDeleteDialog(false);
            setSelectedOffer(null);
            fetchOffers();
        } catch (error) {
            console.error('❌ Erreur suppression:', error);
            setError(error.response?.data?.message || 'Erreur lors de la suppression');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedOffer(null);
    };

    const handleSubmitOffer = async (offer) => {
        try {
            await api.put(`/offers/${offer._id || offer.id}/submit`);
            setSuccess('Offre soumise pour validation');
            fetchOffers();
        } catch (error) {
            console.error('❌ Erreur soumission:', error);
            setError(error.response?.data?.message || 'Erreur lors de la soumission');
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleStatusFilterChange = (newStatus) => {
        setStatusFilter(newStatus);
        setPage(1);
    };

    // ============================================
    // STATUTS OPTIONS
    // ============================================

    const statusOptions = [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'Brouillon', label: 'Brouillon' },
        { value: 'EnAttente', label: 'En attente' },
        { value: 'Publiee', label: 'Publiée' },
        { value: 'Refusee', label: 'Refusée' },
        { value: 'Archivee', label: 'Archivée' },
    ];

    // ============================================
    // RENDER
    // ============================================

    if (loading && page === 1) {
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
                        Mes offres de stage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {total} offre(s) trouvée(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        sx={{
                            backgroundColor: '#000000',
                            borderRadius: '12px',
                            textTransform: 'none',
                            color: '#ffffff',
                            '&:hover': { backgroundColor: '#333333' },
                        }}
                        onClick={() => navigate('/department/create-offer')}
                    >
                        Nouvelle offre
                    </Button>
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
                            placeholder="Rechercher par titre, description..."
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

            {/* ===== TABLEAU ===== */}
            <TableContainer
                component={Paper}
                sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                            <StyledTableCell>Titre</StyledTableCell>
                            <StyledTableCell>Type</StyledTableCell>
                            <StyledTableCell>Postes</StyledTableCell>
                            <StyledTableCell>Statut</StyledTableCell>
                            <StyledTableCell>Candidatures</StyledTableCell>
                            <StyledTableCell>Date limite</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredOffers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {statusFilter !== 'all' 
                                            ? `Aucune offre avec le statut "${getStatusLabel(statusFilter)}"`
                                            : searchTerm 
                                                ? 'Aucune offre ne correspond à votre recherche'
                                                : 'Aucune offre trouvée'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOffers.map((offer) => (
                                <TableRow key={offer._id || offer.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {offer.titre || 'Sans titre'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ maxWidth: 250 }}>
                                            {offer.description?.slice(0, 60)}...
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={offer.typeStage || 'Stage'}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#e0e7ff',
                                                color: '#4338ca',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{offer.nbPostes || 0}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            icon={getStatusIcon(offer.statut)}
                                            label={getStatusLabel(offer.statut)}
                                            status={offer.statut}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={offer.candidaturesCount || offer.nbCandidatures || 0}
                                            size="small"
                                            sx={{
                                                backgroundColor: (offer.candidaturesCount || offer.nbCandidatures || 0) > 0 
                                                    ? '#d1fae5' 
                                                    : '#f3f4f6',
                                                color: (offer.candidaturesCount || offer.nbCandidatures || 0) > 0 
                                                    ? '#065f46' 
                                                    : '#6b7280',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(offer.dateLimiteCandidature || offer.dateFin)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {/* ✅ ICÔNE ŒIL EN NOIR */}
                                        <Tooltip title="Voir">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewOffer(offer)}
                                                sx={{ color: '#000000' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {(offer.statut === 'Brouillon' || offer.statut === 'Refusee') && (
                                            <Tooltip title="Modifier">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditOffer(offer)}
                                                    sx={{ color: '#4f46e5' }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {offer.statut === 'Brouillon' && (
                                            <Tooltip title="Soumettre pour validation">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleSubmitOffer(offer)}
                                                    sx={{ color: '#22c55e' }}
                                                >
                                                    <Send fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {(offer.statut === 'Brouillon' || offer.statut === 'Refusee') && (
                                            <Tooltip title="Supprimer">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteClick(offer)}
                                                    sx={{ color: '#ef4444' }}
                                                >
                                                    <Delete fontSize="small" />
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

            {/* ===== DIALOG DE CONFIRMATION ===== */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle>🗑️ Supprimer l'offre</DialogTitle>
                <DialogContent>
                    <Typography>
                        Êtes-vous sûr de vouloir supprimer l'offre{' '}
                        <strong>{selectedOffer?.titre}</strong> ?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Cette action est irréversible.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                        disabled={submitting}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDeleteConfirm}
                        disabled={submitting}
                        sx={{
                            backgroundColor: '#ef4444',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#dc2626' },
                        }}
                    >
                        {submitting ? <CircularProgress size={20} color="inherit" /> : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>

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

export default MyOffers;
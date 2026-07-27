// src/components/department/MyOffers.jsx
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
        en_attente: { bg: '#fef3c7', text: '#d97706' },
        publiee: { bg: '#d1fae5', text: '#065f46' },
        refuse: { bg: '#fee2e2', text: '#991b1b' },
        archive: { bg: '#e0e7ff', text: '#4338ca' },
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

const MyOffers = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [offers, setOffers] = useState([]);
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);

    useEffect(() => {
        fetchOffers();
    }, []);

    useEffect(() => {
        filterOffers();
    }, [offers, searchTerm, statusFilter]);

    const fetchOffers = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockOffers = [
                {
                    id: '1',
                    titre: 'Stage Développement Web',
                    description: 'Développement d\'applications web avec React et Node.js',
                    typeStage: 'PFE',
                    nbPostes: 2,
                    statut: 'publiee',
                    datePublication: '2026-06-01',
                    dateLimiteCandidature: '2026-07-15',
                    candidatures: 12,
                },
                {
                    id: '2',
                    titre: 'Stage Data Science',
                    description: 'Analyse de données et machine learning',
                    typeStage: 'Master',
                    nbPostes: 1,
                    statut: 'en_attente',
                    datePublication: null,
                    dateLimiteCandidature: '2026-08-01',
                    candidatures: 0,
                },
                {
                    id: '3',
                    titre: 'Stage Cybersécurité',
                    description: 'Sécurisation des infrastructures et applications',
                    typeStage: 'PFE',
                    nbPostes: 2,
                    statut: 'brouillon',
                    datePublication: null,
                    dateLimiteCandidature: '2026-09-01',
                    candidatures: 0,
                },
                {
                    id: '4',
                    titre: 'Stage Marketing Digital',
                    description: 'Stratégie de communication et SEO',
                    typeStage: 'Licence',
                    nbPostes: 1,
                    statut: 'refuse',
                    datePublication: null,
                    dateLimiteCandidature: '2026-05-15',
                    candidatures: 0,
                },
                {
                    id: '5',
                    titre: 'Stage DevOps',
                    description: 'CI/CD, automatisation et cloud',
                    typeStage: 'PFA',
                    nbPostes: 2,
                    statut: 'archive',
                    datePublication: '2026-03-01',
                    dateLimiteCandidature: '2026-04-30',
                    candidatures: 8,
                },
            ];

            setOffers(mockOffers);
            setFilteredOffers(mockOffers);

        } catch (error) {
            console.error('Erreur chargement offres:', error);
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
                    o.titre.toLowerCase().includes(term) ||
                    o.description.toLowerCase().includes(term) ||
                    o.typeStage.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((o) => o.statut === statusFilter);
        }

        setFilteredOffers(filtered);
    };

    const getStatusLabel = (status) => {
        const labels = {
            brouillon: 'Brouillon',
            en_attente: 'En attente',
            publiee: 'Publiée',
            refuse: 'Refusée',
            archive: 'Archivée',
        };
        return labels[status] || status;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'publiee':
                return <CheckCircle sx={{ fontSize: 14 }} />;
            case 'en_attente':
                return <Pending sx={{ fontSize: 14 }} />;
            case 'refuse':
                return <Cancel sx={{ fontSize: 14 }} />;
            case 'brouillon':
                return <Edit sx={{ fontSize: 14 }} />;
            default:
                return null;
        }
    };

    const handleViewOffer = (offer) => {
        navigate(`/department/offer/${offer.id}`);
    };

    const handleEditOffer = (offer) => {
        navigate(`/department/edit-offer/${offer.id}`);
    };

    const handleDeleteClick = (offer) => {
        setSelectedOffer(offer);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = () => {
        setOffers(offers.filter((o) => o.id !== selectedOffer.id));
        setOpenDeleteDialog(false);
        setSelectedOffer(null);
    };

    const handleSubmitOffer = (offer) => {
        // Soumettre pour validation
        setOffers(
            offers.map((o) =>
                o.id === offer.id ? { ...o, statut: 'en_attente' } : o
            )
        );
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedOffer(null);
    };

    const statutOptions = [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'brouillon', label: 'Brouillon' },
        { value: 'en_attente', label: 'En attente' },
        { value: 'publiee', label: 'Publiée' },
        { value: 'refuse', label: 'Refusée' },
        { value: 'archive', label: 'Archivée' },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        📋 Mes offres de stage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredOffers.length} offre(s) trouvée(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchOffers}
                        disabled={loading}
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                        Rafraîchir
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        sx={{
                            backgroundColor: '#148aa0',
                            borderRadius: '12px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#0b7890' },
                        }}
                        onClick={() => navigate('/department/create-offer')}
                    >
                        Nouvelle offre
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
                            {statutOptions.map((option) => (
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
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: '#148aa0' }} />
                                </TableCell>
                            </TableRow>
                        ) : filteredOffers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucune offre trouvée
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOffers.map((offer) => (
                                <TableRow key={offer.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {offer.titre}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {offer.description.slice(0, 60)}...
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={offer.typeStage}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#e0e7ff',
                                                color: '#4338ca',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{offer.nbPostes}</Typography>
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
                                            label={offer.candidatures}
                                            size="small"
                                            sx={{
                                                backgroundColor:
                                                    offer.candidatures > 0 ? '#d1fae5' : '#f3f4f6',
                                                color: offer.candidatures > 0 ? '#065f46' : '#6b7280',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {offer.dateLimiteCandidature
                                                ? new Date(offer.dateLimiteCandidature).toLocaleDateString('fr-FR')
                                                : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewOffer(offer)}
                                                sx={{ color: '#148aa0' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {(offer.statut === 'brouillon' || offer.statut === 'refuse') && (
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
                                        {offer.statut === 'brouillon' && (
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
                                        {(offer.statut === 'brouillon' || offer.statut === 'refuse') && (
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
                        Cette action est irréversible.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDeleteConfirm}
                        sx={{
                            backgroundColor: '#ef4444',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#dc2626' },
                        }}
                    >
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MyOffers;
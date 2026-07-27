// src/components/rh/ValidateOffers.jsx
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
} from '@mui/material';
import {
    Search,
    Visibility,
    Refresh,
    FilterList,
    CheckCircle,
    Cancel,
    Pending,
    Comment,
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
        en_attente: { bg: '#fef3c7', text: '#d97706' },
        publiee: { bg: '#d1fae5', text: '#065f46' },
        refuse: { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors.en_attente;
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

const ValidateOffers = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [offers, setOffers] = useState([]);
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('en_attente');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [actionType, setActionType] = useState('');
    const [comment, setComment] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

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
                    statut: 'en_attente',
                    dateSoumission: '2026-07-18',
                    departement: 'DSI',
                    createur: 'Fatima ALAOUI',
                },
                {
                    id: '2',
                    titre: 'Stage Data Science',
                    description: 'Analyse de données et machine learning',
                    typeStage: 'Master',
                    nbPostes: 1,
                    statut: 'en_attente',
                    dateSoumission: '2026-07-17',
                    departement: 'DSI',
                    createur: 'Fatima ALAOUI',
                },
                {
                    id: '3',
                    titre: 'Stage Cybersécurité',
                    description: 'Sécurisation des infrastructures et applications',
                    typeStage: 'PFE',
                    nbPostes: 2,
                    statut: 'en_attente',
                    dateSoumission: '2026-07-16',
                    departement: 'DSI',
                    createur: 'Karim BENNANI',
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
                    o.departement.toLowerCase().includes(term) ||
                    o.createur.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((o) => o.statut === statusFilter);
        }

        setFilteredOffers(filtered);
    };

    const getStatusLabel = (status) => {
        const labels = {
            en_attente: 'En attente',
            publiee: 'Publiée',
            refuse: 'Refusée',
        };
        return labels[status] || status;
    };

    const handleOpenDialog = (offer, action) => {
        setSelectedOffer(offer);
        setActionType(action);
        setComment('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOffer(null);
        setComment('');
    };

    const handleConfirmAction = () => {
        if (actionType === 'valider') {
            setOffers(
                offers.map((o) =>
                    o.id === selectedOffer.id ? { ...o, statut: 'publiee' } : o
                )
            );
            setSuccess(`✅ Offre "${selectedOffer.titre}" validée avec succès !`);
        } else {
            setOffers(
                offers.map((o) =>
                    o.id === selectedOffer.id ? { ...o, statut: 'refuse' } : o
                )
            );
            setSuccess(`❌ Offre "${selectedOffer.titre}" refusée`);
        }
        handleCloseDialog();
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        ✅ Validation des offres
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredOffers.length} offre(s) en attente de validation
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
                </Box>
            </PageHeader>

            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

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
                            <MenuItem value="all">Tous les statuts</MenuItem>
                            <MenuItem value="en_attente">En attente</MenuItem>
                            <MenuItem value="publiee">Publiée</MenuItem>
                            <MenuItem value="refuse">Refusée</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('en_attente');
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
                            <StyledTableCell>Département</StyledTableCell>
                            <StyledTableCell>Type</StyledTableCell>
                            <StyledTableCell>Postes</StyledTableCell>
                            <StyledTableCell>Soumission</StyledTableCell>
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
                        ) : filteredOffers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucune offre en attente de validation
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
                                            label={offer.departement}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#e0e7ff',
                                                color: '#4338ca',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={offer.typeStage}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#f3e8ff',
                                                color: '#6b21a8',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{offer.nbPostes}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(offer.dateSoumission).toLocaleDateString('fr-FR')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            par {offer.createur}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={getStatusLabel(offer.statut)}
                                            status={offer.statut}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir les détails">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/rh/offer/${offer.id}`)}
                                                sx={{ color: '#148aa0' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {offer.statut === 'en_attente' && (
                                            <>
                                                <Tooltip title="Valider">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog(offer, 'valider')}
                                                        sx={{ color: '#22c55e' }}
                                                    >
                                                        <CheckCircle fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Refuser">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog(offer, 'refuser')}
                                                        sx={{ color: '#ef4444' }}
                                                    >
                                                        <Cancel fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
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
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle>
                    {actionType === 'valider' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ color: '#22c55e' }} /> Valider l'offre
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Cancel sx={{ color: '#ef4444' }} /> Refuser l'offre
                        </Box>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {actionType === 'valider'
                            ? `Êtes-vous sûr de vouloir valider l'offre "${selectedOffer?.titre}" ?`
                            : `Êtes-vous sûr de vouloir refuser l'offre "${selectedOffer?.titre}" ?`}
                    </Typography>
                    {actionType === 'refuser' && (
                        <TextField
                            label="Motif du refus"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Expliquez la raison du refus..."
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseDialog}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmAction}
                        sx={{
                            backgroundColor: actionType === 'valider' ? '#22c55e' : '#ef4444',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: actionType === 'valider' ? '#16a34a' : '#dc2626',
                            },
                        }}
                    >
                        {actionType === 'valider' ? 'Valider' : 'Refuser'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ValidateOffers;
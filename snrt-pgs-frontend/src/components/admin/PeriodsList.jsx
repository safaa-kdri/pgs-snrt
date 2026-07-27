// src/components/admin/PeriodsList.jsx
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    InputAdornment,
    Tooltip,
    Grid,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Delete,
    Event,
    Refresh,
    FilterList,
    CheckCircle,
    Block,
    CalendarToday,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================
// STYLES (même thème que les pages publiques)
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

    const [loading, setLoading] = useState(true);
    const [periods, setPeriods] = useState([]);
    const [filteredPeriods, setFilteredPeriods] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [dialogMode, setDialogMode] = useState('view');
    const [formData, setFormData] = useState({
        nom: '',
        dateDebut: '',
        dateFin: '',
        dateOuvertureCandidatures: '',
        dateFermetureCandidatures: '',
        actif: true,
    });

    useEffect(() => {
        fetchPeriods();
    }, []);

    useEffect(() => {
        filterPeriods();
    }, [periods, searchTerm, statusFilter]);

    const fetchPeriods = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockPeriods = [
                {
                    id: '1',
                    nom: 'Été 2026',
                    dateDebut: '2026-06-01',
                    dateFin: '2026-08-31',
                    dateOuvertureCandidatures: '2026-03-01',
                    dateFermetureCandidatures: '2026-05-15',
                    actif: true,
                    status: 'active',
                },
                {
                    id: '2',
                    nom: 'Hiver 2027',
                    dateDebut: '2027-01-01',
                    dateFin: '2027-03-31',
                    dateOuvertureCandidatures: '2026-10-01',
                    dateFermetureCandidatures: '2026-11-15',
                    actif: true,
                    status: 'upcoming',
                },
                {
                    id: '3',
                    nom: 'Printemps 2026',
                    dateDebut: '2026-03-01',
                    dateFin: '2026-05-31',
                    dateOuvertureCandidatures: '2025-12-01',
                    dateFermetureCandidatures: '2026-02-15',
                    actif: false,
                    status: 'past',
                },
                {
                    id: '4',
                    nom: 'Automne 2026',
                    dateDebut: '2026-09-01',
                    dateFin: '2026-11-30',
                    dateOuvertureCandidatures: '2026-06-01',
                    dateFermetureCandidatures: '2026-08-15',
                    actif: false,
                    status: 'inactive',
                },
            ];

            setPeriods(mockPeriods);
            setFilteredPeriods(mockPeriods);

        } catch (error) {
            console.error('Erreur chargement périodes:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPeriods = () => {
        let filtered = [...periods];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.nom.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((p) => p.status === statusFilter);
        }

        setFilteredPeriods(filtered);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr });
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

    const handleOpenDialog = (period, mode) => {
        if (period) {
            setSelectedPeriod(period);
            setFormData({
                nom: period.nom || '',
                dateDebut: period.dateDebut || '',
                dateFin: period.dateFin || '',
                dateOuvertureCandidatures: period.dateOuvertureCandidatures || '',
                dateFermetureCandidatures: period.dateFermetureCandidatures || '',
                actif: period.actif !== undefined ? period.actif : true,
            });
        } else {
            setSelectedPeriod(null);
            setFormData({
                nom: '',
                dateDebut: '',
                dateFin: '',
                dateOuvertureCandidatures: '',
                dateFermetureCandidatures: '',
                actif: true,
            });
        }
        setDialogMode(mode);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPeriod(null);
    };

    const handleSavePeriod = () => {
        // TODO: Appel API POST /periods ou PUT /periods/:id
        console.log('💾 Sauvegarde période:', formData);
        handleCloseDialog();
    };

    const handleDeletePeriod = () => {
        // TODO: Appel API DELETE /periods/:id
        console.log('🗑️ Suppression période:', selectedPeriod?.id);
        setPeriods(periods.filter((p) => p.id !== selectedPeriod?.id));
        handleCloseDialog();
    };

    const handleToggleStatus = (period) => {
        const newStatus = period.actif ? false : true;
        // TODO: Appel API PUT /periods/:id/status
        console.log('🔄 Changement statut:', period.id, '→', newStatus);
        setPeriods(
            periods.map((p) =>
                p.id === period.id ? { ...p, actif: newStatus, status: getStatusFromDates({ ...p, actif: newStatus }) } : p
            )
        );
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        📅 Gestion des périodes de stage
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
                            backgroundColor: '#148aa0',
                            borderRadius: '12px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#0b7890' },
                        }}
                        onClick={() => handleOpenDialog(null, 'add')}
                    >
                        Ajouter une période
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
                                            label={
                                                period.status === 'active' ? 'Actif' :
                                                period.status === 'upcoming' ? 'À venir' :
                                                period.status === 'past' ? 'Passé' : 'Inactif'
                                            }
                                            status={period.status}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Voir">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(period, 'view')}
                                            >
                                                👁️
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Modifier">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(period, 'edit')}
                                            >
                                                <Edit sx={{ fontSize: 18, color: '#4f46e5' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={period.actif ? 'Désactiver' : 'Activer'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleStatus(period)}
                                            >
                                                {period.actif ? (
                                                    <Block sx={{ fontSize: 18, color: '#f59e0b' }} />
                                                ) : (
                                                    <CheckCircle sx={{ fontSize: 18, color: '#22c55e' }} />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Supprimer">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(period, 'delete')}
                                            >
                                                <Delete sx={{ fontSize: 18, color: '#ef4444' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ===== DIALOG ===== */}
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
                    {dialogMode === 'view' && '📅 Détails de la période'}
                    {dialogMode === 'add' && '➕ Ajouter une période'}
                    {dialogMode === 'edit' && '✏️ Modifier la période'}
                    {dialogMode === 'delete' && '🗑️ Supprimer la période'}
                </DialogTitle>
                <DialogContent>
                    {dialogMode === 'delete' ? (
                        <Typography>
                            Êtes-vous sûr de vouloir supprimer la période{' '}
                            <strong>{selectedPeriod?.nom}</strong> ?
                            Cette action est irréversible.
                        </Typography>
                    ) : dialogMode === 'view' ? (
                        selectedPeriod && (
                            <Box sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">
                                            Nom
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {selectedPeriod.nom}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Date de début
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {formatDate(selectedPeriod.dateDebut)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Date de fin
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {formatDate(selectedPeriod.dateFin)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Ouverture candidatures
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {formatDate(selectedPeriod.dateOuvertureCandidatures)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Fermeture candidatures
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {formatDate(selectedPeriod.dateFermetureCandidatures)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">
                                            Statut
                                        </Typography>
                                        <StatusChip
                                            label={
                                                selectedPeriod.status === 'active' ? 'Actif' :
                                                selectedPeriod.status === 'upcoming' ? 'À venir' :
                                                selectedPeriod.status === 'past' ? 'Passé' : 'Inactif'
                                            }
                                            status={selectedPeriod.status}
                                            size="small"
                                            sx={{ mt: 0.5 }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        )
                    ) : (
                        // Formulaire add/edit
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                label="Nom de la période"
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                fullWidth
                                margin="normal"
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                                }}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Date de début"
                                        type="date"
                                        value={formData.dateDebut}
                                        onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Date de fin"
                                        type="date"
                                        value={formData.dateFin}
                                        onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Ouverture candidatures"
                                        type="date"
                                        value={formData.dateOuvertureCandidatures}
                                        onChange={(e) => setFormData({ ...formData, dateOuvertureCandidatures: e.target.value })}
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Fermeture candidatures"
                                        type="date"
                                        value={formData.dateFermetureCandidatures}
                                        onChange={(e) => setFormData({ ...formData, dateFermetureCandidatures: e.target.value })}
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.actif}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                actif: e.target.checked,
                                            })
                                        }
                                    />
                                }
                                label={formData.actif ? 'Actif' : 'Inactif'}
                                sx={{ mt: 2 }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseDialog}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        {dialogMode === 'delete' ? 'Annuler' : 'Fermer'}
                    </Button>
                    {dialogMode === 'delete' && (
                        <Button
                            variant="contained"
                            onClick={handleDeletePeriod}
                            sx={{
                                backgroundColor: '#ef4444',
                                borderRadius: '10px',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#dc2626' },
                            }}
                        >
                            Supprimer
                        </Button>
                    )}
                    {(dialogMode === 'add' || dialogMode === 'edit') && (
                        <Button
                            variant="contained"
                            onClick={handleSavePeriod}
                            sx={{
                                backgroundColor: '#148aa0',
                                borderRadius: '10px',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#0b7890' },
                            }}
                        >
                            {dialogMode === 'add' ? 'Ajouter' : 'Enregistrer'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PeriodsList;
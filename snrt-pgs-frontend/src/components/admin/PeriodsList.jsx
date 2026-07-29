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
    MenuItem,
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
    Visibility,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
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

    const [loading, setLoading] = useState(true);
    const [periods, setPeriods] = useState([]);
    const [filteredPeriods, setFilteredPeriods] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');

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
                status: period.status || getStatusFromDates(period),
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

    // ✅ SAUVEGARDER VERS L'API
    const handleSavePeriod = async () => {
        try {
            const payload = {
                nom: formData.nom,
                dateDebut: formData.dateDebut,
                dateFin: formData.dateFin,
                dateOuvertureCandidatures: formData.dateOuvertureCandidatures,
                dateFermetureCandidatures: formData.dateFermetureCandidatures,
                actif: formData.actif,
            };

            if (dialogMode === 'add') {
                await api.post('/periods', payload);
            } else if (dialogMode === 'edit') {
                await api.put(`/periods/${selectedPeriod.id}`, payload);
            }
            handleCloseDialog();
            fetchPeriods();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setError('Erreur lors de la sauvegarde de la periode');
        }
    };

    // ✅ SUPPRIMER VERS L'API
    const handleDeletePeriod = async () => {
        try {
            await api.delete(`/periods/${selectedPeriod.id}`);
            handleCloseDialog();
            fetchPeriods();
        } catch (error) {
            console.error('Erreur suppression:', error);
            setError('Erreur lors de la suppression de la periode');
        }
    };

    // ✅ CHANGER STATUT VERS L'API
    const handleToggleStatus = async (period) => {
        const newStatus = period.actif ? false : true;
        try {
            await api.put(`/periods/${period.id}`, { actif: newStatus });
            fetchPeriods();
        } catch (error) {
            console.error('Erreur changement statut:', error);
            setError('Erreur lors du changement de statut');
        }
    };

    const getStatusLabel = (period) => {
        if (period.status === 'active') return 'Actif';
        if (period.status === 'upcoming') return 'A venir';
        if (period.status === 'past') return 'Passe';
        return 'Inactif';
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Gestion des periodes de stage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredPeriods.length} periode(s) trouvee(s)
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
                        Rafraichir
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
                        Ajouter une periode
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
                            <MenuItem value="upcoming">A venir</MenuItem>
                            <MenuItem value="past">Passe</MenuItem>
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
                            Reinitialiser
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
                            <StyledTableCell>Periode</StyledTableCell>
                            <StyledTableCell>Debut</StyledTableCell>
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
                                        Aucune periode trouvee
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
                                            label={getStatusLabel(period)}
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
                                                <Visibility sx={{ fontSize: 18, color: '#148aa0' }} />
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
                                        <Tooltip title={period.actif ? 'Desactiver' : 'Activer'}>
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
                    {dialogMode === 'view' && 'Details de la periode'}
                    {dialogMode === 'add' && 'Ajouter une periode'}
                    {dialogMode === 'edit' && 'Modifier la periode'}
                    {dialogMode === 'delete' && 'Supprimer la periode'}
                </DialogTitle>
                <DialogContent>
                    {dialogMode === 'delete' ? (
                        <Typography>
                            Etes-vous sur de vouloir supprimer la periode{' '}
                            <strong>{selectedPeriod?.nom}</strong> ?
                            Cette action est irreversible.
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
                                            Date de debut
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
                                            label={getStatusLabel(selectedPeriod)}
                                            status={selectedPeriod.status}
                                            size="small"
                                            sx={{ mt: 0.5 }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        )
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                label="Nom de la periode"
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
                                        label="Date de debut"
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
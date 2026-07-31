// src/components/admin/AdminOffres.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    IconButton,
    Alert,
    CircularProgress,
    InputAdornment,
    Tooltip,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Add,
    Edit,
    Delete,
    Visibility,
    Search,
    Refresh,
} from '@mui/icons-material';
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
        'Publiée': { bg: '#d1fae5', text: '#065f46' },
        'En attente': { bg: '#fef3c7', text: '#d97706' },
        'Brouillon': { bg: '#e0e7ff', text: '#4338ca' },
        'Archivée': { bg: '#f3f4f6', text: '#6b7280' },
        'Refusée': { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors['En attente'];
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

const AdminOffres = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [offres, setOffres] = useState([]);
    const [filteredOffres, setFilteredOffres] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departements, setDepartements] = useState([]);

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add');
    const [selectedOffre, setSelectedOffre] = useState(null);
    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        typeStage: '',
        nbPostes: 1,
        departementId: '',
        dateLimiteCandidature: '',
        dateDebut: '',
        dateFin: '',
        statut: 'Brouillon',
    });

    useEffect(() => {
        fetchOffres();
        fetchDepartements();
    }, []);

    useEffect(() => {
        filterOffres();
    }, [offres, searchTerm, statusFilter]);

    const fetchOffres = async () => {
        setLoading(true);
        try {
            const response = await api.get('/offers');
            if (response.data?.data) {
                setOffres(response.data.data);
                setFilteredOffres(response.data.data);
            }
        } catch (error) {
            console.error('Erreur chargement offres:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartements = async () => {
        try {
            const response = await api.get('/departments');
            if (response.data?.data) {
                setDepartements(response.data.data);
            }
        } catch (error) {
            console.error('Erreur chargement departements:', error);
        }
    };

    const filterOffres = () => {
        let filtered = [...offres];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (o) =>
                    o.titre?.toLowerCase().includes(term) ||
                    o.description?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((o) => o.statut === statusFilter);
        }

        setFilteredOffres(filtered);
    };

    const handleOpenDialog = (offre = null, mode = 'add') => {
        if (offre) {
            setSelectedOffre(offre);
            setFormData({
                titre: offre.titre || '',
                description: offre.description || '',
                typeStage: offre.typeStage || '',
                nbPostes: offre.nbPostes || 1,
                departementId: offre.departementId?._id || offre.departementId || '',
                dateLimiteCandidature: offre.dateLimiteCandidature?.split('T')[0] || '',
                dateDebut: offre.dateDebut?.split('T')[0] || '',
                dateFin: offre.dateFin?.split('T')[0] || '',
                statut: offre.statut || 'Brouillon',
            });
        } else {
            setSelectedOffre(null);
            setFormData({
                titre: '',
                description: '',
                typeStage: '',
                nbPostes: 1,
                departementId: '',
                dateLimiteCandidature: '',
                dateDebut: '',
                dateFin: '',
                statut: 'Brouillon',
            });
        }
        setDialogMode(mode);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOffre(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            if (dialogMode === 'add') {
                await api.post('/offers', formData);
            } else if (dialogMode === 'edit') {
                await api.put(`/offers/${selectedOffre._id}`, formData);
            }
            handleCloseDialog();
            fetchOffres();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cette offre ?')) {
            try {
                await api.delete(`/offers/${id}`);
                fetchOffres();
            } catch (error) {
                console.error('Erreur suppression:', error);
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`/offers/${id}/status`, { statut: newStatus });
            fetchOffres();
        } catch (error) {
            console.error('Erreur changement statut:', error);
        }
    };

    const getStatusLabel = (status) => {
        return status || 'Brouillon';
    };

    const typesStage = [
        'PFE', 'PFA', 'Initiation', 'Ete', 'Master', 'Licence', 'Technicien'
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            
            {/* ===== EN-TETE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Gestion des offres de stage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredOffres.length} offre(s) trouvee(s)
                    </Typography>
                </Box>
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
                    Nouvelle offre
                </Button>
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
                                        <Search sx={{ color: '#999' }} />
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
                            <MenuItem value="Publiée">Publiee</MenuItem>
                            <MenuItem value="En attente">En attente</MenuItem>
                            <MenuItem value="Brouillon">Brouillon</MenuItem>
                            <MenuItem value="Archivée">Archivee</MenuItem>
                            <MenuItem value="Refusée">Refusee</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={fetchOffres}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                borderColor: '#ddd',
                                color: '#666',
                                backgroundColor: '#fff',
                            }}
                        >
                            Rafraichir
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
                            <StyledTableCell>Departement</StyledTableCell>
                            <StyledTableCell>Type</StyledTableCell>
                            <StyledTableCell>Postes</StyledTableCell>
                            <StyledTableCell>Date limite</StyledTableCell>
                            <StyledTableCell>Statut</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <CircularProgress sx={{ color: '#148aa0' }} />
                                </TableCell>
                            </TableRow>
                        ) : filteredOffres.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">
                                        Aucune offre trouvee
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOffres.map((offre) => (
                                <TableRow key={offre._id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {offre.titre || 'Sans titre'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {offre.departementId?.nom || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={offre.typeStage || '-'}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#e0e7ff',
                                                color: '#4338ca',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {offre.nbPostes || 0}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {offre.dateLimiteCandidature
                                                ? new Date(offre.dateLimiteCandidature).toLocaleDateString('fr-FR')
                                                : '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={getStatusLabel(offre.statut)}
                                            status={getStatusLabel(offre.statut)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(offre, 'view')}
                                            >
                                                <Visibility sx={{ fontSize: 18, color: '#148aa0' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Modifier">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(offre, 'edit')}
                                            >
                                                <Edit sx={{ fontSize: 18, color: '#4f46e5' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Supprimer">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(offre._id)}
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
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle>
                    {dialogMode === 'add' && 'Nouvelle offre de stage'}
                    {dialogMode === 'edit' && 'Modifier l\'offre'}
                    {dialogMode === 'view' && 'Details de l\'offre'}
                </DialogTitle>
                <DialogContent>
                    {dialogMode === 'view' ? (
                        selectedOffre && (
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        Titre
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {selectedOffre.titre}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        Description
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedOffre.description || 'Aucune description'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Type de stage
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedOffre.typeStage || '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Nombre de postes
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedOffre.nbPostes || 0}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Date limite
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedOffre.dateLimiteCandidature
                                            ? new Date(selectedOffre.dateLimiteCandidature).toLocaleDateString('fr-FR')
                                            : '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Statut
                                    </Typography>
                                    <StatusChip
                                        label={getStatusLabel(selectedOffre.statut)}
                                        status={getStatusLabel(selectedOffre.statut)}
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Date debut
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedOffre.dateDebut
                                            ? new Date(selectedOffre.dateDebut).toLocaleDateString('fr-FR')
                                            : '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Date fin
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedOffre.dateFin
                                            ? new Date(selectedOffre.dateFin).toLocaleDateString('fr-FR')
                                            : '-'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        )
                    ) : (
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Titre de l'offre"
                                        name="titre"
                                        value={formData.titre}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Type de stage</InputLabel>
                                        <Select
                                            name="typeStage"
                                            value={formData.typeStage}
                                            onChange={handleChange}
                                            label="Type de stage"
                                            sx={{ borderRadius: '10px' }}
                                        >
                                            {typesStage.map((type) => (
                                                <MenuItem key={type} value={type}>
                                                    {type}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Nombre de postes"
                                        name="nbPostes"
                                        type="number"
                                        value={formData.nbPostes}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Departement</InputLabel>
                                        <Select
                                            name="departementId"
                                            value={formData.departementId}
                                            onChange={handleChange}
                                            label="Departement"
                                            sx={{ borderRadius: '10px' }}
                                        >
                                            {departements.map((dept) => (
                                                <MenuItem key={dept._id} value={dept._id}>
                                                    {dept.nom}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Statut</InputLabel>
                                        <Select
                                            name="statut"
                                            value={formData.statut}
                                            onChange={handleChange}
                                            label="Statut"
                                            sx={{ borderRadius: '10px' }}
                                        >
                                            <MenuItem value="Brouillon">Brouillon</MenuItem>
                                            <MenuItem value="En attente">En attente</MenuItem>
                                            <MenuItem value="Publiee">Publiee</MenuItem>
                                            <MenuItem value="Archivee">Archivee</MenuItem>
                                            <MenuItem value="Refusee">Refusee</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Date limite candidature"
                                        name="dateLimiteCandidature"
                                        type="date"
                                        value={formData.dateLimiteCandidature}
                                        onChange={handleChange}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Date debut"
                                        name="dateDebut"
                                        type="date"
                                        value={formData.dateDebut}
                                        onChange={handleChange}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Date fin"
                                        name="dateFin"
                                        type="date"
                                        value={formData.dateFin}
                                        onChange={handleChange}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseDialog}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        {dialogMode === 'view' ? 'Fermer' : 'Annuler'}
                    </Button>
                    {dialogMode !== 'view' && (
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            sx={{
                                backgroundColor: '#148aa0',
                                borderRadius: '10px',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#0b7890' },
                            }}
                        >
                            {dialogMode === 'add' ? 'Creer' : 'Enregistrer'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminOffres;
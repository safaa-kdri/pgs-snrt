// src/components/admin/DepartmentsList.jsx
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
    Avatar,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Delete,
    Business,
    Refresh,
    FilterList,
    CheckCircle,
    Block,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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

const DepartmentsList = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [dialogMode, setDialogMode] = useState('view');
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        responsable: '',
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        filterDepartments();
    }, [departments, searchTerm, statusFilter]);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockDepartments = [
                {
                    id: '1',
                    nom: 'Direction des Systèmes d\'Information',
                    description: 'DSI - Gestion des infrastructures et applications',
                    responsable: 'Safaa EL KADOURI',
                    nbStagiaires: 12,
                    status: 'active',
                    dateCreation: '2026-01-15',
                },
                {
                    id: '2',
                    nom: 'Direction Technique',
                    description: 'Technique - Production et diffusion',
                    responsable: 'Karim BENNANI',
                    nbStagiaires: 8,
                    status: 'active',
                    dateCreation: '2026-02-01',
                },
                {
                    id: '3',
                    nom: 'Direction Marketing',
                    description: 'Marketing - Communication et promotion',
                    responsable: 'Fatima ALAOUI',
                    nbStagiaires: 5,
                    status: 'active',
                    dateCreation: '2026-03-10',
                },
                {
                    id: '4',
                    nom: 'Direction des Ressources Humaines',
                    description: 'DRH - Gestion du personnel',
                    responsable: 'Mohamed CHERKAOUI',
                    nbStagiaires: 3,
                    status: 'inactive',
                    dateCreation: '2026-02-15',
                },
            ];

            setDepartments(mockDepartments);
            setFilteredDepartments(mockDepartments);

        } catch (error) {
            console.error('Erreur chargement départements:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterDepartments = () => {
        let filtered = [...departments];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (d) =>
                    d.nom.toLowerCase().includes(term) ||
                    d.description.toLowerCase().includes(term) ||
                    d.responsable.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((d) => d.status === statusFilter);
        }

        setFilteredDepartments(filtered);
    };

    const getInitials = (nom) => {
        return nom
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleOpenDialog = (dept, mode) => {
        if (dept) {
            setSelectedDept(dept);
            setFormData({
                nom: dept.nom,
                description: dept.description,
                responsable: dept.responsable,
            });
        } else {
            setSelectedDept(null);
            setFormData({ nom: '', description: '', responsable: '' });
        }
        setDialogMode(mode);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedDept(null);
    };

    const handleSaveDepartment = () => {
        // TODO: Appel API POST /departments ou PUT /departments/:id
        console.log('💾 Sauvegarde département:', formData);
        handleCloseDialog();
    };

    const handleDeleteDepartment = () => {
        // TODO: Appel API DELETE /departments/:id
        console.log('🗑️ Suppression département:', selectedDept?.id);
        setDepartments(departments.filter((d) => d.id !== selectedDept?.id));
        handleCloseDialog();
    };

    const handleToggleStatus = (dept) => {
        const newStatus = dept.status === 'active' ? 'inactive' : 'active';
        // TODO: Appel API PUT /departments/:id/status
        console.log('🔄 Changement statut:', dept.id, '→', newStatus);
        setDepartments(
            departments.map((d) =>
                d.id === dept.id ? { ...d, status: newStatus } : d
            )
        );
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        🏢 Gestion des départements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredDepartments.length} département(s) trouvé(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchDepartments}
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
                        Ajouter un département
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
                            <StyledTableCell>Département</StyledTableCell>
                            <StyledTableCell>Description</StyledTableCell>
                            <StyledTableCell>Responsable</StyledTableCell>
                            <StyledTableCell>Stagiaires</StyledTableCell>
                            <StyledTableCell>Statut</StyledTableCell>
                            <StyledTableCell align="right">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: '#148aa0' }} />
                                </TableCell>
                            </TableRow>
                        ) : filteredDepartments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucun département trouvé
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDepartments.map((dept) => (
                                <TableRow key={dept.id} hover>
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
                                                {getInitials(dept.nom)}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={600}>
                                                {dept.nom}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                                            {dept.description}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{dept.responsable}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={dept.nbStagiaires}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#e0e7ff',
                                                color: '#4338ca',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={dept.status === 'active' ? 'Actif' : 'Inactif'}
                                            status={dept.status}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Voir">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(dept, 'view')}
                                            >
                                                👁️
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Modifier">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(dept, 'edit')}
                                            >
                                                <Edit sx={{ fontSize: 18, color: '#4f46e5' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={dept.status === 'active' ? 'Désactiver' : 'Activer'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleStatus(dept)}
                                            >
                                                {dept.status === 'active' ? (
                                                    <Block sx={{ fontSize: 18, color: '#f59e0b' }} />
                                                ) : (
                                                    <CheckCircle sx={{ fontSize: 18, color: '#22c55e' }} />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Supprimer">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(dept, 'delete')}
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
                    {dialogMode === 'view' && '🏢 Détails du département'}
                    {dialogMode === 'add' && '➕ Ajouter un département'}
                    {dialogMode === 'edit' && '✏️ Modifier le département'}
                    {dialogMode === 'delete' && '🗑️ Supprimer le département'}
                </DialogTitle>
                <DialogContent>
                    {dialogMode === 'delete' ? (
                        <Typography>
                            Êtes-vous sûr de vouloir supprimer le département{' '}
                            <strong>{selectedDept?.nom}</strong> ?
                            Cette action est irréversible.
                        </Typography>
                    ) : dialogMode === 'view' ? (
                        selectedDept && (
                            <Box sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">
                                            Nom
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {selectedDept.nom}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">
                                            Description
                                        </Typography>
                                        <Typography variant="body2">
                                            {selectedDept.description}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Responsable
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {selectedDept.responsable}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Stagiaires
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {selectedDept.nbStagiaires}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">
                                            Statut
                                        </Typography>
                                        <StatusChip
                                            label={selectedDept.status === 'active' ? 'Actif' : 'Inactif'}
                                            status={selectedDept.status}
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
                                label="Nom du département"
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                fullWidth
                                margin="normal"
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                                }}
                            />
                            <TextField
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                fullWidth
                                margin="normal"
                                multiline
                                rows={3}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                                }}
                            />
                            <TextField
                                label="Responsable"
                                value={formData.responsable}
                                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                                fullWidth
                                margin="normal"
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                                }}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.status !== 'inactive'}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                status: e.target.checked ? 'active' : 'inactive',
                                            })
                                        }
                                    />
                                }
                                label={formData.status === 'active' ? 'Actif' : 'Inactif'}
                                sx={{ mt: 1 }}
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
                            onClick={handleDeleteDepartment}
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
                            onClick={handleSaveDepartment}
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

export default DepartmentsList;
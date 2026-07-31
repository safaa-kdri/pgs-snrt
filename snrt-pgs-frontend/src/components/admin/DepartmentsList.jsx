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
    MenuItem,
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Delete,
    Refresh,
    FilterList,
    CheckCircle,
    Block,
    Visibility,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
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
    const [error, setError] = useState('');

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [dialogMode, setDialogMode] = useState('view');
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        responsable: '',
        status: 'active',
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        filterDepartments();
    }, [departments, searchTerm, statusFilter]);

    const fetchDepartments = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/departments');
            
            let data = [];
            if (response.data?.data) {
                data = response.data.data;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data?.departments) {
                data = response.data.departments;
            }

            const formattedData = data.map(dept => ({
                id: dept._id || dept.id,
                nom: dept.nom || dept.name || 'Sans nom',
                description: dept.description || '',
                responsable: dept.responsable?.nom || dept.responsable || 'Non assigné',
                nbStagiaires: dept.nbStagiaires || 0,
                status: dept.actif !== undefined ? (dept.actif ? 'active' : 'inactive') : 'active',
                dateCreation: dept.createdAt || dept.dateCreation || new Date().toISOString(),
            }));
            
            setDepartments(formattedData);
            setFilteredDepartments(formattedData);
        } catch (error) {
            console.error('Erreur chargement departements:', error);
            setError('Erreur lors du chargement des departements');
            setDepartments([]);
            setFilteredDepartments([]);
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
        if (!nom) return '?';
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
                status: dept.status || 'active',
            });
        } else {
            setSelectedDept(null);
            setFormData({ nom: '', description: '', responsable: '', status: 'active' });
        }
        setDialogMode(mode);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedDept(null);
    };

    const handleSaveDepartment = async () => {
        try {
            const payload = {
                nom: formData.nom,
                description: formData.description,
                responsable: formData.responsable,
                actif: formData.status === 'active',
            };

            if (dialogMode === 'add') {
                await api.post('/departments', payload);
            } else if (dialogMode === 'edit') {
                await api.put(`/departments/${selectedDept.id}`, payload);
            }
            handleCloseDialog();
            fetchDepartments();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setError('Erreur lors de la sauvegarde du departement');
        }
    };

    const handleDeleteDepartment = async () => {
        try {
            await api.delete(`/departments/${selectedDept.id}`);
            handleCloseDialog();
            fetchDepartments();
        } catch (error) {
            console.error('Erreur suppression:', error);
            setError('Erreur lors de la suppression du departement');
        }
    };

    const handleToggleStatus = async (dept) => {
        const newStatus = dept.status === 'active' ? false : true;
        try {
            await api.put(`/departments/${dept.id}`, { actif: newStatus });
            fetchDepartments();
        } catch (error) {
            console.error('Erreur changement statut:', error);
            setError('Erreur lors du changement de statut');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Gestion des departements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredDepartments.length} departement(s) trouvé(s)
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
                        Ajouter un departement
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
                            <StyledTableCell>Departement</StyledTableCell>
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
                                        Aucun departement trouvé
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
                                            {dept.description || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{dept.responsable || '-'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={dept.nbStagiaires || 0}
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
                                                <Visibility sx={{ fontSize: 18, color: '#148aa0' }} />
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
                    {dialogMode === 'view' && 'Details du departement'}
                    {dialogMode === 'add' && 'Ajouter un departement'}
                    {dialogMode === 'edit' && 'Modifier le departement'}
                    {dialogMode === 'delete' && 'Supprimer le departement'}
                </DialogTitle>
                <DialogContent>
                    {dialogMode === 'delete' ? (
                        <Typography>
                            Etes-vous sûr de vouloir supprimer le departement{' '}
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
                                            {selectedDept.description || '-'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Responsable
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {selectedDept.responsable || '-'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Stagiaires
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {selectedDept.nbStagiaires || 0}
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
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                label="Nom du departement"
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
                                        checked={formData.status === 'active'}
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
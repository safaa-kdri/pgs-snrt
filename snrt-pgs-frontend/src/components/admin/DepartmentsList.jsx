// src/components/admin/DepartmentsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    Refresh,
    FilterList,
    CheckCircle,
    Block,
    Visibility,
    Archive,
    Restore,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../../services/api';
import DepartmentDetailPage from './DepartmentDetailPage';
import DepartmentEditPage from './DepartmentEditPage';
import DepartmentAddPage from './DepartmentAddPage'; // ✅ AJOUTER

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
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [dialogMode, setDialogMode] = useState('view');
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        responsableId: '',
        status: 'active',
    });

    // ✅ Détection des pages
    const isViewPage = location.pathname.startsWith('/admin/departments/view/');
    const isEditPage = location.pathname.startsWith('/admin/departments/edit/');
    const isAddPage = location.pathname === '/admin/departments/add';

    useEffect(() => {
        if (!isViewPage && !isEditPage && !isAddPage) {
            fetchDepartments();
        }
    }, [isViewPage, isEditPage, isAddPage]);

    useEffect(() => {
        filterDepartments();
    }, [departments, searchTerm, statusFilter]);

    // ✅ CHARGER DEPUIS L'API AVEC POPULATE
    const fetchDepartments = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/departments');
            
            console.log('📥 [DepartmentsList] Réponse API:', response.data);
            
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
                responsable: dept.responsableId?.nom || dept.responsable?.nom || dept.responsable || 'Non assigne',
                responsableId: dept.responsableId?._id || dept.responsableId || dept.responsable?._id || null,
                nbStagiaires: dept.nbStagiaires || 0,
                status: dept.actif !== undefined ? (dept.actif ? 'active' : 'inactive') : 'active',
                dateCreation: dept.createdAt || dept.dateCreation || new Date().toISOString(),
            }));
            
            console.log('📥 [DepartmentsList] Données formatées:', formattedData.length);
            
            setDepartments(formattedData);
            setFilteredDepartments(formattedData);
        } catch (error) {
            console.error('❌ Erreur chargement departements:', error);
            console.error('❌ Détails:', error.response?.data);
            setError(error.response?.data?.message || 'Erreur lors du chargement des departements');
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
                description: dept.description || '',
                responsableId: dept.responsableId || '',
                status: dept.status || 'active',
            });
        } else {
            setSelectedDept(null);
            setFormData({ 
                nom: '', 
                description: '', 
                responsableId: '', 
                status: 'active' 
            });
        }
        setDialogMode(mode);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedDept(null);
    };

    // ✅ SAUVEGARDER VERS L'API
    const handleSaveDepartment = async () => {
        try {
            const payload = {
                nom: formData.nom,
                description: formData.description,
                responsableId: formData.responsableId || undefined,
                actif: formData.status === 'active',
            };

            console.log('📤 [DepartmentsList] Payload:', payload);

            if (dialogMode === 'add') {
                await api.post('/departments', payload);
            } else if (dialogMode === 'edit') {
                await api.put(`/departments/${selectedDept.id}`, payload);
            }
            handleCloseDialog();
            fetchDepartments();
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            console.error('❌ Détails:', error.response?.data);
            setError(error.response?.data?.message || 'Erreur lors de la sauvegarde du departement');
        }
    };

    // ✅ ARCHIVER (Désactiver) - Garder la traçabilité
    const handleArchiveDepartment = async (dept) => {
        if (!window.confirm(`Voulez-vous vraiment archiver le departement "${dept.nom}" ?`)) return;
        try {
            await api.put(`/departments/${dept.id}`, { actif: false });
            setSuccess('Departement archive avec succes');
            fetchDepartments();
        } catch (error) {
            console.error('❌ Erreur archivage:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'archivage');
        }
    };

    // ✅ RESTAURER (Réactiver) - Pour les départements inactifs
    const handleRestoreDepartment = async (dept) => {
        if (!window.confirm(`Voulez-vous vraiment restaurer le departement "${dept.nom}" ?`)) return;
        try {
            await api.put(`/departments/${dept.id}`, { actif: true });
            setSuccess('Departement restaure avec succes');
            fetchDepartments();
        } catch (error) {
            console.error('❌ Erreur restauration:', error);
            setError(error.response?.data?.message || 'Erreur lors de la restauration');
        }
    };

    // ============================================
    // ✅ AFFICHAGE : PAGE DE DETAIL
    // ============================================
    if (isViewPage) {
        return <DepartmentDetailPage />;
    }

    // ============================================
    // ✅ AFFICHAGE : PAGE DE MODIFICATION
    // ============================================
    if (isEditPage) {
        return <DepartmentEditPage />;
    }

    // ============================================
    // ✅ AFFICHAGE : PAGE D'AJOUT
    // ============================================
    if (isAddPage) {
        return <DepartmentAddPage />;
    }

    // ============================================
    // AFFICHAGE : LISTE DES DEPARTEMENTS
    // ============================================
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
                            backgroundColor: '#2d3748',
                            borderRadius: '12px',
                            textTransform: 'none',
                            color: '#ffffff',
                            '&:hover': { backgroundColor: '#1a202c' },
                        }}
                        onClick={() => navigate('/admin/departments/add')}
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
            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>
                    {success}
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
                                    <CircularProgress size={40} sx={{ color: '#2d3748' }} />
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
                                                    backgroundColor: '#2d3748',
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
                                        <Typography variant="body2">
                                            {dept.responsable || '-'}
                                        </Typography>
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
                                                onClick={() => navigate(`/admin/departments/view/${dept.id}`)}
                                            >
                                                <Visibility sx={{ fontSize: 18, color: '#148aa0' }} />
                                            </IconButton>
                                        </Tooltip>
                                        
                                        <Tooltip title="Modifier">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/admin/departments/edit/${dept.id}`)}
                                            >
                                                <Edit sx={{ fontSize: 18, color: '#4f46e5' }} />
                                            </IconButton>
                                        </Tooltip>
                                        
                                        {dept.status === 'active' && (
                                            <Tooltip title="Archiver">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleArchiveDepartment(dept)}
                                                    sx={{ color: '#f59e0b' }}
                                                >
                                                    <Archive sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        
                                        {dept.status === 'inactive' && (
                                            <Tooltip title="Restaurer">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRestoreDepartment(dept)}
                                                    sx={{ color: '#22c55e' }}
                                                >
                                                    <Restore sx={{ fontSize: 18 }} />
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
        </Container>
    );
};

export default DepartmentsList;
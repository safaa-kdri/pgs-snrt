// src/components/department/EncadrantsList.jsx
// ✅ VERSION SANS BOUTON RÉINITIALISER

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
    Avatar,
    IconButton,
    Grid,
    CircularProgress,
    InputAdornment,
    Tooltip,
    Alert,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Search,
    Refresh,
    PersonAdd,
    Person,
    Email,
    Phone,
    Work,
    CheckCircle,
    Pending,
    Cancel,
    Visibility,
    Edit,
    Delete,
    ArrowBack,
    Group,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import EncadrantAddPage from './EncadrantAddPage';
import EncadrantEditPage from './EncadrantEditPage';

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
    fontSize: '13px',
});

const StatusChip = styled(Chip)(({ status }) => {
    const colors = {
        'actif': { bg: '#d1fae5', text: '#065f46' },
        'inactif': { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors['actif'];
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

const EncadrantsList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [encadrants, setEncadrants] = useState([]);
    const [filteredEncadrants, setFilteredEncadrants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Dialog states (gardés pour les actions de désactivation/activation)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedEncadrant, setSelectedEncadrant] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        cin: '',
        motDePasse: '',
        confirmMotDePasse: '',
        actif: true,
    });

    // ✅ Récupérer l'ID du rôle "Encadrant"
    const [encadrantRoleId, setEncadrantRoleId] = useState(null);

    // ✅ Détection des pages
    const isAddPage = location.pathname === '/department/encadrants/add';
    const isEditPage = location.pathname.startsWith('/department/encadrants/edit/');

    useEffect(() => {
        if (!isAddPage && !isEditPage) {
            fetchEncadrants();
            fetchEncadrantRoleId();
        }
    }, [isAddPage, isEditPage]);

    useEffect(() => {
        filterEncadrants();
    }, [encadrants, searchTerm]);

    // ============================================
    // CHARGEMENT DES DONNÉES - API RÉELLE
    // ============================================

    // ✅ Récupérer l'ID du rôle "Encadrant" dynamiquement
    const fetchEncadrantRoleId = async () => {
        try {
            const response = await api.get('/roles');
            const roles = response.data?.data || response.data || [];
            const encadrantRole = roles.find(r => r.nom === 'Encadrant');
            if (encadrantRole) {
                setEncadrantRoleId(encadrantRole._id || encadrantRole.id);
            } else {
                console.warn('⚠️ Rôle "Encadrant" non trouvé dans la liste des rôles');
            }
        } catch (error) {
            console.error('❌ Erreur chargement rôle Encadrant:', error);
        }
    };

    // ✅ MODIFIÉ : Récupérer les encadrants du département
    const fetchEncadrants = async () => {
        setLoading(true);
        setError('');
        try {
            // ✅ Récupérer les encadrants du département
            const response = await api.get('/users', {
                params: { 
                    type: 'interne',
                    role: 'Encadrant',
                    departementId: user?.departementId 
                }
            });
            
            let data = response.data?.data || response.data || [];
            
            // Si la réponse est un objet avec une propriété contenant le tableau
            if (!Array.isArray(data)) {
                for (const key in data) {
                    if (Array.isArray(data[key])) {
                        data = data[key];
                        break;
                    }
                }
            }

            // Formater les données
            const formattedData = data.map(enc => ({
                _id: enc._id || enc.id,
                nom: enc.nom || '',
                prenom: enc.prenom || '',
                email: enc.email || '',
                telephone: enc.telephone || 'Non renseigné',
                cin: enc.cin || '',
                actif: enc.actif !== undefined ? enc.actif : true,
                stagesEncours: enc.stagesEncours || 0,
            }));

            setEncadrants(formattedData);
            setFilteredEncadrants(formattedData);

        } catch (error) {
            console.error('❌ Erreur chargement encadrants:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
            setEncadrants([]);
            setFilteredEncadrants([]);
        } finally {
            setLoading(false);
        }
    };

    const filterEncadrants = () => {
        let filtered = [...encadrants];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (e) =>
                    (e.nom || '').toLowerCase().includes(term) ||
                    (e.prenom || '').toLowerCase().includes(term) ||
                    (e.email || '').toLowerCase().includes(term)
            );
        }
        setFilteredEncadrants(filtered);
    };

    // ============================================
    // GESTION DES ACTIONS
    // ============================================

    const getInitials = (nom, prenom) => {
        if (!nom && !prenom) return '?';
        return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase() || '?';
    };

    const handleOpenDelete = (encadrant) => {
        setSelectedEncadrant(encadrant);
        setOpenDeleteDialog(true);
    };

    const handleCloseDelete = () => {
        setOpenDeleteDialog(false);
        setSelectedEncadrant(null);
    };

    // ============================================
    // SUPPRIMER UN ENCADRANT
    // ============================================
    const handleDeleteEncadrant = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/users/internal/${selectedEncadrant._id}`);
            setSuccess('✅ Encadrant supprimé avec succès');
            setOpenDeleteDialog(false);
            fetchEncadrants();
        } catch (error) {
            console.error('❌ Erreur suppression:', error);
            setError(error.response?.data?.message || 'Erreur lors de la suppression');
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================
    // CHANGER LE STATUT
    // ============================================
    const handleToggleStatus = async (encadrant) => {
        const newStatus = encadrant.actif ? false : true;
        try {
            await api.patch(`/users/internal/${encadrant._id}/status`, { actif: newStatus });
            fetchEncadrants();
            setSuccess(newStatus ? '✅ Encadrant activé' : '✅ Encadrant désactivé');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('❌ Erreur changement statut:', error);
            setError(error.response?.data?.message || 'Erreur lors du changement de statut');
        }
    };

    // ============================================
    // ✅ AFFICHAGE : PAGE D'AJOUT
    // ============================================
    if (isAddPage) {
        return <EncadrantAddPage />;
    }

    // ============================================
    // ✅ AFFICHAGE : PAGE DE MODIFICATION
    // ============================================
    if (isEditPage) {
        return <EncadrantEditPage />;
    }

    // ============================================
    // RENDER : LISTE DES ENCADRANTS
    // ============================================

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={44} sx={{ color: '#2d3748' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Encadrants du département
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredEncadrants.length} encadrant(s) trouvé(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={() => navigate('/department/encadrants/add')}
                        sx={{
                            backgroundColor: '#2d3748',
                            borderRadius: '12px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#1a202c' },
                        }}
                    >
                        Ajouter un encadrant
                    </Button>
                </Box>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

            {/* ========================================== */}
            {/* ✅ FILTRES - UNIQUEMENT RECHERCHE */}
            {/* ========================================== */}
            <FiltersContainer>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                        <TextField
                            placeholder="Rechercher par nom, prénom, email..."
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
                            <StyledTableCell>Encadrant</StyledTableCell>
                            <StyledTableCell>Email</StyledTableCell>
                            <StyledTableCell>Téléphone</StyledTableCell>
                            <StyledTableCell>CIN</StyledTableCell>
                            <StyledTableCell>Stages en cours</StyledTableCell>
                            <StyledTableCell>Statut</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEncadrants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {searchTerm ? 'Aucun encadrant ne correspond à votre recherche' : 'Aucun encadrant trouvé'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEncadrants.map((enc) => (
                                <TableRow key={enc._id || enc.id} hover>
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
                                                {getInitials(enc.nom, enc.prenom)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {enc.prenom} {enc.nom}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{enc.email}</TableCell>
                                    <TableCell>{enc.telephone || '-'}</TableCell>
                                    <TableCell>{enc.cin || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={enc.stagesEncours || 0}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#dbeafe',
                                                color: '#1d4ed8',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={enc.actif ? 'Actif' : 'Inactif'}
                                            status={enc.actif ? 'actif' : 'inactif'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Modifier">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/department/encadrants/edit/${enc._id}`)}
                                                sx={{ color: '#4f46e5' }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={enc.actif ? 'Désactiver' : 'Activer'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleStatus(enc)}
                                                sx={{ color: enc.actif ? '#f59e0b' : '#22c55e' }}
                                            >
                                                {enc.actif ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ===== DIALOG SUPPRESSION (gardé pour la suppression) ===== */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDelete}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', padding: '8px' },
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Delete sx={{ color: '#ef4444' }} />
                    Supprimer l'encadrant
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Êtes-vous sûr de vouloir supprimer l'encadrant{' '}
                        <strong>{selectedEncadrant?.prenom} {selectedEncadrant?.nom}</strong> ?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Cette action est irréversible. Tous les stages associés à cet encadrant devront être réaffectés.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleCloseDelete} sx={{ borderRadius: '10px', textTransform: 'none' }}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDeleteEncadrant}
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
            <Box sx={{ mt: 3 }}>
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

export default EncadrantsList;
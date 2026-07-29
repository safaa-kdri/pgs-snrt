// src/components/admin/UsersList.jsx
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
    Avatar,
    IconButton,
    MenuItem,
    Grid,
    Alert,
    CircularProgress,
    InputAdornment,
    Tooltip,
    Switch,
    FormControlLabel,
    Divider,
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Delete,
    Block,
    CheckCircle,
    PersonAdd,
    FilterList,
    Refresh,
    Visibility,
    ArrowBack,
    Save,
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
        pending: { bg: '#fef3c7', text: '#d97706' },
        blocked: { bg: '#fef3c7', text: '#d97706' },
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

const FormCard = styled(Paper)({
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    border: '1px solid #e8edf0',
});

const BackButton = styled(Button)({
    borderRadius: '10px',
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    color: '#148aa0',
    '&:hover': {
        backgroundColor: 'rgba(20, 138, 160, 0.05)',
    },
});

const SubmitButton = styled(Button)({
    borderRadius: '10px',
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    padding: '10px 32px',
    backgroundColor: '#148aa0',
    color: '#fff',
    '&:hover': { backgroundColor: '#0b7890' },
    '&:disabled': { backgroundColor: '#a0c4cd' },
});

const CancelButton = styled(Button)({
    borderRadius: '10px',
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    padding: '10px 32px',
    borderColor: '#d1d5db',
    color: '#6b7280',
    '&:hover': { borderColor: '#9ca3af' },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const UsersList = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState('add');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserType, setSelectedUserType] = useState('interne');

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        cin: '',
        telephone: '',
        role: '',
        motDePasse: '',
        confirmMotDePasse: '',
        actif: true,
        type: 'interne',
    });

    const roles = ['Administrateur', 'RH', 'Departement', 'Encadrant', 'Etudiant'];

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter, statusFilter]);

    // ✅ CHARGER LES UTILISATEURS - ADAPTÉ À LA STRUCTURE DU BACKEND
    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/users');
            console.log('🔍 [UsersList] Response:', response.data);

            let allUsers = [];

            // ✅ Adapter à la structure du backend
            if (response.data?.success && response.data?.data) {
                const data = response.data.data;
                
                // Si data a des internes et externes
                if (data.internes && data.externes) {
                    allUsers = [...data.internes, ...data.externes];
                } 
                // Si data est un tableau direct
                else if (Array.isArray(data)) {
                    allUsers = data;
                } 
                // Si data est un objet unique
                else {
                    allUsers = [data];
                }
            } else if (Array.isArray(response.data)) {
                allUsers = response.data;
            }

            console.log('🔍 [UsersList] Utilisateurs extraits:', allUsers.length);

            if (!allUsers || allUsers.length === 0) {
                setUsers([]);
                setFilteredUsers([]);
                setError('Aucun utilisateur trouvé dans la base de données');
                setLoading(false);
                return;
            }

            const formattedData = allUsers.map(user => ({
                id: user._id || user.id,
                nom: user.nom || '',
                prenom: user.prenom || '',
                email: user.email || '',
                cin: user.cin || '',
                telephone: user.telephone || 'Non renseigné',
                role: user.roleId?.nom || user.role || user.userType || 'Etudiant',
                userType: user.userType || (user.roleId ? 'interne' : 'externe'),
                status: user.actif !== undefined ? (user.actif ? 'active' : 'inactive') : 'active',
                dateInscription: user.createdAt || user.dateInscription || new Date().toISOString(),
            }));

            setUsers(formattedData);
            setFilteredUsers(formattedData);
        } catch (error) {
            console.error('❌ Erreur chargement utilisateurs:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
            setUsers([]);
            setFilteredUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = [...users];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (u) =>
                    (u.nom || '').toLowerCase().includes(term) ||
                    (u.prenom || '').toLowerCase().includes(term) ||
                    (u.email || '').toLowerCase().includes(term)
            );
        }
        if (roleFilter !== 'all') {
            filtered = filtered.filter((u) => u.role === roleFilter);
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter((u) => u.status === statusFilter);
        }
        setFilteredUsers(filtered);
    };

    const getRoleColor = (role) => {
        const colors = {
            Administrateur: '#4f46e5',
            RH: '#8b5cf6',
            Departement: '#f59e0b',
            Encadrant: '#22c55e',
            Etudiant: '#148aa0',
        };
        return colors[role] || '#999';
    };

    const getInitials = (nom, prenom) => {
        if (!nom || !prenom) return '?';
        return `${prenom[0]}${nom[0]}`.toUpperCase();
    };

    const openForm = (mode, user = null) => {
        setFormMode(mode);
        setError('');
        setSuccess('');
        if (user) {
            setSelectedUserId(user.id);
            setSelectedUserType(user.userType || 'interne');
            setFormData({
                nom: user.nom || '',
                prenom: user.prenom || '',
                email: user.email || '',
                cin: user.cin || '',
                telephone: user.telephone || '',
                role: user.role || '',
                motDePasse: '',
                confirmMotDePasse: '',
                actif: user.status === 'active',
                type: user.userType || 'interne',
            });
        } else {
            setSelectedUserId(null);
            setSelectedUserType('interne');
            setFormData({
                nom: '',
                prenom: '',
                email: '',
                cin: '',
                telephone: '',
                role: '',
                motDePasse: '',
                confirmMotDePasse: '',
                actif: true,
                type: 'interne',
            });
        }
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setSelectedUserId(null);
        setError('');
        setSuccess('');
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // ✅ AJOUTER/MODIFIER UTILISATEUR
    const handleSubmitForm = async () => {
        setError('');
        setSuccess('');

        if (!formData.nom || !formData.prenom || !formData.email || !formData.cin || !formData.role) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (formMode === 'add' && (!formData.motDePasse || formData.motDePasse.length < 8)) {
            setError('Le mot de passe doit contenir au moins 8 caracteres');
            return;
        }

        if (formData.motDePasse && formData.motDePasse !== formData.confirmMotDePasse) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            const payload = {
                nom: formData.nom,
                prenom: formData.prenom,
                email: formData.email,
                cin: formData.cin,
                telephone: formData.telephone,
                role: formData.role,
                actif: formData.actif,
            };

            if (formData.motDePasse) {
                payload.motDePasse = formData.motDePasse;
            }

            let endpoint = '';
            if (formMode === 'edit') {
                const type = selectedUserType || 'interne';
                endpoint = `/users/${type}/${selectedUserId}`;
                await api.put(endpoint, payload);
                setSuccess('Utilisateur modifié avec succès');
            } else {
                const type = formData.type || 'interne';
                endpoint = `/users/${type}`;
                await api.post(endpoint, payload);
                setSuccess('Utilisateur ajouté avec succès');
            }

            setTimeout(() => {
                closeForm();
                fetchUsers();
            }, 1500);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    // ✅ SUPPRIMER UTILISATEUR
    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Supprimer ${user.prenom} ${user.nom} ?`)) return;
        try {
            const type = user.userType || 'interne';
            await api.delete(`/users/${type}/${user.id}`);
            fetchUsers();
        } catch (error) {
            setError('Erreur lors de la suppression');
        }
    };

    // ✅ CHANGER STATUT
    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? false : true;
        try {
            const type = user.userType || 'interne';
            await api.patch(`/users/${type}/${user.id}/status`, { actif: newStatus });
            fetchUsers();
        } catch (error) {
            setError('Erreur lors du changement de statut');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        Gestion des utilisateurs
                    </Typography>
                    
                </Box>
                {!showForm && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={fetchUsers}
                            disabled={loading}
                            sx={{ borderRadius: '12px', textTransform: 'none' }}
                        >
                            Rafraîchir
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<PersonAdd />}
                            sx={{
                                backgroundColor: '#148aa0',
                                borderRadius: '12px',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#0b7890' },
                            }}
                            onClick={() => openForm('add')}
                        >
                            Ajouter un utilisateur
                        </Button>
                    </Box>
                )}
            </PageHeader>

            {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>
                    {success}
                </Alert>
            )}

            {showForm ? (
                <FormCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <BackButton startIcon={<ArrowBack />} onClick={closeForm}>
                            Retour
                        </BackButton>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {formMode === 'add' && 'Ajouter un utilisateur'}
                            {formMode === 'edit' && 'Modifier un utilisateur'}
                            {formMode === 'view' && 'Détails de l\'utilisateur'}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Nom *"
                                name="nom"
                                value={formData.nom}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                disabled={formMode === 'view'}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Prénom *"
                                name="prenom"
                                value={formData.prenom}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                disabled={formMode === 'view'}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email *"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                disabled={formMode === 'view'}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="CIN *"
                                name="cin"
                                value={formData.cin}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                disabled={formMode === 'view'}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Téléphone"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleFormChange}
                                fullWidth
                                disabled={formMode === 'view'}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Rôle *"
                                name="role"
                                value={formData.role}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                disabled={formMode === 'view'}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            >
                                <MenuItem value="">Sélectionner un rôle</MenuItem>
                                {roles.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {role}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Type d'utilisateur"
                                name="type"
                                value={formData.type}
                                onChange={handleFormChange}
                                fullWidth
                                disabled={formMode === 'edit' || formMode === 'view'}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            >
                                <MenuItem value="interne">Interne</MenuItem>
                                <MenuItem value="externe">Externe</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label={formMode === 'add' ? 'Mot de passe *' : 'Nouveau mot de passe'}
                                name="motDePasse"
                                type="password"
                                value={formData.motDePasse}
                                onChange={handleFormChange}
                                fullWidth
                                disabled={formMode === 'view'}
                                helperText={formMode === 'edit' ? 'Laisser vide pour ne pas modifier' : 'Minimum 8 caractères'}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.actif}
                                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                                        disabled={formMode === 'view'}
                                    />
                                }
                                label={formData.actif ? 'Compte actif' : 'Compte inactif'}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                        <CancelButton variant="outlined" onClick={closeForm}>
                            Annuler
                        </CancelButton>
                        {formMode !== 'view' && (
                            <SubmitButton onClick={handleSubmitForm}>
                                <Save sx={{ mr: 1 }} />
                                {formMode === 'add' ? 'Ajouter' : 'Enregistrer'}
                            </SubmitButton>
                        )}
                    </Box>
                </FormCard>
            ) : (
                <>
                    {/* FILTRES */}
                    <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4}>
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
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    select
                                    label="Rôle"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                                    }}
                                >
                                    <MenuItem value="all">Tous les rôles</MenuItem>
                                    {roles.map((role) => (
                                        <MenuItem key={role} value={role}>
                                            {role}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    select
                                    label="Statut"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    size="small"
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: '10px' },
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
                                        setRoleFilter('all');
                                        setStatusFilter('all');
                                    }}
                                    sx={{
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        borderColor: '#ddd',
                                        color: '#666',
                                    }}
                                >
                                    Réinitialiser
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* TABLEAU */}
                    <TableContainer
                        component={Paper}
                        sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                                    <StyledTableCell>Utilisateur</StyledTableCell>
                                    <StyledTableCell>Email</StyledTableCell>
                                    <StyledTableCell>Rôle</StyledTableCell>
                                    <StyledTableCell>Statut</StyledTableCell>
                                    <StyledTableCell>Inscription</StyledTableCell>
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
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                Aucun utilisateur trouvé
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            backgroundColor: getRoleColor(user.role),
                                                            width: 36,
                                                            height: 36,
                                                            fontSize: 14,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {getInitials(user.nom, user.prenom)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {user.prenom} {user.nom}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: getRoleColor(user.role) + '20',
                                                        color: getRoleColor(user.role),
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip
                                                    label={user.status === 'active' ? 'Actif' : 'Inactif'}
                                                    status={user.status}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(user.dateInscription).toLocaleDateString('fr-FR')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Voir">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openForm('view', user)}
                                                    >
                                                        <Visibility sx={{ fontSize: 18, color: '#148aa0' }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Modifier">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openForm('edit', user)}
                                                    >
                                                        <Edit sx={{ fontSize: 18, color: '#4f46e5' }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={user.status === 'active' ? 'Désactiver' : 'Activer'}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleToggleStatus(user)}
                                                    >
                                                        {user.status === 'active' ? (
                                                            <Block sx={{ fontSize: 18, color: '#f59e0b' }} />
                                                        ) : (
                                                            <CheckCircle sx={{ fontSize: 18, color: '#22c55e' }} />
                                                        )}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Supprimer">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteUser(user)}
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
                </>
            )}
        </Container>
    );
};

export default UsersList;
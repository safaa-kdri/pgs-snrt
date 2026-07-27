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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    InputAdornment,
    Tooltip,
    Switch,
    FormControlLabel,
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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../hooks/useAuth';
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

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const UsersList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogMode, setDialogMode] = useState('view'); // view, edit, delete

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Simulation de données (à remplacer par l'appel API réel)
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockUsers = [
                {
                    id: '1',
                    nom: 'EL KADOURI',
                    prenom: 'Safaa',
                    email: 'admin@snrt.ma',
                    role: 'Administrateur',
                    status: 'active',
                    dateInscription: '2026-01-15',
                    telephone: '0600000000',
                },
                {
                    id: '2',
                    nom: 'BENNANI',
                    prenom: 'Karim',
                    email: 'rh@snrt.ma',
                    role: 'RH',
                    status: 'active',
                    dateInscription: '2026-01-20',
                    telephone: '0612345678',
                },
                {
                    id: '3',
                    nom: 'ALAOUI',
                    prenom: 'Fatima',
                    email: 'departement@snrt.ma',
                    role: 'Departement',
                    status: 'active',
                    dateInscription: '2026-02-01',
                    telephone: '0687654321',
                },
                {
                    id: '4',
                    nom: 'EL HASSANI',
                    prenom: 'Youssef',
                    email: 'etudiant@test.ma',
                    role: 'Etudiant',
                    status: 'active',
                    dateInscription: '2026-03-10',
                    telephone: '0612345987',
                },
                {
                    id: '5',
                    nom: 'CHERKAOUI',
                    prenom: 'Mohamed',
                    email: 'encadrant@snrt.ma',
                    role: 'Encadrant',
                    status: 'inactive',
                    dateInscription: '2026-02-15',
                    telephone: '0654321876',
                },
            ];

            setUsers(mockUsers);
            setFilteredUsers(mockUsers);

        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
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
                    u.nom.toLowerCase().includes(term) ||
                    u.prenom.toLowerCase().includes(term) ||
                    u.email.toLowerCase().includes(term)
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
        return `${prenom[0]}${nom[0]}`.toUpperCase();
    };

    const handleOpenDialog = (user, mode) => {
        setSelectedUser(user);
        setDialogMode(mode);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = () => {
        // TODO: Appel API DELETE /users/:id
        console.log('🗑️ Suppression utilisateur:', selectedUser?.id);
        setUsers(users.filter((u) => u.id !== selectedUser?.id));
        handleCloseDialog();
    };

    const handleToggleStatus = (user) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        // TODO: Appel API PUT /users/:id/status
        console.log('🔄 Changement statut:', user.id, '→', newStatus);
        setUsers(
            users.map((u) =>
                u.id === user.id ? { ...u, status: newStatus } : u
            )
        );
    };

    const roles = ['Administrateur', 'RH', 'Departement', 'Encadrant', 'Etudiant'];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        👥 Gestion des utilisateurs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredUsers.length} utilisateur(s) trouvé(s)
                    </Typography>
                </Box>
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
                        onClick={() => navigate('/admin/users/create')}
                    >
                        Ajouter un utilisateur
                    </Button>
                </Box>
            </PageHeader>

            {/* ===== FILTRES ===== */}
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
                            <MenuItem value="blocked">Bloqué</MenuItem>
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

            {/* ===== TABLEAU ===== */}
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
                                    <TableCell>
                                        <Typography variant="body2">{user.email}</Typography>
                                    </TableCell>
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
                                                onClick={() => handleOpenDialog(user, 'view')}
                                            >
                                                👁️
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Modifier">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(user, 'edit')}
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
                                                onClick={() => handleOpenDialog(user, 'delete')}
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
                    {dialogMode === 'view' && '👤 Détails utilisateur'}
                    {dialogMode === 'edit' && '✏️ Modifier utilisateur'}
                    {dialogMode === 'delete' && '🗑️ Supprimer utilisateur'}
                </DialogTitle>
                <DialogContent>
                    {dialogMode === 'delete' ? (
                        <Typography>
                            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
                            <strong>{selectedUser?.prenom} {selectedUser?.nom}</strong> ?
                            Cette action est irréversible.
                        </Typography>
                    ) : (
                        selectedUser && (
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Nom
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {selectedUser.nom}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Prénom
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {selectedUser.prenom}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {selectedUser.email}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Rôle
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {selectedUser.role}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Statut
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {selectedUser.status === 'active' ? 'Actif' : 'Inactif'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        Téléphone
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {selectedUser.telephone || 'Non renseigné'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        Date d'inscription
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {new Date(selectedUser.dateInscription).toLocaleDateString(
                                            'fr-FR',
                                            {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric',
                                            }
                                        )}
                                    </Typography>
                                </Grid>
                            </Grid>
                        )
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
                            onClick={handleDeleteUser}
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
                    {dialogMode === 'edit' && (
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: '#148aa0',
                                borderRadius: '10px',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#0b7890' },
                            }}
                        >
                            Enregistrer
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UsersList;
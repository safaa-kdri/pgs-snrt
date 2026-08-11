// src/components/admin/UsersList.jsx
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
    MenuItem,
    Grid,
    Alert,
    CircularProgress,
    InputAdornment,
    Tooltip,
    Switch,
    FormControlLabel,
    Divider,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Search,
    Add,
    Edit,
    Delete,
    Block,
    CheckCircle,
    PersonAdd,
    Refresh,
    Visibility,
    ArrowBack,
    Save,
    AdminPanelSettings as AdminIcon,
    People as PeopleIcon,
    Business as BusinessIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    SupervisorAccount as SupervisorIcon,
    Group as GroupIcon,
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

const TitleContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    marginBottom: '24px',
});

const TitleIcon = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
    '& svg': {
        fontSize: '75px',
        color: '#000000',
    },
});

const TitleText = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

const TitleMain = styled(Typography)({
    fontWeight: 700,
    fontSize: '28px',
    color: '#1a2332',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '-0.5px',
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
    color: '#000000',
    borderColor: '#000000',
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderColor: '#000000',
    },
});

const SubmitButton = styled(Button)({
    borderRadius: '10px',
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    padding: '10px 32px',
    backgroundColor: '#000000',
    color: '#ffffff',
    '&:hover': { backgroundColor: '#333333' },
    '&:disabled': { backgroundColor: '#999999' },
});

const CancelButton = styled(Button)({
    borderRadius: '10px',
    textTransform: 'none',
    fontFamily: 'Inter, sans-serif',
    padding: '10px 32px',
    borderColor: '#000000',
    color: '#000000',
    '&:hover': { 
        borderColor: '#333333',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
});

// CONFIGURATION DES RÔLES
const roleConfig = {
    'all': { 
        icon: <GroupIcon />, 
        color: '#148aa0', 
        label: 'Tous les utilisateurs', 
    },
    'Administrateur': { 
        icon: <AdminIcon />, 
        color: '#4f46e5', 
        label: 'Administrateurs', 
    },
    'RH': { 
        icon: <PeopleIcon />, 
        color: '#8b5cf6', 
        label: 'RH', 
    },
    'Departement': { 
        icon: <BusinessIcon />, 
        color: '#f59e0b', 
        label: 'Départements', 
    },
    'Encadrant': { 
        icon: <SupervisorIcon />, 
        color: '#22c55e', 
        label: 'Encadrants', 
    },
    'Etudiant': { 
        icon: <SchoolIcon />, 
        color: '#148aa0', 
        label: 'Étudiants', 
    },
};

// MAPPING RÔLE → TYPE
const ROLE_TO_TYPE = {
    'Administrateur': 'interne',
    'RH': 'interne',
    'Departement': 'interne',
    'Encadrant': 'interne',
    'Etudiant': 'externe',
};

// RÔLES DISPONIBLES
const ALL_ROLES = ['Administrateur', 'RH', 'Departement', 'Encadrant', 'Etudiant'];
const INTERNAL_ROLES = ['Administrateur', 'RH', 'Departement', 'Encadrant'];

// MIN PASSWORD LENGTH PAR TYPE
const PASSWORD_MIN_LENGTH = {
    'externe': 16,
    'interne': 20,
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const UsersList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const roleFilter = queryParams.get('role') || 'all';

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState('add');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserType, setSelectedUserType] = useState('interne');

    const isFilteredByRole = roleFilter !== 'all';
    const isEtudiantFilter = roleFilter === 'Etudiant';
    const isInternalFilter = isFilteredByRole && roleFilter !== 'Etudiant';

    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

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
        universite: '',
        filiere: '',
        niveau: '',
        annee: '',
        civilite: 'Mr',
        dateNaissance: '2000-01-01',
        adresse: 'Non renseignée',
        ville: 'Non renseignée',
        pays: 'Maroc',
        departementId: '',
        departementNom: '',
    });

    const getPasswordMinLength = () => {
        if (isEtudiantFilter || formData.type === 'externe') {
            return PASSWORD_MIN_LENGTH.externe;
        }
        return PASSWORD_MIN_LENGTH.interne;
    };

    useEffect(() => {
        if (showForm) {
            setShowForm(false);
            setError('');
            setSuccess('');
        }
    }, [location.pathname, location.search]);

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter, statusFilter]);

    const getRoleConfig = (role) => {
        return roleConfig[role] || roleConfig['all'];
    };

    const fetchDepartments = async () => {
        setLoadingDepartments(true);
        try {
            const response = await api.get('/departments');
            console.log('📥 Départements reçus:', response.data);
            
            let data = [];
            if (response.data?.success && response.data?.data) {
                data = response.data.data;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                data = response.data.data;
            }
            
            const validDepartments = data.filter(dept => dept._id || dept.id);
            console.log('📌 Départements valides:', validDepartments.map(d => ({ 
                nom: d.nom, 
                id: d._id || d.id 
            })));
            
            setDepartments(validDepartments);
        } catch (error) {
            console.error('❌ Erreur chargement départements:', error);
            setError('Erreur lors du chargement des départements');
        } finally {
            setLoadingDepartments(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/users');
            console.log('📥 Utilisateurs reçus:', response.data);

            let allUsers = [];

            if (response.data?.success && response.data?.data) {
                const data = response.data.data;
                if (Array.isArray(data)) {
                    allUsers = data;
                } else {
                    allUsers = [data];
                }
            } else if (Array.isArray(response.data)) {
                allUsers = response.data;
            }

            if (!allUsers || allUsers.length === 0) {
                setUsers([]);
                setFilteredUsers([]);
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
                role: user.role || user.roleId?.nom || 'Etudiant',
                userType: user.userType || (user.roleId ? 'interne' : 'externe'),
                status: user.actif !== undefined ? (user.actif ? 'active' : 'inactive') : 'active',
                dateInscription: user.createdAt || user.dateInscription || new Date().toISOString(),
                departementId: user.departementId?._id || user.departementId || null,
                departementNom: user.departementId?.nom || null,
                universite: user.universite || '',
                filiere: user.filiere || '',
                niveau: user.niveau || '',
                annee: user.annee || '',
                civilite: user.civilite || 'Mr',
                dateNaissance: user.dateNaissance || '2000-01-01',
                adresse: user.adresse || 'Non renseignée',
                ville: user.ville || 'Non renseignée',
                pays: user.pays || 'Maroc',
            }));

            setUsers(formattedData);
            setFilteredUsers(formattedData);
        } catch (error) {
            console.error('❌ Erreur chargement:', error);
            setError(error.response?.data?.message || 'Erreur de chargement');
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

    const getRoleIcon = (role) => {
        const icons = {
            Administrateur: <AdminIcon sx={{ fontSize: 18 }} />,
            RH: <PeopleIcon sx={{ fontSize: 18 }} />,
            Departement: <BusinessIcon sx={{ fontSize: 18 }} />,
            Encadrant: <SupervisorIcon sx={{ fontSize: 18 }} />,
            Etudiant: <SchoolIcon sx={{ fontSize: 18 }} />,
        };
        return icons[role] || <PersonIcon sx={{ fontSize: 18 }} />;
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
                universite: user.universite || '',
                filiere: user.filiere || '',
                niveau: user.niveau || '',
                annee: user.annee || '',
                civilite: user.civilite || 'Mr',
                dateNaissance: user.dateNaissance || '2000-01-01',
                adresse: user.adresse || 'Non renseignée',
                ville: user.ville || 'Non renseignée',
                pays: user.pays || 'Maroc',
                departementId: user.departementId || '',
                departementNom: user.departementNom || '',
            });
        } else {
            setSelectedUserId(null);
            
            if (isEtudiantFilter) {
                setFormData({
                    nom: '',
                    prenom: '',
                    email: '',
                    cin: '',
                    telephone: '',
                    role: 'Etudiant',
                    motDePasse: '',
                    confirmMotDePasse: '',
                    actif: true,
                    type: 'externe',
                    universite: '',
                    filiere: '',
                    niveau: '',
                    annee: '',
                    civilite: 'Mr',
                    dateNaissance: '2000-01-01',
                    adresse: 'Non renseignée',
                    ville: 'Non renseignée',
                    pays: 'Maroc',
                    departementId: '',
                    departementNom: '',
                });
                setSelectedUserType('externe');
            } else if (isFilteredByRole) {
                const type = ROLE_TO_TYPE[roleFilter] || 'interne';
                setFormData({
                    nom: '',
                    prenom: '',
                    email: '',
                    cin: '',
                    telephone: '',
                    role: roleFilter,
                    motDePasse: '',
                    confirmMotDePasse: '',
                    actif: true,
                    type: type,
                    universite: '',
                    filiere: '',
                    niveau: '',
                    annee: '',
                    civilite: 'Mr',
                    dateNaissance: '2000-01-01',
                    adresse: 'Non renseignée',
                    ville: 'Non renseignée',
                    pays: 'Maroc',
                    departementId: '',
                    departementNom: '',
                });
                setSelectedUserType(type);
            } else {
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
                    universite: '',
                    filiere: '',
                    niveau: '',
                    annee: '',
                    civilite: 'Mr',
                    dateNaissance: '2000-01-01',
                    adresse: 'Non renseignée',
                    ville: 'Non renseignée',
                    pays: 'Maroc',
                    departementId: '',
                    departementNom: '',
                });
                setSelectedUserType('interne');
            }
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

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        let newRole = formData.role;
        
        if (newType === 'externe') {
            newRole = 'Etudiant';
        } else if (newType === 'interne' && formData.role === 'Etudiant') {
            newRole = '';
        }
        
        setFormData({ 
            ...formData, 
            type: newType,
            role: newRole
        });
    };

    const isRoleDisabled = () => {
        if (isFilteredByRole) return true;
        if (formMode === 'edit' || formMode === 'view') return true;
        return false;
    };

    const isTypeDisabled = () => {
        if (isFilteredByRole) return true;
        if (formMode === 'edit' || formMode === 'view') return true;
        return false;
    };

    const handleSubmitForm = async () => {
        setError('');
        setSuccess('');

        // Validation des champs obligatoires
        if (!formData.nom || !formData.prenom || !formData.email || !formData.cin || !formData.role) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        // Validation du département pour les utilisateurs internes
        if (formData.type === 'interne') {
            if (!formData.departementId || formData.departementId === '') {
                setError('Veuillez sélectionner un département pour les utilisateurs internes');
                return;
            }
            
            // Vérifier que le département existe dans la liste
            const selectedDept = departments.find(d => 
                (d._id || d.id) === formData.departementId
            );
            if (!selectedDept) {
                setError('Le département sélectionné n\'existe pas');
                return;
            }
            
            // ✅ Récupérer le NOM du département pour l'envoyer au backend
            setFormData(prev => ({
                ...prev,
                departementNom: selectedDept.nom
            }));
        }

        const minLength = getPasswordMinLength();
        if (formMode === 'add') {
            if (!formData.motDePasse || formData.motDePasse.length < minLength) {
                setError(`Le mot de passe doit contenir au moins ${minLength} caractères`);
                return;
            }
            const password = formData.motDePasse;
            const errors = [];
            if (!/[A-Z]/.test(password)) errors.push('une majuscule');
            if (!/[a-z]/.test(password)) errors.push('une minuscule');
            if (!/[0-9]/.test(password)) errors.push('un chiffre');
            if (!/[^A-Za-z0-9]/.test(password)) errors.push('un caractère spécial');
            if (errors.length > 0) {
                setError(`Le mot de passe doit contenir : ${errors.join(', ')}`);
                return;
            }
        }

        if (formData.motDePasse && formData.motDePasse !== formData.confirmMotDePasse) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            let payload = {};

            if (formData.type === 'externe' || formData.role === 'Etudiant') {
                payload = {
                    nom: formData.nom,
                    prenom: formData.prenom,
                    email: formData.email,
                    cin: formData.cin,
                    telephone: formData.telephone || '0612345678',
                    civilite: formData.civilite || 'Mr',
                    dateNaissance: formData.dateNaissance || '2000-01-01',
                    adresse: formData.adresse || 'Non renseignée',
                    ville: formData.ville || 'Non renseignée',
                    pays: formData.pays || 'Maroc',
                    universite: formData.universite || '',
                    filiere: formData.filiere || '',
                    niveau: formData.niveau || '',
                    annee: formData.annee || '',
                    motDePasse: formData.motDePasse,
                    actif: formData.actif,
                };
            } else {
                // 🔥 Utilisateur interne - Envoyer le NOM du département, pas l'ID
                const selectedDept = departments.find(d => 
                    (d._id || d.id) === formData.departementId
                );
                
                payload = {
                    nom: formData.nom,
                    prenom: formData.prenom,
                    email: formData.email,
                    cin: formData.cin,
                    telephone: formData.telephone || '0612345678',
                    role: formData.role,
                    motDePasse: formData.motDePasse,
                    actif: formData.actif,
                    departementNom: selectedDept ? selectedDept.nom : formData.departementNom,
                };
            }

            console.log('📤 [UsersList] Payload envoyé:', JSON.stringify(payload, null, 2));

            let endpoint = '';
            if (formMode === 'edit') {
                const type = selectedUserType || 'interne';
                endpoint = `/users/${type}/${selectedUserId}`;
                await api.put(endpoint, payload);
                setSuccess('Utilisateur modifié avec succès');
            } else {
                const type = formData.type || 'interne';
                if (type === 'externe' || formData.role === 'Etudiant') {
                    endpoint = '/users/externe';
                } else {
                    endpoint = '/users/internal';
                }
                const response = await api.post(endpoint, payload);
                console.log('✅ Réponse succès:', response.data);
                setSuccess('Utilisateur ajouté avec succès');
            }

            setTimeout(() => {
                closeForm();
                fetchUsers();
                fetchDepartments();
            }, 1500);
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            console.error('❌ Response:', error.response?.data);
            console.error('❌ Status:', error.response?.status);
            
            let errorMessage = 'Erreur lors de la sauvegarde';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }
            setError(errorMessage);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Supprimer ${user.prenom} ${user.nom} ?`)) return;
        try {
            const type = user.userType || 'interne';
            await api.delete(`/users/${type}/${user.id}`);
            setSuccess('Utilisateur supprimé avec succès');
            fetchUsers();
        } catch (error) {
            console.error('❌ Erreur suppression:', error);
            setError(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? false : true;
        try {
            const type = user.userType || 'interne';
            await api.patch(`/users/${type}/${user.id}/status`, { actif: newStatus });
            setSuccess(newStatus ? 'Utilisateur activé' : 'Utilisateur désactivé');
            fetchUsers();
        } catch (error) {
            console.error('❌ Erreur changement statut:', error);
            setError(error.response?.data?.message || 'Erreur lors du changement de statut');
        }
    };

    const currentRoleConfig = getRoleConfig(roleFilter);

    const getFormTitle = () => {
        if (formMode === 'add') {
            if (isFilteredByRole) return `Ajouter un ${roleFilter}`;
            return 'Ajouter un utilisateur';
        }
        if (formMode === 'edit') return 'Modifier un utilisateur';
        return 'Détails de l\'utilisateur';
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            
            <TitleContainer>
                <TitleIcon>
                    {currentRoleConfig.icon}
                </TitleIcon>
                <TitleText>
                    <TitleMain>{currentRoleConfig.label}</TitleMain>
                </TitleText>
            </TitleContainer>

            <PageHeader>
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        {filteredUsers.length} utilisateur(s) trouvé(s)
                    </Typography>
                </Box>
                {!showForm && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<PersonAdd />}
                            sx={{
                                backgroundColor: '#000000',
                                borderRadius: '12px',
                                textTransform: 'none',
                                color: '#ffffff',
                                '&:hover': { backgroundColor: '#333333' },
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
                            {getFormTitle()}
                        </Typography>
                        {isFilteredByRole && (
                            <Chip 
                                label={`Rôle: ${formData.role}`}
                                size="small"
                                sx={{ 
                                    backgroundColor: getRoleColor(formData.role) + '20',
                                    color: getRoleColor(formData.role),
                                    fontWeight: 600,
                                }}
                            />
                        )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                id="user-nom"
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
                                id="user-prenom"
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
                                id="user-email"
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
                                id="user-cin"
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
                                id="user-telephone"
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
                            <FormControl fullWidth>
                                <InputLabel id="user-type-label">Type d'utilisateur *</InputLabel>
                                <Select
                                    labelId="user-type-label"
                                    id="user-type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleTypeChange}
                                    label="Type d'utilisateur *"
                                    disabled={isTypeDisabled() || formMode === 'view'}
                                    sx={{ borderRadius: '10px' }}
                                >
                                    <MenuItem value="interne">Interne</MenuItem>
                                    <MenuItem value="externe">Externe</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="user-role-label">Rôle *</InputLabel>
                                <Select
                                    labelId="user-role-label"
                                    id="user-role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleFormChange}
                                    label="Rôle *"
                                    disabled={isRoleDisabled() || formMode === 'view'}
                                    sx={{ borderRadius: '10px' }}
                                >
                                    <MenuItem value="">Sélectionner un rôle</MenuItem>
                                    {formData.type === 'interne' 
                                        ? INTERNAL_ROLES.map((role) => (
                                            <MenuItem key={role} value={role}>{role}</MenuItem>
                                          ))
                                        : ALL_ROLES.map((role) => (
                                            <MenuItem key={role} value={role}>{role}</MenuItem>
                                          ))
                                    }
                                </Select>
                            </FormControl>
                            {isFilteredByRole && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Le rôle est fixé par le filtre actuel
                                </Typography>
                            )}
                        </Grid>

                        {/* CHAMP DÉPARTEMENT - REQUIS POUR LES UTILISATEURS INTERNES */}
                        {formData.type === 'interne' && (
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel id="user-departement-label">Département *</InputLabel>
                                    <Select
                                        labelId="user-departement-label"
                                        id="user-departement"
                                        name="departementId"
                                        value={formData.departementId || ''}
                                        onChange={handleFormChange}
                                        label="Département *"
                                        disabled={formMode === 'view' || loadingDepartments}
                                        sx={{ borderRadius: '10px' }}
                                    >
                                        <MenuItem value="">
                                            {loadingDepartments ? 'Chargement...' : 'Sélectionner un département'}
                                        </MenuItem>
                                        {departments.map((dept) => (
                                            <MenuItem 
                                                key={dept._id || dept.id} 
                                                value={dept._id || dept.id}
                                            >
                                                {dept.nom}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {departments.length === 0 && !loadingDepartments && (
                                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                            Aucun département disponible. Veuillez en créer un d'abord.
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>
                        )}

                        {/* Champs pour étudiant */}
                        {formData.type === 'externe' && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="user-universite"
                                        label="Université"
                                        name="universite"
                                        value={formData.universite || ''}
                                        onChange={handleFormChange}
                                        fullWidth
                                        disabled={formMode === 'view'}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="user-filiere"
                                        label="Filière"
                                        name="filiere"
                                        value={formData.filiere || ''}
                                        onChange={handleFormChange}
                                        fullWidth
                                        disabled={formMode === 'view'}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="user-niveau"
                                        label="Niveau"
                                        name="niveau"
                                        value={formData.niveau || ''}
                                        onChange={handleFormChange}
                                        fullWidth
                                        disabled={formMode === 'view'}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="user-annee"
                                        label="Année universitaire"
                                        name="annee"
                                        value={formData.annee || ''}
                                        onChange={handleFormChange}
                                        fullWidth
                                        disabled={formMode === 'view'}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="user-civilite"
                                        label="Civilité"
                                        name="civilite"
                                        value={formData.civilite || 'Mr'}
                                        onChange={handleFormChange}
                                        fullWidth
                                        disabled={formMode === 'view'}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="user-dateNaissance"
                                        label="Date de naissance"
                                        name="dateNaissance"
                                        type="date"
                                        value={formData.dateNaissance || '2000-01-01'}
                                        onChange={handleFormChange}
                                        fullWidth
                                        disabled={formMode === 'view'}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="user-adresse"
                                        label="Adresse"
                                        name="adresse"
                                        value={formData.adresse || ''}
                                        onChange={handleFormChange}
                                        fullWidth
                                        disabled={formMode === 'view'}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="user-ville"
                                        label="Ville"
                                        name="ville"
                                        value={formData.ville || ''}
                                        onChange={handleFormChange}
                                        fullWidth
                                        disabled={formMode === 'view'}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12} sm={6}>
                            <TextField
                                id="user-password"
                                label={formMode === 'add' ? 'Mot de passe *' : 'Nouveau mot de passe'}
                                name="motDePasse"
                                type="password"
                                value={formData.motDePasse}
                                onChange={handleFormChange}
                                fullWidth
                                disabled={formMode === 'view'}
                                helperText={
                                    formMode === 'edit' 
                                        ? 'Laisser vide pour ne pas modifier' 
                                        : `Minimum ${getPasswordMinLength()} caractères avec majuscule, minuscule, chiffre et caractère spécial`
                                }
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                id="user-confirm-password"
                                label="Confirmer le mot de passe"
                                name="confirmMotDePasse"
                                type="password"
                                value={formData.confirmMotDePasse}
                                onChange={handleFormChange}
                                fullWidth
                                disabled={formMode === 'view'}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        id="user-active"
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
                    <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', backgroundColor: '#fafbfc' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    id="search-users"
                                    placeholder="Rechercher par nom, email..."
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
                                    id="filter-status"
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
                        </Grid>
                    </Paper>

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
                                    <StyledTableCell>Département</StyledTableCell>
                                    <StyledTableCell>Statut</StyledTableCell>
                                    <StyledTableCell>Inscription</StyledTableCell>
                                    <StyledTableCell align="right">Actions</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                            <CircularProgress size={40} sx={{ color: '#000000' }} />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                {roleFilter !== 'all' 
                                                    ? `Aucun utilisateur avec le rôle "${roleFilter}"`
                                                    : 'Aucun utilisateur trouvé'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const roleIcon = getRoleIcon(user.role);
                                        const roleColor = getRoleColor(user.role);
                                        return (
                                            <TableRow key={user.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar
                                                            sx={{
                                                                backgroundColor: roleColor,
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
                                                        icon={roleIcon}
                                                        label={user.role}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: roleColor + '20',
                                                            color: roleColor,
                                                            fontWeight: 500,
                                                            '& .MuiChip-icon': {
                                                                color: roleColor,
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {user.departementNom || '-'}
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
                                        );
                                    })
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
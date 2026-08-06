// src/components/admin/AdminOffres.jsx
// ✅ VERSION SANS BOUTON RAFRAÎCHIR

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    ArrowBack,
    Archive,
} from '@mui/icons-material';
import api from '../../services/api';
import OfferDetailPage from './OfferDetailPage';

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
        'Publiee': { bg: '#d1fae5', text: '#065f46' },
        'EnAttente': { bg: '#fef3c7', text: '#d97706' },
        'Brouillon': { bg: '#e0e7ff', text: '#4338ca' },
        'Archivee': { bg: '#f3f4f6', text: '#6b7280' },
        'Refusee': { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors['EnAttente'];
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '12px',
        height: '24px',
    };
});

const StyledButton = styled(Button)({
    backgroundColor: '#2d3748',
    color: '#ffffff',
    borderRadius: '12px',
    textTransform: 'none',
    padding: '8px 24px',
    '&:hover': {
        backgroundColor: '#333333',
    },
    '&:disabled': {
        backgroundColor: '#999999',
        color: '#ffffff',
    },
});

// ✅ Filtres Container
const FiltersContainer = styled(Paper)({
    padding: '16px 20px',
    marginBottom: '24px',
    borderRadius: '12px',
    backgroundColor: '#fafbfc',
    border: '1px solid #eef1f3',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const AdminOffres = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [offres, setOffres] = useState([]);
    const [filteredOffres, setFilteredOffres] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departements, setDepartements] = useState([]);
    const [departementMap, setDepartementMap] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isCreatePage = location.pathname === '/admin/offres/add';
    const isEditPage = location.pathname.startsWith('/admin/offres/edit/');
    const isViewPage = location.pathname.startsWith('/admin/offres/view/');

    // ✅ CHARGER LES DÉPARTEMENTS AU MONTAGE
    useEffect(() => {
        if (!isCreatePage && !isEditPage && !isViewPage) {
            fetchDepartements();
        }
    }, [isCreatePage, isEditPage, isViewPage]);

    // ✅ CHARGER LES OFFRES QUAND departementMap EST REMPLI
    useEffect(() => {
        if (!isCreatePage && !isEditPage && !isViewPage && Object.keys(departementMap).length > 0) {
            fetchOffres();
        }
    }, [departementMap, isCreatePage, isEditPage, isViewPage]);

    useEffect(() => {
        filterOffres();
    }, [offres, searchTerm, statusFilter]);

    // ============================================
    // ✅ CHARGER LES DÉPARTEMENTS
    // ============================================
    const fetchDepartements = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/departments');
            let depts = [];
            if (response.data?.data) {
                depts = response.data.data;
            } else if (Array.isArray(response.data)) {
                depts = response.data;
            }
            setDepartements(depts);
            
            // ✅ Créer le map des départements
            const map = {};
            depts.forEach(d => {
                map[d._id || d.id] = d.nom;
            });
            setDepartementMap(map);
            
        } catch (error) {
            console.error('Erreur chargement departements:', error);
            setError('Erreur lors du chargement des départements');
            setLoading(false);
        }
    };

    // ============================================
    // ✅ CHARGER LES OFFRES (utilise departementMap du state)
    // ============================================
    const fetchOffres = async () => {
        setError('');
        try {
            const response = await api.get('/offers', {
                params: { limit: 100 }
            });
            
            let data = [];
            
            if (response.data?.offers) {
                data = response.data.offers;
            } else if (response.data?.data) {
                data = response.data.data;
            } else if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data?.results) {
                data = response.data.results;
            } else {
                for (const key in response.data) {
                    if (Array.isArray(response.data[key])) {
                        data = response.data[key];
                        break;
                    }
                }
            }
            
            // ✅ Utiliser departementMap du state (maintenant rempli)
            const currentMap = departementMap;
            
            data = data.map(offer => {
                const deptId = offer.departementId;
                const deptNom = currentMap[deptId] || 'Non assigné';
                return {
                    ...offer,
                    departementNom: deptNom
                };
            });
            
            setOffres(data);
            setFilteredOffres(data);
            
        } catch (error) {
            console.error('Erreur chargement offres:', error);
            setError(error.response?.data?.message || 'Erreur lors du chargement des offres');
            setOffres([]);
            setFilteredOffres([]);
        } finally {
            setLoading(false);
        }
    };

    const filterOffres = () => {
        let filtered = [...offres];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (o) =>
                    o.titre?.toLowerCase().includes(term) ||
                    o.description?.toLowerCase().includes(term) ||
                    (o.departementNom || '').toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((o) => o.statut === statusFilter);
        }

        setFilteredOffres(filtered);
    };

    // ============================================
    // OUVRIR LA PAGE DE CREATION
    // ============================================
    const handleNewOffer = () => {
        navigate('/admin/offres/add');
    };

    // ============================================
    // RETOUR A LA LISTE
    // ============================================
    const handleBackToList = () => {
        navigate('/admin/offres');
        fetchDepartements();
    };

    // ============================================
    // ✅ VOIR LE DETAIL
    // ============================================
    const handleViewOffer = (offre) => {
        navigate(`/admin/offres/view/${offre._id || offre.id}`);
    };

    // ============================================
    // MODIFIER
    // ============================================
    const handleEditOffer = (offre) => {
        navigate(`/admin/offres/edit/${offre._id || offre.id}`);
    };

    // ============================================
    // SUPPRIMER
    // ============================================
    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer cette offre ?')) {
            try {
                const offer = offres.find(o => o._id === id);
                if (offer && offer.statut !== 'Brouillon' && offer.statut !== 'Refusee') {
                    setError('Seules les offres en brouillon ou refusees peuvent etre supprimees. Utilisez l\'archivage pour les autres.');
                    return;
                }
                
                await api.delete(`/offers/${id}`);
                setSuccess('Offre supprimee avec succes');
                fetchDepartements();
            } catch (error) {
                console.error('Erreur suppression:', error);
                if (error.response?.data?.message?.includes('brouillon')) {
                    setError('Seules les offres en brouillon peuvent etre supprimees. Utilisez l\'archivage pour les autres.');
                } else {
                    setError(error.response?.data?.message || 'Erreur lors de la suppression');
                }
            }
        }
    };

    // ============================================
    // ARCHIVER
    // ============================================
    const handleArchive = async (offer) => {
        if (!window.confirm(`Voulez-vous vraiment archiver l'offre "${offer.titre}" ?`)) return;
        
        try {
            await api.put(`/offers/${offer._id || offer.id}/archive`);
            setSuccess('Offre archivee avec succes');
            fetchDepartements();
        } catch (error) {
            console.error('Erreur archivage:', error);
            setError(error.response?.data?.message || 'Erreur lors de l\'archivage');
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'Brouillon': 'Brouillon',
            'EnAttente': 'En attente',
            'Publiee': 'Publiee',
            'Archivee': 'Archivee',
            'Refusee': 'Refusee',
        };
        return labels[status] || status || 'Brouillon';
    };

    // ============================================
    // AFFICHAGE : PAGE DE CREATION
    // ============================================
    if (isCreatePage) {
        return <CreateOfferPage onBack={handleBackToList} />;
    }

    // ============================================
    // AFFICHAGE : PAGE DE MODIFICATION
    // ============================================
    if (isEditPage) {
        const offerId = location.pathname.split('/').pop();
        return <EditOfferPage offerId={offerId} onBack={handleBackToList} />;
    }

    // ============================================
    // ✅ AFFICHAGE : PAGE DE DETAIL
    // ============================================
    if (isViewPage) {
        return <OfferDetailPage />;
    }

    // ============================================
    // AFFICHAGE : LISTE DES OFFRES
    // ============================================
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
                <StyledButton
                    startIcon={<Add />}
                    onClick={handleNewOffer}
                >
                    Nouvelle offre
                </StyledButton>
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

            {/* ========================================== */}
            {/* ✅ FILTRES - SANS BOUTON RAFRAÎCHIR */}
            {/* ========================================== */}
            <FiltersContainer>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={7}>
                        <TextField
                            id="search-offers"
                            placeholder="Rechercher par titre, département..."
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
                    <Grid item xs={12} sm={5}>
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
                            <MenuItem value="Publiee">Publiee</MenuItem>
                            <MenuItem value="EnAttente">En attente</MenuItem>
                            <MenuItem value="Brouillon">Brouillon</MenuItem>
                            <MenuItem value="Archivee">Archivee</MenuItem>
                            <MenuItem value="Refusee">Refusee</MenuItem>
                        </TextField>
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
                                    <Box>
                                        <Typography color="text.secondary" sx={{ mb: 1 }}>
                                            {searchTerm || statusFilter !== 'all'
                                                ? 'Aucune offre ne correspond à vos critères'
                                                : 'Aucune offre trouvee'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOffres.map((offre) => (
                                <TableRow key={offre._id || offre.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {offre.titre || 'Sans titre'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {offre.departementNom || offre.departementId?.nom || '-'}
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
                                            status={offre.statut}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewOffer(offre)}
                                            >
                                                <Visibility sx={{ fontSize: 18, color: '#148aa0' }} />
                                            </IconButton>
                                        </Tooltip>
                                        
                                        {(offre.statut === 'Brouillon' || offre.statut === 'Refusee') && (
                                            <Tooltip title="Modifier">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditOffer(offre)}
                                                >
                                                    <Edit sx={{ fontSize: 18, color: '#4f46e5' }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        
                                        {(offre.statut === 'Publiee' || offre.statut === 'EnAttente') && (
                                            <Tooltip title="Archiver">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleArchive(offre)}
                                                >
                                                    <Archive sx={{ fontSize: 18, color: '#f59e0b' }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        
                                        {offre.statut === 'Brouillon' && (
                                            <Tooltip title="Supprimer">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(offre._id)}
                                                >
                                                    <Delete sx={{ fontSize: 18, color: '#ef4444' }} />
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

// ============================================
// PAGE DE CREATION D'OFFRE (PAGE ENTIERE)
// ============================================
const CreateOfferPage = ({ onBack }) => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [periods, setPeriods] = useState([]);

    const [form, setForm] = useState({
        titre: '',
        description: '',
        typeStage: '',
        nbPostes: 1,
        periodeId: '',
        dateDebut: '',
        dateFin: '',
        dateLimiteCandidature: '',
        departementId: '',
        sujets: [{ titre: '', description: '', missions: [''], profilRecherche: '', competences: [{ nom: '', niveau: '' }] }],
        documentsRequis: [],
    });

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        try {
            const response = await api.get('/periods');
            if (response.data?.data) {
                setPeriods(response.data.data);
            }
        } catch (error) {
            console.error('Erreur chargement periodes:', error);
        }
    };

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
        setError('');
        setSuccess('');
    };

    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...form.sujets];
        newSubjects[index][field] = value;
        setForm({ ...form, sujets: newSubjects });
    };

    const addSubject = () => {
        setForm({
            ...form,
            sujets: [
                ...form.sujets,
                { titre: '', description: '', missions: [''], profilRecherche: '', competences: [{ nom: '', niveau: '' }] },
            ],
        });
    };

    const removeSubject = (index) => {
        if (form.sujets.length <= 1) return;
        setForm({ ...form, sujets: form.sujets.filter((_, i) => i !== index) });
    };

    const addMission = (subjectIndex) => {
        const newSubjects = [...form.sujets];
        newSubjects[subjectIndex].missions.push('');
        setForm({ ...form, sujets: newSubjects });
    };

    const removeMission = (subjectIndex, missionIndex) => {
        const newSubjects = [...form.sujets];
        if (newSubjects[subjectIndex].missions.length <= 1) return;
        newSubjects[subjectIndex].missions = newSubjects[subjectIndex].missions.filter(
            (_, i) => i !== missionIndex
        );
        setForm({ ...form, sujets: newSubjects });
    };

    const handleMissionChange = (subjectIndex, missionIndex, value) => {
        const newSubjects = [...form.sujets];
        newSubjects[subjectIndex].missions[missionIndex] = value;
        setForm({ ...form, sujets: newSubjects });
    };

    const addCompetence = (subjectIndex) => {
        const newSubjects = [...form.sujets];
        newSubjects[subjectIndex].competences.push({ nom: '', niveau: '' });
        setForm({ ...form, sujets: newSubjects });
    };

    const removeCompetence = (subjectIndex, compIndex) => {
        const newSubjects = [...form.sujets];
        if (newSubjects[subjectIndex].competences.length <= 1) return;
        newSubjects[subjectIndex].competences = newSubjects[subjectIndex].competences.filter(
            (_, i) => i !== compIndex
        );
        setForm({ ...form, sujets: newSubjects });
    };

    const handleCompetenceChange = (subjectIndex, compIndex, field, value) => {
        const newSubjects = [...form.sujets];
        newSubjects[subjectIndex].competences[compIndex][field] = value;
        setForm({ ...form, sujets: newSubjects });
    };

    const validateForm = () => {
        const errors = [];
        if (!form.titre) errors.push('Le titre est obligatoire');
        if (!form.description) errors.push('La description est obligatoire');
        if (!form.typeStage) errors.push('Le type de stage est obligatoire');
        if (!form.periodeId) errors.push('La periode est obligatoire');
        if (!form.dateDebut) errors.push('La date de debut est obligatoire');
        if (!form.dateFin) errors.push('La date de fin est obligatoire');
        if (!form.dateLimiteCandidature) errors.push('La date limite de candidature est obligatoire');
        form.sujets.forEach((sujet, index) => {
            if (!sujet.titre) errors.push(`Le titre du sujet ${index + 1} est obligatoire`);
            if (!sujet.description) errors.push(`La description du sujet ${index + 1} est obligatoire`);
        });
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const errors = validateForm();
        if (errors.length > 0) {
            setError(errors.join(', '));
            return;
        }

        setSaving(true);
        try {
            const dataToSend = { ...form };
            if (!dataToSend.departementId) {
                const deptResponse = await api.get('/departments');
                if (deptResponse.data?.data && deptResponse.data.data.length > 0) {
                    dataToSend.departementId = deptResponse.data.data[0]._id;
                }
            }
            
            await api.post('/offers', dataToSend);
            setSuccess('Offre creee avec succes !');
            setTimeout(() => onBack(), 1500);
        } catch (error) {
            console.error('Erreur creation offre:', error);
            setError(error.response?.data?.message || 'Erreur lors de la creation de l\'offre');
        } finally {
            setSaving(false);
        }
    };

    const typesStage = ['PFE', 'PFA', 'Initiation', 'Ete', 'Master', 'Licence', 'Technicien'];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <PageHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={onBack} sx={{ color: '#666' }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                            Nouvelle offre de stage
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Remplissez les informations ci-dessous pour creer une nouvelle offre
                        </Typography>
                    </Box>
                </Box>
                <StyledButton
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                >
                    {saving ? 'Creation...' : 'Publier l\'offre'}
                </StyledButton>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

            <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            id="offer-title"
                            label="Titre de l'offre *"
                            value={form.titre}
                            onChange={(e) => handleChange('titre', e.target.value)}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="offer-description"
                            label="Description *"
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="offer-type-label">Type de stage *</InputLabel>
                            <Select
                                labelId="offer-type-label"
                                id="offer-type"
                                value={form.typeStage}
                                onChange={(e) => handleChange('typeStage', e.target.value)}
                                label="Type de stage *"
                                sx={{ borderRadius: '10px' }}
                            >
                                {typesStage.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="offer-nbPostes"
                            label="Nombre de postes"
                            type="number"
                            value={form.nbPostes}
                            onChange={(e) => handleChange('nbPostes', parseInt(e.target.value))}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="offer-period-label">Periode *</InputLabel>
                            <Select
                                labelId="offer-period-label"
                                id="offer-period"
                                value={form.periodeId}
                                onChange={(e) => handleChange('periodeId', e.target.value)}
                                label="Periode *"
                                sx={{ borderRadius: '10px' }}
                            >
                                {periods.map((period) => (
                                    <MenuItem key={period._id} value={period._id}>
                                        {period.nom}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="offer-dateDebut"
                            label="Date de debut *"
                            type="date"
                            value={form.dateDebut}
                            onChange={(e) => handleChange('dateDebut', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="offer-dateFin"
                            label="Date de fin *"
                            type="date"
                            value={form.dateFin}
                            onChange={(e) => handleChange('dateFin', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="offer-dateLimite"
                            label="Date limite candidature *"
                            type="date"
                            value={form.dateLimiteCandidature}
                            onChange={(e) => handleChange('dateLimiteCandidature', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                            Sujets de stage
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={addSubject}
                            sx={{ mb: 2, borderRadius: '10px', textTransform: 'none' }}
                        >
                            Ajouter un sujet
                        </Button>
                    </Grid>

                    {form.sujets.map((sujet, subjectIndex) => (
                        <Grid item xs={12} key={subjectIndex}>
                            <Paper sx={{ p: 3, backgroundColor: '#f7f7f7', borderRadius: '12px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Sujet {subjectIndex + 1}
                                    </Typography>
                                    {form.sujets.length > 1 && (
                                        <IconButton onClick={() => removeSubject(subjectIndex)} color="error">
                                            <Delete />
                                        </IconButton>
                                    )}
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            id={`subject-title-${subjectIndex}`}
                                            label="Titre du sujet *"
                                            value={sujet.titre}
                                            onChange={(e) => handleSubjectChange(subjectIndex, 'titre', e.target.value)}
                                            fullWidth
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            id={`subject-description-${subjectIndex}`}
                                            label="Description du sujet *"
                                            value={sujet.description}
                                            onChange={(e) => handleSubjectChange(subjectIndex, 'description', e.target.value)}
                                            fullWidth
                                            multiline
                                            rows={3}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            id={`subject-profil-${subjectIndex}`}
                                            label="Profil recherche"
                                            value={sujet.profilRecherche}
                                            onChange={(e) => handleSubjectChange(subjectIndex, 'profilRecherche', e.target.value)}
                                            fullWidth
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                            Missions
                                        </Typography>
                                        {sujet.missions.map((mission, missionIndex) => (
                                            <Box key={missionIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                <TextField
                                                    id={`subject-${subjectIndex}-mission-${missionIndex}`}
                                                    value={mission}
                                                    onChange={(e) => handleMissionChange(subjectIndex, missionIndex, e.target.value)}
                                                    placeholder={`Mission ${missionIndex + 1}`}
                                                    fullWidth
                                                    size="small"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={() => removeMission(subjectIndex, missionIndex)}
                                                    disabled={sujet.missions.length <= 1}
                                                    sx={{ color: '#ef4444' }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ))}
                                        <Button
                                            size="small"
                                            startIcon={<Add />}
                                            onClick={() => addMission(subjectIndex)}
                                            sx={{ textTransform: 'none', color: '#148aa0' }}
                                        >
                                            Ajouter une mission
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                            Competences requises
                                        </Typography>
                                        {sujet.competences.map((comp, compIndex) => (
                                            <Box key={compIndex} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                                                <TextField
                                                    id={`subject-${subjectIndex}-comp-${compIndex}-name`}
                                                    value={comp.nom}
                                                    onChange={(e) => handleCompetenceChange(subjectIndex, compIndex, 'nom', e.target.value)}
                                                    placeholder="Nom de la competence"
                                                    size="small"
                                                    sx={{ flex: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                                />
                                                <FormControl size="small" sx={{ flex: 1 }}>
                                                    <InputLabel id={`subject-${subjectIndex}-comp-${compIndex}-level-label`}>Niveau</InputLabel>
                                                    <Select
                                                        labelId={`subject-${subjectIndex}-comp-${compIndex}-level-label`}
                                                        id={`subject-${subjectIndex}-comp-${compIndex}-level`}
                                                        value={comp.niveau}
                                                        onChange={(e) => handleCompetenceChange(subjectIndex, compIndex, 'niveau', e.target.value)}
                                                        displayEmpty
                                                        label="Niveau"
                                                        sx={{ borderRadius: '8px' }}
                                                    >
                                                        <MenuItem value="">Niveau</MenuItem>
                                                        <MenuItem value="Debutant">Debutant</MenuItem>
                                                        <MenuItem value="Intermediaire">Intermediaire</MenuItem>
                                                        <MenuItem value="Avance">Avance</MenuItem>
                                                        <MenuItem value="Expert">Expert</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => removeCompetence(subjectIndex, compIndex)}
                                                    disabled={sujet.competences.length <= 1}
                                                    sx={{ color: '#ef4444' }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ))}
                                        <Button
                                            size="small"
                                            startIcon={<Add />}
                                            onClick={() => addCompetence(subjectIndex)}
                                            sx={{ textTransform: 'none', color: '#148aa0' }}
                                        >
                                            Ajouter une competence
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Container>
    );
};

// ============================================
// PAGE DE MODIFICATION D'OFFRE
// ============================================
const EditOfferPage = ({ offerId, onBack }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [periods, setPeriods] = useState([]);

    const [form, setForm] = useState({
        titre: '',
        description: '',
        typeStage: '',
        nbPostes: 1,
        periodeId: '',
        dateDebut: '',
        dateFin: '',
        dateLimiteCandidature: '',
        departementId: '',
        sujets: [],
        documentsRequis: [],
    });

    useEffect(() => {
        fetchOfferAndPeriods();
    }, [offerId]);

    const fetchOfferAndPeriods = async () => {
        setLoading(true);
        try {
            const offerResponse = await api.get(`/offers/${offerId}`);
            const offer = offerResponse.data?.offer || offerResponse.data?.data || {};
            
            const periodsResponse = await api.get('/periods');
            const periodsData = periodsResponse.data?.data || [];
            setPeriods(periodsData);

            setForm({
                titre: offer.titre || '',
                description: offer.description || '',
                typeStage: offer.typeStage || '',
                nbPostes: offer.nbPostes || 1,
                periodeId: offer.periodeId || '',
                dateDebut: offer.dateDebut ? offer.dateDebut.split('T')[0] : '',
                dateFin: offer.dateFin ? offer.dateFin.split('T')[0] : '',
                dateLimiteCandidature: offer.dateLimiteCandidature ? offer.dateLimiteCandidature.split('T')[0] : '',
                departementId: offer.departementId || '',
                sujets: offer.sujets || [],
                documentsRequis: offer.documentsRequis || [],
            });

        } catch (error) {
            console.error('Erreur chargement offre:', error);
            setError('Erreur lors du chargement de l\'offre');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            await api.put(`/offers/${offerId}`, form);
            setSuccess('Offre modifiee avec succes !');
            setTimeout(() => onBack(), 1500);
        } catch (error) {
            console.error('Erreur modification:', error);
            setError(error.response?.data?.message || 'Erreur lors de la modification');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#148aa0' }} />
                </Box>
            </Container>
        );
    }

    const typesStage = ['PFE', 'PFA', 'Initiation', 'Ete', 'Master', 'Licence', 'Technicien'];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <PageHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={onBack} sx={{ color: '#666' }}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                            Modifier l'offre
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {form.titre || 'Offre sans titre'}
                        </Typography>
                    </Box>
                </Box>
                <StyledButton
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={saving}
                >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                </StyledButton>
            </PageHeader>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}

            <Paper sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            id="edit-offer-title"
                            label="Titre de l'offre *"
                            value={form.titre}
                            onChange={(e) => handleChange('titre', e.target.value)}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="edit-offer-description"
                            label="Description *"
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="edit-offer-type-label">Type de stage *</InputLabel>
                            <Select
                                labelId="edit-offer-type-label"
                                id="edit-offer-type"
                                value={form.typeStage}
                                onChange={(e) => handleChange('typeStage', e.target.value)}
                                label="Type de stage *"
                                sx={{ borderRadius: '10px' }}
                            >
                                {typesStage.map((type) => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="edit-offer-nbPostes"
                            label="Nombre de postes"
                            type="number"
                            value={form.nbPostes}
                            onChange={(e) => handleChange('nbPostes', parseInt(e.target.value))}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="edit-offer-period-label">Periode *</InputLabel>
                            <Select
                                labelId="edit-offer-period-label"
                                id="edit-offer-period"
                                value={form.periodeId}
                                onChange={(e) => handleChange('periodeId', e.target.value)}
                                label="Periode *"
                                sx={{ borderRadius: '10px' }}
                            >
                                {periods.map((period) => (
                                    <MenuItem key={period._id || period.id} value={period._id || period.id}>
                                        {period.nom}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="edit-offer-dateDebut"
                            label="Date de debut *"
                            type="date"
                            value={form.dateDebut}
                            onChange={(e) => handleChange('dateDebut', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="edit-offer-dateFin"
                            label="Date de fin *"
                            type="date"
                            value={form.dateFin}
                            onChange={(e) => handleChange('dateFin', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            id="edit-offer-dateLimite"
                            label="Date limite candidature *"
                            type="date"
                            value={form.dateLimiteCandidature}
                            onChange={(e) => handleChange('dateLimiteCandidature', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                    <Button
                        variant="outlined"
                        onClick={onBack}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={saving}
                        sx={{
                            backgroundColor: '#000000',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#333333' },
                        }}
                    >
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminOffres;
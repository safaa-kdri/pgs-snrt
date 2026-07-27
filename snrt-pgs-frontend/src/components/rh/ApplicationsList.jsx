// src/components/rh/ApplicationsList.jsx
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
    Grid,
    CircularProgress,
    InputAdornment,
    Tooltip,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
} from '@mui/material';
import {
    Search,
    Visibility,
    Refresh,
    FilterList,
    CheckCircle,
    Cancel,
    Pending,
    Event,
    Description,
    Send,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../hooks/useAuth';

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
        soumise: { bg: '#dbeafe', text: '#1d4ed8' },
        en_analyse: { bg: '#fef3c7', text: '#d97706' },
        entretien: { bg: '#f3e8ff', text: '#6b21a8' },
        acceptee: { bg: '#d1fae5', text: '#065f46' },
        refuse: { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors.soumise;
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
    };
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const ApplicationsList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [actionType, setActionType] = useState('');
    const [comment, setComment] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        filterApplications();
    }, [applications, searchTerm, statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockApplications = [
                {
                    id: '1',
                    offre: 'Stage Développement Web',
                    candidat: 'Youssef EL HASSANI',
                    email: 'youssef@test.ma',
                    dateSoumission: '2026-07-15',
                    statut: 'en_analyse',
                    typeStage: 'PFE',
                    departement: 'DSI',
                },
                {
                    id: '2',
                    offre: 'Stage Data Science',
                    candidat: 'Fatima BENNANI',
                    email: 'fatima@test.ma',
                    dateSoumission: '2026-07-12',
                    statut: 'entretien',
                    typeStage: 'Master',
                    departement: 'DSI',
                },
                {
                    id: '3',
                    offre: 'Stage Cybersécurité',
                    candidat: 'Ahmed ALAMI',
                    email: 'ahmed@test.ma',
                    dateSoumission: '2026-07-10',
                    statut: 'soumise',
                    typeStage: 'PFE',
                    departement: 'DSI',
                },
                {
                    id: '4',
                    offre: 'Stage Marketing Digital',
                    candidat: 'Khadija ALAOUI',
                    email: 'khadija@test.ma',
                    dateSoumission: '2026-06-28',
                    statut: 'acceptee',
                    typeStage: 'Licence',
                    departement: 'Marketing',
                },
                {
                    id: '5',
                    offre: 'Stage DevOps',
                    candidat: 'Mohamed CHERKAOUI',
                    email: 'mohamed@test.ma',
                    dateSoumission: '2026-06-20',
                    statut: 'refuse',
                    typeStage: 'PFA',
                    departement: 'DSI',
                },
            ];

            setApplications(mockApplications);
            setFilteredApplications(mockApplications);

        } catch (error) {
            console.error('Erreur chargement candidatures:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterApplications = () => {
        let filtered = [...applications];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (a) =>
                    a.offre.toLowerCase().includes(term) ||
                    a.candidat.toLowerCase().includes(term) ||
                    a.departement.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((a) => a.statut === statusFilter);
        }

        setFilteredApplications(filtered);
    };

    const getStatusLabel = (status) => {
        const labels = {
            soumise: 'Soumise',
            en_analyse: 'En analyse',
            entretien: 'Entretien',
            acceptee: 'Acceptée',
            refuse: 'Refusée',
        };
        return labels[status] || status;
    };

    const handleOpenDialog = (app, action) => {
        setSelectedApp(app);
        setActionType(action);
        setComment('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedApp(null);
        setComment('');
    };

    const handleConfirmAction = () => {
        if (actionType === 'accepter') {
            setApplications(
                applications.map((a) =>
                    a.id === selectedApp.id ? { ...a, statut: 'acceptee' } : a
                )
            );
            setSuccess(`✅ Candidature de ${selectedApp.candidat} acceptée !`);
        } else if (actionType === 'refuser') {
            setApplications(
                applications.map((a) =>
                    a.id === selectedApp.id ? { ...a, statut: 'refuse' } : a
                )
            );
            setSuccess(`❌ Candidature de ${selectedApp.candidat} refusée`);
        } else if (actionType === 'entretien') {
            setApplications(
                applications.map((a) =>
                    a.id === selectedApp.id ? { ...a, statut: 'entretien' } : a
                )
            );
            setSuccess(`📅 Entretien programmé pour ${selectedApp.candidat}`);
        }
        handleCloseDialog();
        setTimeout(() => setSuccess(''), 3000);
    };

    const statusOptions = [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'soumise', label: 'Soumise' },
        { value: 'en_analyse', label: 'En analyse' },
        { value: 'entretien', label: 'Entretien' },
        { value: 'acceptee', label: 'Acceptée' },
        { value: 'refuse', label: 'Refusée' },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        📋 Gestion des candidatures
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredApplications.length} candidature(s) trouvée(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchApplications}
                        disabled={loading}
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                        Rafraîchir
                    </Button>
                </Box>
            </PageHeader>

            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '10px' }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

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
                            {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
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
                            <StyledTableCell>Candidat</StyledTableCell>
                            <StyledTableCell>Offre</StyledTableCell>
                            <StyledTableCell>Département</StyledTableCell>
                            <StyledTableCell>Type</StyledTableCell>
                            <StyledTableCell>Date</StyledTableCell>
                            <StyledTableCell>Statut</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: '#148aa0' }} />
                                </TableCell>
                            </TableRow>
                        ) : filteredApplications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucune candidature trouvée
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredApplications.map((app) => (
                                <TableRow key={app.id} hover>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                {app.candidat}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {app.email}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{app.offre}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={app.departement}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#e0e7ff',
                                                color: '#4338ca',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={app.typeStage}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#f3e8ff',
                                                color: '#6b21a8',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(app.dateSoumission).toLocaleDateString('fr-FR')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={getStatusLabel(app.statut)}
                                            status={app.statut}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir les détails">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/rh/application/${app.id}`)}
                                                sx={{ color: '#148aa0' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {app.statut === 'soumise' && (
                                            <>
                                                <Tooltip title="Passer en analyse">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog(app, 'analyse')}
                                                        sx={{ color: '#f59e0b' }}
                                                    >
                                                        <Pending fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                        {(app.statut === 'en_analyse' || app.statut === 'soumise') && (
                                            <>
                                                <Tooltip title="Programmer entretien">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog(app, 'entretien')}
                                                        sx={{ color: '#8b5cf6' }}
                                                    >
                                                        <Event fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Accepter">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog(app, 'accepter')}
                                                        sx={{ color: '#22c55e' }}
                                                    >
                                                        <CheckCircle fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Refuser">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenDialog(app, 'refuser')}
                                                        sx={{ color: '#ef4444' }}
                                                    >
                                                        <Cancel fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                        {app.statut === 'acceptee' && (
                                            <Tooltip title="Générer convention">
                                                <IconButton
                                                    size="small"
                                                    sx={{ color: '#22c55e' }}
                                                >
                                                    <Description fontSize="small" />
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

            {/* ===== DIALOG DE CONFIRMATION ===== */}
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
                    {actionType === 'accepter' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ color: '#22c55e' }} /> Accepter la candidature
                        </Box>
                    )}
                    {actionType === 'refuser' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Cancel sx={{ color: '#ef4444' }} /> Refuser la candidature
                        </Box>
                    )}
                    {actionType === 'entretien' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Event sx={{ color: '#8b5cf6' }} /> Programmer un entretien
                        </Box>
                    )}
                    {actionType === 'analyse' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Pending sx={{ color: '#f59e0b' }} /> Passer en analyse
                        </Box>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {actionType === 'accepter' && `Êtes-vous sûr de vouloir accepter la candidature de ${selectedApp?.candidat} ?`}
                        {actionType === 'refuser' && `Êtes-vous sûr de vouloir refuser la candidature de ${selectedApp?.candidat} ?`}
                        {actionType === 'entretien' && `Voulez-vous programmer un entretien avec ${selectedApp?.candidat} ?`}
                        {actionType === 'analyse' && `Voulez-vous passer la candidature de ${selectedApp?.candidat} en analyse ?`}
                    </Typography>
                    {(actionType === 'refuser' || actionType === 'entretien') && (
                        <TextField
                            label={actionType === 'refuser' ? "Motif du refus" : "Commentaires"}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder={actionType === 'refuser' ? "Expliquez la raison du refus..." : "Ajoutez des commentaires..."}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseDialog}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmAction}
                        sx={{
                            backgroundColor:
                                actionType === 'accepter' ? '#22c55e' :
                                actionType === 'refuser' ? '#ef4444' :
                                actionType === 'entretien' ? '#8b5cf6' : '#f59e0b',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor:
                                    actionType === 'accepter' ? '#16a34a' :
                                    actionType === 'refuser' ? '#dc2626' :
                                    actionType === 'entretien' ? '#7c3aed' : '#d97706',
                            },
                        }}
                    >
                        {actionType === 'accepter' ? 'Accepter' :
                         actionType === 'refuser' ? 'Refuser' :
                         actionType === 'entretien' ? 'Programmer' : 'Analyser'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ApplicationsList;
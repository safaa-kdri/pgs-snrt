// src/components/rh/Interviews.jsx
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
    Avatar,
} from '@mui/material';
import {
    Search,
    Add,
    Visibility,
    Refresh,
    FilterList,
    CheckCircle,
    Cancel,
    Pending,
    Event,
    VideoCall,
    LocationOn,
    Schedule,
    Delete,
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
        planifie: { bg: '#dbeafe', text: '#1d4ed8' },
        en_cours: { bg: '#fef3c7', text: '#d97706' },
        termine: { bg: '#d1fae5', text: '#065f46' },
        annule: { bg: '#fee2e2', text: '#991b1b' },
    };
    const color = colors[status] || colors.planifie;
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

const Interviews = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [interviews, setInterviews] = useState([]);
    const [filteredInterviews, setFilteredInterviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [dialogMode, setDialogMode] = useState('add');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        candidat: '',
        offre: '',
        date: '',
        heure: '',
        duree: 30,
        type: 'presentiel',
        lieu: '',
        lienVisio: '',
        commentaires: '',
    });

    useEffect(() => {
        fetchInterviews();
    }, []);

    useEffect(() => {
        filterInterviews();
    }, [interviews, searchTerm, statusFilter]);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            const mockInterviews = [
                {
                    id: '1',
                    candidat: 'Youssef EL HASSANI',
                    offre: 'Stage Développement Web',
                    date: '2026-07-20',
                    heure: '10:00',
                    duree: 30,
                    type: 'visio',
                    lieu: null,
                    lienVisio: 'https://meet.google.com/abc-defg-hij',
                    statut: 'planifie',
                    commentaires: 'Entretien technique',
                },
                {
                    id: '2',
                    candidat: 'Fatima BENNANI',
                    offre: 'Stage Data Science',
                    date: '2026-07-19',
                    heure: '14:30',
                    duree: 45,
                    type: 'presentiel',
                    lieu: 'Bureau DSI - Rabat',
                    lienVisio: null,
                    statut: 'termine',
                    commentaires: 'Entretien réussi',
                },
                {
                    id: '3',
                    candidat: 'Ahmed ALAMI',
                    offre: 'Stage Cybersécurité',
                    date: '2026-07-21',
                    heure: '09:00',
                    duree: 30,
                    type: 'visio',
                    lieu: null,
                    lienVisio: 'https://meet.google.com/xyz-uvwx-yz',
                    statut: 'planifie',
                    commentaires: null,
                },
            ];

            setInterviews(mockInterviews);
            setFilteredInterviews(mockInterviews);

        } catch (error) {
            console.error('Erreur chargement entretiens:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterInterviews = () => {
        let filtered = [...interviews];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (i) =>
                    i.candidat.toLowerCase().includes(term) ||
                    i.offre.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((i) => i.statut === statusFilter);
        }

        setFilteredInterviews(filtered);
    };

    const getStatusLabel = (status) => {
        const labels = {
            planifie: 'Planifié',
            en_cours: 'En cours',
            termine: 'Terminé',
            annule: 'Annulé',
        };
        return labels[status] || status;
    };

    const getTypeIcon = (type) => {
        if (type === 'visio') return <VideoCall fontSize="small" />;
        if (type === 'presentiel') return <LocationOn fontSize="small" />;
        return <Schedule fontSize="small" />;
    };

    const getTypeLabel = (type) => {
        const labels = {
            visio: 'Visio',
            presentiel: 'Présentiel',
            telephonique: 'Téléphonique',
        };
        return labels[type] || type;
    };

    const handleOpenDialog = (interview, mode) => {
        if (interview) {
            setSelectedInterview(interview);
            setForm({
                candidat: interview.candidat,
                offre: interview.offre,
                date: interview.date,
                heure: interview.heure,
                duree: interview.duree,
                type: interview.type,
                lieu: interview.lieu || '',
                lienVisio: interview.lienVisio || '',
                commentaires: interview.commentaires || '',
            });
        } else {
            setSelectedInterview(null);
            setForm({
                candidat: '',
                offre: '',
                date: '',
                heure: '',
                duree: 30,
                type: 'presentiel',
                lieu: '',
                lienVisio: '',
                commentaires: '',
            });
        }
        setDialogMode(mode);
        setOpenDialog(true);
        setError('');
        setSuccess('');
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedInterview(null);
    };

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleSaveInterview = () => {
        // Validation
        if (!form.candidat || !form.offre || !form.date || !form.heure) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (dialogMode === 'add') {
            const newInterview = {
                id: String(interviews.length + 1),
                ...form,
                statut: 'planifie',
            };
            setInterviews([...interviews, newInterview]);
            setSuccess('✅ Entretien planifié avec succès !');
        } else {
            setInterviews(
                interviews.map((i) =>
                    i.id === selectedInterview.id ? { ...i, ...form } : i
                )
            );
            setSuccess('✅ Entretien modifié avec succès !');
        }
        setTimeout(() => setSuccess(''), 3000);
        handleCloseDialog();
    };

    const handleDeleteInterview = (id) => {
        setInterviews(interviews.filter((i) => i.id !== id));
        setSuccess('✅ Entretien supprimé avec succès');
        setTimeout(() => setSuccess(''), 3000);
    };

    const statusOptions = [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'planifie', label: 'Planifié' },
        { value: 'en_cours', label: 'En cours' },
        { value: 'termine', label: 'Terminé' },
        { value: 'annule', label: 'Annulé' },
    ];

    const typeOptions = [
        { value: 'presentiel', label: 'Présentiel' },
        { value: 'visio', label: 'Visio' },
        { value: 'telephonique', label: 'Téléphonique' },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        🎯 Gestion des entretiens
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredInterviews.length} entretien(s) trouvé(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchInterviews}
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
                        Planifier un entretien
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
                            <StyledTableCell>Type</StyledTableCell>
                            <StyledTableCell>Date / Heure</StyledTableCell>
                            <StyledTableCell>Lieu / Lien</StyledTableCell>
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
                        ) : filteredInterviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucun entretien trouvé
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInterviews.map((interview) => (
                                <TableRow key={interview.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#148aa0', fontSize: 14, color: '#fff' }}>
                                                {interview.candidat.split(' ').map(n => n[0]).join('')}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={500}>
                                                {interview.candidat}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{interview.offre}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={getTypeIcon(interview.type)}
                                            label={getTypeLabel(interview.type)}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#f3e8ff',
                                                color: '#6b21a8',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(interview.date).toLocaleDateString('fr-FR')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {interview.heure} ({interview.duree} min)
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {interview.type === 'visio' ? (
                                            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
                                                {interview.lienVisio?.slice(0, 30)}...
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2">{interview.lieu || '-'}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={getStatusLabel(interview.statut)}
                                            status={interview.statut}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir">
                                            <IconButton
                                                size="small"
                                                sx={{ color: '#148aa0' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Modifier">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(interview, 'edit')}
                                                sx={{ color: '#4f46e5' }}
                                            >
                                                <Add fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Supprimer">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteInterview(interview.id)}
                                                sx={{ color: '#ef4444' }}
                                            >
                                                <Delete fontSize="small" />
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
                    {dialogMode === 'add' ? '📅 Planifier un entretien' : '✏️ Modifier l\'entretien'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Candidat *"
                                value={form.candidat}
                                onChange={(e) => handleChange('candidat', e.target.value)}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Offre *"
                                value={form.offre}
                                onChange={(e) => handleChange('offre', e.target.value)}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Date *"
                                type="date"
                                value={form.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Heure *"
                                type="time"
                                value={form.heure}
                                onChange={(e) => handleChange('heure', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Durée (minutes)"
                                type="number"
                                value={form.duree}
                                onChange={(e) => handleChange('duree', parseInt(e.target.value))}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Type *"
                                value={form.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            >
                                {typeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            {form.type === 'visio' ? (
                                <TextField
                                    label="Lien Visio *"
                                    value={form.lienVisio}
                                    onChange={(e) => handleChange('lienVisio', e.target.value)}
                                    fullWidth
                                    placeholder="https://meet.google.com/..."
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            ) : (
                                <TextField
                                    label="Lieu *"
                                    value={form.lieu}
                                    onChange={(e) => handleChange('lieu', e.target.value)}
                                    fullWidth
                                    placeholder="Adresse du lieu"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Commentaires"
                                value={form.commentaires}
                                onChange={(e) => handleChange('commentaires', e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                            />
                        </Grid>
                    </Grid>
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
                        onClick={handleSaveInterview}
                        sx={{
                            backgroundColor: '#148aa0',
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#0b7890' },
                        }}
                    >
                        {dialogMode === 'add' ? 'Planifier' : 'Enregistrer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Interviews;
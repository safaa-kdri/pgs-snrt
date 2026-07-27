// src/components/admin/Logs.jsx
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
    MenuItem,
    Pagination,
    Tab,
    Tabs,
} from '@mui/material';
import {
    Search,
    Refresh,
    FilterList,
    Download,
    Visibility,
    Delete,
    Error as ErrorIcon,
    Warning,
    Info,
    CheckCircle,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

const LogLevelChip = styled(Chip)(({ level }) => {
    const colors = {
        error: { bg: '#fee2e2', text: '#991b1b' },
        warning: { bg: '#fef3c7', text: '#d97706' },
        info: { bg: '#dbeafe', text: '#1d4ed8' },
        success: { bg: '#d1fae5', text: '#065f46' },
        debug: { bg: '#f3e8ff', text: '#6b21a8' },
    };
    const color = colors[level] || colors.info;
    return {
        backgroundColor: color.bg,
        color: color.text,
        fontWeight: 500,
        fontSize: '11px',
        height: '24px',
        '& .MuiChip-icon': {
            fontSize: '14px',
        },
    };
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Logs = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [tabValue, setTabValue] = useState(0);

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    const logsPerPage = 20;

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        filterLogs();
    }, [logs, searchTerm, levelFilter, dateFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockLogs = [
                {
                    id: '1',
                    timestamp: new Date(Date.now() - 1000 * 60 * 5),
                    level: 'success',
                    user: 'Safaa EL KADOURI',
                    action: 'Connexion réussie',
                    details: 'Utilisateur admin@snrt.ma connecté',
                    ip: '192.168.1.100',
                    module: 'Auth',
                },
                {
                    id: '2',
                    timestamp: new Date(Date.now() - 1000 * 60 * 15),
                    level: 'info',
                    user: 'Karim BENNANI',
                    action: 'Création d\'une offre',
                    details: 'Offre "Stage en Cybersécurité" créée',
                    ip: '192.168.1.101',
                    module: 'Offres',
                },
                {
                    id: '3',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30),
                    level: 'warning',
                    user: 'Fatima ALAOUI',
                    action: 'Tentative de connexion échouée',
                    details: 'Mot de passe incorrect - 2e tentative',
                    ip: '192.168.1.102',
                    module: 'Auth',
                },
                {
                    id: '4',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60),
                    level: 'error',
                    user: 'Mohamed CHERKAOUI',
                    action: 'Erreur de validation',
                    details: 'La candidature #45 n\'a pas pu être validée',
                    ip: '192.168.1.103',
                    module: 'Candidatures',
                },
                {
                    id: '5',
                    timestamp: new Date(Date.now() - 1000 * 60 * 90),
                    level: 'info',
                    user: 'Youssef EL HASSANI',
                    action: 'Dépôt de candidature',
                    details: 'Candidature pour Stage Développement Web',
                    ip: '192.168.1.104',
                    module: 'Candidatures',
                },
                {
                    id: '6',
                    timestamp: new Date(Date.now() - 1000 * 60 * 120),
                    level: 'success',
                    user: 'Système',
                    action: 'Sauvegarde automatique',
                    details: 'Base de données sauvegardée avec succès',
                    ip: '127.0.0.1',
                    module: 'Système',
                },
                {
                    id: '7',
                    timestamp: new Date(Date.now() - 1000 * 60 * 180),
                    level: 'error',
                    user: 'Système',
                    action: 'Erreur de base de données',
                    details: 'Timeout lors de la sauvegarde automatique',
                    ip: '127.0.0.1',
                    module: 'Système',
                },
                {
                    id: '8',
                    timestamp: new Date(Date.now() - 1000 * 60 * 240),
                    level: 'warning',
                    user: 'Safaa EL KADOURI',
                    action: 'Modification de rôle',
                    details: 'Rôle de Karim BENNANI modifié: RH → Encadrant',
                    ip: '192.168.1.100',
                    module: 'Administration',
                },
                {
                    id: '9',
                    timestamp: new Date(Date.now() - 1000 * 60 * 300),
                    level: 'info',
                    user: 'Karim BENNANI',
                    action: 'Validation d\'offre',
                    details: 'Offre "Stage en Data Science" validée',
                    ip: '192.168.1.101',
                    module: 'Offres',
                },
                {
                    id: '10',
                    timestamp: new Date(Date.now() - 1000 * 60 * 360),
                    level: 'success',
                    user: 'Fatima ALAOUI',
                    action: 'Clôture de stage',
                    details: 'Stage #12 clôturé avec note 18/20',
                    ip: '192.168.1.102',
                    module: 'Stages',
                },
            ];

            setLogs(mockLogs);
            setFilteredLogs(mockLogs);

        } catch (error) {
            console.error('Erreur chargement logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterLogs = () => {
        let filtered = [...logs];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (l) =>
                    l.user.toLowerCase().includes(term) ||
                    l.action.toLowerCase().includes(term) ||
                    l.details.toLowerCase().includes(term) ||
                    l.module.toLowerCase().includes(term)
            );
        }

        if (levelFilter !== 'all') {
            filtered = filtered.filter((l) => l.level === levelFilter);
        }

        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();
            switch (dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    filtered = filtered.filter((l) => new Date(l.timestamp) >= filterDate);
                    break;
                case 'week':
                    filterDate.setDate(filterDate.getDate() - 7);
                    filtered = filtered.filter((l) => new Date(l.timestamp) >= filterDate);
                    break;
                case 'month':
                    filterDate.setMonth(filterDate.getMonth() - 1);
                    filtered = filtered.filter((l) => new Date(l.timestamp) >= filterDate);
                    break;
            }
        }

        setFilteredLogs(filtered);
        setPage(1);
    };

    const formatDate = (date) => {
        return format(new Date(date), 'dd/MM/yyyy HH:mm:ss', { locale: fr });
    };

    const getLevelIcon = (level) => {
        switch (level) {
            case 'error': return <ErrorIcon sx={{ fontSize: 14 }} />;
            case 'warning': return <Warning sx={{ fontSize: 14 }} />;
            case 'success': return <CheckCircle sx={{ fontSize: 14 }} />;
            case 'debug': return <Info sx={{ fontSize: 14 }} />;
            default: return <Info sx={{ fontSize: 14 }} />;
        }
    };

    const getLevelLabel = (level) => {
        switch (level) {
            case 'error': return 'Erreur';
            case 'warning': return 'Avertissement';
            case 'success': return 'Succès';
            case 'debug': return 'Debug';
            default: return 'Info';
        }
    };

    const handleOpenDialog = (log) => {
        setSelectedLog(log);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedLog(null);
    };

    const handleExport = () => {
        // TODO: Exporter les logs en CSV ou PDF
        console.log('📥 Export des logs');
        alert('📥 Fonctionnalité d\'export (bientôt disponible)');
    };

    const handleClearLogs = () => {
        // TODO: Vider les logs
        console.log('🗑️ Vidage des logs');
        setLogs([]);
        setFilteredLogs([]);
    };

    const indexOfLastLog = page * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        const levels = ['all', 'error', 'warning', 'info', 'success', 'debug'];
        setLevelFilter(levels[newValue]);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <PageHeader>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                        📋 Logs d'audit
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {filteredLogs.length} entrée(s) trouvée(s)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleExport}
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                        Exporter
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchLogs}
                        disabled={loading}
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                    >
                        Rafraîchir
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Delete />}
                        onClick={handleClearLogs}
                        sx={{
                            backgroundColor: '#ef4444',
                            borderRadius: '12px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#dc2626' },
                        }}
                    >
                        Vider les logs
                    </Button>
                </Box>
            </PageHeader>

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
                    <Grid item xs={12} sm={3}>
                        <TextField
                            select
                            label="Période"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            size="small"
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#fff' },
                            }}
                        >
                            <MenuItem value="all">Toutes les périodes</MenuItem>
                            <MenuItem value="today">Aujourd'hui</MenuItem>
                            <MenuItem value="week">7 derniers jours</MenuItem>
                            <MenuItem value="month">30 derniers jours</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={() => {
                                setSearchTerm('');
                                setLevelFilter('all');
                                setDateFilter('all');
                                setTabValue(0);
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

            {/* ===== TABS (Niveaux) ===== */}
            <Paper sx={{ mb: 3, borderRadius: '12px' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 500,
                            minHeight: '48px',
                        },
                        '& .Mui-selected': {
                            color: '#148aa0',
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#148aa0',
                        },
                    }}
                >
                    <Tab label="📊 Tous" />
                    <Tab label="🔴 Erreurs" />
                    <Tab label="🟡 Avertissements" />
                    <Tab label="🔵 Informations" />
                    <Tab label="🟢 Succès" />
                    <Tab label="🟣 Debug" />
                </Tabs>
            </Paper>

            {/* ===== TABLEAU ===== */}
            <TableContainer
                component={Paper}
                sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
                            <StyledTableCell>Date/Heure</StyledTableCell>
                            <StyledTableCell>Niveau</StyledTableCell>
                            <StyledTableCell>Utilisateur</StyledTableCell>
                            <StyledTableCell>Action</StyledTableCell>
                            <StyledTableCell>Module</StyledTableCell>
                            <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={40} sx={{ color: '#148aa0' }} />
                                </TableCell>
                            </TableRow>
                        ) : currentLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucun log trouvé
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentLogs.map((log) => (
                                <TableRow key={log.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" noWrap>
                                            {formatDate(log.timestamp)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <LogLevelChip
                                            icon={getLevelIcon(log.level)}
                                            label={getLevelLabel(log.level)}
                                            level={log.level}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>
                                            {log.user}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {log.action}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={log.module}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#e0e7ff',
                                                color: '#4338ca',
                                                fontWeight: 500,
                                                fontSize: '11px',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Voir les détails">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(log)}
                                                sx={{ color: '#148aa0' }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ===== PAGINATION ===== */}
            {filteredLogs.length > logsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                borderRadius: '8px',
                            },
                            '& .Mui-selected': {
                                backgroundColor: '#148aa0 !important',
                                color: '#fff',
                            },
                        }}
                    />
                </Box>
            )}

            {/* ===== DIALOG DÉTAILS ===== */}
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
                    📄 Détails du log
                </DialogTitle>
                <DialogContent>
                    {selectedLog && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Date et heure
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {formatDate(selectedLog.timestamp)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Niveau
                                </Typography>
                                <LogLevelChip
                                    icon={getLevelIcon(selectedLog.level)}
                                    label={getLevelLabel(selectedLog.level)}
                                    level={selectedLog.level}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Utilisateur
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {selectedLog.user}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Module
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {selectedLog.module}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">
                                    Action
                                </Typography>
                                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                                    {selectedLog.action}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">
                                    Détails
                                </Typography>
                                <Paper
                                    sx={{
                                        p: 2,
                                        mt: 0.5,
                                        backgroundColor: '#f7f7f7',
                                        borderRadius: '8px',
                                        fontFamily: 'monospace',
                                        fontSize: '13px',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {selectedLog.details}
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">
                                    Adresse IP
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {selectedLog.ip}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">
                                    ID du log
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                    {selectedLog.id}
                                </Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        onClick={handleCloseDialog}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Logs;
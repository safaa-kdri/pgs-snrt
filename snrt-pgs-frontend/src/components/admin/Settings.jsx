// src/components/admin/Settings.jsx
// ✅ CORRECTION : Ajout des IDs pour les TextField et Select

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Grid,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Save,
    Refresh,
    Settings as SettingsIcon,
    Security,
    Email,
    Storage,
    Language,
    Notifications,
    Build,
} from '@mui/icons-material';

// ============================================
// STYLES
// ============================================

const SettingsCard = styled(Card)({
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    marginBottom: '24px',
    border: '1px solid #eef1f3',
    '& .MuiCardContent-root': {
        padding: '24px',
    },
});

const SectionTitle = styled(Typography)({
    fontSize: '18px',
    fontWeight: 600,
    color: '#1a2332',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
});

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#fff',
    },
    '& .MuiInputLabel-root': {
        color: '#666',
    },
});

const SaveButton = styled(Button)({
    borderRadius: '12px',
    backgroundColor: '#000000',
    color: '#ffffff',
    textTransform: 'none',
    fontWeight: 600,
    padding: '10px 32px',
    '&:hover': { backgroundColor: '#333333' },
    '&:disabled': { backgroundColor: '#999999' },
});

const CancelButton = styled(Button)({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 500,
    padding: '10px 32px',
    color: '#666666',
    borderColor: '#cccccc',
    '&:hover': {
        borderColor: '#666666',
        backgroundColor: 'rgba(0,0,0,0.04)',
    },
});

// Clé pour le stockage local
const SETTINGS_STORAGE_KEY = 'snrt_pgs_settings';

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Settings = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Valeurs par défaut
    const defaultSettings = {
        appName: 'SNRT - PGS',
        appLanguage: 'fr',
        appTheme: 'light',
        maxLoginAttempts: 3,
        blockDuration: 60,
        twoFactorRequired: true,
        sessionTimeout: 24,
        emailHost: 'smtp.gmail.com',
        emailPort: 587,
        emailSecure: false,
        emailUser: '',
        emailPassword: '',
        emailFrom: 'noreply@snrt.ma',
        emailNotifications: true,
        pushNotifications: true,
        newOfferNotifications: true,
        applicationNotifications: true,
        backupFrequency: 'daily',
        retentionDays: 365,
        maintenanceMode: false,
        maintenanceMessage: 'La plateforme est en maintenance. Veuillez revenir plus tard.',
    };

    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        loadSettings();
    }, []);

    // ✅ CHARGER LES PARAMÈTRES DEPUIS localStorage
    const loadSettings = () => {
        setLoading(true);
        setError('');
        try {
            const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setSettings({ ...defaultSettings, ...parsed });
            } else {
                setSettings(defaultSettings);
                // Sauvegarder les valeurs par défaut
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
            }
            setSuccess('Paramètres chargés avec succès');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Erreur chargement paramètres:', error);
            setError('Erreur lors du chargement des paramètres');
            setSettings(defaultSettings);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings({ ...settings, [field]: value });
        setSuccess('');
        setError('');
    };

    // ✅ SAUVEGARDER LES PARAMÈTRES DANS localStorage
    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        setSnackbarOpen(false);

        try {
            // Sauvegarder dans localStorage
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            
            // Simuler un délai pour l'effet de sauvegarde
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setSuccess('Paramètres sauvegardés avec succès');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setError('Erreur lors de la sauvegarde des paramètres');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('Voulez-vous vraiment réinitialiser tous les paramètres ?')) {
            localStorage.removeItem(SETTINGS_STORAGE_KEY);
            setSettings(defaultSettings);
            setSuccess('Paramètres réinitialisés');
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#000000' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                    Paramètres généraux
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Configurez les paramètres de la plateforme
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                </Alert>
            )}

            {success && !snackbarOpen && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                    {success}
                </Alert>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ borderRadius: '12px' }}>
                    Paramètres sauvegardés avec succès
                </Alert>
            </Snackbar>

            {/* ===== GÉNÉRAL ===== */}
            <SettingsCard>
                <CardContent>
                    <SectionTitle>
                        <SettingsIcon sx={{ color: '#000000' }} />
                        Général
                    </SectionTitle>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                id="settings-appName"
                                label="Nom de l'application"
                                value={settings.appName}
                                onChange={(e) => handleChange('appName', e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="settings-language-label">Langue</InputLabel>
                                <Select
                                    labelId="settings-language-label"
                                    id="settings-language"
                                    value={settings.appLanguage}
                                    onChange={(e) => handleChange('appLanguage', e.target.value)}
                                    label="Langue"
                                    sx={{ borderRadius: '10px', backgroundColor: '#fff' }}
                                >
                                    <MenuItem value="fr">Français</MenuItem>
                                    <MenuItem value="en">English</MenuItem>
                                    <MenuItem value="ar">العربية</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="settings-theme-label">Thème</InputLabel>
                                <Select
                                    labelId="settings-theme-label"
                                    id="settings-theme"
                                    value={settings.appTheme}
                                    onChange={(e) => handleChange('appTheme', e.target.value)}
                                    label="Thème"
                                    sx={{ borderRadius: '10px', backgroundColor: '#fff' }}
                                >
                                    <MenuItem value="light">Clair</MenuItem>
                                    <MenuItem value="dark">Sombre</MenuItem>
                                    <MenuItem value="system">Système</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </SettingsCard>

            {/* ===== SÉCURITÉ ===== */}
            <SettingsCard>
                <CardContent>
                    <SectionTitle>
                        <Security sx={{ color: '#4f46e5' }} />
                        Sécurité
                    </SectionTitle>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <StyledTextField
                                id="settings-maxLoginAttempts"
                                label="Tentatives max"
                                type="number"
                                value={settings.maxLoginAttempts}
                                onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                                fullWidth
                                InputProps={{ inputProps: { min: 1, max: 10 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StyledTextField
                                id="settings-blockDuration"
                                label="Durée blocage (minutes)"
                                type="number"
                                value={settings.blockDuration}
                                onChange={(e) => handleChange('blockDuration', parseInt(e.target.value))}
                                fullWidth
                                InputProps={{ inputProps: { min: 5, max: 1440 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StyledTextField
                                id="settings-sessionTimeout"
                                label="Timeout session (heures)"
                                type="number"
                                value={settings.sessionTimeout}
                                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                                fullWidth
                                InputProps={{ inputProps: { min: 1, max: 72 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        id="settings-twoFactorRequired"
                                        checked={settings.twoFactorRequired}
                                        onChange={(e) => handleChange('twoFactorRequired', e.target.checked)}
                                    />
                                }
                                label="Authentification à deux facteurs (2FA) obligatoire"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </SettingsCard>

            {/* ===== EMAIL ===== */}
            <SettingsCard>
                <CardContent>
                    <SectionTitle>
                        <Email sx={{ color: '#f59e0b' }} />
                        Configuration Email
                    </SectionTitle>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                id="settings-emailHost"
                                label="Serveur SMTP"
                                value={settings.emailHost}
                                onChange={(e) => handleChange('emailHost', e.target.value)}
                                fullWidth
                                placeholder="smtp.gmail.com"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                id="settings-emailPort"
                                label="Port"
                                type="number"
                                value={settings.emailPort}
                                onChange={(e) => handleChange('emailPort', parseInt(e.target.value))}
                                fullWidth
                                InputProps={{ inputProps: { min: 1, max: 65535 } }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        id="settings-emailSecure"
                                        checked={settings.emailSecure}
                                        onChange={(e) => handleChange('emailSecure', e.target.checked)}
                                    />
                                }
                                label="Utiliser une connexion sécurisée (SSL/TLS)"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                id="settings-emailUser"
                                label="Utilisateur SMTP"
                                value={settings.emailUser}
                                onChange={(e) => handleChange('emailUser', e.target.value)}
                                fullWidth
                                placeholder="user@domain.com"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                id="settings-emailPassword"
                                label="Mot de passe SMTP"
                                type="password"
                                value={settings.emailPassword}
                                onChange={(e) => handleChange('emailPassword', e.target.value)}
                                fullWidth
                                placeholder="••••••••"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <StyledTextField
                                id="settings-emailFrom"
                                label="Email d'envoi"
                                value={settings.emailFrom}
                                onChange={(e) => handleChange('emailFrom', e.target.value)}
                                fullWidth
                                placeholder="noreply@snrt.ma"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </SettingsCard>

            {/* ===== NOTIFICATIONS ===== */}
            <SettingsCard>
                <CardContent>
                    <SectionTitle>
                        <Notifications sx={{ color: '#8b5cf6' }} />
                        Notifications
                    </SectionTitle>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        id="settings-emailNotifications"
                                        checked={settings.emailNotifications}
                                        onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                                    />
                                }
                                label="Notifications par email"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        id="settings-pushNotifications"
                                        checked={settings.pushNotifications}
                                        onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                                    />
                                }
                                label="Notifications push"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        id="settings-newOfferNotifications"
                                        checked={settings.newOfferNotifications}
                                        onChange={(e) => handleChange('newOfferNotifications', e.target.checked)}
                                    />
                                }
                                label="Alertes nouvelles offres"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        id="settings-applicationNotifications"
                                        checked={settings.applicationNotifications}
                                        onChange={(e) => handleChange('applicationNotifications', e.target.checked)}
                                    />
                                }
                                label="Alertes candidatures"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </SettingsCard>

            {/* ===== BASE DE DONNÉES ===== */}
            <SettingsCard>
                <CardContent>
                    <SectionTitle>
                        <Storage sx={{ color: '#22c55e' }} />
                        Base de données
                    </SectionTitle>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="settings-backup-label">Fréquence des sauvegardes</InputLabel>
                                <Select
                                    labelId="settings-backup-label"
                                    id="settings-backup"
                                    value={settings.backupFrequency}
                                    onChange={(e) => handleChange('backupFrequency', e.target.value)}
                                    label="Fréquence des sauvegardes"
                                    sx={{ borderRadius: '10px', backgroundColor: '#fff' }}
                                >
                                    <MenuItem value="hourly">Horaire</MenuItem>
                                    <MenuItem value="daily">Quotidienne</MenuItem>
                                    <MenuItem value="weekly">Hebdomadaire</MenuItem>
                                    <MenuItem value="monthly">Mensuelle</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                id="settings-retentionDays"
                                label="Conservation (jours)"
                                type="number"
                                value={settings.retentionDays}
                                onChange={(e) => handleChange('retentionDays', parseInt(e.target.value))}
                                fullWidth
                                InputProps={{ inputProps: { min: 1, max: 3650 } }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </SettingsCard>

            {/* ===== MAINTENANCE ===== */}
            <SettingsCard>
                <CardContent>
                    <SectionTitle>
                        <Build sx={{ color: '#ef4444' }} />
                        Maintenance
                    </SectionTitle>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        id="settings-maintenanceMode"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                    />
                                }
                                label={
                                    <Typography color={settings.maintenanceMode ? '#ef4444' : 'inherit'}>
                                        {settings.maintenanceMode ? 'Mode maintenance activé' : 'Mode maintenance désactivé'}
                                    </Typography>
                                }
                            />
                        </Grid>
                        {settings.maintenanceMode && (
                            <Grid item xs={12}>
                                <StyledTextField
                                    id="settings-maintenanceMessage"
                                    label="Message de maintenance"
                                    value={settings.maintenanceMessage}
                                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="La plateforme est en maintenance. Veuillez revenir plus tard."
                                />
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </SettingsCard>

            {/* ===== BOUTONS ===== */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <CancelButton
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleReset}
                    disabled={saving}
                >
                    Réinitialiser
                </CancelButton>
                <SaveButton
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                >
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </SaveButton>
            </Box>
        </Container>
    );
};

export default Settings;
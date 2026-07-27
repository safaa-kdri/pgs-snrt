// src/components/admin/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Grid,
    Alert,
    CircularProgress,
    Divider,
    Card,
    CardContent,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Save,
    Refresh,
    Settings as SettingsIcon,
    Security,
    Email,
    Storage,
    Palette,
    Language,
    Notifications,
} from '@mui/icons-material';

// ============================================
// STYLES
// ============================================

const SettingsCard = styled(Card)({
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    marginBottom: '24px',
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
    backgroundColor: '#148aa0',
    color: '#fff',
    textTransform: 'none',
    fontWeight: 600,
    padding: '10px 32px',
    '&:hover': { backgroundColor: '#0b7890' },
    '&:disabled': { backgroundColor: '#a0c4cd' },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Settings = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // État des paramètres
    const [settings, setSettings] = useState({
        // Général
        appName: 'SNRT - PGS',
        appLogo: '',
        appLanguage: 'fr',
        appTheme: 'light',

        // Sécurité
        maxLoginAttempts: 3,
        blockDuration: 60,
        twoFactorRequired: true,
        sessionTimeout: 24,

        // Email
        emailHost: 'smtp.gmail.com',
        emailPort: 587,
        emailFrom: 'noreply@snrt.ma',

        // Notifications
        emailNotifications: true,
        pushNotifications: true,
        newOfferNotifications: true,
        applicationNotifications: true,

        // Base de données
        backupFrequency: 'daily',
        retentionDays: 365,

        // Maintenance
        maintenanceMode: false,
        maintenanceMessage: 'La plateforme est en maintenance. Veuillez revenir plus tard.',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            // TODO: Appel API GET /settings
            setSuccess('Paramètres chargés avec succès');
        } catch (error) {
            console.error('Erreur chargement paramètres:', error);
            setError('Erreur lors du chargement des paramètres');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings({ ...settings, [field]: value });
        setSuccess('');
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // TODO: Appel API PUT /settings
            console.log('💾 Paramètres sauvegardés:', settings);
            setSuccess('✅ Paramètres sauvegardés avec succès !');
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setError('❌ Erreur lors de la sauvegarde des paramètres');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ===== EN-TÊTE ===== */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
                    ⚙️ Paramètres généraux
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

            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                    {success}
                </Alert>
            )}

            {/* ===== GÉNÉRAL ===== */}
            <SettingsCard>
                <CardContent>
                    <SectionTitle>
                        <SettingsIcon sx={{ color: '#148aa0' }} />
                        Général
                    </SectionTitle>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                label="Nom de l'application"
                                value={settings.appName}
                                onChange={(e) => handleChange('appName', e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Langue</InputLabel>
                                <Select
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
                                <InputLabel>Thème</InputLabel>
                                <Select
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
                                label="Tentatives max"
                                type="number"
                                value={settings.maxLoginAttempts}
                                onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StyledTextField
                                label="Durée blocage (minutes)"
                                type="number"
                                value={settings.blockDuration}
                                onChange={(e) => handleChange('blockDuration', parseInt(e.target.value))}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StyledTextField
                                label="Timeout session (heures)"
                                type="number"
                                value={settings.sessionTimeout}
                                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.twoFactorRequired}
                                        onChange={(e) => handleChange('twoFactorRequired', e.target.checked)}
                                        sx={{ '& .MuiSwitch-track': { backgroundColor: settings.twoFactorRequired ? '#148aa0' : '#ccc' } }}
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
                                label="Serveur SMTP"
                                value={settings.emailHost}
                                onChange={(e) => handleChange('emailHost', e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <StyledTextField
                                label="Port"
                                type="number"
                                value={settings.emailPort}
                                onChange={(e) => handleChange('emailPort', parseInt(e.target.value))}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <StyledTextField
                                label="Email d'envoi"
                                value={settings.emailFrom}
                                onChange={(e) => handleChange('emailFrom', e.target.value)}
                                fullWidth
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
                                <InputLabel>Fréquence des sauvegardes</InputLabel>
                                <Select
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
                                label="Conservation (jours)"
                                type="number"
                                value={settings.retentionDays}
                                onChange={(e) => handleChange('retentionDays', parseInt(e.target.value))}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </SettingsCard>

            {/* ===== MAINTENANCE ===== */}
            <SettingsCard>
                <CardContent>
                    <SectionTitle>
                        <SettingsIcon sx={{ color: '#ef4444' }} />
                        Maintenance
                    </SectionTitle>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                        sx={{ '& .MuiSwitch-track': { backgroundColor: settings.maintenanceMode ? '#ef4444' : '#ccc' } }}
                                    />
                                }
                                label={
                                    <Typography color={settings.maintenanceMode ? '#ef4444' : 'inherit'}>
                                        {settings.maintenanceMode ? '⚠️ Mode maintenance activé' : 'Mode maintenance désactivé'}
                                    </Typography>
                                }
                            />
                        </Grid>
                        {settings.maintenanceMode && (
                            <Grid item xs={12}>
                                <StyledTextField
                                    label="Message de maintenance"
                                    value={settings.maintenanceMessage}
                                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </SettingsCard>

            {/* ===== BOUTONS ===== */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchSettings}
                    sx={{ borderRadius: '12px', textTransform: 'none' }}
                >
                    Réinitialiser
                </Button>
                <SaveButton
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                >
                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </SaveButton>
            </Box>
        </Container>
    );
};

export default Settings;
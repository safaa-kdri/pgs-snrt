// src/components/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Avatar,
    Badge,
    Paper,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Work as WorkIcon,
    Description as DescriptionIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarIcon,
    Settings as SettingsIcon,
    Help as HelpIcon,
    ContactMail as ContactIcon,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import { loadCurrentUser, logout } from '../../store/slices/authSlice';

// ============================================
// STYLES
// ============================================

const drawerWidth = 280;

const AppBar = styled(Box)({
    backgroundColor: '#06455b',
    backgroundImage: 'url(/navbar-bg.jpeg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '74px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 1100,
});

const Logo = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '& img': {
        width: '50px',
        height: 'auto',
    },
    '& span': {
        color: 'white',
        fontSize: '18px',
        fontWeight: 600,
        fontFamily: '"Inria Sans", sans-serif',
        letterSpacing: '1px',
    },
});

const MenuButton = styled(IconButton)({
    color: 'white',
    '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});

const DrawerStyled = styled(Drawer)({
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        backgroundColor: '#f7f7f7',
        border: 'none',
        boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
    },
});

const DrawerHeader = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    backgroundColor: '#06455b',
    backgroundImage: 'url(/navbar-bg.jpeg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    '& img': {
        width: '60px',
        height: 'auto',
    },
    '& span': {
        color: 'white',
        fontSize: '18px',
        fontWeight: 600,
        fontFamily: '"Inria Sans", sans-serif',
        marginLeft: '10px',
        letterSpacing: '1px',
    },
});

const DrawerUser = styled(Box)({
    padding: '20px 16px',
    textAlign: 'center',
    borderBottom: '1px solid #e8edf0',
    '& .MuiAvatar-root': {
        width: 56,
        height: 56,
        margin: '0 auto 8px',
        backgroundColor: '#148aa0',
    },
    '& .name': {
        fontSize: '16px',
        fontWeight: 600,
        color: '#1a1a2e',
        fontFamily: 'Inter, sans-serif',
    },
    '& .role': {
        fontSize: '13px',
        color: '#6d7884',
        fontFamily: 'Inter, sans-serif',
    },
});

const DrawerItem = styled(ListItem)(({ active }) => ({
    borderRadius: '10px',
    margin: '4px 12px',
    padding: '10px 16px',
    backgroundColor: active ? '#148aa0' : 'transparent',
    color: active ? '#ffffff' : '#1a1a2e',
    '&:hover': {
        backgroundColor: active ? '#148aa0' : 'rgba(20, 138, 160, 0.08)',
    },
    '& .MuiListItemIcon-root': {
        color: active ? '#ffffff' : '#148aa0',
        minWidth: '40px',
    },
    '& .MuiListItemText-root .MuiTypography-root': {
        fontSize: '14px',
        fontWeight: active ? 600 : 400,
        fontFamily: 'Inter, sans-serif',
    },
}));

// ===== STATS CARDS =====
const StatsCard = styled(Card)({
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e8edf0',
    transition: 'all 0.2s ease',
    '&:hover': {
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        transform: 'translateY(-2px)',
    },
});

const StatsIcon = styled(Box)(({ color }) => ({
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: color || '#e8edf0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': {
        color: '#ffffff',
        fontSize: '24px',
    },
}));

const StatsValue = styled(Typography)({
    fontSize: '28px',
    fontWeight: 700,
    color: '#1a1a2e',
    fontFamily: 'Inter, sans-serif',
});

const StatsLabel = styled(Typography)({
    fontSize: '14px',
    color: '#6d7884',
    fontFamily: 'Inter, sans-serif',
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const AdminDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeItem, setActiveItem] = useState('dashboard');

    // ✅ Vérifier l'authentification
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login-interne', { replace: true });
        }
        dispatch(loadCurrentUser());
    }, [dispatch, navigate]);

    // ✅ Si pas authentifié, rediriger
    if (!isAuthenticated && !localStorage.getItem('token')) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const handleNavigate = (path, item) => {
        setActiveItem(item);
        navigate(path);
        setDrawerOpen(false);
    };

    const menuItems = [
        { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin', key: 'dashboard' },
        { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/admin/users', key: 'users' },
        { text: 'Offres de stage', icon: <WorkIcon />, path: '/admin/offres', key: 'offres' },
        { text: 'Départements', icon: <BusinessIcon />, path: '/admin/departments', key: 'departments' },
        { text: 'Périodes', icon: <CalendarIcon />, path: '/admin/periods', key: 'periods' },
        { text: 'Logs', icon: <DescriptionIcon />, path: '/admin/logs', key: 'logs' },
        { text: 'Paramètres', icon: <SettingsIcon />, path: '/admin/settings', key: 'settings' },
        { divider: true },
        { text: 'FAQ', icon: <HelpIcon />, path: '/faq', key: 'faq' },
        { text: 'Contact', icon: <ContactIcon />, path: '/contact', key: 'contact' },
    ];

    // ========================================== //
    // STATS MOCK (à remplacer par API)
    // ========================================== //

    const stats = [
        { label: 'Total Utilisateurs', value: '1,284', icon: <PeopleIcon />, color: '#4f46e5' },
        { label: 'Offres Publiées', value: '47', icon: <WorkIcon />, color: '#148aa0' },
        { label: 'Candidatures', value: '312', icon: <DescriptionIcon />, color: '#f59e0b' },
        { label: 'Stages en cours', value: '23', icon: <BusinessIcon />, color: '#10b981' },
    ];

    const recentActivities = [
        { user: 'Ahmed Benali', action: 'a postulé à "Stage Développeur"', time: 'il y a 2 min' },
        { user: 'Sarah El Fassi', action: 'a été acceptée pour "Stage Marketing"', time: 'il y a 15 min' },
        { user: 'Karim Tazi', action: 'a déposé son rapport final', time: 'il y a 1h' },
        { user: 'Leila Amrani', action: 'a créé une nouvelle offre', time: 'il y a 3h' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            
            {/* ===== HEADER ===== */}
            <AppBar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MenuButton onClick={() => setDrawerOpen(true)}>
                        <MenuIcon sx={{ fontSize: 28 }} />
                    </MenuButton>
                    <Logo>
                        <img src="/logo_snrt_final.png" alt="SNRT" />
                        <span>E-stages</span>
                    </Logo>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton sx={{ color: 'white' }}>
                        <Badge badgeContent={4} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    <Button
                        onClick={handleLogout}
                        sx={{
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderRadius: '50px',
                            px: 3,
                            py: 0.8,
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
                            '& i': { marginRight: '8px' },
                        }}
                    >
                        <i className="fa-solid fa-sign-out-alt"></i>
                        Déconnexion
                    </Button>
                </Box>
            </AppBar>

            {/* ===== DRAWER ===== */}
            <DrawerStyled anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <DrawerHeader>
                    <img src="/logo_snrt_final.png" alt="SNRT" />
                    <span>Administration</span>
                </DrawerHeader>

                <DrawerUser>
                    <Avatar>
                        {user?.prenom?.charAt(0) || 'A'}
                    </Avatar>
                    <Typography className="name">
                        {user?.prenom} {user?.nom}
                    </Typography>
                    <Typography className="role">
                        {user?.role || 'Administrateur'}
                    </Typography>
                </DrawerUser>

                <List sx={{ pt: 2 }}>
                    {menuItems.map((item, index) => (
                        item.divider ? (
                            <Divider key={`divider-${index}`} sx={{ my: 1, mx: 2 }} />
                        ) : (
                            <DrawerItem
                                key={item.key}
                                active={activeItem === item.key}
                                onClick={() => handleNavigate(item.path, item.key)}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </DrawerItem>
                        )
                    ))}
                </List>

                <Box sx={{ p: 3, mt: 'auto', borderTop: '1px solid #e8edf0' }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleLogout}
                        sx={{
                            backgroundColor: '#dc3545',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            '&:hover': { backgroundColor: '#c82333' },
                        }}
                    >
                        <i className="fa-solid fa-sign-out-alt" style={{ marginRight: '8px' }}></i>
                        Se déconnecter
                    </Button>
                </Box>
            </DrawerStyled>

            {/* ===== CONTENU ===== */}
            <Box sx={{ flex: 1, p: 3 }}>
                <Container maxWidth="xl" sx={{ px: { xs: 0, md: 2 } }}>
                    
                    {/* TITRE */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e', fontFamily: 'Inter, sans-serif' }}>
                            Tableau de bord
                        </Typography>
                        <Typography sx={{ color: '#6d7884', fontFamily: 'Inter, sans-serif' }}>
                            Bienvenue dans votre espace d'administration, {user?.prenom || 'Admin'}.
                        </Typography>
                    </Box>

                    {/* STATS */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {stats.map((stat, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <StatsCard>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <StatsIcon color={stat.color}>
                                            {stat.icon}
                                        </StatsIcon>
                                        <Box>
                                            <StatsValue>{stat.value}</StatsValue>
                                            <StatsLabel>{stat.label}</StatsLabel>
                                        </Box>
                                    </CardContent>
                                </StatsCard>
                            </Grid>
                        ))}
                    </Grid>

                    {/* ACTIVITÉS RÉCENTES */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e8edf0' }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '18px', mb: 2, fontFamily: 'Inter, sans-serif' }}>
                                    Activités récentes
                                </Typography>
                                {recentActivities.map((activity, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            py: 1.5,
                                            borderBottom: index < recentActivities.length - 1 ? '1px solid #f0f2f5' : 'none',
                                        }}
                                    >
                                        <Box>
                                            <Typography sx={{ fontWeight: 500, fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                                                {activity.user}
                                            </Typography>
                                            <Typography sx={{ color: '#6d7884', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                                                {activity.action}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ color: '#aab1b8', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                                            {activity.time}
                                        </Typography>
                                    </Box>
                                ))}
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e8edf0' }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '18px', mb: 2, fontFamily: 'Inter, sans-serif' }}>
                                    Actions rapides
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            fontFamily: 'Inter, sans-serif',
                                            borderColor: '#148aa0',
                                            color: '#148aa0',
                                            '&:hover': { backgroundColor: 'rgba(20,138,160,0.05)' },
                                        }}
                                        onClick={() => navigate('/admin/users')}
                                    >
                                        <PeopleIcon sx={{ mr: 1, fontSize: 20 }} />
                                        Gérer les utilisateurs
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            fontFamily: 'Inter, sans-serif',
                                            borderColor: '#148aa0',
                                            color: '#148aa0',
                                            '&:hover': { backgroundColor: 'rgba(20,138,160,0.05)' },
                                        }}
                                        onClick={() => navigate('/admin/offres')}
                                    >
                                        <WorkIcon sx={{ mr: 1, fontSize: 20 }} />
                                        Gérer les offres
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            fontFamily: 'Inter, sans-serif',
                                            borderColor: '#148aa0',
                                            color: '#148aa0',
                                            '&:hover': { backgroundColor: 'rgba(20,138,160,0.05)' },
                                        }}
                                        onClick={() => navigate('/admin/departments')}
                                    >
                                        <BusinessIcon sx={{ mr: 1, fontSize: 20 }} />
                                        Gérer les départements
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            fontFamily: 'Inter, sans-serif',
                                            borderColor: '#148aa0',
                                            color: '#148aa0',
                                            '&:hover': { backgroundColor: 'rgba(20,138,160,0.05)' },
                                        }}
                                        onClick={() => navigate('/admin/settings')}
                                    >
                                        <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                                        Paramètres
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default AdminDashboard;
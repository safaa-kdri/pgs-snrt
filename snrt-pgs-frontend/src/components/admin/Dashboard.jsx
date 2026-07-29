// src/components/admin/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  ContactMail as ContactIcon,
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';
import AdminHeader from './AdminHeader';

// ============================================
// STYLES
// ============================================

const drawerWidth = 230;

const DrawerStyled = styled(Drawer)({
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    backgroundColor: '#f7f7f7',
    border: 'none',
    boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
    marginTop: '74px',
    height: 'calc(100vh - 74px)',
    position: 'fixed',
    zIndex: 1100,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
});

const DrawerList = styled(List)({
  flex: 1,
  paddingTop: '8px',
  overflow: 'hidden',
});

const DrawerFooter = styled(Box)({
  padding: '12px 16px',
  borderTop: '1px solid #e8edf0',
  flexShrink: 0,
});

const MainContent = styled(Box)({
  marginTop: '74px',
  padding: '24px',
  backgroundColor: '#f8f9fa',
  minHeight: 'calc(100vh - 74px)',
  transition: 'margin-left 0.3s ease',
  flex: 1,
});

const StatsCard = styled(Card)({
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  border: '1px solid #e8edf0',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)',
  },
});

const StatsIcon = styled(Box)(({ color }) => ({
  width: '42px',
  height: '42px',
  borderRadius: '10px',
  backgroundColor: color || '#e8edf0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    color: '#ffffff',
    fontSize: '20px',
  },
}));

const StatsValue = styled(Typography)({
  fontSize: '24px',
  fontWeight: 700,
  color: '#1a1a2e',
  fontFamily: 'Inter, sans-serif',
});

const StatsLabel = styled(Typography)({
  fontSize: '12px',
  color: '#6d7884',
  fontFamily: 'Inter, sans-serif',
});

const DrawerItem = styled(ListItem)(({ active }) => ({
  borderRadius: '8px',
  margin: '2px 8px',
  padding: '6px 12px',
  backgroundColor: active ? '#148aa0' : 'transparent',
  color: active ? '#ffffff' : '#1a1a2e',
  '&:hover': {
    backgroundColor: active ? '#148aa0' : 'rgba(20, 138, 160, 0.08)',
  },
  '& .MuiListItemIcon-root': {
    color: active ? '#ffffff' : '#148aa0',
    minWidth: '32px',
  },
  '& .MuiListItemIcon-root svg': {
    fontSize: '20px',
  },
  '& .MuiListItemText-root .MuiTypography-root': {
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    fontFamily: 'Inter, sans-serif',
  },
}));

const LogoutButton = styled(Button)({
  width: '100%',
  backgroundColor: '#dc3545',
  borderRadius: '8px',
  textTransform: 'none',
  fontFamily: 'Inter, sans-serif',
  fontSize: '13px',
  padding: '8px',
  color: '#fff',
  '&:hover': { backgroundColor: '#c82333' },
});

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const AdminDashboard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalOffers: 0,
    totalApplications: 0,
    totalInternships: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin') setActiveItem('dashboard');
    else if (path.includes('/users')) setActiveItem('users');
    else if (path.includes('/offres')) setActiveItem('offres');
    else if (path.includes('/departments')) setActiveItem('departments');
    else if (path.includes('/periods')) setActiveItem('periods');
    else if (path.includes('/settings')) setActiveItem('settings');
    else setActiveItem('dashboard');
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) {
      navigate('/login-interne', { replace: true });
      return;
    }
    try {
      const userData = JSON.parse(storedUser);
      const role = userData.role || userData.userType;
      if (role !== 'Administrateur' && role !== 'Admin') {
        navigate('/', { replace: true });
        return;
      }
      setLoading(false);
    } catch {
      navigate('/login-interne', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (hasLoaded.current || loading) return;
    hasLoaded.current = true;

    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setStatsData({
            totalUsers: d.departementsActifs || 0,
            totalOffers: d.offres?.publiees || d.offres?.total || 0,
            totalApplications: d.candidatures?.total || 0,
            totalInternships: d.stages?.enCours || 0,
          });

          const acts = [];
          if (d.offres?.publiees) acts.push({ user: 'Système', action: `${d.offres.publiees} offres publiées`, time: 'Récemment' });
          if (d.candidatures?.soumises) acts.push({ user: 'Système', action: `${d.candidatures.soumises} nouvelles candidatures`, time: 'Récemment' });
          if (d.entretiensAVenir) acts.push({ user: 'Système', action: `${d.entretiensAVenir} entretiens à venir`, time: 'À venir' });
          if (!acts.length) acts.push({ user: 'Admin', action: 'Tableau de bord chargé', time: 'à l\'instant' });
          setRecentActivities(acts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [loading]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleNavigate = (path, item) => {
    setActiveItem(item);
    navigate(path);
    setDrawerOpen(false);
  };

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin', key: 'dashboard' },
    { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/admin/users', key: 'users' },
    { text: 'Offres de stage', icon: <WorkIcon />, path: '/admin/offres', key: 'offres' },
    { text: 'Départements', icon: <BusinessIcon />, path: '/admin/departments', key: 'departments' },
    { text: 'Périodes', icon: <CalendarIcon />, path: '/admin/periods', key: 'periods' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/admin/settings', key: 'settings' },
    { divider: true },
    { text: 'FAQ', icon: <HelpIcon />, path: '/faq', key: 'faq' },
    { text: 'Contact', icon: <ContactIcon />, path: '/contact', key: 'contact' },
  ];

  const stats = [
    { label: 'Utilisateurs', value: statsData.totalUsers.toLocaleString(), icon: <PeopleIcon />, color: '#4f46e5', path: '/admin/users' },
    { label: 'Offres publiées', value: statsData.totalOffers.toLocaleString(), icon: <WorkIcon />, color: '#148aa0', path: '/admin/offres' },
    { label: 'Candidatures', value: statsData.totalApplications.toLocaleString(), icon: <DescriptionIcon />, color: '#f59e0b', path: '/admin/offres' },
    { label: 'Stages en cours', value: statsData.totalInternships.toLocaleString(), icon: <BusinessIcon />, color: '#10b981', path: '/admin/offres' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#148aa0' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AdminHeader toggleDrawer={toggleDrawer} />

      <DrawerStyled
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variant="persistent"
      >
        <DrawerList>
          {menuItems.map((item, idx) =>
            item.divider ? (
              <Divider key={`div-${idx}`} sx={{ my: 1, mx: 2 }} />
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
          )}
        </DrawerList>

        <DrawerFooter>
          <LogoutButton onClick={handleLogout}>Se déconnecter</LogoutButton>
        </DrawerFooter>
      </DrawerStyled>

      <MainContent style={{ marginLeft: drawerOpen ? drawerWidth : 0 }}>
        {children || (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a2e' }}>Tableau de bord</Typography>
              <Typography sx={{ color: '#6d7884' }}>Bienvenue Admin</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.map((s, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <StatsCard onClick={() => navigate(s.path)}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                      <StatsIcon color={s.color}>{s.icon}</StatsIcon>
                      <Box>
                        <StatsValue>{s.value}</StatsValue>
                        <StatsLabel>{s.label}</StatsLabel>
                      </Box>
                    </CardContent>
                  </StatsCard>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e8edf0' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '18px', mb: 2 }}>Activités récentes</Typography>
                  {recentActivities.length === 0 ? (
                    <Typography sx={{ color: '#6d7884', textAlign: 'center', py: 3 }}>Aucune activité</Typography>
                  ) : (
                    recentActivities.map((a, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: i < recentActivities.length - 1 ? '1px solid #f0f2f5' : 'none' }}>
                        <Box>
                          <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>{a.user}</Typography>
                          <Typography sx={{ color: '#6d7884', fontSize: '13px' }}>{a.action}</Typography>
                        </Box>
                        <Typography sx={{ color: '#aab1b8', fontSize: '12px' }}>{a.time}</Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e8edf0' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '18px', mb: 2 }}>Actions rapides</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      { label: 'Utilisateurs', icon: <PeopleIcon />, path: '/admin/users' },
                      { label: 'Offres', icon: <WorkIcon />, path: '/admin/offres' },
                      { label: 'Départements', icon: <BusinessIcon />, path: '/admin/departments' },
                      { label: 'Paramètres', icon: <SettingsIcon />, path: '/admin/settings' },
                    ].map((btn) => (
                      <Button
                        key={btn.label}
                        variant="outlined"
                        fullWidth
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '13px',
                          borderColor: '#148aa0',
                          color: '#148aa0',
                          justifyContent: 'flex-start',
                          '&:hover': { backgroundColor: 'rgba(20,138,160,0.05)' },
                        }}
                        onClick={() => handleNavigate(btn.path, btn.label.toLowerCase())}
                      >
                        {React.cloneElement(btn.icon, { sx: { mr: 1, fontSize: 18 } })}
                        {btn.label}
                      </Button>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </MainContent>
    </Box>
  );
};

export default AdminDashboard;
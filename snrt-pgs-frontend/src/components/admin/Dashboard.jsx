// src/components/admin/AdminDashboard.jsx
// ✅ CORRECTION : shouldForwardProp pour active + passage de user au header

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
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SupervisorIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PersonAdd as PersonAddIcon,
  VpnKey as VpnKeyIcon,
  Verified as VerifiedIcon,
  PostAdd as PostAddIcon,
  Edit as EditIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Publish as PublishIcon,
  Cancel as CancelIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Update as UpdateIcon,
  Event as EventIcon,
  EventNote as EventNoteIcon,
  EventBusy as EventBusyIcon,
  Assessment as AssessmentIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon2,
  AdminPanelSettings as AdminPanelSettingsIcon,
  SettingsSuggest as SettingsSuggestIcon,
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';
import AdminHeader from './AdminHeader';

// ============================================
// STYLES
// ============================================

const drawerWidth = 260;

const DrawerStyled = styled(Drawer)({
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    backgroundColor: '#e8ecf0',
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
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#c0c4c8',
    borderRadius: '4px',
  },
});

const DrawerFooter = styled(Box)({
  padding: '12px 16px',
  borderTop: '1px solid #d0d4d8',
  flexShrink: 0,
});

const MainContent = styled(Box)({
  marginTop: '74px',
  padding: '24px',
  backgroundColor: '#ffffff',
  minHeight: 'calc(100vh - 74px)',
  transition: 'margin-left 0.3s ease',
  flex: 1,
});

// ✅ CORRECTION : Filtrer la prop active pour DrawerItem
const DrawerItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ active }) => ({
  borderRadius: '8px',
  margin: '2px 8px',
  padding: '6px 12px',
  backgroundColor: active ? '#d0d4d8' : 'transparent',
  color: '#1a1a2e',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: active ? '#d0d4d8' : '#e0e4e8',
  },
  '& .MuiListItemIcon-root': {
    color: '#1a1a2e',
    minWidth: '32px',
  },
  '& .MuiListItemIcon-root svg': {
    fontSize: '20px',
  },
  '& .MuiListItemText-root .MuiTypography-root': {
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    fontFamily: 'Inter, sans-serif',
    color: '#1a1a2e',
  },
}));

// ✅ CORRECTION : Filtrer la prop active pour SubDrawerItem
const SubDrawerItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'active',
})(({ active }) => ({
  borderRadius: '8px',
  margin: '2px 8px 2px 32px',
  padding: '4px 12px',
  backgroundColor: active ? '#d0d4d8' : 'transparent',
  color: '#1a1a2e',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: active ? '#d0d4d8' : '#e0e4e8',
  },
  '& .MuiListItemIcon-root': {
    color: '#1a1a2e',
    minWidth: '28px',
  },
  '& .MuiListItemIcon-root svg': {
    fontSize: '18px',
  },
  '& .MuiListItemText-root .MuiTypography-root': {
    fontSize: '12px',
    fontWeight: active ? 600 : 400,
    fontFamily: 'Inter, sans-serif',
    color: '#1a1a2e',
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

const StatsCard = styled(Card)(({ bgcolor }) => ({
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: bgcolor || '#148aa0',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
    transform: 'translateY(-3px)',
  },
  '& .MuiCardContent-root': {
    padding: '20px 24px',
  },
}));

const StatsValue = styled(Typography)({
  fontSize: '28px',
  fontWeight: 700,
  color: '#ffffff',
  fontFamily: 'Inter, sans-serif',
});

const StatsLabel = styled(Typography)({
  fontSize: '14px',
  color: 'rgba(255,255,255,0.85)',
  fontFamily: 'Inter, sans-serif',
  marginTop: '2px',
});

const StatsIconWrapper = styled(Box)({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255,255,255,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    color: '#ffffff',
    fontSize: '24px',
  },
});

const HeaderTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: '28px',
  color: '#1a1a2e',
  fontFamily: 'Inter, sans-serif',
  letterSpacing: '-0.5px',
  marginBottom: '4px',
});

const HeaderSubtitle = styled(Typography)({
  color: '#6d7884',
  fontSize: '15px',
  fontFamily: 'Inter, sans-serif',
});

const ActivityIconWrapper = styled(Box)(({ color }) => ({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: color || '#e8ecf0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '& svg': {
    fontSize: '18px',
    color: '#ffffff',
  },
}));

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const AdminDashboard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalOffers: 0,
    totalApplications: 0,
    totalInternships: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [user, setUser] = useState(null);
  const hasLoaded = useRef(false);

  const actionLabels = {
    'LOGIN_SUCCESS': 'Connexion réussie',
    'LOGIN_FAILED': 'Tentative de connexion échouée',
    'LOGOUT': 'Déconnexion',
    'REGISTER': 'Inscription',
    'PASSWORD_CHANGED': 'Mot de passe modifié',
    'PASSWORD_RESET': 'Mot de passe réinitialisé',
    '2FA_VERIFIED': 'Vérification 2FA réussie',
    'OFFER_CREATED': 'Offre créée',
    'OFFER_UPDATED': 'Offre modifiée',
    'OFFER_SUBMITTED': 'Offre soumise',
    'OFFER_VALIDATED': 'Offre validée',
    'OFFER_PUBLISHED': 'Offre publiée',
    'OFFER_REJECTED': 'Offre refusée',
    'OFFER_ARCHIVED': 'Offre archivée',
    'OFFER_DELETED': 'Offre supprimée',
    'APPLICATION_CREATED': 'Candidature créée',
    'APPLICATION_SUBMITTED': 'Candidature soumise',
    'APPLICATION_STATUS_CHANGED': 'Statut modifié',
    'APPLICATION_DELETED': 'Candidature supprimée',
    'INTERVIEW_CREATED': 'Entretien planifié',
    'INTERVIEW_UPDATED': 'Entretien modifié',
    'INTERVIEW_CANCELLED': 'Entretien annulé',
    'INTERNSHIP_CREATED': 'Stage créé',
    'INTERNSHIP_CLOSED': 'Stage clôturé',
    'INTERNSHIP_EVALUATED': 'Stagiaire évalué',
    'USER_CREATED': 'Utilisateur créé',
    'USER_UPDATED': 'Utilisateur modifié',
    'USER_DELETED': 'Utilisateur supprimé',
    'USER_STATUS_CHANGED': 'Statut modifié',
    'USER_ROLE_CHANGED': 'Rôle modifié',
    'DOCUMENT_UPLOADED': 'Document uploadé',
    'DOCUMENT_DELETED': 'Document supprimé',
    'DOCUMENT_VERIFIED': 'Document vérifié',
    'ADMIN_ACTION': 'Action administrateur',
    'SYSTEM_ACTION': 'Action système',
  };

  const moduleConfig = {
    'Auth': { color: '#4f46e5', label: 'Authentification' },
    'Offres': { color: '#148aa0', label: 'Offres' },
    'Candidatures': { color: '#f59e0b', label: 'Candidatures' },
    'Entretiens': { color: '#8b5cf6', label: 'Entretiens' },
    'Stages': { color: '#22c55e', label: 'Stages' },
    'Utilisateurs': { color: '#3b82f6', label: 'Utilisateurs' },
    'Documents': { color: '#f97316', label: 'Documents' },
    'Systeme': { color: '#6b7280', label: 'Système' },
    'Admin': { color: '#ef4444', label: 'Administration' },
  };

  const getActionIcon = (action) => {
    if (!action) return <DescriptionIcon2 />;
    const a = action.toUpperCase();
    if (a === 'LOGIN_SUCCESS' || a === 'LOGIN_FAILED') return <LoginIcon />;
    if (a === 'LOGOUT') return <LogoutIcon />;
    if (a === 'REGISTER') return <PersonAddIcon />;
    if (a.includes('PASSWORD')) return <VpnKeyIcon />;
    if (a === '2FA_VERIFIED') return <VerifiedIcon />;
    if (a.includes('OFFER') && a.includes('CREATED')) return <PostAddIcon />;
    if (a.includes('OFFER') && a.includes('UPDATED')) return <EditIcon />;
    if (a.includes('OFFER') && a.includes('SUBMITTED')) return <SendIcon />;
    if (a.includes('OFFER') && a.includes('VALIDATED')) return <CheckCircleIcon />;
    if (a.includes('OFFER') && a.includes('PUBLISHED')) return <PublishIcon />;
    if (a.includes('OFFER') && a.includes('REJECTED')) return <CancelIcon />;
    if (a.includes('OFFER') && a.includes('ARCHIVED')) return <ArchiveIcon />;
    if (a.includes('OFFER') && a.includes('DELETED')) return <DeleteIcon />;
    if (a.includes('APPLICATION') && a.includes('CREATED')) return <AssignmentIcon />;
    if (a.includes('APPLICATION') && a.includes('SUBMITTED')) return <AssignmentTurnedInIcon />;
    if (a.includes('APPLICATION') && a.includes('CHANGED')) return <UpdateIcon />;
    if (a.includes('INTERVIEW') && a.includes('CREATED')) return <EventIcon />;
    if (a.includes('INTERVIEW') && a.includes('UPDATED')) return <EventNoteIcon />;
    if (a.includes('INTERVIEW') && a.includes('CANCELLED')) return <EventBusyIcon />;
    if (a.includes('INTERNSHIP') && a.includes('CLOSED')) return <AssignmentTurnedInIcon />;
    if (a.includes('INTERNSHIP') && a.includes('EVALUATED')) return <AssessmentIcon />;
    if (a.includes('USER') && a.includes('CREATED')) return <PersonAddIcon />;
    if (a.includes('DOCUMENT') && a.includes('UPLOADED')) return <FolderIcon />;
    if (a.includes('ADMIN')) return <AdminPanelSettingsIcon />;
    if (a.includes('SYSTEM')) return <SettingsSuggestIcon />;
    return <DescriptionIcon2 />;
  };

  // ✅ RÉCUPÉRER L'UTILISATEUR DEPUIS localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erreur chargement user:', error);
    }
  }, []);

  // ✅ MISE À JOUR DE L'ACTIVE ITEM SELON LA ROUTE
  useEffect(() => {
    const path = location.pathname;
    const search = location.search;
    
    if (path === '/admin') {
      setActiveItem('dashboard');
    } else if (path === '/admin/users' || path.startsWith('/admin/users?')) {
      setActiveItem('users');
    } else if (path.startsWith('/admin/offres')) {
      setActiveItem('offres');
    } else if (path.startsWith('/admin/departments')) {
      setActiveItem('departments');
    } else if (path.startsWith('/admin/periods')) {
      setActiveItem('periods');
    } else if (path.startsWith('/admin/settings')) {
      setActiveItem('settings');
    } else {
      setActiveItem('dashboard');
    }
  }, [location.pathname, location.search]);

  // ✅ AUTHENTIFICATION
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

  // ✅ CHARGEMENT DES DONNÉES
  useEffect(() => {
    if (hasLoaded.current || loading) return;
    hasLoaded.current = true;

    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setStatsData({
            totalUsers: d.totalUsers || d.departementsActifs || 0,
            totalOffers: d.offres?.publiees || d.offres?.total || 0,
            totalApplications: d.candidatures?.total || 0,
            totalInternships: d.stages?.enCours || 0,
          });
        }

        try {
          const logsRes = await api.get('/logs/recent?limit=10');
          if (logsRes.data?.success && logsRes.data?.data) {
            setRecentActivities(logsRes.data.data);
          }
        } catch (logErr) {
          console.warn('⚠️ Erreur récupération logs:', logErr.message);
          setRecentActivities([]);
        }
      } catch (err) {
        console.error('❌ Erreur chargement:', err);
        setStatsData({
          totalUsers: 0,
          totalOffers: 0,
          totalApplications: 0,
          totalInternships: 0,
        });
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

  // ✅ NAVIGATION SIMPLIFIÉE
  const handleNavigate = (path, item) => {
    setActiveItem(item);
    navigate(path);
  };

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  // ✅ MENU ITEMS
  const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin', key: 'dashboard' },
    { 
      text: 'Utilisateurs', 
      icon: <PeopleIcon />, 
      key: 'users',
      subItems: [
        { text: 'Administrateurs', icon: <AdminIcon />, path: '/admin/users?role=Administrateur', key: 'users-admin' },
        { text: 'RH', icon: <PeopleIcon />, path: '/admin/users?role=RH', key: 'users-rh' },
        { text: 'Département', icon: <BusinessIcon />, path: '/admin/users?role=Departement', key: 'users-department' },
        { text: 'Encadrants', icon: <SupervisorIcon />, path: '/admin/users?role=Encadrant', key: 'users-encadrant' },
        { text: 'Étudiants', icon: <SchoolIcon />, path: '/admin/users?role=Etudiant', key: 'users-etudiant' },
      ]
    },
    { text: 'Offres de stage', icon: <WorkIcon />, path: '/admin/offres', key: 'offres' },
    { text: 'Départements', icon: <BusinessIcon />, path: '/admin/departments', key: 'departments' },
    { text: 'Périodes', icon: <CalendarIcon />, path: '/admin/periods', key: 'periods' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/admin/settings', key: 'settings' },
    { divider: true },
    { text: 'FAQ', icon: <HelpIcon />, path: '/faq', key: 'faq' },
    { text: 'Contact', icon: <ContactIcon />, path: '/contact', key: 'contact' },
  ];

  const cardColors = {
    users: '#4f46e5',
    offers: '#148aa0',
    applications: '#f59e0b',
    internships: '#10b981',
  };

  const stats = [
    { 
      label: 'Utilisateurs', 
      value: statsData.totalUsers.toLocaleString(), 
      icon: <PeopleIcon />, 
      color: cardColors.users, 
      path: '/admin/users' 
    },
    { 
      label: 'Offres publiées', 
      value: statsData.totalOffers.toLocaleString(), 
      icon: <WorkIcon />, 
      color: cardColors.offers, 
      path: '/admin/offres' 
    },
    { 
      label: 'Candidatures', 
      value: statsData.totalApplications.toLocaleString(), 
      icon: <DescriptionIcon />, 
      color: cardColors.applications, 
      path: '/admin/offres' 
    },
    { 
      label: 'Stages en cours', 
      value: statsData.totalInternships.toLocaleString(), 
      icon: <BusinessIcon />, 
      color: cardColors.internships, 
      path: '/admin/offres' 
    },
  ];

  const ActivityItem = ({ activity }) => {
    const label = actionLabels[activity.action] || activity.actionLabel || activity.action || 'Action';
    const moduleInfo = moduleConfig[activity.module] || { color: '#6b7280', label: 'Général' };
    const color = moduleInfo.color;
    
    const formatDate = (date) => {
      if (!date) return 'N/A';
      const d = new Date(date);
      return d.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    const iconComponent = getActionIcon(activity.action);

    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          borderBottom: '1px solid #f0f2f5',
          '&:last-child': { borderBottom: 'none' },
          '&:hover': {
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            mx: -1,
            px: 3,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <ActivityIconWrapper color={color}>
            {iconComponent}
          </ActivityIconWrapper>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#1a1a2e' }}>
              {activity.userNom || activity.user || 'Système'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ color: '#6d7884', fontSize: '13px' }}>
                {label}
              </Typography>
              <Box 
                sx={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  backgroundColor: color,
                  display: 'inline-block'
                }} 
              />
              <Typography sx={{ color: '#9aa4ac', fontSize: '12px' }}>
                {moduleInfo.label}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography sx={{ 
          color: '#aab1b8', 
          fontSize: '12px', 
          whiteSpace: 'nowrap',
          ml: 2
        }}>
          {formatDate(activity.createdAt || activity.date || activity.timestamp)}
        </Typography>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#148aa0' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ✅ Passer user au header */}
      <AdminHeader toggleDrawer={toggleDrawer} drawerOpen={drawerOpen} user={user} />

      <DrawerStyled
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variant="persistent"
      >
        <DrawerList>
          {menuItems.map((item, idx) => {
            if (item.divider) {
              return <Divider key={`div-${idx}`} sx={{ my: 1, mx: 2, backgroundColor: '#d0d4d8' }} />;
            }

            if (item.subItems) {
              // ✅ Vérifier si un sous-item est actif
              const isSubActive = item.subItems.some(sub => 
                location.pathname === '/admin/users' && 
                location.search === `?role=${sub.text}`
              );
              const isActive = activeItem === item.key || isSubActive;

              return (
                <Box key={item.key}>
                  <DrawerItem
                    active={isActive}
                    onClick={() => handleNavigate('/admin/users', item.key)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </DrawerItem>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <SubDrawerItem
                        key={subItem.key}
                        active={
                          location.pathname === '/admin/users' && 
                          location.search === `?role=${subItem.text}`
                        }
                        onClick={() => handleNavigate(subItem.path, subItem.key)}
                      >
                        <ListItemIcon>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={subItem.text} 
                          primaryTypographyProps={{ fontSize: '12px' }}
                        />
                      </SubDrawerItem>
                    ))}
                  </List>
                </Box>
              );
            }

            return (
              <DrawerItem
                key={item.key}
                active={activeItem === item.key}
                onClick={() => handleNavigate(item.path, item.key)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </DrawerItem>
            );
          })}
        </DrawerList>

        <DrawerFooter>
          <LogoutButton onClick={handleLogout}>Se déconnecter</LogoutButton>
        </DrawerFooter>
      </DrawerStyled>

      <MainContent style={{ marginLeft: drawerOpen ? drawerWidth : 0 }}>
        {children || (
          <>
            <Box sx={{ mb: 4 }}>
              <HeaderTitle>Tableau de bord</HeaderTitle>
              <HeaderSubtitle>Bienvenue Admin</HeaderSubtitle>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.map((s, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <StatsCard bgcolor={s.color} onClick={() => navigate(s.path)}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <StatsValue>{s.value}</StatsValue>
                          <StatsLabel>{s.label}</StatsLabel>
                        </Box>
                        <StatsIconWrapper>
                          {s.icon}
                        </StatsIconWrapper>
                      </Box>
                    </CardContent>
                  </StatsCard>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #e8edf0', backgroundColor: '#ffffff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '18px', color: '#1a1a2e' }}>
                      Activités récentes
                    </Typography>
                    <Typography sx={{ color: '#6d7884', fontSize: '13px' }}>
                      {recentActivities.length} événement(s)
                    </Typography>
                  </Box>

                  {recentActivities.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography sx={{ color: '#6d7884' }}>
                        Aucune activité récente
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      {recentActivities.map((activity, index) => (
                        <ActivityItem key={index} activity={activity} />
                      ))}
                    </Box>
                  )}
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
// src/components/department/DepartmentSidebar.jsx
// ✅ VERSION CORRIGÉE - Utilisation de shouldForwardProp

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Button,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Dashboard,
    Assignment,
    Work,
    People,
    Event,
    BarChart,
    Logout,
    Help,
    ContactMail,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const drawerWidth = 280;

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

// ✅ CORRECTION : Utiliser shouldForwardProp pour filtrer les props personnalisées
const DrawerItem = styled(ListItem, {
    shouldForwardProp: (prop) => prop !== 'active',
})(({ active }) => ({
    borderRadius: '8px',
    margin: '2px 8px',
    padding: '8px 12px',
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

const DepartmentSidebar = ({ open, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleNavigate = (path) => {
        navigate(path);
        if (isMobile) {
            onClose();
        }
    };

    const isActive = (path) => {
        if (path.includes('?')) {
            const [basePath, query] = path.split('?');
            return location.pathname === basePath && location.search === `?${query}`;
        }
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('user');
        localStorage.removeItem('2faEmail');
        localStorage.removeItem('2faUserId');
        navigate('/');
    };

    const menuItems = [
        { text: 'Tableau de bord', icon: <Dashboard />, path: '/department', key: 'dashboard' },
        { text: 'Candidatures', icon: <Assignment />, path: '/department/candidatures', key: 'candidatures' },
        { text: 'Stages', icon: <Work />, path: '/department/interns', key: 'interns' },
        { text: 'Offres de stage', icon: <Work />, path: '/department/my-offers', key: 'offers' },
        { text: 'Encadrants', icon: <People />, path: '/department/encadrants', key: 'encadrants' },
        { text: 'Entretiens', icon: <Event />, path: '/department/interviews', key: 'interviews' },
        { divider: true },
        { text: 'FAQ', icon: <Help />, path: '/faq', key: 'faq' },
        { text: 'Contact', icon: <ContactMail />, path: '/contact', key: 'contact' },
    ];

    const renderMenuItem = (item) => {
        if (item.divider) {
            return <Divider key={`div-${item.text}`} sx={{ my: 1, mx: 2, backgroundColor: '#d0d4d8' }} />;
        }

        return (
            <DrawerItem
                key={item.key}
                active={isActive(item.path)}
                onClick={() => handleNavigate(item.path)}
            >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
            </DrawerItem>
        );
    };

    return (
        <DrawerStyled
            anchor="left"
            open={open}
            onClose={onClose}
            variant={isMobile ? 'temporary' : 'persistent'}
        >
            <DrawerList>
                {menuItems.map(renderMenuItem)}
            </DrawerList>

            <DrawerFooter>
                <LogoutButton onClick={handleLogout}>
                    <i className="fa-solid fa-sign-out-alt" style={{ marginRight: '8px' }}></i>
                    Se déconnecter
                </LogoutButton>
            </DrawerFooter>
        </DrawerStyled>
    );
};

export default DepartmentSidebar;
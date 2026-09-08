// src/components/common/Layout.jsx
import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SidebarAuth from './SidebarAuth';
import SidebarSearch from './SidebarSearch';
import LinksCard from './LinksCard';
import PublicTutorial from '../public/PublicTutorial';
import useTutorial from '../../hooks/useTutorial';

const Layout = ({ children, hideSidebars = false }) => {
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const isTutorialPreview = new URLSearchParams(location.search).has('tutorialPreview');
    const tutorial = useTutorial({ autoOpen: location.pathname === '/' && !isTutorialPreview });

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    // ✅ Détecter si c'est le dashboard admin (exactement /admin)
    const isAdminDashboard = location.pathname === '/admin';
    
    // ✅ Détecter si c'est une sous-page admin (/admin/users, /admin/offres, etc.)
    const isAdminSubPage = location.pathname.startsWith('/admin/') && location.pathname !== '/admin';

    // ✅ Dashboard admin → PAS de header (car AdminDashboard a déjà le sien)
    if (isAdminDashboard) {
        return (
            <Box className="theme-page-surface" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
                <Box component="main" sx={{ flex: 1, padding: 0, margin: 0 }}>
                    {children}
                </Box>
            </Box>
        );
    }

    // ✅ Sous-pages admin → Header adapté (sans menu, avec bouton retour)
    if (isAdminSubPage) {
        return (
            <Box className="theme-page-surface" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
                <Header toggleDrawer={toggleDrawer} />
                <Box component="main" sx={{ flex: 1, padding: 0, margin: 0 }}>
                    {children}
                </Box>
            </Box>
        );
    }

    // ✅ Si hideSidebars est true (ex: pages spéciales)
    if (hideSidebars) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header toggleDrawer={toggleDrawer} />
                <Box component="main" sx={{ flex: 1, padding: 0, margin: 0 }}>
                    {children}
                </Box>
                <Footer />
            </Box>
        );
    }

    // ✅ Layout normal (pages publiques)
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header toggleDrawer={toggleDrawer} />
            <Box component="main" sx={{ flex: 1, padding: 0, margin: 0 }}>
                <Grid container spacing={0}>
                    <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                        <SidebarAuth />
                        <LinksCard />
                    </Grid>

                    <Grid item xs={12} md={6} sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, borderLeft: { md: '1px solid #cfd5da' }, borderRight: { md: '1px solid #cfd5da' } }}>
                        {tutorial.isOpen && !isTutorialPreview ? <PublicTutorial tutorial={tutorial} /> : children}
                    </Grid>

                    <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                        <SidebarSearch />
                    </Grid>
                </Grid>
            </Box>
            <Footer />
        </Box>
    );
};

export default Layout;
// src/components/common/Layout.jsx
import React from 'react';
import { Box, Grid } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import SidebarAuth from './SidebarAuth';
import SidebarSearch from './SidebarSearch';
import LinksCard from './LinksCard';

const Layout = ({ children, hideSidebars = false }) => {
    if (hideSidebars) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <Box component="main" sx={{ flex: 1, padding: 0, margin: 0 }}>
                    {children}
                </Box>
                <Footer />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ flex: 1, padding: 0, margin: 0 }}>
                <Grid container spacing={0}>
                    {/* ===== SIDEBAR GAUCHE ===== */}
                    <Grid item xs={12} md={3} sx={{ px: { xs: 2, md: 1 }, py: { xs: 2, md: 3 } }}>
                        <SidebarAuth />
                        <LinksCard />
                    </Grid>

                    {/* ===== CONTENU PRINCIPAL ===== */}
                    <Grid item xs={12} md={6} sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, borderLeft: { md: '1px solid #cfd5da' }, borderRight: { md: '1px solid #cfd5da' } }}>
                        {children}
                    </Grid>

                    {/* ===== SIDEBAR DROITE ===== */}
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
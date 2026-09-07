// src/components/supervisor/SupervisorLayout.jsx
import React, { useState, useEffect } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import SupervisorHeader from './SupervisorHeader';
import SupervisorSidebar from './SupervisorSidebar';

const drawerWidth = 280;

const MainContent = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile',
})(({ open, isMobile }) => ({
    marginTop: '74px',
    padding: '24px',
    backgroundColor: 'var(--bg-primary)',
    minHeight: 'calc(100vh - 74px)',
    transition: 'margin-left 0.3s ease',
    flex: 1,
    marginLeft: (!isMobile && open) ? drawerWidth : 0,
    '@media (max-width: 960px)': {
        marginLeft: 0,
        padding: '16px',
    },
}));

const SupervisorLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useSelector((state) => state.auth);
    const [drawerOpen, setDrawerOpen] = useState(!isMobile);

    useEffect(() => {
        if (isMobile) {
            setDrawerOpen(false);
        } else {
            setDrawerOpen(true);
        }
    }, [isMobile]);

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <SupervisorHeader toggleDrawer={toggleDrawer} user={user} />
            <SupervisorSidebar 
                open={drawerOpen} 
                onClose={() => isMobile && setDrawerOpen(false)} 
                user={user} 
            />
            <MainContent className="theme-page-surface" open={drawerOpen} isMobile={isMobile}>
                <Container maxWidth="xl" sx={{ py: 2 }}>
                    {children}
                </Container>
            </MainContent>
        </Box>
    );
};

export default SupervisorLayout;
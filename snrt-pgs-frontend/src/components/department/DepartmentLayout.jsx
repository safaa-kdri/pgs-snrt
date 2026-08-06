// src/components/department/DepartmentLayout.jsx
// ✅ CORRECTION : shouldForwardProp pour filtrer les props

import React, { useState, useEffect } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import DepartmentHeader from './DepartmentHeader';
import DepartmentSidebar from './DepartmentSidebar';

const drawerWidth = 280;

// ✅ CORRECTION : Filtrer les props personnalisées
const MainContent = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ open, theme }) => ({
    marginTop: '74px',
    padding: '24px',
    backgroundColor: '#ffffff',
    minHeight: 'calc(100vh - 74px)',
    transition: 'margin-left 0.3s ease',
    flex: 1,
    marginLeft: open ? drawerWidth : 0,
    [theme.breakpoints.down('md')]: {
        marginLeft: 0,
        padding: '16px',
    },
}));

const DepartmentLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useSelector((state) => state.auth);

    const [drawerOpen, setDrawerOpen] = useState(!isMobile);

    useEffect(() => {
        setDrawerOpen(!isMobile);
    }, [isMobile]);

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <DepartmentHeader
                toggleDrawer={toggleDrawer}
                drawerOpen={drawerOpen}
                user={user}
            />
            <DepartmentSidebar
                open={drawerOpen}
                onClose={() => isMobile && setDrawerOpen(false)}
            />
            <MainContent open={drawerOpen}>
                <Container maxWidth="xl" sx={{ py: 2 }}>
                    {children}
                </Container>
            </MainContent>
        </Box>
    );
};

export default DepartmentLayout;
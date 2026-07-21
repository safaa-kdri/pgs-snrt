// src/components/common/Layout.jsx
import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            padding: 0,
            margin: 0
        }}>
            <Header />
            <Box component="main" sx={{ 
                flex: 1, 
                padding: 0, 
                margin: 0 
            }}>
                {children}
            </Box>
            <Footer />
        </Box>
    );
};

export default Layout;
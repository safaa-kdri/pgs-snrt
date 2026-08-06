// src/components/admin/AdminHeader.jsx
// ✅ MÊME STRUCTURE QUE DepartmentHeader

import React from 'react';
import { Box, IconButton, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AppBar = styled(Box)({
    backgroundColor: '#06455b',
    backgroundImage: 'url(/navbar-bg.jpeg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '74px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1200,
});

const HeaderContent = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    justifyContent: 'space-between',
});

const Logo = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
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
    padding: '8px',
    '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});

const AdminBadge = styled(Box)({
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: '20px',
    padding: '4px 16px',
    color: 'white',
    fontSize: '13px',
    fontWeight: 500,
    fontFamily: '"Inter", sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
});

const AdminHeader = ({ toggleDrawer, user }) => {
    const navigate = useNavigate();

    return (
        <AppBar>
            <HeaderContent>
                {/* PARTIE GAUCHE - Logo + Menu + Badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Logo onClick={() => navigate('/admin')}>
                        <img src="/logo_snrt_final.png" alt="SNRT" />
                        <span>E-stages</span>
                    </Logo>
                    <MenuButton onClick={toggleDrawer}>
                        <MenuIcon sx={{ fontSize: 28 }} />
                    </MenuButton>
                    <AdminBadge>
                        <i className="fa-solid fa-user-shield" style={{ fontSize: 14 }}></i>
                        Administration
                    </AdminBadge>
                </Box>

                {/* PARTIE DROITE - Avatar + Nom (comme DepartmentHeader) */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: '#2d3748',
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#fff',
                        }}
                    >
                        {user?.prenom?.[0]}{user?.nom?.[0]}
                    </Avatar>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {user?.prenom} {user?.nom}
                    </Typography>
                </Box>
            </HeaderContent>
        </AppBar>
    );
};

export default AdminHeader;
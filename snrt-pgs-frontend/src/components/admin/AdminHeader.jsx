// src/components/admin/AdminHeader.jsx
import React from 'react';
import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Menu as MenuIcon } from '@mui/icons-material';

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
  padding: '8px',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

const AdminHeader = ({ toggleDrawer }) => {
  return (
    <AppBar>
      <HeaderContent>
        <Logo>
          <img src="/logo_snrt_final.png" alt="SNRT" />
          <span>E-stages</span>
        </Logo>
        <MenuButton onClick={toggleDrawer}>
          <MenuIcon sx={{ fontSize: 28 }} />
        </MenuButton>
      </HeaderContent>
    </AppBar>
  );
};

export default AdminHeader;
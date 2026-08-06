// src/components/common/PrivateRoute.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { loadCurrentUser } from '../../store/slices/authSlice';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, status, user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) return;

        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser && !isAuthenticated) {
            dispatch(loadCurrentUser());
            return;
        }

        if (isAuthenticated || status === 'succeeded' || status === 'failed' || (status === 'idle' && !token)) {
            hasChecked.current = true;
            setLoading(false);
        }
    }, [dispatch, isAuthenticated, status]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={48} sx={{ color: '#148aa0' }} />
            </Box>
        );
    }

    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    let isAuth = isAuthenticated || (token && storedUser);

    if (!isAuth && storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            const role = userData.role || userData.userType;
            if (['Administrateur', 'Admin', 'RH', 'Departement', 'Encadrant'].includes(role)) {
                isAuth = true;
            }
        } catch (e) {}
    }

    if (!isAuth) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        let userRole = user?.role || user?.userType;
        if (!userRole && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                userRole = userData.role || userData.userType;
            } catch (e) {}
        }
        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default PrivateRoute;
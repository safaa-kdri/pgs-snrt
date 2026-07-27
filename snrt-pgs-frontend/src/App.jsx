// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import LoginInterne from './components/auth/LoginInterne';

import Layout from './components/common/Layout';
import ScrollToTop from './components/common/ScrollToTop';

// Pages publiques
import Home from './components/public/Home';
import OffersList from './components/public/OffersList';
import OfferDetail from './components/public/OfferDetail';
import FAQ from './components/public/FAQ';
import Contact from './components/public/Contact';
import Terms from './components/public/Terms';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Verify2FA from './components/auth/Verify2FA';
import { loadCurrentUser } from './store/slices/authSlice';

// ===== DASHBOARDS =====
import StudentDashboard from './components/student/Dashboard';
import AdminDashboard from './components/admin/Dashboard';
import SupervisorDashboard from './components/supervisor/Dashboard';
import RhDashboard from './components/rh/Dashboard';

// ===== ADMIN PAGES =====
import UsersList from './components/admin/UsersList';
import DepartmentsList from './components/admin/DepartmentsList';
import PeriodsList from './components/admin/PeriodsList';
import Settings from './components/admin/Settings';
import Logs from './components/admin/Logs';

// ===== SUPERVISOR PAGES =====
import InternsList from './components/supervisor/InternsList';
import InternDetail from './components/supervisor/InternDetail';
import Evaluation from './components/supervisor/Evaluation';
import CloseInternship from './components/supervisor/CloseInternship';

// ===== STUDENT PAGES =====
import Profile from './components/student/Profile';

// ===== PROTECTION DES ROUTES =====
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, status } = useSelector((state) => state.auth);
    const token = localStorage.getItem('token');

    const isAuth = isAuthenticated || !!token;

    if (status === 'loading' && !token) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={48} />
            </Box>
        );
    }

    if (!isAuth) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
    const dispatch = useDispatch();
    const location = useLocation();
    const [authTrigger, setAuthTrigger] = useState(0);

    // ✅ Nettoyage automatique si token et 2faEmail coexistent
    useEffect(() => {
        const twoFactorEmail = localStorage.getItem('2faEmail');
        const twoFactorUserId = localStorage.getItem('2faUserId');
        const token = localStorage.getItem('token');
        
        if (twoFactorEmail && token) {
            localStorage.removeItem('2faEmail');
            localStorage.removeItem('2faUserId');
        }
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            setAuthTrigger(prev => prev + 1);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // ✅ CORRIGÉ : Ne charger l'utilisateur que sur pages protégées ET avec token
    useEffect(() => {
        const publicPaths = ['/', '/login', '/register', '/forgot-password', '/verify-2fa'];
        const isPublicPage = publicPaths.includes(location.pathname);
        const token = localStorage.getItem('token');
        
        if (!isPublicPage && token) {
            dispatch(loadCurrentUser());
        }
    }, [dispatch, location, authTrigger]);

    return (
        <Box sx={{ padding: 0, margin: 0 }}>
            <Layout>
                <ScrollToTop />
                <Routes>
                    {/* ===== ROUTES PUBLIQUES ===== */}
                    <Route path="/" element={<Home />} />
                    <Route path="/offres" element={<OffersList />} />
                    <Route path="/offres/:id" element={<OfferDetail />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<Terms />} />

                    {/* ===== ROUTES AUTHENTIFICATION ===== */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/login-interne" element={<LoginInterne />} />

                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-2fa" element={<Verify2FA />} />

                    {/* ===== ROUTES PROTÉGÉES ===== */}
                    <Route path="/dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

                    {/* ===== ADMIN ROUTES ===== */}
                    <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                    <Route path="/admin/users" element={<PrivateRoute><UsersList /></PrivateRoute>} />
                    <Route path="/admin/departments" element={<PrivateRoute><DepartmentsList /></PrivateRoute>} />
                    <Route path="/admin/periods" element={<PrivateRoute><PeriodsList /></PrivateRoute>} />
                    <Route path="/admin/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                    <Route path="/admin/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />

                    {/* ===== SUPERVISOR ROUTES ===== */}
                    <Route path="/supervisor" element={<PrivateRoute><SupervisorDashboard /></PrivateRoute>} />
                    <Route path="/supervisor/interns" element={<PrivateRoute><InternsList /></PrivateRoute>} />
                    <Route path="/supervisor/interns/:id" element={<PrivateRoute><InternDetail /></PrivateRoute>} />
                    <Route path="/supervisor/evaluate/:id" element={<PrivateRoute><Evaluation /></PrivateRoute>} />
                    <Route path="/supervisor/close/:id" element={<PrivateRoute><CloseInternship /></PrivateRoute>} />

                    {/* ===== RH ROUTE ===== */}
                    <Route path="/rh" element={<PrivateRoute><RhDashboard /></PrivateRoute>} />

                    {/* ===== 404 ===== */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </Box>
    );
}

export default App;
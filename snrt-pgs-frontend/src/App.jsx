// src/App.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import Layout from './components/common/Layout';
import ScrollToTop from './components/common/ScrollToTop';

// Pages publiques
import Home from './components/public/Home';
import OffersList from './components/public/OffersList';
import OfferDetail from './components/public/OfferDetail';
import FAQ from './components/public/FAQ';
import Contact from './components/public/Contact';
import Terms from './components/public/Terms';
import ResultDetail from './components/public/ResultDetail';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Verify2FA from './components/auth/Verify2FA';
import Verify2FAInterne from './components/auth/Verify2FAInterne';
import LoginInterne from './components/auth/LoginInterne';
import { loadCurrentUser } from './store/slices/authSlice';

// ===== DASHBOARDS =====
import StudentDashboard from './components/student/Dashboard';
import AdminDashboard from './components/admin/Dashboard';
import SupervisorDashboard from './components/supervisor/Dashboard';
import RhDashboard from './components/rh/Dashboard';
import DepartmentDashboard from './components/department/Dashboard';

// ===== ADMIN PAGES =====
import UsersList from './components/admin/UsersList';
import DepartmentsList from './components/admin/DepartmentsList';
import PeriodsList from './components/admin/PeriodsList';
import Settings from './components/admin/Settings';
import AdminOffres from './components/admin/AdminOffres';

// ===== SUPERVISOR PAGES =====
import InternsList from './components/supervisor/InternsList';
import InternDetail from './components/supervisor/InternDetail';
import Evaluation from './components/supervisor/Evaluation';
import CloseInternship from './components/supervisor/CloseInternship';

// ===== STUDENT PAGES =====
import Profile from './components/student/Profile';
import Applications from './components/student/Applications';
import Favorites from './components/student/Favorites';
import Notifications from './components/student/Notifications';
import Documents from './components/student/Documents';
import DepotEngagement from './components/student/DepotEngagement';
import DepotRapport from './components/student/DepotRapport';
import Attestation from './components/student/Attestation';
import ApplicationDetailStudent from './components/student/ApplicationDetail';

// ===== DEPARTMENT PAGES =====
import CreateOffer from './components/department/CreateOffer';
import MyOffers from './components/department/MyOffers';
import OfferDetailDept from './components/department/OfferDetail';
import CandidateDetail from './components/department/CandidateDetail';
import ApplyPage from './components/public/ApplyPage';

// ===== RH PAGES =====
import ApplicationsList from './components/rh/ApplicationsList';
import ApplicationDetail from './components/rh/ApplicationDetail';
import ValidateOffers from './components/rh/ValidateOffers';
import Interviews from './components/rh/Interviews';

// ============================================
// PROTECTION DES ROUTES - POUR NON-ADMIN
// ============================================
const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, status, user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) {
            return;
        }

        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        console.log('[PrivateRoute] token:', !!token);
        console.log('[PrivateRoute] storedUser:', !!storedUser);
        console.log('[PrivateRoute] isAuthenticated:', isAuthenticated);
        console.log('[PrivateRoute] status:', status);

        if (token && storedUser && !isAuthenticated) {
            console.log('[PrivateRoute] Chargement utilisateur');
            dispatch(loadCurrentUser());
            return;
        }

        if (isAuthenticated) {
            hasChecked.current = true;
            setLoading(false);
            return;
        }

        if (status === 'succeeded' || status === 'failed') {
            hasChecked.current = true;
            setLoading(false);
            return;
        }

        if (status === 'idle' && !token) {
            hasChecked.current = true;
            setLoading(false);
            return;
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
            if (role === 'Administrateur' || role === 'Admin') {
                isAuth = true;
            }
        } catch (e) {}
    }

    if (!isAuth) {
        console.log('[PrivateRoute] Non authentifie → redirection /');
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
            console.log(`[PrivateRoute] Role ${userRole} non autorise → redirection /`);
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

// ============================================
// APP
// ============================================
function App() {
    const dispatch = useDispatch();
    const location = useLocation();
    const { isAuthenticated, status } = useSelector((state) => state.auth);
    const [authTrigger, setAuthTrigger] = useState(0);

    // ✅ Nettoyage automatique si 2faEmail et token coexistent
    useEffect(() => {
        const twoFactorEmail = localStorage.getItem('2faEmail');
        const twoFactorUserId = localStorage.getItem('2faUserId');
        const user = localStorage.getItem('user');

        if (twoFactorEmail && user) {
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

    useEffect(() => {
        const publicPaths = ['/', '/login', '/register', '/forgot-password', '/verify-2fa', '/verify-2fa-interne', '/offres', '/faq', '/contact', '/terms', '/login-interne'];
        const isPublicPage = publicPaths.some(path => {
            if (path === '/' && location.pathname === '/') return true;
            if (path.includes('/offres') && location.pathname.startsWith('/offres')) return true;
            return location.pathname === path;
        });

        if (isPublicPage) {
            return;
        }

        const user = localStorage.getItem('user');
        if (user && !isAuthenticated && status === 'idle') {
            dispatch(loadCurrentUser());
        }
    }, [dispatch, location, isAuthenticated, status, authTrigger]);

    return (
        <Box sx={{ padding: 0, margin: 0 }}>
            <ScrollToTop />
            <Routes>
                {/* ========================================== */}
                {/* ROUTES SANS LAYOUT */}
                {/* ========================================== */}
                <Route path="/login-interne" element={<LoginInterne />} />
                <Route path="/verify-2fa-interne" element={<Verify2FAInterne />} />
                <Route path="/verify-2fa" element={<Verify2FA />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* ========================================== */}
                {/* ROUTES AVEC LAYOUT PUBLIC */}
                {/* ========================================== */}
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/offres" element={<Layout><OffersList /></Layout>} />
                <Route path="/offres/:id" element={<Layout><OfferDetail /></Layout>} />
                <Route path="/resultats/:id" element={<Layout><ResultDetail /></Layout>} />
                <Route path="/faq" element={<Layout><FAQ /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />
                <Route path="/terms" element={<Layout><Terms /></Layout>} />
                <Route path="/apply/:offerId" element={<Layout><ApplyPage /></Layout>} />

                {/* ===== STUDENT ROUTES (VOTRE PARTIE) ===== */}
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/dashboard/applications" element={<Layout><PrivateRoute><Applications /></PrivateRoute></Layout>} />
                <Route path="/dashboard/favorites" element={<Layout><PrivateRoute><Favorites /></PrivateRoute></Layout>} />
                <Route path="/dashboard/notifications" element={<Layout><PrivateRoute><Notifications /></PrivateRoute></Layout>} />
                <Route path="/dashboard/documents" element={<Layout><PrivateRoute><Documents /></PrivateRoute></Layout>} />
                <Route path="/profile" element={<Layout><PrivateRoute><Profile /></PrivateRoute></Layout>} />
                <Route path="/depot-engagement/:internshipId" element={<Layout><PrivateRoute><DepotEngagement /></PrivateRoute></Layout>} />
                <Route path="/depot-rapport/:internshipId" element={<Layout><PrivateRoute><DepotRapport /></PrivateRoute></Layout>} />
                <Route path="/attestation/:internshipId" element={<Layout><PrivateRoute><Attestation /></PrivateRoute></Layout>} />
                <Route path="/dashboard/application/:id" element={<Layout><PrivateRoute><ApplicationDetailStudent /></PrivateRoute></Layout>} />

                {/* ========================================== */}
                {/* ROUTES ADMIN - AVEC AdminDashboard comme conteneur */}
                {/* ========================================== */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminDashboard><UsersList /></AdminDashboard>} />
                <Route path="/admin/offres" element={<AdminDashboard><AdminOffres /></AdminDashboard>} />
                <Route path="/admin/offres/add" element={<AdminDashboard><AdminOffres /></AdminDashboard>} />
                <Route path="/admin/offres/edit/:id" element={<AdminDashboard><AdminOffres /></AdminDashboard>} />
                <Route path="/admin/offres/view/:id" element={<AdminDashboard><AdminOffres /></AdminDashboard>} />
                <Route path="/admin/departments" element={<AdminDashboard><DepartmentsList /></AdminDashboard>} />
                <Route path="/admin/periods" element={<AdminDashboard><PeriodsList /></AdminDashboard>} />
                <Route path="/admin/settings" element={<AdminDashboard><Settings /></AdminDashboard>} />

                {/* ========================================== */}
                {/* SUPERVISOR ROUTES */}
                {/* ========================================== */}
                <Route path="/supervisor" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['Encadrant', 'Supervisor']}>
                            <SupervisorDashboard />
                        </PrivateRoute>
                    </Layout>
                } />
                <Route path="/supervisor/interns" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['Encadrant', 'Supervisor']}>
                            <InternsList />
                        </PrivateRoute>
                    </Layout>
                } />
                <Route path="/supervisor/interns/:id" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['Encadrant', 'Supervisor']}>
                            <InternDetail />
                        </PrivateRoute>
                    </Layout>
                } />
                <Route path="/supervisor/evaluate/:id" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['Encadrant', 'Supervisor']}>
                            <Evaluation />
                        </PrivateRoute>
                    </Layout>
                } />
                <Route path="/supervisor/close/:id" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['Encadrant', 'Supervisor']}>
                            <CloseInternship />
                        </PrivateRoute>
                    </Layout>
                } />

                {/* ========================================== */}
                {/* RH ROUTES */}
                {/* ========================================== */}
                <Route path="/rh" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['RH', 'Rh']}>
                            <RhDashboard />
                        </PrivateRoute>
                    </Layout>
                } />
                <Route path="/rh/applications" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['RH', 'Rh']}>
                            <ApplicationsList />
                        </PrivateRoute>
                    </Layout>
                } />
                <Route path="/rh/application/:id" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['RH', 'Rh']}>
                            <ApplicationDetail />
                        </PrivateRoute>
                    </Layout>
                } />
                <Route path="/rh/validate-offers" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['RH', 'Rh']}>
                            <ValidateOffers />
                        </PrivateRoute>
                    </Layout>
                } />
                <Route path="/rh/interviews" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['RH', 'Rh']}>
                            <Interviews />
                        </PrivateRoute>
                    </Layout>
                } />

                {/* ========================================== */}
                {/* DEPARTMENT ROUTES */}
                {/* ========================================== */}
                <Route path="/department" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['Departement', 'Department']}>
                            <DepartmentDashboard />
                        </PrivateRoute>
                    </Layout>
                } />
                <Route path="/department/create-offer" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['Departement', 'Department']}>
                            <CreateOffer />
                        </PrivateRoute>
                    </Layout>
                } />
                <Route path="/department/my-offers" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['Departement', 'Department']}>
                            <MyOffers />
                        </PrivateRoute>
                    </Layout>
                } />
                <Route path="/department/offer/:id" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['Departement', 'Department']}>
                            <OfferDetailDept />
                        </PrivateRoute>
                    </Layout>
                } />
                <Route path="/department/candidate/:id" element={
                    <Layout>
                        <PrivateRoute allowedRoles={['Departement', 'Department']}>
                            <CandidateDetail />
                        </PrivateRoute>
                    </Layout>
                } />

                {/* ===== 404 ===== */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Box>
    );
}

export default App;
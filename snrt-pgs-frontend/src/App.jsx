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
import ResultDetail from './components/public/ResultDetail';

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
import DepartmentDashboard from './components/department/Dashboard';

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
import Applications from './components/student/Applications';
import Favorites from './components/student/Favorites';
import Notifications from './components/student/Notifications';
import Documents from './components/student/Documents';
// ✅ NOUVEAUX IMPORTS
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
// PROTECTION DES ROUTES
// ============================================
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, status } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Attendre que le statut soit déterminé
        if (status === 'succeeded' || status === 'idle') {
            setLoading(false);
        }
    }, [status]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={48} />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
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

    // Debug: vérifier que les imports de pages sont des fonctions/composants
    useEffect(() => {
        try {
            console.log('Component types:', {
                Home: typeof Home,
                OffersList: typeof OffersList,
                OfferDetail: typeof OfferDetail,
                FAQ: typeof FAQ,
                Contact: typeof Contact,
                Terms: typeof Terms,
                ResultDetail: typeof ResultDetail,
                Login: typeof Login,
                Register: typeof Register,
                ForgotPassword: typeof ForgotPassword,
                Verify2FA: typeof Verify2FA,
                StudentDashboard: typeof StudentDashboard,
                AdminDashboard: typeof AdminDashboard,
                SupervisorDashboard: typeof SupervisorDashboard,
                RhDashboard: typeof RhDashboard,
                DepartmentDashboard: typeof DepartmentDashboard,
                UsersList: typeof UsersList,
                DepartmentsList: typeof DepartmentsList,
                PeriodsList: typeof PeriodsList,
                Settings: typeof Settings,
                Logs: typeof Logs,
                InternsList: typeof InternsList,
                InternDetail: typeof InternDetail,
                Evaluation: typeof Evaluation,
                CloseInternship: typeof CloseInternship,
                Profile: typeof Profile,
                Applications: typeof Applications,
                Favorites: typeof Favorites,
                Notifications: typeof Notifications,
                Documents: typeof Documents,
                DepotEngagement: typeof DepotEngagement,
                DepotRapport: typeof DepotRapport,
                Attestation: typeof Attestation,
                CreateOffer: typeof CreateOffer,
                MyOffers: typeof MyOffers,
                OfferDetailDept: typeof OfferDetailDept,
                CandidateDetail: typeof CandidateDetail,
                ApplicationsList: typeof ApplicationsList,
                ApplicationDetail: typeof ApplicationDetail,
                ValidateOffers: typeof ValidateOffers,
                Interviews: typeof Interviews,
                Layout: typeof Layout,
            });
        } catch (e) {
            console.error('Error logging component types', e);
        }
    }, []);

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

    // ✅ CHARGER L'UTILISATEUR UNIQUEMENT SUR LES PAGES PROTÉGÉES
    useEffect(() => {
        // ✅ Pages publiques : ne pas appeler /me
        const publicPaths = ['/', '/login', '/register', '/forgot-password', '/verify-2fa', '/offres', '/faq', '/contact', '/terms'];
        const isPublicPage = publicPaths.some(path => {
            if (path === '/' && location.pathname === '/') return true;
            if (path.includes('/offres') && location.pathname.startsWith('/offres')) return true;
            return location.pathname === path;
        });
        
        // ✅ Si page publique, ne pas appeler /me
        if (isPublicPage) {
            return;
        }

        // ✅ UNIQUEMENT sur les pages protégées
        const user = localStorage.getItem('user');
        if (user && !isAuthenticated && status === 'idle') {
            dispatch(loadCurrentUser());
        }
    }, [dispatch, location, isAuthenticated, status, authTrigger]);

    return (
        <Box sx={{ padding: 0, margin: 0 }}>
            <Layout>
                <ScrollToTop />
                <Routes>
                    {/* ===== ROUTES PUBLIQUES ===== */}
                    <Route path="/" element={<Home />} />
                    <Route path="/offres" element={<OffersList />} />
                    <Route path="/offres/:id" element={<OfferDetail />} />
                    <Route path="/resultats/:id" element={<ResultDetail />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/apply/:offerId" element={<ApplyPage />} />

                    {/* ===== ROUTES AUTHENTIFICATION ===== */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/login-interne" element={<LoginInterne />} />

                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-2fa" element={<Verify2FA />} />

                    {/* ===== ROUTES PROTÉGÉES ===== */}
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                    <Route path="/dashboard/applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
                    <Route path="/dashboard/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
                    <Route path="/dashboard/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                    <Route path="/dashboard/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

                    {/* ===== STUDENT - DEPOT ROUTES ===== */}
                    <Route path="/depot-engagement/:internshipId" element={<PrivateRoute><DepotEngagement /></PrivateRoute>} />
                    <Route path="/depot-rapport/:internshipId" element={<PrivateRoute><DepotRapport /></PrivateRoute>} />
                    <Route path="/attestation/:internshipId" element={<PrivateRoute><Attestation /></PrivateRoute>} />
                    <Route path="/dashboard/application/:id" element={<PrivateRoute><ApplicationDetailStudent /></PrivateRoute>} />

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

                    {/* ===== RH ROUTES ===== */}
                    <Route path="/rh" element={<PrivateRoute><RhDashboard /></PrivateRoute>} />
                    <Route path="/rh/applications" element={<PrivateRoute><ApplicationsList /></PrivateRoute>} />
                    <Route path="/rh/application/:id" element={<PrivateRoute><ApplicationDetail /></PrivateRoute>} />
                    <Route path="/rh/validate-offers" element={<PrivateRoute><ValidateOffers /></PrivateRoute>} />
                    <Route path="/rh/interviews" element={<PrivateRoute><Interviews /></PrivateRoute>} />

                    {/* ===== DEPARTMENT ROUTES ===== */}
                    <Route path="/department" element={<PrivateRoute><DepartmentDashboard /></PrivateRoute>} />
                    <Route path="/department/create-offer" element={<PrivateRoute><CreateOffer /></PrivateRoute>} />
                    <Route path="/department/my-offers" element={<PrivateRoute><MyOffers /></PrivateRoute>} />
                    <Route path="/department/offer/:id" element={<PrivateRoute><OfferDetailDept /></PrivateRoute>} />
                    <Route path="/department/candidate/:id" element={<PrivateRoute><CandidateDetail /></PrivateRoute>} />

                    {/* ===== 404 ===== */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </Box>
    );
}

export default App;
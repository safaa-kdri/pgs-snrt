// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/common/Layout';

// Pages publiques
import Home from './components/public/Home';
import OffersList from './components/public/OffersList';
import OfferDetail from './components/public/OfferDetail';
import FAQ from './components/public/FAQ';
import Contact from './components/public/Contact';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Verify2FA from './components/auth/Verify2FA';

function App() {
    return (
        <Layout>
            <Routes>
                {/* Routes Publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/offres" element={<OffersList />} />
                <Route path="/offres/:id" element={<OfferDetail />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />

                {/* Routes Authentification */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-2fa" element={<Verify2FA />} />

                {/* Routes Protégées (à venir) */}
                <Route path="/dashboard/*" element={<div>Dashboard</div>} />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}

export default App;
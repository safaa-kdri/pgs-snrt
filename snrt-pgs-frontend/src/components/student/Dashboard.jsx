// src/components/student/Dashboard.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // ✅ Rediriger vers la page d'accueil
        navigate('/', { replace: true });
    }, [navigate]);

    return null;
};

export default StudentDashboard;
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { superadminRoutes } from '../routes/SuperadminRoutes';
import ProtectedRoute from '../common/ProtectedRoute';
import LoadingSpinner from '../common/LoadingSpinner';

const SuperadminRouteWrapper: React.FC = () => {
    const { userData, loading } = useAuth();
    const pathname = window.location.pathname;
    const excludedPaths = ['/superadmin/students/new'];

    if (loading) return <LoadingSpinner />;

    // userData が無くても excludedPaths なら例外で通す
    if (!userData?.email && !excludedPaths.includes(pathname)) {
        return <Navigate to="/" replace />;
    }

    return (
        <Routes>
            {/* 動的メール前半入りURL */}
            <Route
                path={`/*`}
                element={
                    <ProtectedRoute role="superadmin">
                        <Layout role="superadmin" />
                    </ProtectedRoute>
                }
            >
                {superadminRoutes}
            </Route>
        </Routes>
    );
};

export default SuperadminRouteWrapper;

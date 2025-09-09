import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { adminRoutes } from '../routes/adminRoutes';
import ProtectedRoute from '../common/ProtectedRoute';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminRouteWrapper: React.FC = () => {
    const { userData, loading } = useAuth();
    const pathname = window.location.pathname;
    const excludedPaths = ['/admin/students/new'];

    if (loading) return <LoadingSpinner />;

    // userData が無くても excludedPaths なら例外で通す
    if (!userData?.email && !excludedPaths.includes(pathname)) {
        return <Navigate to="/" replace />;
    }

    return (
        <Routes>
            {/* 動的メール前半入りURL */}
            <Route
                path={`/admin/*`}
                element={
                    <ProtectedRoute>
                        <Layout role="admin" />
                    </ProtectedRoute>
                }
            >
                {adminRoutes}
            </Route>
        </Routes>
    );
};

export default AdminRouteWrapper;

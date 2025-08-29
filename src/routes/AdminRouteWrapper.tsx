import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { adminRoutes } from '../routes/adminRoutes';
import ProtectedRoute from '../common/ProtectedRoute';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminRouteWrapper: React.FC = () => {
    const { userData, loading } = useAuth();

    if (loading) return <LoadingSpinner />;

    if (!userData?.email) return <Navigate to="/admin-login" replace />;

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

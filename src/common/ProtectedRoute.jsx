// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const pathname = window.location.pathname;
    const excludedPaths = ['/admin/students/new'];

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!user && !excludedPaths.includes(pathname)) {
          return <Navigate to="/" replace />;
      }

  return children;
};

export default ProtectedRoute;

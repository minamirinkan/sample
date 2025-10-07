import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: 'superadmin' | 'admin' | 'teacher' | 'customer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, userData, loading } = useAuth();
  const pathname = window.location.pathname;
  const excludedPaths1 = ['/superadmin/students/new'];
  const excludedPaths2 = ['/admin/students/new'];

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!user && !excludedPaths1.includes(pathname) && !excludedPaths2.includes(pathname)) {
    return <Navigate to="/" replace />;
  }

  // 役割チェック
  if (role && userData?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

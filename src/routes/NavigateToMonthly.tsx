// /NavigateToMonthly.tsx
import { useParams, Navigate } from 'react-router-dom';
export const NavigateToMonthly = () => {
    const { studentId } = useParams<{ studentId: string }>();
    if (!studentId) return null;
    return <Navigate to={`/admin/students/${studentId}/attendance/monthly`} replace />;
};

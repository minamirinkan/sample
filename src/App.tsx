import { Routes, Route } from "react-router-dom";
import React from 'react';
import CustomerDashboard from "./guardian/Dashboard/CustomerDashboard";
import TeacherDashboard from "./teacher/Dashboard/TeacherDashboard";
import CalendarPopup from './common/timetable/components/CalendarPopup';
import ProtectedRoute from './common/ProtectedRoute';
import ChangePassword from './pages/ChangePassword';
import TeacherChangePassword from './teacher/TeacherChangePassword';
import { useAuth } from './contexts/AuthContext';
import AdminRouteWrapper from "./routes/AdminRouteWrapper";
import StudentList from "./common/timetable/components/StudentList";
import LoadingSpinner from "./common/LoadingSpinner";
import RoleBasedProvider from './contexts/providers/RoleBasedProvider';
import SuperadminRouteWrapper from "./routes/SuperadminRouteWrapper";

const App: React.FC = () => {
  const { userData, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <RoleBasedProvider>
      <ProtectedRoute>
        <Routes>
          <Route path="/mypage/dashboard" element={<CustomerDashboard />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/calendar" element={<CalendarPopup classroomCode={userData?.classroomCode ?? null} />} />
          <Route path="/customer/change-password" element={<ChangePassword />} />
          <Route path="/teacher/change-password" element={<TeacherChangePassword />} />
          <Route path="/admin/timetable/studentlist" element={<StudentList />} />
          <Route path="/admin/*" element={<AdminRouteWrapper />} />
          <Route path="/superadmin/*" element={<SuperadminRouteWrapper />} />
        </Routes>
      </ProtectedRoute>
    </RoleBasedProvider>
  );
};

export default App;

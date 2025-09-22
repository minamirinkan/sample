import { Routes, Route } from "react-router-dom";
import React from 'react';
import CalendarPopup from './common/timetable/components/CalendarPopup';
import ProtectedRoute from './common/ProtectedRoute';
import ChangePassword from './pages/ChangePassword';
import TeacherChangePassword from './teacher/TeacherChangePassword';
import { useAuth } from './contexts/AuthContext';
import AdminRouteWrapper from "./routes/AdminRouteWrapper";
import StudentList from "./common/timetable/components/StudentList";
import LoadingSpinner from "./common/LoadingSpinner";
import RoleBasedProvider from './contexts/providers/RoleBasedProvider';
import AdminStudentCalendar from './common/StudentsSchedule/StudentSchedule';
import SuperadminRouteWrapper from "./routes/SuperadminRouteWrapper";
import TeacherRouteWrapper from "./routes/TeacherRouteWrapper";
import CustomerRouteWrapper from "./routes/CustomerRouteWrapper";

const App: React.FC = () => {
  const { userData, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <RoleBasedProvider>
      <ProtectedRoute>
        <Routes>
          <Route path="/calendar" element={<CalendarPopup classroomCode={userData?.classroomCode ?? null} />} />
          <Route path="/customer/change-password" element={<ChangePassword />} />
          <Route path="/teacher/change-password" element={<TeacherChangePassword />} />
          <Route path="/admin/timetable/studentlist" element={<StudentList />} />
          <Route path="/admin/*" element={<AdminRouteWrapper />} />
          <Route path="/superadmin/*" element={<SuperadminRouteWrapper />} />
          <Route path="/teacher/*" element={<TeacherRouteWrapper />} />
          <Route path="/mypage/*" element={<CustomerRouteWrapper />} />
          <Route path="/admin/student-timetable" element={<AdminStudentCalendar />} />
        </Routes>
      </ProtectedRoute>
    </RoleBasedProvider>
  );
};

export default App;

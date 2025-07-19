import { Routes, Route } from 'react-router-dom';
import React from 'react';
import SuperAdminLogin from './pages/SuperAdminLogin.js';
import SuperAdminDashboard from "./Superadmin/Dashboard/SuperAdminDashboard";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import CustomerDashboard from "./guardian/Dashboard/CustomerDashboard.jsx";
import TeacherDashboard from "./teacher/Dashboard/TeacherDashboard.jsx";
import AdminLogin from './pages/AdminLogin.js';
import TeacherLogin from './teacher/TeacherLogin.js';
import CustomerLogin from './pages/CustomerLogin.js';
import StudentLogin from './pages/StudentLogin.js';
import TimetablePage from './common/timetable/TimetablePage.jsx';
import CalendarPopup from './common/timetable/components/CalendarPopup.jsx';
import DevLoginSelector from './pages/DevLoginSelector.jsx';
import ProtectedRoute from './common/ProtectedRoute.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import TeacherChangePassword from './teacher/TeacherChangePassword.jsx';
import ScheduleCalendarPage from './common/StudentsSchedule/ScheduleCalendarPage.jsx'
import { ToastContainer } from 'react-toastify';

const App: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<DevLoginSelector />} />
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/timetable"
          element={
            <ProtectedRoute>
              <TimetablePage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/mypage/dashboard" element={<CustomerDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/superadmin-login" element={<SuperAdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/calendar" element={<CalendarPopup />} />
        <Route path="/customer/change-password" element={<ChangePassword />} />
        <Route path="/teacher/change-password" element={<TeacherChangePassword />} />
        <Route path="/admin/schedule" element={<ScheduleCalendarPage />} />
      </Routes>
      <ToastContainer
        position="top-center"
        className="custom-toast-container"
      />
    </>
  );
}

export default App;

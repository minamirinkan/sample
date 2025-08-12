import { Routes, Route } from "react-router-dom";
import React from "react";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./Superadmin/Dashboard/SuperAdminDashboard";
import AdminDashboard from "./admin/AdminDashboard";
import CustomerDashboard from "./guardian/Dashboard/CustomerDashboard";
import TeacherDashboard from "./teacher/Dashboard/TeacherDashboard";
import AdminLogin from "./pages/AdminLogin";
import TeacherLogin from "./teacher/TeacherLogin";
import CustomerLogin from "./pages/CustomerLogin";
import TimetablePage from "./common/timetable/TimetablePage";
import CalendarPopup from "./common/timetable/components/CalendarPopup";
import DevLoginSelector from "./pages/DevLoginSelector";
import ProtectedRoute from "./common/ProtectedRoute";
import ChangePassword from "./pages/ChangePassword";
import TeacherChangePassword from "./teacher/TeacherChangePassword";
import ScheduleCalendarPage from "./common/StudentsSchedule/ScheduleCalendarPage";
import { ToastContainer } from "react-toastify";

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
        <Route path="/calendar" element={<CalendarPopup />} />
        <Route path="/customer/change-password" element={<ChangePassword />} />
        <Route
          path="/teacher/change-password"
          element={<TeacherChangePassword />}
        />
        <Route path="/admin/schedule" element={<ScheduleCalendarPage />} />
      </Routes>
      <ToastContainer
        position="top-center"
        className="custom-toast-container"
      />
    </>
  );
};

export default App;

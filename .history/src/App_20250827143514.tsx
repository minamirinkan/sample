import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import React from 'react';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from "./Superadmin/Dashboard/SuperAdminDashboard";
import AdminDashboard from "./admin/AdminDashboard";
import CustomerDashboard from "./guardian/Dashboard/CustomerDashboard";
import TeacherDashboard from "./teacher/Dashboard/TeacherDashboard";
import AdminLogin from './pages/AdminLogin';
import TeacherLogin from './teacher/TeacherLogin';
import CustomerLogin from './pages/CustomerLogin';
import StudentLogin from './pages/StudentLogin';
import TimetablePage from './common/timetable/TimetablePage';
import CalendarPopup from './common/timetable/components/CalendarPopup';
import DevLoginSelector from './pages/DevLoginSelector';
import ProtectedRoute from './common/ProtectedRoute';
import ChangePassword from './pages/ChangePassword';
import TeacherChangePassword from './teacher/TeacherChangePassword';
import { ToastContainer } from 'react-toastify';
import { ClassroomSelectionProvider } from './contexts/ClassroomSelectionContext';
import RoleBasedProvider from './contexts/providers/RoleBasedProvider';
import { useAuth } from './contexts/AuthContext';
import AdminProfile from './common/pages/adminProfile'
import Layout from "./components/Layout";

const App: React.FC = () => {
  const { userData, loading } = useAuth();

  const routes = (
    <Routes>
      <Route path="/" element={<DevLoginSelector />} />
      <Route path="/superadmin-login" element={<SuperAdminLogin />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/customer-login" element={<CustomerLogin />} />
      <Route path="/student-login" element={<StudentLogin />} />

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
      <Route path="/mypage/dashboard" element={<CustomerDashboard />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/calendar" element={<CalendarPopup classroomCode={userData?.classroomCode ?? null} />} />
      <Route path="/customer/change-password" element={<ChangePassword />} />
      <Route path="/teacher/change-password" element={<TeacherChangePassword />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <Layout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 animate-pulse">読み込み中...</p>
      </div>
    );
  }

  if (!userData) {
    // 未ログインでも表示可能なルート
    return (
      <>
        {routes}
        <ToastContainer position="top-center" className="custom-toast-container" />
      </>
    );
  }

  return (
    <RoleBasedProvider>
      <ClassroomSelectionProvider>
        <>
          {routes}
          <ToastContainer position="top-center" className="custom-toast-container" />
        </>
      </ClassroomSelectionProvider>
    </RoleBasedProvider>
  );
};

export default App;

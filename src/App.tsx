import { Routes, Route } from 'react-router-dom';
import SuperAdminLogin from './pages/SuperAdminLogin.js';
import SuperAdminDashboard from "./pages/SuperAdminDashboard.tsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import AdminLogin from './pages/AdminLogin.js';
import TeacherLogin from './pages/TeacherLogin.js';
import CustomerLogin from './pages/CustomerLogin.js';
import StudentLogin from './pages/StudentLogin.js';
import TimetablePage from './pages/TimetablePage.jsx';
import CalendarPopup from './components/CalendarPopup.jsx';
import DevLoginSelector from './pages/DevLoginSelector.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import TeacherChangePassword from './pages/TeacherChangePassword.jsx';
import ScheduleCalendarPage from './pages/ScheduleCalendarPage.jsx'
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

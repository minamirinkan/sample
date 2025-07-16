import { Routes, Route } from 'react-router-dom';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from "./pages/SuperAdminDashboard.tsx";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminLogin from './pages/AdminLogin';
import TeacherLogin from './pages/TeacherLogin';
import CustomerLogin from './pages/CustomerLogin';
import StudentLogin from './pages/StudentLogin';
import TimetablePage from './pages/TimetablePage';
import CalendarPopup from './components/CalendarPopup';
import DevLoginSelector from './pages/DevLoginSelector';
import ProtectedRoute from './components/ProtectedRoute';
import ChangePassword from './pages/ChangePassword';
import TeacherChangePassword from './pages/TeacherChangePassword';
import ScheduleCalendarPage from './pages/ScheduleCalendarPage.jsx'
import { ToastContainer } from 'react-toastify';

function App() {
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

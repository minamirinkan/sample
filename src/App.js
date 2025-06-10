import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from './pages/AdminLogin';
import TeacherLogin from './pages/TeacherLogin';
import CustomerLogin from './pages/CustomerLogin';
import StudentLogin from './pages/StudentLogin';
import TimetablePage from './pages/TimetablePage';
import CalendarPopup from './components/CalendarPopup';
import DevLoginSelector from './pages/DevLoginSelector';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DevLoginSelector />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/superadmin-login" element={<SuperAdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/superadmin/timetable" element={<TimetablePage />} />
        <Route path="/calendar" element={<CalendarPopup />} />
      </Routes>
    </Router>
  );
}

export default App;

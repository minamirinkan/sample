import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminLogin from './pages/AdminLogin';
import TeacherLogin from './pages/TeacherLogin';
import CustomerLogin from './pages/CustomerLogin';
import StudentLogin from './pages/StudentLogin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SuperAdminLogin />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
      </Routes>
    </Router>
  );
}

export default App;

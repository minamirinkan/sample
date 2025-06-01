import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import CustomerLogin from './pages/CustomerLogin';
import TeacherLogin from './pages/TeacherLogin';
import CustomerSignup from './pages/CustomerSignup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerLogin />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/customer-signup" element={<CustomerSignup />} />
        <Route path="/customer-login" element={<CustomerLogin />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import DevLoginSelector from './pages/DevLoginSelector';
import SuperAdminLogin from './pages/SuperAdminLogin';
import AdminLogin from './pages/AdminLogin';
import TeacherLogin from './teacher/TeacherLogin';
import CustomerLogin from './pages/CustomerLogin';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<DevLoginSelector />} />
          <Route path="/superadmin-login" element={<SuperAdminLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/customer-login" element={<CustomerLogin />} />

          <Route path="/*" element={<App />} />
        </Routes>
        <ToastContainer position="top-center" className="custom-toast-container" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

serviceWorkerRegistration.register();

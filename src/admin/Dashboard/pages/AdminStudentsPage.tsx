// src/pages/AdminStudentsPage.tsx
import { Routes, Route } from 'react-router-dom';
import SuperAdminStudents from '../../../common/Students/SuperAdminStudents';
import StudentRegistrationForm from '../../../common/Students/StudentRegistrationForm/StudentRegistrationForm';
import StudentDetailPage from '@/Superadmin/components/StudentDetailPage';

export default function AdminStudentsPage() {
    return (
        <Routes>
            <Route path="/" element={<SuperAdminStudents />} />
            <Route path="new" element={<StudentRegistrationForm />} />
            <Route path=":id" element={<StudentDetailPage />} />
        </Routes>
    );
}

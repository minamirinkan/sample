//src/pages/SuperAdminDashboard
import SuperAdminHeader from '../components/SuperAdminHeader';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import SuperAdminStudents from '../components/SuperAdminStudents';
import { useState } from 'react';
import SuperAdminTeachers from '../components/SuperAdminTeachers';
import TimetablePage from './TimetablePage';
import SchoolAccountAdmin from '../components/AdminRegistrationForm/SchoolAccountAdmin';
import StudentRegistrationForm from '../components/StudentRegistrationForm/StudentRegistrationForm';
import TeacherRegistrationForm from '../components/TeacherRegistrationForm/TeacherRegistrationForm';
import TuitionRegistrationForm from '../components/TuitionRegistrationTabs';
import TeacherFeeRegistration from '../components/AdminRegistrationForm/TeacherFeeRegistration';

const SuperAdminDashboard = () => {
    const [selectedContent, setSelectedContent] = useState('welcome');
    const [sidebarOpen, setSidebarOpen] = useState(true); // サイドバー開閉状態

    const renderContent = () => {
        switch (selectedContent) {
            case 'students':
                return <SuperAdminStudents onAddNewStudent={() => setSelectedContent('studentRegistration')} />;
            case 'teachers':
                return <SuperAdminTeachers onAddNewTeacher={() => setSelectedContent('teacherRegistration')} />;
            case 'timetable':
                return <TimetablePage />;
            case 'admin': // ← 教室管理
                return <SchoolAccountAdmin />;
            case 'tuition':
                return <TuitionRegistrationForm />;
            case 'TeacherFee':
                return <TeacherFeeRegistration />;
            case 'studentRegistration':
                return <StudentRegistrationForm onSubmitSuccess={() => setSelectedContent('students')} />;
            case 'teacherRegistration':
                return <TeacherRegistrationForm onSubmitSuccess={() => setSelectedContent('teachers')} />;
            default:
                return (
                    <>
                        <h5>ようこそ、管理者様</h5>
                        <p>左側のメニューから操作を選択してください。</p>
                    </>
                );
        }
    };
    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    return (
        <div className={`min-h-screen flex flex-col ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <header>
                <SuperAdminHeader onToggleSidebar={toggleSidebar} />
            </header>
            <div className="flex flex-1">
                <aside className={`w-64 border-r border-gray-300 ${sidebarOpen ? 'block' : 'hidden'}`}>
                    <SuperAdminSidebar onSelectMenu={setSelectedContent} />
                </aside>
                <main className="flex-1 p-4 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;

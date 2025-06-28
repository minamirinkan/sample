import SuperAdminHeader from '../components/SuperAdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import SuperAdminStudents from '../components/SuperAdminStudents';
import { useState } from 'react';
import SuperAdminTeachers from '../components/SuperAdminTeachers';
import TimetablePage from './TimetablePage';
import StudentRegistrationForm from '../components/StudentRegistrationForm/StudentRegistrationForm'
import TeacherRegistrationForm from '../components/TeacherRegistrationForm/TeacherRegistrationForm';
import ScheduleCalendarPage from './ScheduleCalendarPage';
import AdminStudentCalendar from './AdminStudentCalendar';

const AdminDashboard = () => {
    const [selectedContent, setSelectedContent] = useState('welcome');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [showTeacherForm, setShowTeacherForm] = useState(false);

    const handleMenuSelect = (menu) => {
        setSelectedContent(menu);
        setShowStudentForm(false); // 生徒フォームを閉じる
        setShowTeacherForm(false); // 講師フォームを閉じる
    };

    const handleAddNewStudent = () => {
        setShowStudentForm(true);
    };

    const handleAddNewTeacher = () => {
        setShowTeacherForm(true); // ←追加
    };

    const handleStudentFormSubmit = () => {
        setShowStudentForm(false);
        setSelectedContent('students'); // フォーム閉じて生徒一覧に戻る例
    };

    const handleTeacherFormSubmit = () => {
        setShowTeacherForm(false);
        setSelectedContent('teachers');
    };

    const renderContent = () => {
        if (selectedContent === 'students') {
            return showStudentForm ? (
                <StudentRegistrationForm
                    onSubmitSuccess={handleStudentFormSubmit}
                    onCancel={() => {
                        setShowStudentForm(false);
                        setSelectedContent('students');
                    }}
                />
            ) : (
                <SuperAdminStudents onAddNewStudent={handleAddNewStudent} />
            );
        }
        if (selectedContent === 'teachers') {
            return showTeacherForm ? (
                <TeacherRegistrationForm
                    onSubmitSuccess={handleTeacherFormSubmit}
                    onCancel={() => {
                        setShowTeacherForm(false);
                        setSelectedContent('teachers');
                    }}
                />
            ) : (
                <SuperAdminTeachers onAddNewTeacher={handleAddNewTeacher} />
            );
        }
        switch (selectedContent) {
            case 'timetable':
                return <TimetablePage />;
            case 'schedule-calendar':   // ここを追加
                return <ScheduleCalendarPage />;
            case 'student-timetable':
                return <AdminStudentCalendar />;
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
                    <AdminSidebar onSelectMenu={handleMenuSelect} />
                </aside>
                <main className="flex-1 p-4 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;

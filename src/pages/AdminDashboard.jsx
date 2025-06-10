import SuperAdminHeader from '../components/SuperAdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import SuperAdminStudents from '../components/SuperAdminStudents';
import { useState } from 'react';
import SuperAdminTeachers from '../components/SuperAdminTeachers';
import TimetablePage from './TimetablePage';

const AdminDashboard = () => {
    const [selectedContent, setSelectedContent] = useState('welcome');
    const [sidebarOpen, setSidebarOpen] = useState(true); // サイドバー開閉状態

    const renderContent = () => {
        switch (selectedContent) {
            case 'students':
                return <SuperAdminStudents />;
            case 'teachers':
                return <SuperAdminTeachers />;
            case 'timetable':
                return <TimetablePage />;
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
                    <AdminSidebar onSelectMenu={setSelectedContent} />
                </aside>
                <main className="flex-1 p-4 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;

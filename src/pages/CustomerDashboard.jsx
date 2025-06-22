import SuperAdminHeader from '../components/SuperAdminHeader';
import CustomerSidebar from '../components/CustomerSidebar';
import { useState } from 'react';
import TimetablePage from './TimetablePage';
import TimetablePageC from './TimetableCustomerPage';


const CustomerDashboard = () => {
    const [selectedContent, setSelectedContent] = useState('timetable');
    const [sidebarOpen, setSidebarOpen] = useState(true); // サイドバー開閉状態

    const renderContent = () => {
        switch (selectedContent) {
            case 'timetable':
                return <TimetablePageC />;
            default:
                return (
                    <>
                        <h5>ようこそ、お客様</h5>
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
                    <CustomerSidebar onSelectMenu={setSelectedContent} />
                </aside>
                <main className="flex-1 p-4 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default CustomerDashboard;

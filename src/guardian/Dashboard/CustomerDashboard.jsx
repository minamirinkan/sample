import SuperAdminHeader from '../../Superadmin/Dashboard/components/SuperAdminHeader'
import CustomerSidebar from './components/CustomerSidebar';
import { useState } from 'react';
import TimetablePageC from '../timetable/TimetableCustomerPage';
import HookStatusPage from '../../pages/HookStatusPage';

const CustomerDashboard = () => {
  const [selectedContent, setSelectedContent] = useState('timetable');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (selectedContent) {
      case 'timetable':
        return <TimetablePageC />;
      case 'tasks':
        return <HookStatusPage />;
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <header>
        <SuperAdminHeader onToggleSidebar={toggleSidebar} />
      </header>

      {/* ✅ オーバーレイ背景 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 relative">
        {/* ✅ 重なるサイドバー */}
        <aside
          className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-300 shadow-lg transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <CustomerSidebar onSelectMenu={(key) => {
            setSelectedContent(key);
            setSidebarOpen(false); // メニュー選択後に閉じる
          }} />
        </aside>

        {/* ✅ メインコンテンツは常に全幅 */}
        <main className="flex-1 w-full p-4 overflow-auto z-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;

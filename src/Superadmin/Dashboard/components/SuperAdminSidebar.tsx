// src/components/SuperAdminSidebar.tsx
import { FC } from 'react';
import {
    FaTasks,
    FaBell,
    FaBook,
    FaComments,
    FaYenSign,
    FaChartBar,
    FaFileAlt,
    FaDatabase
} from 'react-icons/fa';
import SidebarSection from '../../../admin/Dashboard/components/SidebarSection';

const SuperAdminSidebar: FC<{ isOpen?: boolean }> = ({ isOpen = true }) => {

    if (!isOpen) return null;

    return (
        <aside className="w-64 border-r border-gray-300 p-4 overflow-auto h-screen">
            <h4
                className="text-lg font-bold mb-4 text-center text-gray-800"
                style={{ fontSize: '20px' }}
            >
                {'管理者'}
            </h4>
            <ul className="sidebar-menu">
                <SidebarSection icon={FaTasks} title="ToDo" subItems={[{ label: 'ToDo', key: 'todo', path: '/superadmin/todo' }]} />
                <SidebarSection icon={FaBell} title="通知管理" subItems={[{ label: '社長連絡', key: 'notification', path: '/superadmin/notification' }]} />
                <SidebarSection icon={FaBook} title="業務日報管理" subItems={[
                    { label: '業務日報', key: 'daily-report', path: '/superadmin/daily-report' },
                    { label: '業務内容', key: 'tasks', path: '/superadmin/tasks' }
                ]} />
                <SidebarSection icon={FaComments} title="問合せ管理" subItems={[
                    { label: '問合せ', key: 'inquiries', path: '/superadmin/inquiries' },
                    { label: '見込み生徒', key: 'prospects', path: '/superadmin/prospects' }
                ]} />
                <SidebarSection icon={FaYenSign} title="売上管理" subItems={[{ label: '請求情報', key: 'billing', path: '/superadmin/billing' }]} />
                <SidebarSection icon={FaChartBar} title="目標管理" subItems={[{ label: '目標ファイル', key: 'goals', path: '/superadmin/goals' }]} />
                <SidebarSection
                    icon={FaBook}
                    title="時間割"
                    subItems={[
                        { label: '時間割一覧', key: 'timetable', path: '/superadmin/timetable' }
                    ]}
                />
                <SidebarSection
                    icon={FaBook}
                    title="スケジュール"
                    subItems={[
                        { label: '休講日リスト', key: 'holiday-page', path: '/superadmin/holiday-page' }
                    ]}
                />
                <SidebarSection
                    icon={FaDatabase}
                    title="マスタ管理"
                    subItems={[
                        { label: '教室', key: 'admin', path: '/superadmin/admin' },
                        { label: '料金', key: 'tuition', path: '/superadmin/tuition' },
                        { label: '講師給与', key: 'teacher-fee', path: '/superadmin/teacher-fee' },
                        { label: '生徒', key: 'students', path: '/superadmin/students' },
                        { label: '講師', key: 'teachers', path: '/superadmin/teachers' }
                    ]}
                />
                <SidebarSection icon={FaFileAlt} title="レポート" subItems={[
                    { label: '問合せ経路別入会率', key: 'report-entry-rate', path: '/superadmin/report-entry-rate' },
                    { label: '問合せ昨対比', key: 'report-compare', path: '/superadmin/report-compare' },
                    { label: '学年区分別実績集計', key: 'report-grade-summary', path: '/superadmin/report-grade-summary' },
                    { label: '日計表', key: 'daily-sheet', path: '/superadmin/daily-sheet' },
                    { label: '売上集計', key: 'sales-summary', path: '/superadmin/sales-summary' },
                    { label: '一括分析/教室別', key: 'bulk-by-class', path: '/superadmin/bulk-by-class' },
                    { label: '一括分析/複数教室', key: 'bulk-multi-class', path: '/superadmin/bulk-multi-class' },
                ]} />
            </ul>
        </aside>
    );
};

export default SuperAdminSidebar;

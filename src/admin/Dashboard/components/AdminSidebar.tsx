import { FC, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import SidebarSection from './SidebarSection';
import {
    FaBell, FaDatabase, FaTasks, FaBook, FaComments, FaYenSign, FaChartBar, FaFileAlt
} from 'react-icons/fa';

const AdminSidebar: FC<{ isOpen?: boolean }> = ({ isOpen = true }) => {
    const { userData } = useAuth();
    const [classroomName, setClassroomName] = useState('');
    const classroomCode = userData?.classroomCode;

    // classroomName を取得
    useEffect(() => {
        const fetchClassroomName = async () => {
            if (!classroomCode) return;
            const docRef = doc(db, 'classrooms', classroomCode);
            const docSnap = await getDoc(docRef);
            setClassroomName(docSnap.exists() ? (docSnap.data() as { name?: string }).name ?? '' : '教室名なし');
        };
        fetchClassroomName();
    }, [classroomCode]);

    if (!isOpen) return null;

    return (
        <aside className="w-64 border-r border-gray-300 p-4 overflow-auto h-screen">
            <h4 className="text-lg font-bold mb-4 text-center text-gray-800">
                {classroomName ? `${classroomName}教室` : '管理者'}
            </h4>
            <ul className="sidebar-menu">
                <SidebarSection
                    icon={FaBell}
                    title="チャット"
                    subItems={[
                        { label: '本部', key: 'chats', path: '/admin/chat' },
                        { label: '教室', key: 'chat', path: '/admin/chat' }
                    ]}
                />
                <SidebarSection
                    icon={FaDatabase}
                    title="成績管理"
                    subItems={[
                        { label: '学校関連', key: 'schoolTest', path: '/admin/schooltest' },
                        { label: '模試関連', key: 'jukuTest', path: '/admin/jukutest' },
                    ]}
                />
                <SidebarSection
                    icon={FaTasks}
                    title="ToDo"
                    subItems={[
                        {
                            label: 'ToDo',
                            key: 'todo',
                            path: '/admin/todo', // ←ここでページ遷移
                        },
                    ]}
                />
                <SidebarSection
                    icon={FaBell} title="通知管理" subItems={[
                        { label: '社長連絡', key: 'notification', path: '/admin/notification' }
                    ]}
                />
                <SidebarSection
                    icon={FaBook} title="業務日報管理" subItems={[
                        { label: '業務日報', key: 'daily-report', path: '/admin/daily-report' },
                        { label: '業務内容', key: 'tasks', path: '/admin/tasks' }
                    ]}
                />
                <SidebarSection
                    icon={FaComments} title="問合せ管理" subItems={[
                        { label: '問合せ', key: 'inquiries', path: '/admin/inquiries' },
                        { label: '見込み生徒', key: 'prospects', path: '/admin/prospects' }
                    ]}
                />
                <SidebarSection
                    icon={FaYenSign} title="売上管理" subItems={[
                        { label: '請求情報', key: 'billing', path: '/admin/billing' }
                    ]}
                />
                <SidebarSection
                    icon={FaChartBar} title="目標管理" subItems={[
                        { label: '目標ファイル', key: 'goals', path: '/admin/goals' }
                    ]}
                />
                <SidebarSection
                    icon={FaBook}
                    title="スケジュール"
                    subItems={[
                        { label: '休講日リスト', key: 'holiday-page', path: '/admin/holiday-page' }
                    ]}
                />
                <SidebarSection
                    icon={FaBook}
                    title="時間割"
                    subItems={[
                        { label: '時間割一覧', key: 'timetable', path: '/admin/timetable' },
                        { label: '生徒時間割', key: 'student-timetable', path: '/admin/student-timetable' }
                    ]}
                />
                <SidebarSection
                    icon={FaDatabase}
                    title="マスタ管理"
                    subItems={[
                        { label: '生徒', key: 'students', path: '/admin/students' },
                        { label: '講師', key: 'teachers', path: '/admin/teachers' },
                        { label: 'シフト計算', key: 'teacher-shifts', path: '/admin/teacher-shifts' }
                    ]}
                />
                <SidebarSection
                    icon={FaFileAlt} title="レポート" subItems={[
                        { label: '問合せ経路別入会率', key: 'report-entry-rate', path: '/admin/report-entry-rate' },
                        { label: '問合せ昨対比', key: 'report-compare', path: '/admin/report-compare' },
                        { label: '学年区分別実績集計', key: 'report-grade-summary', path: '/admin/report-grade-summary' },
                        { label: '日計表', key: 'daily-sheet', path: '/admin/daily-sheet' },
                        { label: '売上集計', key: 'sales-summary', path: '/admin/sales-summary' },
                        { label: '一括分析/教室別', key: 'bulk-by-class', path: '/admin/bulk-by-class' },
                        { label: '一括分析/複数教室', key: 'bulk-multi-class', path: '/admin/bulk-multi-class' },
                    ]}
                />
            </ul>
        </aside>
    );
};

export default AdminSidebar;

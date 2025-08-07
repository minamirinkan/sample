//src/components/AdminSidebar.jsx
import { useEffect, useState } from 'react';
import {
    FaTasks,
    FaBell,
    FaBook,
    FaComments,
    FaYenSign,
    FaChartBar,
    FaFileAlt,
    FaDatabase,
    FaAngleLeft
} from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; // Firebase初期化済みファイル
import { useAuth } from '../../../contexts/AuthContext.tsx'; // classroomCodeを取得できるAuthContext想定

const SidebarSection = ({ icon: Icon, title, subItems, onSelectMenu }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    return (
        <li className="mb-2">
            <button
                className="flex items-center justify-between w-full text-left hover:bg-gray-100 p-2 rounded"
                onClick={toggle}
            >
                <div className="flex items-center">
                    <Icon className="mr-2" />
                    {title}
                </div>
                <FaAngleLeft
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-[-90deg]' : ''}`}
                />
            </button>
            {isOpen && (
                <ul className="pl-8 mt-1 space-y-1 text-sm text-gray-700">
                    {subItems.map((item, idx) => (
                        <li
                            key={idx}
                            className="hover:underline cursor-pointer"
                            onClick={() => onSelectMenu?.(item.key)}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
};

const AdminSidebar = ({ onSelectMenu }) => {
    const { adminData } = useAuth(); // adminData.classroomCodeがある想定
    const [classroomName, setClassroomName] = useState('');

    useEffect(() => {
        const fetchClassroomName = async () => {
            if (!adminData?.classroomCode) return;

            const docRef = doc(db, 'classrooms', adminData.classroomCode);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setClassroomName(docSnap.data().name);
            } else {
                setClassroomName('教室名なし');
            }
        };

        fetchClassroomName();
    }, [adminData]);

    return (
        <aside className="w-64 border-r border-gray-300 p-4 overflow-auto h-screen">
            <h4
                className="text-lg font-bold mb-4 text-center text-gray-800"
                style={{ fontSize: '20px' }}
            >
                {classroomName ? `${classroomName}教室` : '管理者'}
            </h4>
            <ul className="sidebar-menu">
                <SidebarSection
                    icon={FaDatabase}
                    title="テストデータ"
                    subItems={[
                        { label: 'authContext', key: 'authTest' },
                        { label: 'userContext', key: 'userTest' },
                    ]}
                    onSelectMenu={onSelectMenu}
                />
                <SidebarSection icon={FaTasks} title="ToDo" subItems={[{ label: 'ToDo', key: 'todo' }]} onSelectMenu={onSelectMenu} />
                <SidebarSection icon={FaBell} title="通知管理" subItems={[{ label: '社長連絡', key: 'notification' }]} onSelectMenu={onSelectMenu} />
                <SidebarSection icon={FaBook} title="業務日報管理" subItems={[
                    { label: '業務日報', key: 'daily-report' },
                    { label: '業務内容', key: 'tasks' }
                ]} onSelectMenu={onSelectMenu} />
                <SidebarSection icon={FaComments} title="問合せ管理" subItems={[
                    { label: '問合せ', key: 'inquiries' },
                    { label: '見込み生徒', key: 'prospects' }
                ]} onSelectMenu={onSelectMenu} />
                <SidebarSection icon={FaYenSign} title="売上管理" subItems={[{ label: '請求情報', key: 'billing' }]} onSelectMenu={onSelectMenu} />
                <SidebarSection icon={FaChartBar} title="目標管理" subItems={[{ label: '目標ファイル', key: 'goals' }]} onSelectMenu={onSelectMenu} />
                <SidebarSection
                    icon={FaBook} // 他のアイコンでもOK
                    title="スケジュール"
                    subItems={[
                        { label: 'カレンダー', key: 'schedule-calendar' },
                        { label: '休講日リスト', key: 'holiday-page' }
                    ]}
                    onSelectMenu={onSelectMenu}
                />
                <SidebarSection
                    icon={FaBook}
                    title="時間割"
                    subItems={[
                        { label: '時間割一覧', key: 'timetable' },
                        { label: '生徒時間割', key: 'student-timetable' }
                    ]}
                    onSelectMenu={onSelectMenu}
                /* onSelectMenu={(key) => {
                    if (key === 'timetable') {
                        navigate('/superadmin/timetable'); // ← 遷移
                    }
                }} */
                />
                <SidebarSection
                    icon={FaDatabase}
                    title="マスタ管理"
                    subItems={[
                        { label: '生徒', key: 'students' },
                        { label: '講師', key: 'teachers' }
                    ]}
                    onSelectMenu={onSelectMenu}
                />
                <SidebarSection
                    icon={FaBell}
                    title="チャット"
                    subItems={[
                        { label: '本部', key: 'chat' },
                        { label: '教室', key: 'chat' }
                    ]}
                    onSelectMenu={onSelectMenu}
                />
                <SidebarSection icon={FaFileAlt} title="レポート" subItems={[
                    { label: '問合せ経路別入会率', key: 'report-entry-rate' },
                    { label: '問合せ昨対比', key: 'report-compare' },
                    { label: '学年区分別実績集計', key: 'report-grade-summary' },
                    { label: '日計表', key: 'daily-sheet' },
                    { label: '売上集計', key: 'sales-summary' },
                    { label: '一括分析/教室別', key: 'bulk-by-class' },
                    { label: '一括分析/複数教室', key: 'bulk-multi-class' },
                ]} onSelectMenu={onSelectMenu} />
            </ul>
        </aside>
    );
};

export default AdminSidebar;

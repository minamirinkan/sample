import React from 'react';
import { Link } from 'react-router-dom';
import MonthlyAttendanceTable from './MonthlyAttendanceTable';
import AttendanceSubTable from './AttendanceSubTable';
import RegularLessonTable from './RegularLessonTable';

type Props = {
    classroomCode: string;
    studentId: string;
    studentName: string;
    selectedMonth: string; // stateで管理する年月
    tab: 'regular' | 'monthly' | 'seasonal'
    setTab: (tab: 'regular' | 'monthly' | 'seasonal') => void;
};

const TAB_KEYS = ['regular', 'monthly', 'seasonal'] as const;
type TabKey = typeof TAB_KEYS[number];

const TAB_LABELS: Record<TabKey, string> = {
    regular: 'レギュラー授業',
    monthly: '月間出席記録',
    seasonal: '講習授業',
};

const AttendanceTabs: React.FC<Props> = ({ classroomCode, studentId, studentName, selectedMonth, tab, setTab }) => {
    const activeTab = tab;

    return (
        <div className="min-w-[700px]">
            {/* タブナビ */}
            <div className="flex space-x-4 mb-4 border-b pb-2">
                {TAB_KEYS.map((key) => (
                    <Link
                        key={key}
                        to={`/admin/students/${studentId}/attendance/${key}`}
                        className={`px-4 py-2 font-semibold rounded-t ${activeTab === key
                            ? 'bg-white border-t border-l border-r text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                        onClick={() => setTab(key)}
                    >
                        {TAB_LABELS[key]}
                    </Link>
                ))}
            </div>

            {/* タブコンテンツ */}
            {activeTab === 'regular' && (
                <RegularLessonTable
                    classroomCode={classroomCode}
                    studentId={studentId}
                    studentName={studentName}
                    selectedMonth={selectedMonth} // 年月を props で渡す
                />
            )}
            {activeTab === 'monthly' && (
                <MonthlyAttendanceTable
                    classroomCode={classroomCode}
                    studentId={studentId}
                    studentName={studentName}
                    selectedMonth={selectedMonth}
                />
            )}
            {activeTab === 'seasonal' && (
                <AttendanceSubTable
                    mode="seasonal"
                    classroomCode={classroomCode}
                    studentId={studentId}
                    studentName={studentName}
                    selectedMonth={selectedMonth}
                    data={[]}
                    teachers={[]}
                    editingIndex={null}
                    editValues={null}
                    handleEditClick={() => { }}
                    handleChange={() => { }}
                    handleSaveClick={() => { }}
                    setEditingIndex={() => { }}
                    getStatusClass={() => ''}
                    periodLabels={[]}
                />
            )}
        </div>
    );
};

export default AttendanceTabs;

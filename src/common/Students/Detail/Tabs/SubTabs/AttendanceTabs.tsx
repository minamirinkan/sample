import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MonthlyAttendanceTable from './MonthlyAttendanceTable';
import AttendanceSubTable from './AttendanceSubTable';
import RegularLessonTable from './RegularLessonTable';

type Props = {
    classroomCode: string;
    studentId: string;
    studentName: string;
    selectedMonth: string;
    mode: 'regular' | 'seasonal';
};

const TAB_KEYS = ['regular', 'monthly', 'seasonal'] as const;
type TabKey = typeof TAB_KEYS[number];

const TAB_LABELS: Record<TabKey, string> = {
    regular: 'レギュラー授業',
    monthly: '月間出席記録',
    seasonal: '講習授業',
};

const AttendanceTabs: React.FC<Props> = ({ classroomCode, studentId, studentName, selectedMonth, mode }) => {
    const { tab } = useParams<{ tab?: TabKey }>();
    const activeTab: TabKey = TAB_KEYS.includes(tab as TabKey) ? (tab as TabKey) : 'monthly';
    
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
                        aria-selected={activeTab === key}
                        role="tab"
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
                    selectedMonth={selectedMonth}
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
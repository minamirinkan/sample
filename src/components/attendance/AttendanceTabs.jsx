import React, { useState } from 'react';
import MonthlyAttendanceTable from './MonthlyAttendanceTable';
import AttendanceSubTable from './AttendanceSubTable'; // ← 旧スタイルを使うならこちら
import RegularLessonTable from './RegularLessonTable';

const AttendanceTabs = ({
    classroomCode,
    studentId,
    studentName,
    selectedMonth,
}) => {
    const [activeTab, setActiveTab] = useState('月間出席記録');

    const tabs = ['レギュラー授業', '月間出席記録', '講習授業'];

    const renderActiveTable = () => {
        switch (activeTab) {
            case 'レギュラー授業':
                return (
                    <RegularLessonTable 
                        mode="regular"
                        classroomCode={classroomCode}
                        studentId={studentId}
                        studentName={studentName}
                        selectedMonth={selectedMonth}
                    />
                );
            case '月間出席記録':
                return (
                    <MonthlyAttendanceTable
                        classroomCode={classroomCode}
                        studentId={studentId}
                        studentName={studentName}
                        selectedMonth={selectedMonth}
                    />
                );
            case '講習授業':
                return (
                    <AttendanceSubTable
                        mode="seasonal"
                        classroomCode={classroomCode}
                        studentId={studentId}
                        studentName={studentName}
                        selectedMonth={selectedMonth}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-w-[700px]">
            <div className="flex space-x-4 mb-4 border-b pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-semibold rounded-t ${activeTab === tab
                            ? 'bg-white border-t border-l border-r text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {renderActiveTable()}
        </div>
    );
};

export default AttendanceTabs;

import React from 'react';
import AttendanceSubTable from './AttendanceSubTable';
import useTeachers from '../../../../../contexts/hooks/useTeachers';
import usePeriodLabels from '../../../../../contexts/hooks/usePeriodLabels';
import { useStudentAttendance } from '../../../../../contexts/hooks/useStudentAttendance';
import { useAttendanceEdit } from '../../../../../contexts/hooks/useAttendanceEdit';
import { MakeupLesson } from '../../../../../contexts/types/makeupLessons';

type Props = {
    classroomCode: string;
    studentId: string;
    studentName: string;
    selectedMonth: string;
};

const MonthlyAttendanceTable: React.FC<Props> = ({
    classroomCode,
    studentId,
    studentName,
    selectedMonth,
}) => {
    const { teachers } = useTeachers();
    const { periodLabels } = usePeriodLabels(classroomCode);

    // 通常の出席データを取得
    const { loading, attendanceList, setAttendanceList } = useStudentAttendance(classroomCode, studentId, selectedMonth);
    // 編集用フック
    const {
        editingIndexRegular,        // ★ 追加
        setEditingIndexRegular,     // ★ 追加
        editValues,
        setEditValues,
        handleChange,
        handleSaveClick,
        regularList,
    } = useAttendanceEdit(attendanceList, setAttendanceList, periodLabels, teachers, classroomCode, studentName);

    const statusStyles: Record<string, string> = {
        '未定': 'bg-blue-100 text-blue-800',
        '欠席': 'bg-red-100 text-red-800',
        '出席': 'bg-gray-100 text-gray-800',
    };

    const getStatusClass = (status: string) => statusStyles[status] || '';

    if (loading) {
        return <p>読み込み中...</p>;
    }

    return (
        <div className="min-w-[700px]">
            <h2 className="text-lg font-bold mb-2 text-blue-600">月間出席記録</h2>
            <AttendanceSubTable
                data={regularList as unknown as MakeupLesson[]}
                teachers={teachers}
                editingIndex={editingIndexRegular}          // ← フックの値
                setEditingIndex={setEditingIndexRegular}    // ← フックの setter
                editValues={editValues}
                handleEditClick={(idx) => {
                    setEditingIndexRegular(idx);              // ← フックの setter を呼ぶ
                    const entry = regularList[idx];
                    setEditValues({
                        ...entry,
                        teacherCode: entry.teacher?.code || '',
                        name: entry.name || studentName || '',
                    });
                }}
                handleChange={handleChange}
                handleSaveClick={() => handleSaveClick('regular')} // ← フック内の editingIndexRegular を参照してOK
                getStatusClass={getStatusClass}
                periodLabels={periodLabels}
                classroomCode={classroomCode}
                studentId={studentId}
                studentName={studentName}
                selectedMonth={selectedMonth}
                mode="regular"
            />
        </div>
    );
};

export default MonthlyAttendanceTable;
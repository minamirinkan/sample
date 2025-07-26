import React from 'react';
import AttendanceSubTable from './SubTabs/AttendanceSubTable';
import useTeachers from '../../../../contexts/hooks/useTeachers';
import usePeriodLabels from '../../../../contexts/hooks/usePeriodLabels';
import useMakeupLessons from '../../../../contexts/hooks/useMakeupLessons';
import {useAttendanceEdit} from '../../../../contexts/hooks/useAttendanceEdit';

const MakeupAttendanceTable = ({ studentId, classroomCode, studentName }) => {
    const { teachers } = useTeachers();
    const { periodLabels } = usePeriodLabels(classroomCode);
    const { makeupLessons, loading } = useMakeupLessons(studentId || null);

    // 編集用のフック（第1引数にはmakeupLessonsを使う）
    const {
        editingIndexMakeup,
        setEditingIndexMakeup,
        editValues,
        setEditingMakeupLesson,
        setEditValues,
        handleChange,
        handleSaveClick,
    } = useAttendanceEdit(makeupLessons, () => {}, periodLabels, teachers, classroomCode, studentName);
console.log('studentname:', studentName);
    const statusStyles = {
        '振替': 'bg-green-100 text-green-800',
    };
    const getStatusClass = (status) => statusStyles[status] || '';

    if (loading) {
        return <p>読み込み中...</p>;
    }

    return (
        <div className="min-w-[700px]">
            <h2 className="text-lg font-bold mb-2 text-yellow-600">振替情報</h2>
            <AttendanceSubTable
                data={makeupLessons || []}
                teachers={teachers}
                editingIndex={editingIndexMakeup}
                setEditingIndex={setEditingIndexMakeup}
                editValues={editValues}
                handleEditClick={(idx) => {
                    const entry = makeupLessons[idx];
                    setEditingMakeupLesson(entry);
                    setEditingIndexMakeup(idx);
                    const periodLabel = periodLabels[entry.period - 1]?.label || '';
                    setEditValues({
                        ...entry,
                        periodLabel,
                        name: entry.name || studentName || '',
                    });
                }}
                handleChange={handleChange}
                handleSaveClick={() => handleSaveClick('makeup')}
                getStatusClass={getStatusClass}
                periodLabels={periodLabels}
            />
        </div>
    );
};

export default MakeupAttendanceTable;

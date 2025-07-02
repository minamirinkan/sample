import AttendanceSubTable from './AttendanceSubTable';
import { useTeachers } from '../../hooks/useTeachers';
import usePeriodLabels from '../../hooks/usePeriodLabels';
import { useAttendanceEdit } from '../../hooks/useAttendanceEdit';
import useMakeupLessons from '../../hooks/useMakeupLessons';
import { useStudentAttendance } from '../../hooks/useStudentAttendance';

const AttendanceTable = ({ classroomCode, studentId, studentName, selectedMonth }) => {
    const { teachers } = useTeachers();
    const { periodLabels } = usePeriodLabels(classroomCode);

    // 通常の出席データを取得
    const {
        loading: loadingAttendance,
        attendanceList,
        setAttendanceList,
    } = useStudentAttendance(classroomCode, studentId, selectedMonth);

    // 振替出席データを取得
    const {
        makeupLessons,
        loading: loadingMakeup,
    } = useMakeupLessons(studentId || null);

    // 編集用のフック
    const {
        editingIndexRegular,
        setEditingIndexRegular,
        editingIndexMakeup,
        setEditingIndexMakeup,
        editValues,
        setEditingMakeupLesson,
        setEditValues,
        handleChange,
        handleSaveClick,
        regularList,
    } = useAttendanceEdit(attendanceList, setAttendanceList, periodLabels, teachers, classroomCode, studentName);

    const statusStyles = {
        '未定': 'bg-blue-100 text-blue-800',
        '振替': 'bg-green-100 text-green-800',
        '欠席': 'bg-red-100 text-red-800',
        '出席': 'bg-gray-100 text-gray-800',
    };
    const getStatusClass = (status) => statusStyles[status] || '';

    if (loadingAttendance || loadingMakeup) {
        return <p>読み込み中...</p>;
    }

    return (
        <div className="space-y-6">
            {/* 振替出席情報 */}
            <div className="min-w-[700px]">
                <h2 className="text-lg font-bold mb-2 text-yellow-600">振替出席情報</h2>
                <AttendanceSubTable
                    data={makeupLessons || []}
                    teachers={teachers}
                    editingIndex={editingIndexMakeup}
                    setEditingIndex={setEditingIndexMakeup}
                    editValues={editValues}
                    handleEditClick={(idx) => {
                        setEditingIndexRegular(null);
                        const entry = makeupLessons[idx];
                        setEditingMakeupLesson(entry);
                        setEditingIndexMakeup(idx);
                        const periodLabel = periodLabels[entry.period - 1]?.label || '';
                        setEditValues({
                            ...entry,
                            periodLabel, // 明示的に追加
                        });
                    }}
                    handleChange={handleChange}
                    handleSaveClick={() => handleSaveClick('makeup')}
                    getStatusClass={getStatusClass}
                    periodLabels={periodLabels}
                />
            </div>

            {/* 通常出席情報 */}
            <div className="min-w-[700px]">
                <h2 className="text-lg font-bold mb-2 text-blue-600">通常出席情報</h2>
                <AttendanceSubTable
                    data={regularList}
                    teachers={teachers}
                    editingIndex={editingIndexRegular}
                    setEditingIndex={setEditingIndexRegular}
                    editValues={editValues}
                    handleEditClick={(idx) => {
                        setEditingIndexMakeup(null);
                        setEditingIndexRegular(idx);
                        const entry = regularList[idx];
                        setEditValues({
                            ...entry,
                            teacherCode: entry.teacher?.code || '',
                        });
                    }}
                    handleChange={handleChange}
                    handleSaveClick={() => handleSaveClick('regular')}
                    getStatusClass={getStatusClass}
                    periodLabels={periodLabels}
                />
            </div>
        </div>
    );
};

export default AttendanceTable;

import AttendanceSubTable from './AttendanceSubTable';
import { useTeachers } from '../../hooks/useTeachers';
import usePeriodLabels from '../../hooks/usePeriodLabels';
import { useAttendanceEdit } from '../../hooks/useAttendanceEdit';
import useMakeupLessons from '../../hooks/useMakeupLessons';

const AttendanceTable = ({ attendanceList, setAttendanceList, classroomCode, studentId, studentName }) => {
    const { teachers } = useTeachers();
    const { periodLabels } = usePeriodLabels(classroomCode);

    const {
        makeupLessons,
        loading: loadingMakeup,
    } = useMakeupLessons(studentId || null);
    console.log('makeupLessons:', makeupLessons);
    console.log('✅ studentId passed to useMakeupLessons:', studentId);

    const {
        editingIndexRegular,
        setEditingIndexRegular,
        editingIndexMakeup,
        setEditingIndexMakeup,
        editValues,
        editingMakeupLesson,
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

    return (
        <div className="space-y-6">
            <div className="min-w-[700px]">
                <h2 className="text-lg font-bold mb-2 text-yellow-600">振替出席情報</h2>
                {loadingMakeup ? (
                    <p>読み込み中...</p>
                ) : (
                    <AttendanceSubTable
                        data={makeupLessons || []}
                        teachers={teachers}
                        editingIndex={editingIndexMakeup}
                        setEditingIndex={setEditingIndexMakeup}
                        editValues={editValues}
                        handleEditClick={(idx) => {
                            setEditingIndexRegular(null);
                            const entry = makeupLessons[idx];
                            console.log('🔍 makeupLessons[idx]:', entry);
                            console.log('🔍 makeupLessons[idx].date:', entry?.date);
                            setEditingMakeupLesson(makeupLessons[idx]);
                            setEditingIndexMakeup(idx);
                            setEditValues({ ...entry }); // 🔁 安全に浅くコピーしてからセット
                        }}
                        handleChange={handleChange}
                        handleSaveClick={() => handleSaveClick('makeup')}
                        getStatusClass={getStatusClass}
                        periodLabels={periodLabels}
                    />
                )}
            </div>

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
                        setEditValues(regularList[idx]);
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
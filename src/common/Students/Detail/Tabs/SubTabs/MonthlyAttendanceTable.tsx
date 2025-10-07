import React from 'react';
import AttendanceSubTable from './AttendanceSubTable';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { useAuth, AuthProvider } from '../../../../../contexts/AuthContext';
import { useAdminData, AdminDataProvider } from '../../../../../contexts/providers/AdminDataProvider';
import useTeachers from '../../../../../contexts/hooks/useTeachers';
import usePeriodLabels from '../../../../../contexts/hooks/usePeriodLabels';
import { useStudentAttendance } from '../../../../../contexts/hooks/useStudentAttendance';
import { useAttendanceEdit } from '../../../../../contexts/hooks/useAttendanceEdit';
import { MakeupLesson } from '../../../../../contexts/types/makeupLessons';
import AdminStudentCalendar from '../../../../StudentsSchedule/StudentSchedule';

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


    const openCalendarWindow = () => {
        const newWindow = window.open('/admin/student-timetable', '_blank', 'width=600,height=800');
        if (newWindow) {
          // ★ 追加: 子ウィンドウに一時的なプロップを注入
          (newWindow as any).__CALENDAR_PROPS__ = {
            classroomCode,
            studentId,
            studentName,
            selectedMonth,
          };
      
          newWindow.document.title = "生徒一覧";
          const root = newWindow.document.createElement('div');
          newWindow.document.body.appendChild(root);
      
          createRoot(root).render(
            <BrowserRouter>
              <AuthProvider>
                <AdminDataProvider>
                  <AdminStudentCalendar />
                </AdminDataProvider>
              </AuthProvider>
            </BrowserRouter>
          );
        }
      };      
    if (loading) {
        return <p>読み込み中...</p>;
    }

    return (
        <div className="min-w-[700px]">
            <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold text-blue-600">月間出席記録</h2>
        <button
          type="button"
          onClick={openCalendarWindow}
          className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 active:scale-[0.99] transition"
          aria-label="カレンダーを別ウィンドウで開く"
        >
          カレンダーを別ウィンドウで表示
        </button>
      </div>
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
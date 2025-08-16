import React, { useMemo, useEffect, useState } from 'react';
import AttendanceSubTable from './SubTabs/AttendanceSubTable';
import useTeachers from '../../../../contexts/hooks/useTeachers';
import usePeriodLabels from '../../../../contexts/hooks/usePeriodLabels';
import useMakeupLessons from '../../../../contexts/hooks/useMakeupLessons';
import { useAttendanceEdit, AttendanceEntry } from '../../../../contexts/hooks/useAttendanceEdit';
import { MakeupLesson } from '../../../../contexts/types/makeupLessons';

type Props = {
  studentId?: string;
  classroomCode: string;
  studentName: string;
};

const MakeupAttendanceTable: React.FC<Props> = ({ studentId, classroomCode, studentName }) => {
  const { teachers } = useTeachers();
  const { periodLabels } = usePeriodLabels(classroomCode);
  const { makeupLessons, loading } = useMakeupLessons(studentId || null);

  // --- MakeupLesson[] → AttendanceEntry[] 正規化 ---
  const entriesFromMakeup: AttendanceEntry[] = useMemo(() => {
    return (makeupLessons ?? []).map((ml) => {
      const teacherObj =
        typeof ml.teacher === 'object' && ml.teacher !== null
          ? ml.teacher
          : ml.teacher
          ? { code: '', name: String(ml.teacher) }
          : null;

      const periodLabel =
        ml.period != null ? `${ml.period}限` : periodLabels?.[0]?.label ?? '1限';

      return {
        studentId: ml.studentId ?? (studentId ?? ''),
        student: { name: ml.name ?? studentName ?? '' },
        status: ml.status ?? '振替',
        periodLabel,
        period: ml.period,
        date: ml.date ?? '',
        teacher: teacherObj,
        classType: ml.classType,
        duration: ml.duration,
        seat: ml.seat,
        grade: ml.grade,
        subject: ml.subject,
      } as AttendanceEntry;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [makeupLessons, studentId, studentName, periodLabels]);

  // --- フックへ渡す配列（フック内部で set を使うため state 化） ---
  const [attendanceList, setAttendanceList] = useState<AttendanceEntry[]>(entriesFromMakeup);
  useEffect(() => {
    setAttendanceList(entriesFromMakeup);
  }, [entriesFromMakeup]);

  // --- 編集系はすべて useAttendanceEdit に一本化 ---
  const {
    // ★ これらをフックから使う：ローカルに同名の useState は持たない
    editingIndexMakeup,
    setEditingIndexMakeup,
    editingMakeupLesson,
    setEditingMakeupLesson,
    editValues,
    setEditValues,
    handleChange,
    handleSaveClick,
  } = useAttendanceEdit(
    attendanceList,
    setAttendanceList,
    periodLabels,
    teachers,
    classroomCode,
    studentName
  );

  const statusStyles: Record<string, string> = { 振替: 'bg-green-100 text-green-800' };
  const getStatusClass = (status: string) => statusStyles[status] || '';

  if (loading) return <p>読み込み中...</p>;

  return (
    <div className="min-w-[700px]">
      <h2 className="text-lg font-bold mb-2 text-yellow-600">振替情報</h2>
      <AttendanceSubTable
        // 表示自体は元のデータでもOK（行レンダリング用）
        data={attendanceList as unknown as MakeupLesson[]}
        teachers={teachers}
        // ★ 編集インデックスはフック由来のものだけを使う
        editingIndex={editingIndexMakeup}
        setEditingIndex={setEditingIndexMakeup}
        // ★ 編集中の値もフック由来
        editValues={editValues as any}
        handleEditClick={(idx: number) => {
            // ★ 正規化済みの行を使う（makeupLessons[idx] は使わない）
            const normalized = attendanceList[idx];
            setEditingIndexMakeup(idx);        // フックの state
            setEditingMakeupLesson(normalized); // ★ periodLabel を持っている
        
            const fallbackLabel =
              normalized.period != null
                ? `${normalized.period}限`
                : periodLabels?.[0]?.label ?? '1限';
        
            setEditValues({
              ...normalized,
              periodLabel: normalized.periodLabel ?? fallbackLabel,
              name: normalized.student?.name || studentName || '',
            } as any);
          }}
        handleChange={handleChange}                 // フックの editValues を更新
        handleSaveClick={() => handleSaveClick('makeup')} // フック内の state を参照して保存
        getStatusClass={getStatusClass}
        periodLabels={periodLabels}
        classroomCode={classroomCode}
        studentId={studentId!}
        studentName={studentName}
        mode="seasonal"
        selectedMonth={new Date().toISOString().split('T')[0]}
      />
    </div>
  );
};

export default MakeupAttendanceTable;
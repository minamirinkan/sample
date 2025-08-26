import TimetableCell from './TimetableCell';
import { TimetableRowProps } from '../../../contexts/types/timetablerow';
import { useAdminData } from '../../../contexts/providers/AdminDataProvider';

export default function TimetableRow({
  rowIndex,
  row,
  onChange,
  allTeachers,
  allRows,
}: TimetableRowProps) {
  // statusに基づいて振替・欠席・未定などの固定行かどうかを判断
  const isFixedRow = ['未定', '振替', '欠席'].includes(row.status);
  const { classroom } = useAdminData();
  const MANAGER_CODE = 't0470000';
  console.log('classroom.classroom.fullname',classroom.classroom.fullname)
  const teacherOptions = [
    ...(classroom.classroom.fullname
      ? [{
        code: MANAGER_CODE,
        fullname: classroom.classroom.fullname,
      }]
      : []),
    ...allTeachers,
  ].filter((opt, idx, arr) =>
    idx === arr.findIndex(o => o.code === opt.code)
  );

  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;

    // 教室長が選ばれたときの特別処理
    if (selectedCode === MANAGER_CODE) {
      const updatedTeacher = classroom?.name
        ? { code: MANAGER_CODE, name: classroom.classroom.fullname }
        : null;
      onChange(rowIndex, { ...row, teacher: updatedTeacher });
      return;
    }

    const teacherObj = allTeachers.find(t => t.code === selectedCode) || null;
    const updatedTeacher = teacherObj
      ? { code: teacherObj.code, name: teacherObj.fullname }
      : null;

    onChange(rowIndex, { ...row, teacher: updatedTeacher });
  };

  return (
    <tr>
      <td className="border p-2 text-center font-bold bg-gray-50">
        {isFixedRow ? (
          // 固定行 ― status文字列をそのまま表示
          <span className="text-gray-700">{row.status}</span>
        ) : (
          // 通常行 ― 講師選択セレクトボックスを表示
          <select
            value={row.teacher?.code || ''}
            onChange={handleTeacherChange}
            className="w-auto min-w-[2rem] max-w-full border border-gray-200 p-1 rounded text-xs text-left"
            title="講師を選択"
          >
            <option value="">選択</option>
            {teacherOptions.map((t) => (
              <option key={t.code} value={t.code}>
                {t.fullname}
              </option>
            ))}
          </select>
        )}
      </td>

      {/* 各時限のセルを表示 */}
      {row.periods.map((students, periodIdx) => (
        <TimetableCell
          key={periodIdx}
          periodIdx={periodIdx}
          students={students}
          rowIndex={rowIndex}
          row={row}
          allRows={allRows}
          onChange={onChange}
        />
      ))}
    </tr>
  );
}
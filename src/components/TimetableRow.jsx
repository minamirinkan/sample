import TimetableCell from './TimetableCell';

export default function TimetableRow({ rowIndex, row, onChange, allTeachers, allRows }) {
  // statusに基づいて振替・欠席・未定などの固定行かどうかを判断
  const isFixedRow = ['未定', '振替', '欠席'].includes(row.status);

  const handleTeacherChange = (e) => {
    const selectedCode = e.target.value;
    const teacherObj = allTeachers.find(t => t.code === selectedCode) || null;
    const updatedTeacher = teacherObj
      ? {
        code: teacherObj.code,
        name: `${teacherObj.lastName} ${teacherObj.firstName}`
      }
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
            {allTeachers.map((t) => (
              <option key={t.code} value={t.code}>
                {`${t.lastName} ${t.firstName}`}
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
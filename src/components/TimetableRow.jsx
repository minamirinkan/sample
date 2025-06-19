import TimetableCell from './TimetableCell';

export default function TimetableRow({ rowIndex, row, onChange, allTeachers, allRows }) {
  // 振り替え・欠席の判定
  const isFixedRow = row.teacher === '振り替え' || row.teacher === '欠席';

  const handleTeacherChange = (e) => {
    const selectedCode = e.target.value;
    const teacherObj = allTeachers.find(t => t.code === selectedCode) || null;
    onChange(rowIndex, { ...row, teacher: teacherObj });
  };

  return (
    <tr>
      <td className="border p-2 text-left font-bold bg-gray-50">
        {isFixedRow ? row.teacher : (
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

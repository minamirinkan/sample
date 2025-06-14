// src/components/TimetableRow.jsx
import TimetableCell from './TimetableCell';

export default function TimetableRow({ rowIndex, row, onChange, allTeachers, allRows }) {
    const handleTeacherChange = (e) => {
        onChange(rowIndex, { ...row, teacher: e.target.value });
    };

    return (
        <tr>
            <td className="border p-2 text-center align-top bg-gray-50">
                <select
                    value={row.teacher}
                    onChange={handleTeacherChange}
                    className="w-full border border-gray-200 p-1 rounded text-xs text-center"
                >
                    <option value="">選択</option>
                    {allTeachers.map((t) => (
                        <option key={t.code} value={t.code}>
                            {`${t.lastName} ${t.firstName}（${t.code}）`}
                        </option>
                    ))}
                </select>
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

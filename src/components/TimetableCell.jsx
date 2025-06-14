// src/components/TimetableCell.jsx
import StudentChip from './StudentChip';

export default function TimetableCell({
    periodIdx,
    students,
    rowIndex,
    row,
    allRows,
    onChange,
}) {
    const handleChange = (periodIdx, studentIdx, field, value) => {
        const newRow = JSON.parse(JSON.stringify(row));
        newRow.periods[periodIdx][studentIdx][field] = value;
        onChange(rowIndex, newRow);
    };

    const handleRemove = (periodIdx, studentIdx) => {
        const newRow = JSON.parse(JSON.stringify(row));
        newRow.periods[periodIdx].splice(studentIdx, 1);
        onChange(rowIndex, newRow);
    };

    return (
        <td
            className="text-[10px] p-0.5 mb-0.5 border rounded bg-white shadow-sm cursor-pointer hover:bg-gray-100"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                const json = e.dataTransfer.getData('application/json');
                if (!json) return;

                try {
                    const { student, fromPeriod } = JSON.parse(json);
                    if (fromPeriod === periodIdx) return;

                    const existsInOtherRows = allRows.some((r, i) => {
                        if (i === rowIndex) return false;
                        return r.periods[periodIdx].some((s) => s.code === student.code);
                    });
                    if (existsInOtherRows) {
                        alert('この時限の他の行にすでに同じ生徒が存在します');
                        return;
                    }

                    const newRow = JSON.parse(JSON.stringify(row));

                    const alreadyExists = newRow.periods[periodIdx].some(
                        (s) => s.code === student.code
                    );
                    if (alreadyExists) return;

                    if (fromPeriod !== null && fromPeriod !== undefined) {
                        newRow.periods[fromPeriod] = newRow.periods[fromPeriod].filter(
                            (s) => s.code !== student.code
                        );
                    }

                    newRow.periods[periodIdx].push(student);
                    onChange(rowIndex, newRow);
                } catch (err) {
                    console.error('Drop error:', err);
                }
            }}
        >
            <div className="flex flex-wrap gap-1">
                {students.map((student, studentIdx) => (
                    <StudentChip
                        key={studentIdx}
                        student={student}
                        periodIdx={periodIdx}
                        studentIdx={studentIdx}
                        handleChange={handleChange}
                        handleRemove={handleRemove}
                    />
                ))}
            </div>
        </td>
    );
}

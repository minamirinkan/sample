// src/components/TimetableRow.jsx
export default function TimetableRow({ rowIndex, row, onChange, allTeachers, allRows }) {
    const handleChange = (periodIdx, studentIdx, field, value) => {
        const newRow = JSON.parse(JSON.stringify(row));
        newRow.periods[periodIdx][studentIdx][field] = value;
        onChange(rowIndex, newRow);
    };

    return (
        <tr>
            <td className="border p-2 text-center align-top bg-gray-50">
                <select
                    value={row.teacher}
                    onChange={(e) =>
                        onChange(rowIndex, { ...row, teacher: e.target.value })
                    }
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
                <td
                    key={periodIdx}
                    className="text-[10px] p-0.5 mb-0.5 border rounded bg-white shadow-sm cursor-pointer hover:bg-gray-100"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        const json = e.dataTransfer.getData('application/json');
                        if (!json) return;

                        try {
                            const { student, fromPeriod } = JSON.parse(json);
                            if (fromPeriod === periodIdx) return;

                            // 他の行の同じ時限に同じ生徒がいるかチェック
                            const existsInOtherRows = allRows.some((r, i) => {
                                if (i === rowIndex) return false;
                                return r.periods[periodIdx].some(
                                    (s) => s.code === student.code
                                );
                            });
                            if (existsInOtherRows) {
                                alert('この時限の他の行にすでに同じ生徒が存在します');
                                return;
                            }

                            const newRow = JSON.parse(JSON.stringify(row));

                            // 今の行の同じ時限にも重複していないか
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
                            <div
                                key={studentIdx}
                                className="mb-1 border rounded bg-blue-100 p-2 flex items-center gap-0.5 hover:bg-green-200"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData(
                                        'application/json',
                                        JSON.stringify({ student, fromPeriod: periodIdx })
                                    );
                                }}
                            >
                                {/* 座席 */}
                                <input
                                    placeholder="座席"
                                    value={student.seat}
                                    onChange={(e) =>
                                        handleChange(periodIdx, studentIdx, 'seat', e.target.value)
                                    }
                                    className="w-8 border border-blue-300 rounded px-1 text-xs text-center p-0.5"
                                />

                                {/* 学年 */}
                                <div className="w-10 text-xs text-center font-semibold text-blue-800">
                                    {student.grade}
                                </div>

                                {/* 氏名（編集不可、divにして横長表示） */}
                                <div
                                    className="text-xs font-semibold text-blue-800 px-1 whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis"
                                    style={{ lineHeight: 1 }}
                                    title={student.name}
                                >
                                    {student.name}
                                </div>

                                {/* 科目 */}
                                <input
                                    placeholder="科目"
                                    value={student.subject}
                                    onChange={(e) =>
                                        handleChange(periodIdx, studentIdx, 'subject', e.target.value)
                                    }
                                    className="w-12 border border-blue-300 rounded px-1 text-xs text-center p-0.5"
                                />

                                {/* 削除ボタン */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newRow = JSON.parse(JSON.stringify(row));
                                        newRow.periods[periodIdx].splice(studentIdx, 1);
                                        onChange(rowIndex, newRow);
                                    }}
                                    className="text-red-600 font-bold px-2 hover:text-red-800"
                                    title="削除"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </td>
            ))}
        </tr>
    );
}

import { useState } from 'react';

export default function TimetableRow({ rowIndex, row, onChange, allTeachers, allStudents }) {
    const [selectingPeriod, setSelectingPeriod] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState('');
    const [studentOptions, setStudentOptions] = useState([]);

    const handleChange = (periodIdx, studentIdx, field, value) => {
        const newRow = JSON.parse(JSON.stringify(row));
        newRow.periods[periodIdx][studentIdx][field] = value;
        onChange(rowIndex, newRow);
    };

    const handleSelectStudent = (student) => {
        const newRow = JSON.parse(JSON.stringify(row));
        newRow.periods[selectingPeriod].push({
            seat: '',
            no: student.code.slice(-2),
            grade: student.grade,
            name: `${student.lastName} ${student.firstName}`,
            subject: '',
        });
        onChange(rowIndex, newRow);
        setSelectingPeriod(null);
        setSelectedGrade('');
        setStudentOptions([]);
    };

    const handleGradeSelect = (grade) => {
        setSelectedGrade(grade);
        const filtered = allStudents.filter((s) => s.grade === grade);
        setStudentOptions(filtered);
    };

    const handleDragStart = (e, student, fromRowIdx, fromPeriodIdx, studentIdx) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
            student,
            fromRowIdx,
            fromPeriodIdx,
            studentIdx,
        }));
    };

    const handleDrop = (e, toPeriodIdx) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (!data) return;

        const { student, fromRowIdx, fromPeriodIdx, studentIdx } = data;
        if (fromRowIdx === rowIndex && fromPeriodIdx === toPeriodIdx) return;

        onChange((prevRows) => {
            const updatedRows = [...prevRows];
            const fromRow = JSON.parse(JSON.stringify(updatedRows[fromRowIdx]));
            fromRow.periods[fromPeriodIdx].splice(studentIdx, 1);
            updatedRows[fromRowIdx] = fromRow;

            const toRow = JSON.parse(JSON.stringify(updatedRows[rowIndex]));
            toRow.periods[toPeriodIdx].push(student);
            updatedRows[rowIndex] = toRow;

            return updatedRows;
        });
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
                    className="border p-1 align-top"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        const json = e.dataTransfer.getData('application/json');
                        if (!json) return;

                        try {
                            const { student, fromPeriod } = JSON.parse(json);

                            // すでに同じperiodなら何もしない（移動ではない）
                            if (fromPeriod === periodIdx) return;

                            const newRow = JSON.parse(JSON.stringify(row));

                            // 元の場所から削除
                            newRow.periods[fromPeriod] = newRow.periods[fromPeriod].filter(
                                (s) =>
                                    !(
                                        s.name === student.name &&
                                        s.no === student.no &&
                                        s.grade === student.grade
                                    )
                            );

                            // 新しい場所に追加
                            newRow.periods[periodIdx].push(student);

                            onChange(rowIndex, newRow);
                        } catch (err) {
                            console.error('Drop error:', err);
                        }
                    }}
                >

                    {students.map((student, studentIdx) => (
                        // ドラッグ対象の生徒（1人分）に追加
                        <div
                            key={studentIdx}
                            className="mb-1 border-b border-dashed border-gray-300 pb-1"
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData(
                                    'application/json',
                                    JSON.stringify({ student, fromPeriod: periodIdx })
                                );
                            }}
                        >

                            <div className="flex gap-1 mb-1">
                                <input
                                    placeholder="座席"
                                    value={student.seat}
                                    onChange={(e) =>
                                        handleChange(periodIdx, studentIdx, 'seat', e.target.value)
                                    }
                                    className="w-10 border p-1 text-xs rounded"
                                />
                                <input
                                    placeholder="No"
                                    value={student.no}
                                    onChange={(e) =>
                                        handleChange(periodIdx, studentIdx, 'no', e.target.value)
                                    }
                                    className="w-10 border p-1 text-xs rounded"
                                />
                                <input
                                    placeholder="学年"
                                    value={student.grade}
                                    onChange={(e) =>
                                        handleChange(periodIdx, studentIdx, 'grade', e.target.value)
                                    }
                                    className="w-12 border p-1 text-xs rounded"
                                />
                            </div>
                            <input
                                placeholder="氏名"
                                value={student.name}
                                onChange={(e) =>
                                    handleChange(periodIdx, studentIdx, 'name', e.target.value)
                                }
                                className="w-full mb-1 border p-1 text-xs rounded"
                            />
                            <input
                                placeholder="科目"
                                value={student.subject}
                                onChange={(e) =>
                                    handleChange(periodIdx, studentIdx, 'subject', e.target.value)
                                }
                                className="w-full border p-1 text-xs rounded"
                            />
                        </div>
                    ))}

                    <button
                        onClick={() => setSelectingPeriod(periodIdx)}
                        className="text-xs text-blue-500 hover:underline"
                    >
                        + 生徒追加
                    </button>

                    {selectingPeriod === periodIdx && (
                        <div className="mt-2 text-xs border p-2 rounded bg-gray-50">
                            <div className="mb-1">
                                <label>学年を選択：</label>
                                <select
                                    value={selectedGrade}
                                    onChange={(e) => handleGradeSelect(e.target.value)}
                                    className="ml-1 p-1 border text-xs"
                                >
                                    <option value="">選択</option>
                                    {['小学1年', '小学2年', '小学3年', '小学4年', '小学5年', '小学6年', '中学1年', '中学2年', '中学3年', '高校1年', '高校2年', '高校3年'].map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>

                            {studentOptions.length > 0 && (
                                <div className="mt-1">
                                    <label>生徒を選択：</label>
                                    <select
                                        onChange={(e) => {
                                            const student = allStudents.find(s => s.code === e.target.value);
                                            if (student) handleSelectStudent(student);
                                        }}
                                        className="ml-1 p-1 border text-xs w-full"
                                    >
                                        <option value="">選択</option>
                                        {studentOptions.map((s) => (
                                            <option key={s.code} value={s.code}>
                                                {`${s.lastName} ${s.firstName}（${s.code}）`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </td>
            ))}
        </tr>
    );
}

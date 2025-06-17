import { useState } from 'react';
import StudentChip from './StudentChip';

export default function TimetableCell({
    periodIdx,
    students,
    rowIndex,
    row,
    allRows,
    onChange,
}) {
    const [menuIndex, setMenuIndex] = useState(null);

    const handleChange = (periodIdx, studentIdx, field, value) => {
        const newRow = JSON.parse(JSON.stringify(row));
        newRow.periods[periodIdx][studentIdx][field] = value;
        onChange(rowIndex, newRow);
    };

    const handleRemoveClick = (studentIdx) => {
        setMenuIndex(studentIdx);
    };

    const handleAction = (studentIdx, action) => {
        const student = row.periods[periodIdx][studentIdx];

        // rows 全体を操作する
        const newAllRows = JSON.parse(JSON.stringify(allRows));

        // 1️⃣ 元の行から必ず削除
        newAllRows[rowIndex].periods[periodIdx] = newAllRows[rowIndex].periods[periodIdx].filter(
            (_, idx) => idx !== studentIdx
        );

        if (action === '振り替え' || action === '欠席') {
            // 2️⃣ 移動先に追加 + 元情報を保存
            const targetRow = newAllRows.find(r => r.teacher === action);
            if (targetRow) {
                targetRow.periods[periodIdx].push({
                    ...student,
                    originRow: rowIndex,       // 元の行index
                    originPeriod: periodIdx    // 元のperiod
                });
            }
        } else if (action === '元に戻す') {
            // 3️⃣ 振り替え・欠席から元に戻す
            if (student.originRow !== undefined && student.originPeriod !== undefined) {
                const originRow = newAllRows[student.originRow];
                if (originRow) {
                    originRow.periods[student.originPeriod].push({
                        ...student,
                        originRow: undefined,
                        originPeriod: undefined
                    });
                }
            }
        }

        // ✅ rows 全体を反映する
        window.dispatchEvent(new CustomEvent('updateAllRows', { detail: newAllRows }));

        setMenuIndex(null);
    };

    return (
        <td
            className="text-[10px] p-0.5 mb-0.5 border rounded bg-white shadow-sm cursor-pointer hover:bg-gray-100 relative"
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
                    <div key={studentIdx} className="relative inline-flex">
                        <StudentChip
                            student={student}
                            periodIdx={periodIdx}
                            studentIdx={studentIdx}
                            handleChange={handleChange}
                            handleRemove={() => handleRemoveClick(studentIdx)}
                        />

                        {/* メニュー */}
                        {menuIndex === studentIdx && (
                            <div className="absolute top-6 right-0 bg-white border rounded shadow text-xs z-20">
                                {/* 元に戻すが可能か判断 */}
                                {row.teacher === '振り替え' || row.teacher === '欠席' ? (
                                    <button
                                        className="block px-2 py-1 hover:bg-gray-100 w-full text-left"
                                        onClick={() => handleAction(studentIdx, '元に戻す')}
                                    >
                                        元に戻す
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="block px-2 py-1 hover:bg-gray-100 w-full text-left"
                                            onClick={() => handleAction(studentIdx, '削除')}
                                        >
                                            削除
                                        </button>
                                        <button
                                            className="block px-2 py-1 hover:bg-gray-100 w-full text-left"
                                            onClick={() => handleAction(studentIdx, '振り替え')}
                                        >
                                            振り替え
                                        </button>
                                        <button
                                            className="block px-2 py-1 hover:bg-gray-100 w-full text-left"
                                            onClick={() => handleAction(studentIdx, '欠席')}
                                        >
                                            欠席
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </td>
    );
}

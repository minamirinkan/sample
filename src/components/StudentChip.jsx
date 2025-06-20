export default function StudentChip({
    student,
    periodIdx,
    studentIdx,
    rowIndex,  // 👈 追加
    handleChange,
    handleRemove,
}) {
    return (
        <div
            className="mb-1 border rounded bg-blue-100 p-2 flex items-center gap-0.5 hover:bg-green-200"
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData(
                    'application/json',
                    JSON.stringify({
                        student,
                        fromRow: rowIndex,   // 👈 必須！
                        fromPeriod: periodIdx
                    })
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

            {/* 氏名 */}
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
                onClick={() => handleRemove(periodIdx, studentIdx)}
                className="text-red-600 font-bold px-2 hover:text-red-800"
                title="削除"
            >
                ✕
            </button>
        </div>
    );
}

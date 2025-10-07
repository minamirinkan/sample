import { FiMoreVertical } from 'react-icons/fi';

export default function StudentChip({
    student,
    periodIdx,
    studentIdx,
    rowIndex,  // 👈 追加
    handleChange,
    handleRemove,
}) {
    const classType = student.classType || '';
    let bgColor = 'bg-gray-100';

    if (classType === '1名クラス') bgColor = 'bg-red-300';
    else if (classType === '2名クラス') bgColor = 'bg-blue-300';
    else if (classType === '演習クラス') bgColor = 'bg-green-300';
    return (
        <div
            className={`mb-1 border rounded ${bgColor} p-2 flex items-center gap-0.5 hover:opacity-90`}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData(
                    'application/json',
                    JSON.stringify({
                        student,
                        fromRow: rowIndex,
                        fromPeriod: periodIdx,
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

            {/* 氏名 */}
            <div
                className="text-xs font-semibold text-blue-800 px-1 whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis"
                style={{ lineHeight: 1 }}
                title={student.name}
            >
                {student.grade} {student.name}
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
                className="text-black-600 font-bold px-2 hover:text-black-800"
                title="操作メニュー"
            >
                <FiMoreVertical size={16} />
            </button>
        </div>
    );
}
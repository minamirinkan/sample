// src/components/TimetableTable.jsx
import TimetableRow from './TimetableRow';
import mockTeachers from '../data/mockTeachers';
import mockStudents from '../data/mockStudents';
import periods from '../constants/periods';

export default function TimetableTable({ rows, onChange }) {
    return (
        <div className="flex gap-4">
            {/* 📦 左側：生徒一覧（ドラッグ可能） */}
            <div className="w-64 p-2 border bg-white rounded shadow text-sm">
                <h3 className="font-bold mb-2">生徒一覧</h3>
                {mockStudents.map((s) => (
                    <div
                        key={s.code}
                        draggable
                        onDragStart={(e) =>
                            e.dataTransfer.setData('studentCode', s.code)
                        }
                        className="p-1 mb-1 border rounded bg-blue-100 hover:bg-blue-200 cursor-move"
                    >
                        {`${s.lastName} ${s.firstName}（${s.grade}）`}
                    </div>
                ))}
            </div>

            {/* 🗓️ 右側：時間割表 */}
            <div className="overflow-x-auto flex-1">
                <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
                    <thead>
                        <tr>
                            <th className="border bg-gray-100 p-2 w-24">講師</th>
                            {periods.map((p, i) => (
                                <th key={i} className="border bg-gray-100 p-2 text-center">
                                    {p.label}
                                    <br />
                                    {p.time}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIdx) => (
                            <TimetableRow
                                key={rowIdx}
                                rowIndex={rowIdx}
                                row={row}
                                onChange={onChange}
                                allTeachers={mockTeachers}
                                allStudents={mockStudents}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// src/components/TimetableTable.jsx
import { useState } from 'react';
import TimetableRow from './TimetableRow';
import mockTeachers from '../data/mockTeachers';
import mockStudents from '../data/mockStudents';
import periods from '../constants/periods';

const shortGrade = (grade) => {
    if (!grade) return '';
    return grade
        .replace('小学', '小')
        .replace('中学', '中')
        .replace('高校', '高')
        .replace('生', '')
        .replace('年', '');
};

export default function TimetableTable({ rows, onChange }) {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');

    const filteredStudents = mockStudents.filter((s) => {
        const name = `${s.lastName} ${s.firstName}`;
        const short = shortGrade(s.grade);
        return (
            name.includes(searchKeyword) &&
            (gradeFilter === '' || short === gradeFilter)
        );
    });

    const gradeOrder = [
        '小1', '小2', '小3', '小4', '小5', '小6',
        '中1', '中2', '中3',
        '高1', '高2', '高3','既卒'
    ];

    const existingGrades = gradeOrder.filter((g) =>
        mockStudents.some((s) => shortGrade(s.grade) === g)
    );

    return (
        <div className="flex gap-4">
            {/* 左側：生徒一覧 */}
            <div className="w-48 p-2 border bg-white rounded shadow text-sm">
                <h3 className="font-bold mb-2">生徒一覧</h3>

                {/* 検索バー */}
                <input
                    type="text"
                    placeholder="名前で検索"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="mb-2 p-1 border rounded w-full text-sm"
                />

                {/* 学年絞り込み */}
                <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="mb-2 p-1 border rounded w-full text-sm"
                >
                    <option value="">すべての学年</option>
                    {existingGrades.map((g) => (
                        <option key={g} value={g}>
                            {g}
                        </option>
                    ))}
                </select>

                {/* 生徒リスト */}
                <div className="overflow-y-auto max-h-[500px] pr-1">
                    {filteredStudents.map((s) => (
                        <div
                            key={s.code}
                            draggable
                            onDragStart={(e) =>
                                e.dataTransfer.setData(
                                    'application/json',
                                    JSON.stringify({
                                        student: {
                                            name: `${s.lastName} ${s.firstName}`,
                                            grade: shortGrade(s.grade),
                                            code: s.code,
                                            seat: '',
                                            subject: '',
                                        },
                                        fromPeriod: null,
                                    })
                                )
                            }
                            className="p-1 mb-1 border rounded bg-blue-100 hover:bg-blue-200 cursor-move"
                        >
                            {`(${shortGrade(s.grade)}) ${s.lastName} ${s.firstName}`}
                        </div>
                    ))}
                </div>
            </div>

            {/* 右側：時間割表 */}
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
                                allRows={rows} // ここで全行データを渡す
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

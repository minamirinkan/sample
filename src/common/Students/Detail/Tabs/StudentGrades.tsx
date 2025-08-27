import React, { useState, useRef } from "react";

type StudentGradesProps = {
    studentId?: string;
    studentName: string;
    classroomCode: string;
};

type Grade = {
    [subject: string]: number | undefined;
};

export default function StudentGrades({
    studentId,
    studentName,
    classroomCode,
}: StudentGradesProps) {
    const subjects = ["国語", "社会", "数学", "理科", "英語", "音楽", "美術", "保体", "技家"];
    const semesters = [
        "1年1学期", "1年2学期", "1年3学期",
        "2年1学期", "2年2学期", "2年3学期",
        "3年1学期", "3年2学期"
    ];

    const [grades, setGrades] = useState<{ [semester: string]: Grade }>(() => {
        const initial: { [semester: string]: Grade } = {};
        semesters.forEach((semester) => {
            initial[semester] = {};
            subjects.forEach((subject) => (initial[semester][subject] = undefined));
        });
        return initial;
    });

    // 入力欄の refs を管理
    const inputRefs = useRef<(HTMLInputElement | null)[][]>(
        Array(semesters.length)
            .fill(null)
            .map(() => Array(subjects.length).fill(null))
    );

    const handleScoreChange = (semester: string, subject: string, value: string) => {
        setGrades((prev) => ({
            ...prev,
            [semester]: { ...prev[semester], [subject]: value === "" ? undefined : Number(value) },
        }));
    };

    const handleKeyDown = (rowIndex: number, colIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const nextCol = colIndex + 1;
            const nextRow = rowIndex;
            if (nextCol < subjects.length) {
                // 同じ行の次の科目
                inputRefs.current[nextRow][nextCol]?.focus();
            } else if (rowIndex + 1 < semesters.length) {
                // 次の行の最初の科目
                inputRefs.current[rowIndex + 1][0]?.focus();
            }
        }
    };

    const calculateTotals = (semester: string) => {
        const semGrades = grades[semester];
        const total3 =
            (semGrades["国語"] ?? 0) +
            (semGrades["英語"] ?? 0) +
            (semGrades["数学"] ?? 0);
        const total5 =
            (semGrades["国語"] ?? 0) +
            (semGrades["英語"] ?? 0) +
            (semGrades["数学"] ?? 0) +
            (semGrades["理科"] ?? 0) +
            (semGrades["社会"] ?? 0);
        const total9 = subjects.reduce((sum, subject) => sum + (semGrades[subject] ?? 0), 0);
        return { total3, total5, total9 };
    };

    const handleSave = () => {
        console.log("保存データ:", { studentId, studentName, classroomCode, grades });
        alert("成績を保存しました！（コンソール確認）");
    };

    return (
        <div className="p-2 border rounded bg-gray-50 overflow-x-auto">
            <h3 className="text-md font-semibold mb-2">{studentName} さんの成績管理</h3>
            <p className="mb-1 text-gray-600 text-sm">Classroom: {classroomCode}</p>

            <table className="w-full border-collapse mb-2 text-sm">
                <thead>
                    <tr>
                        <th className="border p-1">学期</th>
                        {subjects.map((subject) => (
                            <th key={subject} className="border p-1">{subject}</th>
                        ))}
                        <th className="border p-1">3科合計</th>
                        <th className="border p-1">5科合計</th>
                        <th className="border p-1">9科合計</th>
                    </tr>
                </thead>
                <tbody>
                    {semesters.map((semester, rowIndex) => {
                        const { total3, total5, total9 } = calculateTotals(semester);
                        return (
                            <tr key={semester}>
                                <td className="border p-1">{semester}</td>
                                {subjects.map((subject, colIndex) => (
                                    <td key={subject} className="border p-1">
                                        <input
                                            type="number"
                                            value={grades[semester][subject] ?? ""}
                                            onChange={(e) => handleScoreChange(semester, subject, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(rowIndex, colIndex, e)}
                                            className="w-12 p-0.5 text-xs border rounded appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            ref={(el) => { inputRefs.current[rowIndex][colIndex] = el; }}
                                        />


                                    </td>
                                ))}
                                <td className="border p-1 font-semibold">{total3}</td>
                                <td className="border p-1 font-semibold">{total5}</td>
                                <td className="border p-1 font-semibold">{total9}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                保存
            </button>
        </div>
    );
}

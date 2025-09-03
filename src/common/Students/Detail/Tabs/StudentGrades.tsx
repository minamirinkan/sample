import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase";
import { getStudentScoresByGrade } from "../../../ScoreTable/scoreService";

type StudentGradesProps = {
    studentId: string;
    studentName: string;
    classroomCode: string;
};

type Grade = {
    [subject: string]: number | null;
};

type SemesterGrades = {
    [semester: string]: Grade;
};

type TestGradesRow = {
    name: string;
    grades: { [subject: string]: number | null };
    deviations: { [subject: string]: number | null };
    totalInput?: number | null;
};

const subjects = ["国語", "社会", "数学", "理科", "英語", "音楽", "美術", "保体", "技家"];
const subjects3 = ["国語", "社会", "数学", "理科", "英語"];

const initialTestRow: TestGradesRow = {
    name: "第一回",
    grades: { "国語": null, "社会": null, "数学": null, "理科": null, "英語": null },
    deviations: { "国語": null, "社会": null, "数学": null, "理科": null, "英語": null }
};

// 学期パターン
const testSemesters3 = [
    "1年1学期中間", "1年1学期期末", "1年2学期中間", "1年2学期期末", "1年学年末",
    "2年1学期中間", "2年1学期期末", "2年2学期中間", "2年2学期期末", "2年学年末",
    "3年1学期中間", "3年1学期期末", "3年2学期中間", "3年2学期期末", "3年学年末"
];
const gradeSemesters3 = [
    "1年1学期", "1年2学期", "1年3学期",
    "2年1学期", "2年2学期", "2年3学期",
    "3年1学期", "3年2学期"
];
const testSemesters2 = [
    "1年前期中間", "1年前期期末", "1年後期中間", "1年後期期末",
    "2年前期中間", "2年前期期末", "2年後期中間", "2年後期期末",
    "3年前期中間", "3年前期期末", "3年後期中間", "3年後期期末"
];
const gradeSemesters2 = [
    "1年前期", "1年後期",
    "2年前期", "2年後期",
    "3年前期", "3年後期"
];

export default function StudentGrades({ studentId, studentName }: StudentGradesProps) {
    const [grades1, setGrades1] = useState<SemesterGrades>({});
    const [grades2, setGrades2] = useState<SemesterGrades>({});
    const [testRows3, setTestRows3] = useState<TestGradesRow[]>([initialTestRow]);
    const [termSystem, setTermSystem] = useState<number>(3); // デフォルト3
    const [testSemesters, setTestSemesters] = useState<string[]>(testSemesters3);
    const [gradeSemesters, setGradeSemesters] = useState<string[]>(gradeSemesters3);

    // useEffect内に追加
    useEffect(() => {
    const fetchGrades = async () => {
        // students ドキュメントから termSystem 取得
        const studentSnap = await getDoc(doc(db, "students", studentId));
        let term = 3;
        if (studentSnap.exists()) {
            const studentData = studentSnap.data();
            term = studentData.termSystem ?? 3;
        }
        setTermSystem(term);
        setTestSemesters(term === 2 ? testSemesters2 : testSemesters3);
        setGradeSemesters(term === 2 ? gradeSemesters2 : gradeSemesters3);

        // scores 取得
        const fetchedGrades = await getStudentScoresByGrade(studentId);
        setGrades1(fetchedGrades);

        // 成績や模試は以前通り
        const snap = await getDoc(doc(db, "studentGrades", studentId));
        const emptyGrades: SemesterGrades = {};
        const semList = [...new Set([...testSemesters, ...gradeSemesters])]; // 空初期用
        semList.forEach(sem => {
            emptyGrades[sem] = {};
            subjects.forEach(subj => emptyGrades[sem][subj] = null);
        });

        if (snap.exists()) {
            const data = snap.data();
            setGrades2(data.grades2 || emptyGrades);
            setTestRows3(data.testRows3 && data.testRows3.length > 0 ? data.testRows3 : [initialTestRow]);
        } else {
            setGrades2(emptyGrades);
            setTestRows3([initialTestRow]);
        }
    };

    fetchGrades();
}, [studentId]);


    const renderTable = (grades: SemesterGrades, semestersToUse: string[]) => (
        <table className="w-full border-collapse text-sm mb-6 text-center">
            <thead>
                <tr>
                    <th className="border p-1">学期</th>
                    {subjects.map(subj => <th key={subj} className="border p-1">{subj}</th>)}
                    <th className="border p-1">3科合計</th>
                    <th className="border p-1">5科合計</th>
                    <th className="border p-1">9科合計</th>
                </tr>
            </thead>
            <tbody>
                {semestersToUse.map(sem => {
                    const total3 = (grades[sem]?.["国語"] ?? 0) + (grades[sem]?.["英語"] ?? 0) + (grades[sem]?.["数学"] ?? 0);
                    const total5 = total3 + (grades[sem]?.["理科"] ?? 0) + (grades[sem]?.["社会"] ?? 0);
                    const total9 = subjects.reduce((sum, subj) => sum + (grades[sem]?.[subj] ?? 0), 0);
                    return (
                        <tr key={sem}>
                            <td className="border p-1">{sem}</td>
                            {subjects.map(subj => (
                                <td key={subj} className="border p-1">{grades[sem]?.[subj] ?? "-"}</td>
                            ))}
                            <td className="border p-1 font-semibold">{total3}</td>
                            <td className="border p-1 font-semibold">{total5}</td>
                            <td className="border p-1 font-semibold">{total9}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );

    const renderTable3 = () => (
        <table className="w-full border-collapse text-sm mb-6 text-center">
            <thead>
                <tr>
                    <th className="border p-1">種類</th>
                    <th className="border p-1">結果</th>
                    {subjects3.map(subj => <th key={subj} className="border p-1">{subj}</th>)}
                    <th className="border p-1">5科合計</th>
                </tr>
            </thead>
            <tbody>
                {testRows3 && testRows3.length > 0 ? (
                    testRows3.map((row, idx) => {
                        const total5 = subjects3.reduce((sum, subj) => sum + (row.grades[subj] ?? 0), 0);
                        return (
                            <React.Fragment key={idx}>
                                <tr>
                                    <td className="border p-1 text-center" rowSpan={2}>{row.name}</td>
                                    <td className="border p-1 font-semibold text-center">点数</td>
                                    {subjects3.map(subj => (
                                        <td key={`score-${subj}-${idx}`} className="border p-1 text-center">{row.grades[subj] ?? "-"}</td>
                                    ))}
                                    <td className="border p-1 font-semibold text-center">{total5}</td>
                                </tr>
                                <tr>
                                    <td className="border p-1 font-semibold text-center">偏差値</td>
                                    {subjects3.map(subj => (
                                        <td key={`dev-${subj}-${idx}`} className="border p-1 text-center">{row.deviations[subj] ?? "-"}</td>
                                    ))}
                                    <td className="border p-1 text-center">-</td>
                                </tr>
                            </React.Fragment>
                        );
                    })
                ) : (
                    <tr>
                        <td className="border p-1 text-center" colSpan={7}>受験した模試がありません</td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    return (
        <div className="p-4 border rounded bg-gray-50 max-w-full overflow-x-auto">
            <h3 className="text-lg font-semibold mb-2">{studentName} さんの成績一覧</h3>

            <div className="mb-4">
                <span className="font-semibold text-gray-700">テスト結果</span>
                {renderTable(grades1, testSemesters)}
            </div>

            <div className="mb-4">
                <span className="font-semibold text-gray-700">成績</span>
                {renderTable(grades2, gradeSemesters)}
            </div>

            <div className="mb-4">
                <span className="font-semibold text-gray-700">模試結果</span>
                {renderTable3()}
            </div>
        </div>
    );
}

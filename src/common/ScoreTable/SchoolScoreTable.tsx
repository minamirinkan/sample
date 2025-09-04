import React, { useState } from "react";
import { useAdminData } from "../../contexts/providers/AdminDataProvider";
import { saveStudentScores, getStudentScores, StudentScore } from "./scoreService";
import { getStudentGradePoints, saveStudentGradePoints, StudentGradePoint } from "./gradePointService";

type Student = {
    studentId: string;
    fullname: string;
    grade: string;
    termSystem: number;
};

const subjects = ["国語", "社会", "数学", "理科", "英語", "音楽", "美術", "保体", "技家"];
const fiveSubjects = ["国語", "社会", "数学", "理科", "英語"];

const testsByTermSystem: Record<number, string[]> = {
    3: ["1学期中間", "1学期期末", "2学期中間", "2学期期末", "学年末"],
    2: ["前期中間", "前期期末", "後期中間", "後期期末"],
};

const pointsByTermSystem: Record<number, string[]> = {
    3: ["1学期", "2学期", "学年末"],
    2: ["前期", "後期"],
};

export default function SchoolScoreTable() {
    const { students, loading } = useAdminData();
    const typedStudents: Student[] = Array.isArray(students?.students)
        ? (students.students as Student[])
        : [];

    const [selectedTerm, setSelectedTerm] = useState<number>(3);
    const [selectedTest, setSelectedTest] = useState<string>("");
    const [selectedGradePoint, setSelectedGradePoint] = useState<string>("");
    const [selectedSchoolLevel, setSelectedSchoolLevel] = useState<string>("中");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [scores, setScores] = useState<Record<string, Record<string, string>>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const getGradeNumber = (grade: string): number => {
        if (grade.includes("小")) return Number(grade.replace("小", ""));
        if (grade.includes("中")) return Number(grade.replace("中", ""));
        if (grade.includes("高")) return Number(grade.replace("高", ""));
        return 0; // 不明な場合
    };

    const filteredStudents = typedStudents
        .filter(s => s.termSystem === selectedTerm)
        .filter(s => {
            if (selectedSchoolLevel === "小") return s.grade.includes("小");
            if (selectedSchoolLevel === "中") return s.grade.includes("中");
            if (selectedSchoolLevel === "高") return s.grade.includes("高");
            return true;
        });

    const tests = testsByTermSystem[selectedTerm] || [];
    const points = pointsByTermSystem[selectedTerm] || [];

    // -------------------
    // 点数変更
    // -------------------
    const handleScoreChange = (studentId: string, subject: string, value: string) => {
        const regex = /^[0-9]*$/;
        if (!regex.test(value)) {
            setErrors(prev => ({
                ...prev,
                [`${studentId}-${subject}`]: "⚠️ 半角数字のみ入力してください"
            }));
            return;
        } else {
            setErrors(prev => ({
                ...prev,
                [`${studentId}-${subject}`]: ""
            }));
        }

        setScores(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [subject]: value }
        }));
    };

    const calcTotal = (studentId: string, subjectsToSum: string[]) => {
        const studentScores = scores[studentId] || {};
        return subjectsToSum.reduce((sum, subj) => sum + Number(studentScores[subj] || 0), 0);
    };

    // -------------------
    // 保存ボタン
    // -------------------
    const handleSave = async () => {
        if (selectedTest) {
            const scoresToSave: StudentScore[] = filteredStudents.map(student => {
                const gradeNumber = getGradeNumber(student.grade);

                return {
                    studentId: student.studentId,
                    gradeNumber,                  // ← 追加
                    termSystem: student.termSystem, // ← 追加
                    test: selectedTest,
                    scores: Object.fromEntries(
                        subjects.map(subj => [subj, Number(scores[student.studentId]?.[subj] || 0)])
                    ),
                };
            });
            try {
                await saveStudentScores(scoresToSave);
                alert("保存しました！");
                setIsEditing(false);
            } catch (error) {
                console.error(error);
                alert("保存に失敗しました。");
            }
        } else if (selectedGradePoint) {
            const scoresToSave: StudentGradePoint[] = filteredStudents.map(student => {
                const gradeNumber = getGradeNumber(student.grade);

                return {
                    studentId: student.studentId,
                    gradeNumber,                  // ← 追加
                    termSystem: student.termSystem, // ← 追加
                    term: selectedGradePoint,
                    scores: Object.fromEntries(
                        subjects.map(subj => [subj, Number(scores[student.studentId]?.[subj] || 0)])
                    ),
                };
            });
            try {
                await saveStudentGradePoints(scoresToSave);
                alert("保存しました！");
                setIsEditing(false);
            } catch (error) {
                console.error(error);
                alert("保存に失敗しました。");
            }
        }
    };

    // -------------------
    // テスト選択時にFirestoreから取得
    // -------------------
    React.useEffect(() => {
        if (!selectedTest && !selectedGradePoint) return;
        if (isEditing) return;

        const fetchData = async () => {
            if (selectedTest) {
                const newScores: Record<string, Record<string, string>> = {};
                for (const student of filteredStudents) {
                    const savedScore = await getStudentScores(
                        student.studentId,
                        getGradeNumber(student.grade),
                        selectedTest
                    );
                    newScores[student.studentId] = {};
                    subjects.forEach(subj => {
                        newScores[student.studentId][subj] = savedScore?.scores[subj]?.toString() || "";
                    });
                }
                setScores(newScores);
            } else if (selectedGradePoint) {
                const newScores: Record<string, Record<string, string>> = {};
                for (const student of filteredStudents) {
                    const savedScore = await getStudentGradePoints(
                        student.studentId,
                        getGradeNumber(student.grade),
                        selectedGradePoint
                    );
                    newScores[student.studentId] = {};
                    subjects.forEach(subj => {
                        newScores[student.studentId][subj] = savedScore?.scores[subj]?.toString() || "";
                    });
                }
                setScores(newScores);
            }
        };

        fetchData();
    }, [selectedTest, selectedGradePoint, filteredStudents, isEditing]);

    if (loading) return <div>読み込み中…</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">学校成績入力・集計</h1>

            {/* 学年区分 */}
            <div className="mb-2">
                <label className="block font-semibold">学年区分:</label>
                <div className="flex gap-4">
                    {["小", "中", "高"].map(level => (
                        <label key={level} className="flex items-center gap-1">
                            <input
                                type="radio"
                                value={level}
                                checked={selectedSchoolLevel === level}
                                onChange={e => setSelectedSchoolLevel(e.target.value)}
                            />
                            {level === "小" ? "小学生" : level === "中" ? "中学生" : "高校生"}
                        </label>
                    ))}
                </div>
            </div>

            <div className="mb-2">
                <label className="block font-semibold">期制:</label>
                <div className="flex gap-4">
                    {[3, 2].map(term => (
                        <label key={term} className="flex items-center gap-1">
                            <input
                                type="radio"
                                value={term}
                                checked={selectedTerm === term}
                                onChange={e => {
                                    const t = Number(e.target.value);
                                    setSelectedTerm(t);
                                    setSelectedTest("");
                                    setIsEditing(false);
                                }}
                            />
                            {term}期制
                        </label>
                    ))}
                </div>
            </div>

            <div className="mb-4 flex items-center gap-4">
                {/* テスト選択 */}
                <div>
                    <label className="mr-2 font-semibold">テスト: </label>
                    <select
                        value={selectedTest}
                        onChange={e => {
                            setSelectedTest(e.target.value);
                            setIsEditing(false);
                            setSelectedGradePoint("");
                        }}
                        className="border p-1"
                    >
                        <option value="">-- 選択 --</option>
                        {tests.map(test => (
                            <option key={test} value={test}>
                                {test}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 内申点選択 */}
                <div>
                    <label className="mr-2 font-semibold">内申: </label>
                    <select
                        value={selectedGradePoint}
                        onChange={e => {
                            setSelectedGradePoint(e.target.value);
                            setIsEditing(false);
                            setSelectedTest("");
                        }}
                        className="border p-1"
                    >
                        <option value="">-- 選択 --</option>
                        {points.map(point => (
                            <option key={point} value={point}>
                                {point}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 点数入力ボタン / 保存 / キャンセル */}
            {(selectedTest || selectedGradePoint) && (
                <div className="mb-4">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            編集
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                保存
                            </button>
                            <button
                                onClick={() => {
                                    setScores({});
                                    setIsEditing(false);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                キャンセル
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 生徒テーブル */}
            {(selectedTest || selectedGradePoint) && filteredStudents.length > 0 && (
                <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                    <table className="border-collapse border w-full min-w-max">
                        <thead className="bg-gray-100">
                            <tr>
                                {/* 生徒名ヘッダーセル */}
                                <th className="sticky top-0 left-0 z-30 w-32 bg-gray-100 border p-2">
                                    生徒名
                                </th>
                                <th className="sticky top-0 z-20 bg-gray-100 border p-2">学年</th>
                                <th className="sticky top-0 z-20 bg-gray-100 border p-2">生徒コード</th>
                                {subjects.map(subj => (
                                    <th
                                        key={subj}
                                        className="sticky top-0 z-20 bg-gray-100 border p-2 min-w-[80px]"
                                    >
                                        {subj}
                                    </th>
                                ))}
                                <th className="sticky top-0 z-20 bg-gray-100 border p-2 min-w-[80px]">5科目合計</th>
                                <th className="sticky top-0 z-20 bg-gray-100 border p-2 min-w-[80px]">9科目合計</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.studentId} className="odd:bg-white even:bg-gray-50">
                                    <td className="sticky left-0 w-32 bg-white border p-2">{student.fullname}</td>
                                    <td className="border p-2">{student.grade}</td>
                                    <td className="border p-2">{student.studentId}</td>

                                    {subjects.map(subj => (
                                        <td key={subj} className="border p-1">
                                            <input
                                                type="text"
                                                value={scores[student.studentId]?.[subj] || ""}
                                                onChange={e =>
                                                    handleScoreChange(student.studentId, subj, e.target.value)
                                                }
                                                disabled={!isEditing}
                                                className="w-16 border p-1 text-center"
                                            />
                                            {errors[`${student.studentId}-${subj}`] && (
                                                <div className="text-red-500 text-xs mt-1">
                                                    {errors[`${student.studentId}-${subj}`]}
                                                </div>
                                            )}
                                        </td>
                                    ))}

                                    <td className="border p-2 text-center">
                                        {calcTotal(student.studentId, fiveSubjects)}
                                    </td>
                                    <td className="border p-2 text-center">
                                        {calcTotal(student.studentId, subjects)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(selectedTest || selectedGradePoint) && filteredStudents.length === 0 && <div>該当する生徒がいません。</div>}
        </div>
    );
}

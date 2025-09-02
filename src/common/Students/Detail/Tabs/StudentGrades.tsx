import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../firebase";

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
    avgDeviation?: number | null;
    totalInput?: number | null;
};


const subjects = ["国語", "社会", "数学", "理科", "英語", "音楽", "美術", "保体", "技家"];
const semesters = ["1年1学期", "1年2学期", "1年3学期", "2年1学期", "2年2学期", "2年3学期", "3年1学期", "3年2学期"];
const subjects3 = ["国語", "社会", "数学", "理科", "英語"];

export default function StudentGrades({ studentId, studentName, classroomCode }: StudentGradesProps) {
    // 1つ目の表
    const [grades1, setGrades1] = useState<SemesterGrades>({});
    const [originalGrades1, setOriginalGrades1] = useState<SemesterGrades>({});
    const [isEditing1, setIsEditing1] = useState(false);

    // 2つ目の表
    const [grades2, setGrades2] = useState<SemesterGrades>({});
    const [originalGrades2, setOriginalGrades2] = useState<SemesterGrades>({});
    const [isEditing2, setIsEditing2] = useState(false);

    // 3つ目の表
    const [testRows3, setTestRows3] = useState<TestGradesRow[]>([
        {
            name: "第一回",
            grades: { "国語": null, "社会": null, "数学": null, "理科": null, "英語": null },
            deviations: { "国語": null, "社会": null, "数学": null, "理科": null, "英語": null }
        }
    ]);
    const [originalTestRows3, setOriginalTestRows3] = useState<TestGradesRow[]>([]);
    const [isEditing3, setIsEditing3] = useState(false);

    const initialTestRow: TestGradesRow = {
        name: "第一回",
        grades: { "国語": null, "社会": null, "数学": null, "理科": null, "英語": null },
        deviations: { "国語": null, "社会": null, "数学": null, "理科": null, "英語": null }
    };

    useEffect(() => {
        const fetchGrades = async () => {
            const docRef = doc(db, "studentGrades", studentId);
            const snap = await getDoc(docRef);

            const emptyGrades: SemesterGrades = {};
            semesters.forEach((sem) => {
                emptyGrades[sem] = {};
                subjects.forEach((subj) => emptyGrades[sem][subj] = null);
            });

            if (snap.exists()) {
                const data = snap.data();
                const loadedRows = data.testRows3 && data.testRows3.length > 0 ? data.testRows3 : [initialTestRow];
                setGrades1(data.grades1 || emptyGrades);
                setOriginalGrades1(data.grades1 || emptyGrades);
                setGrades2(data.grades2 || emptyGrades);
                setOriginalGrades2(data.grades2 || emptyGrades);
                setTestRows3(loadedRows);
                setOriginalTestRows3(loadedRows);
            } else {
                setGrades1(emptyGrades);
                setOriginalGrades1(emptyGrades);
                setGrades2(emptyGrades);
                setOriginalGrades2(emptyGrades);
                setTestRows3([initialTestRow]);
                setOriginalTestRows3([initialTestRow]);
            }
        };
        fetchGrades();
    }, [studentId]);

    // 1つ目・2つ目の表変更
    const handleScoreChange1 = (sem: string, subj: string, value: string) => {
        setGrades1(prev => ({ ...prev, [sem]: { ...prev[sem], [subj]: value === "" ? null : Number(value) } }));
    };
    const handleScoreChange2 = (sem: string, subj: string, value: string) => {
        setGrades2(prev => ({ ...prev, [sem]: { ...prev[sem], [subj]: value === "" ? null : Number(value) } }));
    };

    // 保存・キャンセル 1,2
    const handleSave1 = async () => {
        if (!window.confirm("この成績を保存しますか？")) return;
        const safeGrades: SemesterGrades = {};
        semesters.forEach(sem => {
            safeGrades[sem] = {};
            subjects.forEach(subj => safeGrades[sem][subj] = grades1?.[sem]?.[subj] ?? null);
        });
        await setDoc(doc(db, "studentGrades", studentId), {
            studentId, studentName, classroomCode,
            grades1: safeGrades,
            grades2: originalGrades2,
            testRows3: originalTestRows3
        });
        setOriginalGrades1(safeGrades);
        setIsEditing1(false);
        alert("1つ目の表を保存しました！");
    };
    const handleSave2 = async () => {
        if (!window.confirm("この成績を保存しますか？")) return;
        const safeGrades: SemesterGrades = {};
        semesters.forEach(sem => {
            safeGrades[sem] = {};
            subjects.forEach(subj => safeGrades[sem][subj] = grades2?.[sem]?.[subj] ?? null);
        });
        await setDoc(doc(db, "studentGrades", studentId), {
            studentId, studentName, classroomCode,
            grades1: originalGrades1,
            grades2: safeGrades,
            testRows3: originalTestRows3
        });
        setOriginalGrades2(safeGrades);
        setIsEditing2(false);
        alert("2つ目の表を保存しました！");
    };
    const handleCancel1 = () => { setGrades1(originalGrades1); setIsEditing1(false); };
    const handleCancel2 = () => { setGrades2(originalGrades2); setIsEditing2(false); };

    // 3つ目の表操作
    const handleGradeChange3 = (index: number, subject: string, value: string) => {
        const newRows = [...testRows3];
        newRows[index].grades[subject] = value === "" ? null : Number(value);
        setTestRows3(newRows);
    };
    const handleDeviationChange = (index: number, subject: string, value: string) => {
        const newRows = [...testRows3];
        newRows[index].deviations[subject] = value === "" ? null : Number(value);
        setTestRows3(newRows);
    };
    const handleNameChange3 = (index: number, value: string) => {
        const newRows = [...testRows3];
        newRows[index].name = value;
        setTestRows3(newRows);
    };
    const handleAddRow3 = () => {
        setTestRows3([
            ...testRows3,
            {
                name: `新規${testRows3.length + 1}`,
                grades: { "国語": null, "社会": null, "数学": null, "理科": null, "英語": null },
                deviations: { "国語": null, "社会": null, "数学": null, "理科": null, "英語": null }
            },
        ]);
    };
    const handleSave3 = async () => {
        if (!window.confirm("この成績を保存しますか？")) return;
        await setDoc(doc(db, "studentGrades", studentId), {
            studentId, studentName, classroomCode,
            grades1: originalGrades1,
            grades2: originalGrades2,
            testRows3
        });
        setOriginalTestRows3(testRows3);
        setIsEditing3(false);
        alert("3つ目の表を保存しました！");
    };
    const handleCancel3 = () => {
        if (!originalTestRows3 || originalTestRows3.length === 0) {
            setTestRows3([initialTestRow]); // 空なら初期行を復元
        } else {
            setTestRows3(originalTestRows3);
        }
        setIsEditing3(false);
    };
    // 表描画関数
    const renderTable = (grades: SemesterGrades, isEditing: boolean, handleChange: (sem: string, subj: string, val: string) => void) => (
        <table className="border-collapse text-sm min-w-[700px] mb-6">
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
                {semesters.map(sem => {
                    const total3 = (grades[sem]?.["国語"] ?? 0) + (grades[sem]?.["英語"] ?? 0) + (grades[sem]?.["数学"] ?? 0);
                    const total5 = total3 + (grades[sem]?.["理科"] ?? 0) + (grades[sem]?.["社会"] ?? 0);
                    const total9 = subjects.reduce((sum, subj) => sum + (grades[sem]?.[subj] ?? 0), 0);
                    return (
                        <tr key={sem}>
                            <td className="border p-1">{sem}</td>
                            {subjects.map(subj => (
                                <td key={subj} className="border p-1">
                                    <input
                                        type="number"
                                        value={grades[sem]?.[subj] ?? ""}
                                        onChange={(e) => handleChange(sem, subj, e.target.value)}
                                        className="w-12 p-1 border rounded text-center appearance-none"
                                        disabled={!isEditing}
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
    );

    const renderTable3 = () => (
        <table className="border-collapse text-sm min-w-[700px] mb-6 text-center">
            <thead>
                <tr>
                    <th className="border p-1 text-center">種類</th>
                    <th className="border p-1 text-center">結果</th>
                    {subjects3.map(subj => (
                        <th key={subj} className="border p-1 text-center">{subj}</th>
                    ))}
                    <th className="border p-1 text-center">5科合計</th>
                </tr>
            </thead>

            <tbody>
                {testRows3.map((row, idx) => {
                    const total5 = subjects3.reduce((sum, subj) => sum + (row.grades[subj] ?? 0), 0);

                    return (
                        <>
                            {/* 上段行：点数 / 自動計算 */}
                            <tr key={`row-${idx}-1`}>
                                {/* 種類列：2行結合 */}
                                <td className="border p-1 text-center" rowSpan={2}>
                                    {isEditing3 ? (
                                        <input
                                            type="text"
                                            value={row.name}
                                            onChange={(e) => handleNameChange3(idx, e.target.value)}
                                            className="w-20 p-1 border rounded text-center"
                                        />
                                    ) : row.name}
                                </td>

                                {/* 結果列：上段は点数 */}
                                <td className="border p-1 font-semibold text-center">点数</td>

                                {/* 科目列：上段は点数 input */}
                                {subjects3.map(subj => (
                                    <td key={`score-${subj}-${idx}`} className="border p-1 text-center">
                                        <input
                                            type="number"
                                            value={row.grades[subj] ?? ""}
                                            onChange={(e) => handleGradeChange3(idx, subj, e.target.value)}
                                            className="w-16 p-1 border rounded text-center appearance-none"
                                            disabled={!isEditing3}
                                        />
                                    </td>
                                ))}

                                {/* 5科合計列：上段は自動計算 */}
                                <td className="border p-1 font-semibold text-center">{total5}</td>
                            </tr>

                            {/* 下段行：偏差値 / input */}
                            <tr key={`row-${idx}-2`}>
                                {/* 結果列：下段は偏差値 */}
                                <td className="border p-1 font-semibold text-center">偏差値</td>

                                {/* 科目列：下段は偏差値 input */}
                                {subjects3.map(subj => (
                                    <td key={`dev-${subj}-${idx}`} className="border p-1 text-center">
                                        <input
                                            type="number"
                                            value={row.deviations[subj] ?? ""}
                                            onChange={(e) => handleDeviationChange(idx, subj, e.target.value)}
                                            className="w-16 p-1 border rounded text-center appearance-none"
                                            disabled={!isEditing3}
                                        />
                                    </td>
                                ))}

                                {/* 5科合計列：下段は編集可能 input */}
                                <td className="border p-1 text-center">
                                    <input
                                        type="number"
                                        value={row.totalInput ?? ""}
                                        onChange={(e) => {
                                            const newRows = [...testRows3];
                                            newRows[idx].totalInput = e.target.value === "" ? null : Number(e.target.value);
                                            setTestRows3(newRows);
                                        }}
                                        className="w-16 p-1 border rounded text-center appearance-none"
                                        disabled={!isEditing3}
                                        placeholder="入力"
                                    />
                                </td>
                            </tr>
                        </>
                    );
                })}
            </tbody>
        </table>
    );

    return (
        <div className="p-4 border rounded bg-gray-50 max-w-full overflow-x-auto">
            {/* 1つ目の表 */}
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{studentName} さんの成績管理</h3>
            </div>
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">テスト結果</span>
                <div className="flex items-center space-x-2">
                    {!isEditing1 ? (
                        <button onClick={() => setIsEditing1(true)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">編集</button>
                    ) : (
                        <div className="flex space-x-2">
                            <button onClick={handleSave1} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
                            <button onClick={handleCancel1} className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">キャンセル</button>
                        </div>
                    )}
                </div>
            </div>
            {renderTable(grades1, isEditing1, handleScoreChange1)}

            {/* 2つ目の表 */}
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">成績</span>
                <div className="flex items-center space-x-2">
                    {!isEditing2 ? (
                        <button onClick={() => setIsEditing2(true)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">編集</button>
                    ) : (
                        <div className="flex space-x-2">
                            <button onClick={handleSave2} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
                            <button onClick={handleCancel2} className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">キャンセル</button>
                        </div>
                    )}
                </div>
            </div>
            {renderTable(grades2, isEditing2, handleScoreChange2)}

            {/* 3つ目の表 */}
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">模試結果</span>
                <div className="flex items-center space-x-2">
                    {!isEditing3 ? (
                        <button onClick={() => setIsEditing3(true)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">編集</button>
                    ) : (
                        <div className="flex space-x-2">
                            <button onClick={handleSave3} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">保存</button>
                            <button onClick={handleCancel3} className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">キャンセル</button>
                            <button onClick={handleAddRow3} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">＋</button>
                        </div>
                    )}
                </div>
            </div>
            {renderTable3()}
        </div>
    );
}

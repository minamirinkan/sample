import React, { useState } from "react";
import {
    SEASONS,
    GRADE_CODES,
    COURSE_LABELS,
    generateSeasonCourseCode,
    generateIndividualCourseCode,
    ClassType,
    GradeCode,
} from "./SeasonCourseCode";

interface SeasonCourseTableProps {
    seasonCode: keyof typeof SEASONS;
    yyyyMM: string;
    registrationLocation: string;
}

const SeasonCourseTable: React.FC<SeasonCourseTableProps> = ({ seasonCode }) => {
    const grades = Object.keys(GRADE_CODES) as (keyof typeof GRADE_CODES)[];
    const seasonName = SEASONS[seasonCode];


    const [baseCounts, setBaseCounts] = useState<Record<string, number>>({});
    const [feeAmounts, setFeeAmounts] = useState<Record<string, number[]>>({});

    // 一時データ構築
    const courseList = [
        { gradeCode: "E", label: COURSE_LABELS.F, classType: "W", sets: 4 },
        { gradeCode: "E", label: COURSE_LABELS.O, classType: "A", sets: 4 },
        { gradeCode: "E", label: COURSE_LABELS.N2, classType: "W", sets: 2 },
        { gradeCode: "E", label: COURSE_LABELS.N1, classType: "A", sets: 2 },
        { gradeCode: "J", label: COURSE_LABELS.F, classType: "W", sets: 4 },
        { gradeCode: "J", label: COURSE_LABELS.O, classType: "A", sets: 4 },
        { gradeCode: "J", label: COURSE_LABELS.E, classType: "E", sets: 2 },
        { gradeCode: "J3", label: COURSE_LABELS.F, classType: "W", sets: 4 },
        { gradeCode: "J3", label: COURSE_LABELS.O, classType: "A", sets: 4 },
        { gradeCode: "J3", label: COURSE_LABELS.N2, classType: "W", sets: 3 },
        { gradeCode: "J3", label: COURSE_LABELS.N1, classType: "A", sets: 3 },
        { gradeCode: "J3", label: COURSE_LABELS.E, classType: "E", sets: 2 },
        { gradeCode: "H", label: COURSE_LABELS.F, classType: "W", sets: 4 },
        { gradeCode: "H", label: COURSE_LABELS.O, classType: "A", sets: 4 },
        { gradeCode: "H3", label: COURSE_LABELS.F, classType: "W", sets: 4 },
        { gradeCode: "H3", label: COURSE_LABELS.O, classType: "A", sets: 4 },
        { gradeCode: "H3", label: COURSE_LABELS.N2, classType: "W", sets: 3 },
        { gradeCode: "H3", label: COURSE_LABELS.N1, classType: "A", sets: 3 },
    ];

    const handleBaseCountChange = (key: string, value: string) => {
        setBaseCounts(prev => ({ ...prev, [key]: Number(value) || 0 }));
    };

    const handleFeeChange = (key: string, idx: number, value: string) => {
        const num = Number(value) || 0;
        setFeeAmounts(prev => {
            const updated = { ...prev };
            updated[key] = [...(updated[key] || [])];
            updated[key][idx] = num;
            return updated;
        });
    };

    const renderCourseRows = (course: typeof courseList[0]) => {
        const key = `${course.gradeCode}-${course.label}`;
        const baseCount = baseCounts[key] || 1;
        const amounts = feeAmounts[key] || Array(course.sets).fill(0);

        const labelCode = (Object.keys(COURSE_LABELS) as (keyof typeof COURSE_LABELS)[])
            .find(key => COURSE_LABELS[key] === course.label) || "F";

        const courseCode =
            course.classType === "E"
                ? generateIndividualCourseCode(seasonCode, "E", course.sets, labelCode)
                : generateSeasonCourseCode(seasonCode, course.classType as ClassType, course.gradeCode as GradeCode, course.sets, labelCode);

        return [...Array(course.sets)].map((_, idx) => (
            <tr key={`${course.gradeCode}-${labelCode}-${idx}`}>
                {idx === 0 && (
                    <td rowSpan={course.sets} className="border px-2 py-1 text-center font-medium align-middle">
                        {course.label.split("\n").map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                        <div className="text-xs font-mono text-gray-600 mt-1">{courseCode}</div>
                    </td>
                )}
                <td className="border px-2 py-1 text-center">
                    {idx === 0 ? (
                        <>
                            1セット{" "}
                            <input
                                type="number"
                                min="1"
                                value={baseCounts[key] || ""}
                                onChange={e => handleBaseCountChange(key, e.target.value)}
                                className="border w-14 mx-1 py-0.5 text-center rounded-sm"
                            />{" "}
                            回
                        </>
                    ) : (
                        <>
                            {idx + 1}セット {(idx + 1) * (baseCount || 0)}回
                        </>
                    )}
                </td>
                <td className="border px-2 py-1 text-center">
                    <input
                        type="number"
                        min="0"
                        value={amounts[idx] || ""}
                        onChange={e => handleFeeChange(key, idx, e.target.value)}
                        className="border w-20 px-1 py-0.5 text-center rounded-sm"
                    />
                </td>
            </tr>
        ));
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-xl font-bold text-blue-700 mb-4">{seasonName} 設定テーブル</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {grades.map((gradeCode) => (
                    <div key={gradeCode} className="border rounded-lg shadow-sm p-4 bg-white">
                        <h2 className="text-lg font-bold mb-2 text-blue-700">{GRADE_CODES[gradeCode]}</h2>
                        <table className="table-auto w-full border border-gray-300 border-collapse text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-3 py-1 w-[40%]">コース</th>
                                    <th className="border px-3 py-1 w-[40%]">授業回数</th>
                                    <th className="border px-3 py-1 w-[20%]">受講料</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseList.filter(c => c.gradeCode === gradeCode).map(c => renderCourseRows(c))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeasonCourseTable;

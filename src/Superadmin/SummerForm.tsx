import React, { useEffect, useMemo, useState } from "react";
import {
    SEASONS,
    GRADE_CODES,
    COURSE_LABELS,
    generateSeasonCourseCode,
    generateIndividualCourseCode,
    ClassType,
    GradeCode,
    LABEL_TO_COURSE_CODE,
} from "./SeasonCourseCode";
import { saveSeasonFees } from "./saveSeasonFees";
import { fetchSeasonFees } from "./fetchSeasonFees";
interface SeasonCourseTableProps {
    seasonCode: keyof typeof SEASONS;
    yyyyMM: string;
    registrationLocation: string;
}

const SummerForm: React.FC<SeasonCourseTableProps> = ({
    yyyyMM,
    registrationLocation,
    seasonCode,
}) => {
    const grades = Object.keys(GRADE_CODES) as (keyof typeof GRADE_CODES)[];
    const seasonName = SEASONS[seasonCode];

    const [baseCounts, setBaseCounts] = useState<Record<string, string>>({});
    const [feeAmounts, setFeeAmounts] = useState<Record<string, number[]>>({});
    const [feeTimes, setFeeTimes] = useState<Record<string, number[]>>({});
    const [extraData, setExtraData] = useState<Record<string, any>>({});

    const courseList = useMemo(
        () => [
            { gradeCode: "E", label: COURSE_LABELS.F, classType: "W", sets: 4 },
            { gradeCode: "E", label: COURSE_LABELS.O, classType: "A", sets: 4 },
            { gradeCode: "E", label: COURSE_LABELS.N2, classType: "W", sets: 2 },
            { gradeCode: "E", label: COURSE_LABELS.N1, classType: "A", sets: 2 },
            { gradeCode: "J", label: COURSE_LABELS.F, classType: "W", sets: 4 },
            { gradeCode: "J", label: COURSE_LABELS.O, classType: "A", sets: 4 },
            { gradeCode: "J3", label: COURSE_LABELS.F, classType: "W", sets: 4 },
            { gradeCode: "J3", label: COURSE_LABELS.O, classType: "A", sets: 4 },
            { gradeCode: "J3", label: COURSE_LABELS.N2, classType: "W", sets: 3 },
            { gradeCode: "J3", label: COURSE_LABELS.N1, classType: "A", sets: 3 },
            { gradeCode: "H", label: COURSE_LABELS.F, classType: "W", sets: 4 },
            { gradeCode: "H", label: COURSE_LABELS.O, classType: "A", sets: 4 },
            { gradeCode: "H3", label: COURSE_LABELS.F, classType: "W", sets: 4 },
            { gradeCode: "H3", label: COURSE_LABELS.O, classType: "A", sets: 4 },
            { gradeCode: "H3", label: COURSE_LABELS.N2, classType: "W", sets: 3 },
            { gradeCode: "H3", label: COURSE_LABELS.N1, classType: "A", sets: 3 },
            { gradeCode: "EX", label: COURSE_LABELS.E, classType: "E", sets: 2 },
        ],
        [] // ← 依存なし：初回だけ作成
    );

    useEffect(() => {
        const loadFees = async () => {
            const { fees: fetched, extraData } = await fetchSeasonFees(
                yyyyMM,
                registrationLocation,
                seasonCode,
                courseList,
                "summer"
            );

            const amounts: Record<string, number[]> = {};
            const times: Record<string, number[]> = {};
            const baseCountsInit: Record<string, string> = {};

            Object.entries(fetched).forEach(([key, data]) => {
                amounts[key] = data.amount;
                times[key] = data.times;
                baseCountsInit[key] = data.times?.[0]?.toString() ?? ""; // ← string化して一致
            });

            setFeeAmounts(amounts);
            setFeeTimes(times);
            setBaseCounts(baseCountsInit); // ← 追加
            setExtraData(extraData);
        };

        loadFees();
    }, [yyyyMM, registrationLocation, seasonCode, courseList]);

    const handleBaseCountChange = (courseKey: string, value: string, sets: number) => {
        setBaseCounts((prev) => ({ ...prev, [courseKey]: value }));

        setFeeAmounts((prev) => {
            const updated = { ...prev };
            const num = Number(value) || 0;

            // courseKeyを分解してextraKeyを作る
            const [, classType, gradeCode] = courseKey.split("_");
            const extraKey =
                gradeCode === "EX"
                    ? "H_E_SET1"
                    : `H_${classType}_${gradeCode}_W1_T80`;

            const extraAmount = extraData?.[extraKey]?.amount ?? 0;

            // ✅ extra基準で全セット分の金額を再計算
            updated[courseKey] = Array(sets)
                .fill(0)
                .map((_, idx) => (num > 0 ? extraAmount * num * (idx + 1) : 0));

            return updated;
        });
    };

    const handleFeeChange = (key: string, idx: number, value: string) => {
        const num = Number(value) || 0;
        setFeeAmounts((prev) => {
            const updated = { ...prev };
            updated[key] = [...(updated[key] || [])];
            updated[key][idx] = num; // ← 他は一切触れない
            return updated;
        });
    };

    const renderCourseRows = (course: typeof courseList[0]) => {
        const courseKey = `${seasonCode}_${course.classType}_${course.gradeCode}_${course.label}_SET`;
        const baseCount = baseCounts[courseKey] || 1;
        const amounts = feeAmounts[courseKey] || Array(course.sets).fill(0); // ← ここで全セット分の値を保持

        return [...Array(course.sets)].map((_, idx) => (
            <tr key={`${course.gradeCode}-${course.label}-${idx}`}>
                {idx === 0 && (
                    <td rowSpan={course.sets} className="border px-2 py-1 text-center font-medium align-middle">
                        {course.label.split("\n").map((line, i) => (
                            <React.Fragment key={i}>{line}<br /></React.Fragment>
                        ))}
                        <div className="text-xs font-mono text-gray-600 mt-1">
                            {course.classType === "E"
                                ? generateIndividualCourseCode(seasonCode, "E", course.sets, LABEL_TO_COURSE_CODE[course.label])
                                : generateSeasonCourseCode(seasonCode, course.classType as ClassType, course.gradeCode as GradeCode, course.sets, LABEL_TO_COURSE_CODE[course.label])}
                        </div>
                    </td>
                )}
                <td className="border px-2 py-1 text-center">
                    {idx === 0 ? (
                        <>
                            1セット{" "}
                            <input
                                type="number"
                                min="1"
                                value={
                                    idx === 0
                                        ? baseCounts[courseKey] ?? (feeTimes[courseKey]?.[0]?.toString() ?? "")
                                        : ""
                                }
                                onChange={(e) => {
                                    // 入力時に必ず数値っぽい文字列に整える（"01" → "1"）
                                    const cleanValue = e.target.value.replace(/^0+(?=\d)/, "");
                                    handleBaseCountChange(courseKey, cleanValue, course.sets);
                                }}
                                className="border w-14 mx-1 py-0.5 text-center rounded-sm"
                            /> 回
                        </>
                    ) : (
                        <>
                            {idx + 1}セット {(idx + 1) * (Number(baseCount) || 1)}回
                        </>
                    )}
                </td>
                <td className="border px-2 py-1 text-center">
                    <input
                        type="number"
                        min="0"
                        value={amounts[idx] || ""} // ← すべて独立
                        onChange={(e) => handleFeeChange(courseKey, idx, e.target.value)}
                        className="border w-20 px-1 py-0.5 text-center rounded-sm"
                    />
                </td>
            </tr>
        ));
    };

    const handleSave = async () => {
        await saveSeasonFees(
            yyyyMM,
            registrationLocation,
            seasonCode,
            feeAmounts,   // ← 各セットの金額
            baseCounts,   // ← ← ← ここ重要
            courseList,
            "summer"
        );
        alert("受講料を保存しました！");
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-xl font-bold text-blue-700 mb-4">
                {seasonName} 設定テーブル
            </h1>
            <button
                onClick={handleSave}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                保存
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {grades.map((gradeCode) => (
                    <div key={gradeCode} className="border rounded-lg shadow-sm p-4 bg-white">
                        <h2 className="text-lg font-bold mb-2 text-blue-700">
                            {GRADE_CODES[gradeCode]}
                        </h2>
                        <table className="table-auto w-full border border-gray-300 border-collapse text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-3 py-1 w-[40%]">コース</th>
                                    <th className="border px-3 py-1 w-[40%]">授業回数</th>
                                    <th className="border px-3 py-1 w-[20%]">受講料</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseList
                                    .filter((c) => c.gradeCode === gradeCode)
                                    .map((c) => renderCourseRows(c))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SummerForm;
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { SeasonCode, generateSeasonCourseCode, generateIndividualCourseCode, LABEL_TO_COURSE_CODE } from "./SeasonCourseCode";

export const saveSeasonFees = async (
    yyyyMM: string,
    registrationLocation: string,
    seasonCode: SeasonCode,
    feeAmounts: Record<string, number[]>,
    baseCounts: Record<string, string>, // ← ここ追加
    courseList: any[],
    lectureType: "spring" | "summer" | "winter" = "spring"
) => {
    try {
        const path = `FeeMaster/${yyyyMM}_${registrationLocation}/categories/${lectureType}`;
        const ref = doc(db, path);

        const dataToSave: Record<string, any> = {};

        Object.entries(feeAmounts).forEach(([courseKey, amounts]) => {
            const course = courseList.find(
                (c) => `${seasonCode}_${c.classType}_${c.gradeCode}_${c.label}_SET` === courseKey
            );
            if (!course) return;

            const times = baseCounts[courseKey] || 1; // ← 実際の回数を取得

            amounts.forEach((amount, idx) => {
                let key: string;

                if (course.gradeCode === "EX") {
                    // 個別クラスはセット番号ごとに生成
                    key = generateIndividualCourseCode(seasonCode, "E", idx + 1, LABEL_TO_COURSE_CODE[course.label]);
                } else {
                    // 通常クラスはセット番号ごとに生成
                    key = generateSeasonCourseCode(seasonCode, course.classType, course.gradeCode, idx + 1, LABEL_TO_COURSE_CODE[course.label]);
                }

                dataToSave[key] = {
                    amount,
                    classType: course.classType,
                    duration: "80", // 固定値
                    lessonType: "春季講習", // 固定値
                    times: (Number(times) * (idx + 1)).toString(), // 実際の回数
                };
            });
        });

        await setDoc(ref, dataToSave, { merge: false });
        console.log(`✅ ${lectureType} fees saved successfully!`);
    } catch (err) {
        console.error("🔥 Error saving fees:", err);
    }
};

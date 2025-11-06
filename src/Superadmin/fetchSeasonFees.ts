import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { SeasonCode, LABEL_TO_COURSE_CODE } from "./SeasonCourseCode";

interface FeeData {
    amount: number[];
    times: number[];
}

/**
 * 季節講習または通常講習の料金データを取得
 * @param yyyyMM 対象年月（例: "2025-03"）
 * @param registrationLocation 教室名などの登録場所キー
 * @param seasonCode "SP"（春期）, "SU"（夏期）, "WI"（冬期）など
 * @param courseList 取得対象のコース配列
 * @param lectureType "spring" | "summer" | "winter"（デフォルト: "spring"）
 * @returns { fees, extraData } の形で返す
 */
export const fetchSeasonFees = async (
    yyyyMM: string,
    registrationLocation: string,
    seasonCode: SeasonCode,
    courseList: any[],
    lectureType: "spring" | "summer" | "winter" = "spring"
): Promise<{ fees: Record<string, FeeData>; extraData: Record<string, any> }> => {
    try {
        const basePath = `FeeMaster/${yyyyMM}_${registrationLocation}/categories`;

        // メイン講習（spring/summer/winter）とextraを取得
        const mainRef = doc(db, basePath, lectureType);
        const extraRef = doc(db, basePath, "extra");
        const [mainSnap, extraSnap] = await Promise.all([
            getDoc(mainRef),
            getDoc(extraRef),
        ]);

        const mainData = mainSnap.exists() ? mainSnap.data() : {};
        const extraData = extraSnap.exists() ? extraSnap.data() : {};

        const newFees: Record<string, FeeData> = {};

        courseList.forEach((course) => {
            const courseKey = `${seasonCode}_${course.classType}_${course.gradeCode}_${course.label}_SET`;
            const amounts: number[] = [];
            const timesArr: number[] = [];

            for (let i = 0; i < course.sets; i++) {
                let spKey: string;
                if (course.gradeCode === "EX") {
                    spKey = `SP_${course.classType}_SET${i + 1}_T80_${LABEL_TO_COURSE_CODE[course.label]}`;
                } else {
                    spKey = `SP_${course.classType}_${course.gradeCode}_K${i + 1}_T80_${LABEL_TO_COURSE_CODE[course.label]}`;
                }

                let extraKey: string;
                if (course.gradeCode === "EX") {
                    extraKey = `H_E_SET1`;
                } else {
                    extraKey = `H_${course.classType}_${course.gradeCode}_W1_T80`;
                }

                const mainAmount = (mainData as any)[spKey]?.amount;
                const extraAmount = (extraData as any)[extraKey]?.amount;

                if (mainAmount != null) {
                    amounts.push(mainAmount);
                } else if (extraAmount != null) {
                    amounts.push(i === 0 ? extraAmount : extraAmount * (i + 1));
                } else {
                    amounts.push(0);
                }

                const mainTimes = (mainData as any)[spKey]?.times;
                if (mainTimes != null) {
                    timesArr.push(mainTimes);
                } else {
                    timesArr.push(0);
                }
            }

            newFees[courseKey] = { amount: amounts, times: timesArr };
        });

        console.log(`✅ ${lectureType} fees (amount & times) fetched successfully!`);
        return { fees: newFees, extraData }; // ← ここが変更点！
    } catch (err) {
        console.error("🔥 Error fetching fees:", err);
        return { fees: {}, extraData: {} };
    }
};

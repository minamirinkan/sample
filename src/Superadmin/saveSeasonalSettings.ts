import { db } from "../firebase";
import { doc, setDoc, collection } from "firebase/firestore";

const gradeCodes = ["E", "J", "J3", "H", "H3"];

const getLessonPrefix = (lessonType: string) => {
    switch (lessonType) {
        case "春季講習":
            return "SP";
        case "夏季講習":
            return "SU";
        case "冬季講習":
            return "WI";
        default:
            return "N";
    }
};

interface SaveSeasonalSettingsParams {
    registrationLocation: string;
    yyyyMM: string;
    lessonType: "春季講習" | "夏季講習" | "冬季講習";
    tableDataW: string[][];
    tableDataA: string[][];
    tableDataE: string[][];
    timesW: number[];
    timesA: number[];
    timesE: number[];
    duration: string;
    gradeIndex: number;
}

/**
 * 季節講習（春・夏・冬）の料金を保存
 */
export const saveSeasonalSettings = async ({
    registrationLocation,
    yyyyMM,
    lessonType,
    tableDataW,
    tableDataA,
    tableDataE,
    timesW,
    timesA,
    timesE,
    duration,
    gradeIndex,
}: SaveSeasonalSettingsParams) => {
    const prefix = getLessonPrefix(lessonType);
    const seasonalKey =
        lessonType === "春季講習"
            ? "spring"
            : lessonType === "夏季講習"
                ? "summer"
                : "winter";

    const baseRef = doc(db, "FeeMaster", `${yyyyMM}_${registrationLocation}`);
    const seasonalDocRef = doc(collection(baseRef, "categories"), seasonalKey);

    const buildMap = (
        tableData: string[][],
        timesList: number[],
        classType: "W" | "A" | "E",
        gradeIndex: number
    ) => {
        const map: Record<string, any> = {};

        tableData.forEach((row, rowIdx) => {
            const baseTimes = timesList[rowIdx] || 1;

            row.forEach((amountStr, colIdx) => {
                const amount = Number(amountStr);
                if (!amount) return;

                const gradeCode = gradeCodes[gradeIndex] || "Z";
                const times = baseTimes * (colIdx + 1); // 1セット目は baseTimes, 2セット目は 2*baseTimes ...

                // 🔽 ここで個別クラスのみ SET番号形式に分岐
                let fieldId: string;
                if (classType === "E") {
                    const setNumber = colIdx + 1; // 1セット目→SET1, 2セット目→SET2
                    fieldId = `${prefix}_E_SET${setNumber}`;
                } else {
                    fieldId = `${prefix}_${classType}_${gradeCode}_K${times}_T${duration}`;
                }

                map[fieldId] = {
                    amount,
                    classType,
                    duration,
                    times,
                    lessonType,
                };
            });
        });

        return map;
    };

    const mapW = buildMap(tableDataW, timesW, "W", gradeIndex);
    const mapA = buildMap(tableDataA, timesA, "A", gradeIndex);
    const mapE = buildMap(tableDataE, timesE, "E", gradeIndex);

    await setDoc(seasonalDocRef, { ...mapW, ...mapA, ...mapE }, { merge: true });
};

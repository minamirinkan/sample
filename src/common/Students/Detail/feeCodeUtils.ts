// src/utils/feeCodeUtils.ts
// 授業種別・学年・クラス種別などを基に FeeCode を自動生成

export const getLessonTypePrefix = (lessonType: string): string => {
    switch (lessonType) {
        case "通常": return "N";
        case "補習": return "H";
        case "春季講習": return "SP";
        case "夏季講習": return "SU";
        case "冬季講習": return "WI";
        default: return "Z";
    }
};

export const convertClassTypeToCode = (classType: string): string => {
    switch (classType) {
        case "1名クラス": return "A";
        case "2名クラス": return "W";
        case "個別クラス": return "E";
        default: return "U";
    }
};

export const convertGradeToCode = (grade: string): string => {
    if (grade.startsWith("小")) return "E";
    if (grade === "中1" || grade === "中2") return "J";
    if (grade === "中3") return "J3";
    if (grade === "高1" || grade === "高2") return "H";
    if (grade === "高3" || grade === "既卒") return "H3";
    return "U";
};

/**
 * FeeCode生成
 * - 個別クラス：SET制（中学生限定、学年省略）
 * - 通常・補習：W/Tあり
 * - 講習：Tのみ
 */
export const generateFeeCode = ({
    lessonType,
    classType,
    grade,
    times,
    duration,
}: {
    lessonType: string;
    classType: string;
    grade: string;
    times?: string;
    duration?: string;
}): string => {
    const prefix = getLessonTypePrefix(lessonType);
    const classCode = convertClassTypeToCode(classType);
    const gradeCode = convertGradeToCode(grade);

    // ✅ 個別クラス（E）は中学生限定・SET制
    if (classCode === "E") {
        const setLabel = `SET${times || 1}`;
        return `${prefix}_${classCode}_${setLabel}`;
    }

    // ✅ 講習（春季・夏季・冬季）は週回数なし
    if (["春季講習", "夏季講習", "冬季講習"].includes(lessonType)) {
        return `${prefix}_${classCode}_${gradeCode}_T${duration ?? "80"}`;
    }

    // ✅ 通常・補習
    return `${prefix}_${classCode}_${gradeCode}_W${times || "1"}_T${duration ?? "80"}`;
};

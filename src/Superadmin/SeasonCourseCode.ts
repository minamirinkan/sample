// 季節コード
export const SEASONS = {
    SP: "春季講習",
    SU: "夏季講習",
    WI: "冬季講習",
} as const;
export type SeasonCode = keyof typeof SEASONS;

// クラス種別
export const CLASS_TYPES = {
    W: "2名クラス",
    A: "1名クラス",
    E: "個別クラス",
} as const;
export type ClassType = keyof typeof CLASS_TYPES;

// 学年コード
export const GRADE_CODES = {
    E: "小学生",
    J: "中1/中2",
    J3: "中3",
    H: "高1/高2",
    H3: "高3/既卒",
} as const;
export type GradeCode = keyof typeof GRADE_CODES;

// コース種別（ラベル）
export const COURSE_LABELS = {
    F: "総復習\nW\n【1:2】",
    O: "オリジナル\nA\n【1:1】",
    N2: "苦手教科集中克服\nW\n【1:2】",
    N1: "苦手教科集中克服\nA\n【1:1】",
    E: "理科・社会\n【個別クラス】",
} as const;
export type CourseLabel = keyof typeof COURSE_LABELS;

// コード生成（W/A用）
export const generateSeasonCourseCode = (
    season: SeasonCode,
    classType: ClassType,
    grade: GradeCode,
    setCount: number,
    labelCode: CourseLabel
) => {
    return `${season}_${classType}_${grade}_SET${setCount}_${labelCode}`;
};

// 個別クラス専用コード生成
export const generateIndividualCourseCode = (
    season: SeasonCode,
    classType: "E",
    setCount: number,
    labelCode: CourseLabel
) => {
    return `${season}_${classType}_SET${setCount}_${labelCode}`;
};

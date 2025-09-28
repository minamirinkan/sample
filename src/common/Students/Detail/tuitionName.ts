const extractMonthNum = (month: string): number => {
    return month.includes("-")
        ? parseInt(month.split("-")[1], 10)
        : parseInt(month, 10);
};

export const generateTuitionName = (code: string, month: string): string => {
    const parts = code.split("_");
    if (parts.length < 4) return code;

    const classTypeCode = parts[0]; // W or A
    const timesCode = parts[2];     // W1, W2, ...
    const lastPart = parts[parts.length - 1];
    const duration = lastPart.startsWith("T") ? lastPart.slice(1) : lastPart; // "80" に変換

    const classType = classTypeCode === "W" ? "2名クラス" : "1名クラス";

    const times = timesCode.startsWith("W")
        ? `${timesCode.slice(1)}回`
        : timesCode;

    const monthNum = extractMonthNum(month);

    return `${monthNum}月分授業料 ${classType} ${times} ${duration}分`;
};

export const generateTuitionNameShort = (code: string, month: string): string => {
    const monthNum = extractMonthNum(month);
    return `${monthNum}月分授業料`;
};

export const formatCodeForDisplay = (code: string): string => {
    return code.replace(/_/g, ""); // "_" を消すだけ
};
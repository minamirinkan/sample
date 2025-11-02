const extractMonthNum = (month: string): number => {
    return month.includes("-")
        ? parseInt(month.split("-")[1], 10)
        : parseInt(month.slice(4, 6), 10);
};

export const generateTuitionName = (code: string, month: string, isExtra: boolean = false): string => {
    const parts = code.split("_");
    if (parts.length < 3) return code;

    const classTypeCode = parts[1]; // W, A, E
    const timesCode = parts[3];     // W1, W2, SET1, ...（個別は undefined のことが多い）
    const lastPart = parts[parts.length - 1];
    const duration = lastPart.startsWith("T") ? lastPart.slice(1) : lastPart; // "80" など

    // 🟦 classTypeCodeに応じて日本語名を切り替え
    const classType =
        classTypeCode === "W"
            ? "2名クラス"
            : classTypeCode === "A"
                ? "1名クラス"
                : classTypeCode === "E"
                    ? "個別クラス"
                    : "クラス不明";

    const monthNum = extractMonthNum(month);
    const baseLabel = isExtra
        ? `${monthNum}月分授業料(補習)`
        : `${monthNum}月分授業料`;

    // 🟩 個別クラス（SET構造）の場合
    if (parts.includes("E") && parts.some(p => p.startsWith("SET"))) {
        const setNum = parts.find(p => p.startsWith("SET"))?.replace("SET", "") || "";
        return `${baseLabel} ${classType} ${setNum ? `${setNum}セット` : ""}`.trim();
    }

    // 🟨 通常クラスの場合（W1, W2など）
    const times =
        timesCode?.startsWith("W")
            ? `${timesCode.slice(1)}回`
            : timesCode?.startsWith("SET")
                ? `${timesCode.slice(3)}回`
                : timesCode || "";

    return `${baseLabel} ${classType} ${times} ${duration}分`;
};

export const generateTuitionNameShort = (code: string, month: string, isExtra: boolean = false): string => {
    const monthNum = extractMonthNum(month);
    return isExtra
        ? `${monthNum}月分授業料(補習)`
        : `${monthNum}月分授業料`;
};

export const formatCodeForDisplay = (code: string): string => {
    return code.replace(/_/g, ""); // "_" を消すだけ
};

// src/utils/tuitionName.ts
export const generateTuitionName = (code: string, month: string): string => {
    const parts = code.split("_");
    if (parts.length < 4) return code;

    const classTypeCode = parts[0]; // W or A
    const timesCode = parts[2];     // W1, W2, ...

    const classType = classTypeCode === "W" ? "2名クラス" : "1名クラス";

    let times = "";
    if (timesCode.startsWith("W")) {
        const n = timesCode.slice(1);
        times = `${n}回`;
    } else {
        times = timesCode;
    }

    return `${month}月分授業料${classType}${times}`;
};

import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface FeeMasterLesson {
    lessonType: string; // "通常" or "補習" or "その他"
    classType: string;  // 2名クラス / 1名クラス / 演習クラス / 諸費用
    times: string;      // 週何回
    duration: string;   // 分
    grade: string;
    amount: number;
}

interface Expenses {
    admissionFee: number;
    materialFee: number;
    testFee: { elementary: number; middle: number };
    maintenanceFee: number;
}

/**
 * tuitionDataW/A + 登録地 + 年月 + testPrices + expenses を feeMaster形式に変換して保存
 */
export async function saveFeeMaster({
    registrationLocation,
    yyyyMM,
    tuitionDataW,
    tuitionDataA,
    schedulesW,
    schedulesA,
    grades,
    testPrices, // 演習クラス価格: [1セット, 2セット]
    expenses,   // 諸費用: { admissionFee, materialFee, testFee: {elementary, middle}, maintenanceFee }
}: {
    registrationLocation: string;
    yyyyMM: string;
    tuitionDataW: string[][];
    tuitionDataA: string[][];
    schedulesW: string[];
    schedulesA: string[];
    grades: readonly string[];
    testPrices: number[]; // 例: [8000, 15000]
    expenses: Expenses;
}) {
    try {
        const docId = `${yyyyMM}_${registrationLocation}`;
        const docRef = doc(db, 'feeMaster', docId);

        const feeMasterObj: Record<string, FeeMasterLesson> = {};

        const createFeeCode = (lessonType: string, classType: string, times: string, duration: string) => {
            const prefix = lessonType === '通常' ? 'N' : lessonType === '補習' ? 'H' : 'X';
            const classNum =
                classType === '2名クラス' ? '2' :
                    classType === '1名クラス' ? '1' :
                        classType === '演習クラス' ? '0' :
                            '9'; // 諸費用用
            return `${prefix}${classNum}W${times}T${duration}`;
        };

        // 学年ラベルの分割マップ
        const gradeSplitMap: Record<string, string[]> = {
            '小学生': ['小学生'],
            '中1／中2': ['中1', '中2'],
            '中3': ['中3'],
            '高1／高2': ['高1', '高2'],
            '高3／既卒': ['高3', '既卒'],
        };

        // Wコース（2名クラス, 通常）
        tuitionDataW.forEach((row, rowIdx) => {
            const scheduleLabel = schedulesW[rowIdx];
            const timesMatch = scheduleLabel.match(/週(\d)回/);
            const times = timesMatch ? timesMatch[1] : '1';
            const durationMatch = scheduleLabel.match(/\((\d+)分\)/);
            const duration = durationMatch ? durationMatch[1] : '80';

            row.forEach((amountStr, colIdx) => {
                const label = grades[colIdx];
                const actualGrades = gradeSplitMap[label] ?? [label];

                const amount = Number(amountStr);
                if (!amount) return;

                actualGrades.forEach((grade) => {
                    const feeCode = createFeeCode('通常', '2名クラス', times, duration);
                    feeMasterObj[`${feeCode}_${grade}`] = {
                        lessonType: '通常',
                        classType: '2名クラス',
                        times,
                        duration,
                        grade,
                        amount,
                    };
                });
            });
        });

        // Aコース（1名クラス, 通常）
        tuitionDataA.forEach((row, rowIdx) => {
            const scheduleLabel = schedulesA[rowIdx];
            const timesMatch = scheduleLabel.match(/週(\d)回/);
            const times = timesMatch ? timesMatch[1] : '1';
            const durationMatch = scheduleLabel.match(/\((\d+)分\)/);
            const duration = durationMatch ? durationMatch[1] : '80';

            row.forEach((amountStr, colIdx) => {
                const label = grades[colIdx];
                const actualGrades = gradeSplitMap[label] ?? [label];

                const amount = Number(amountStr);
                if (!amount) return;

                actualGrades.forEach((grade) => {
                    const feeCode = createFeeCode('通常', '1名クラス', times, duration);
                    feeMasterObj[`${feeCode}_${grade}`] = {
                        lessonType: '通常',
                        classType: '1名クラス',
                        times,
                        duration,
                        grade,
                        amount,
                    };
                });
            });
        });

        // 演習クラス
        const exerciseGrades = ['中1', '中2', '中3'];
        [1, 2].forEach((setNum) => {
            const times = setNum.toString(); // W1 / W2
            exerciseGrades.forEach((grade) => {
                const price = testPrices[setNum - 1];
                if (!price) return;

                const feeCode = `N0W${times}T80_${grade}`;
                feeMasterObj[feeCode] = {
                    lessonType: '通常',
                    classType: '演習クラス',
                    times,
                    duration: '80',
                    grade,
                    amount: Number(price),
                };
            });
        });

        // 諸費用
        const expenseEntries: [string, number, string][] = [
            ['admissionFee', expenses.admissionFee, '入会金'],
            ['materialFee', expenses.materialFee, '教材費'],
            ['testFee_elementary', expenses.testFee.elementary, '塾内テスト代 小学生'],
            ['testFee_middle', expenses.testFee.middle, '塾内テスト代 中学生'],
            ['maintenanceFee', expenses.maintenanceFee, '教室維持費'],
        ];

        expenseEntries.forEach(([feeCode, amount, label]) => {
            if (!amount) return;
            feeMasterObj[feeCode] = {
                lessonType: 'その他',
                classType: '諸費用',
                times: '1',
                duration: '1',
                grade: label,
                amount: Number(amount),
            };
        });

        // Firestore に保存
        await setDoc(docRef, feeMasterObj, { merge: true });
        console.log(`✅ feeMaster 保存完了: ${docId}`);
        return docId;
    } catch (error) {
        console.error('❌ feeMaster 保存エラー:', error);
        throw error;
    }
}

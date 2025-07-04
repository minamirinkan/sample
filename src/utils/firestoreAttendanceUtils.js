import { doc, getDoc, updateDoc, collection, getDocs} from 'firebase/firestore';
import { db } from '../firebase'; // Firebase初期化ファイルなど

export async function confirmAttendanceStatus(classroomCode, date) {
    console.log('🧪 classroomCode:', classroomCode);
    console.log('🧪 date:', date);
    const docId = `${classroomCode}_${date}`;
    console.log("✅ docId:", docId);

    const docRef = doc(db, 'dailySchedules', docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error('対象の日付の時間割が存在しません。');
    }

    const data = docSnap.data();
    if (!data.rows) {
        throw new Error('時間割データの形式が不正です。');
    }

    const updatedRows = data.rows.map(row => {
        // 生徒のステータスを更新
        const updatedPeriods = {};
        for (const periodKey of Object.keys(row.periods)) {
            updatedPeriods[periodKey] = row.periods[periodKey].map(student => {
                if (student.status === '予定') {
                    return { ...student, status: '出席' };
                }
                return student;
            });
        }

        // row.status を「予定 → 出勤」に変更（teacher がいる場合のみ）
        const updatedStatus = row.status === '予定' && row.teacher !== null ? '出勤' : row.status;

        return {
            ...row,
            status: updatedStatus,
            periods: updatedPeriods,
        };
    });

    await updateDoc(docRef, {
        rows: updatedRows,
        isSaved: true, // ← この行を追加
    });
}

/**
 * 教室IDに対応する dailySchedules から出席確定日付を取得
 * @param {string} classroomCode - 教室コード（例: "047"）
 * @returns {Promise<string[]>} - yyyy-mm-dd の文字列配列
 */
export const fetchConfirmedAttendanceDatesFromDailySchedules = async (classroomCode) => {
    const snapshot = await getDocs(collection(db, "dailySchedules"));
    const confirmedDates = [];

    snapshot.forEach(doc => {
        const docId = doc.id; // 例: "047_2025-07-04"
        const [code, date] = docId.split("_");

        if (code !== classroomCode) return;

        const data = doc.data();
        const rows = data.rows || [];

        const hasConfirmedAttendance = rows.some(row => {
            return row.periods && Object.values(row.periods).some(periodArray =>
                Array.isArray(periodArray) &&
                periodArray.some(p => p.status === "出席")
            );
        });

        if (hasConfirmedAttendance) {
            confirmedDates.push(date);
        }
    });

    return confirmedDates;
};

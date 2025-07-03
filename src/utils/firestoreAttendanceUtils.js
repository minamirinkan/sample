import { doc, getDoc, updateDoc } from 'firebase/firestore';
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

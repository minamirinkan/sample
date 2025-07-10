import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export const saveToWeeklySchedules = async (studentData) => {
    const {
        name,
        studentId,
        grade,
        classroomCode,
        courseFormData,
    } = studentData;

    const currentMonth = new Date().toISOString().slice(0, 7); // 例: '2025-07'

    const normalCourses = courseFormData.filter((course) => course.kind === '通常');

    for (const course of normalCourses) {
        const {
            subject,
            subjectOther,
            weekday,
            period: rawPeriod,
            classType,
            duration
        } = course;

        const weekdayMap = {
            '日': 0,
            '月': 1,
            '火': 2,
            '水': 3,
            '木': 4,
            '金': 5,
            '土': 6,
        };

        const dayOfWeekNum = weekdayMap[weekday];
        if (dayOfWeekNum === undefined) {
            console.warn(`曜日の変換に失敗しました: ${weekday}`);
            continue;
        }

        const periodNumber = String(rawPeriod).replace('限', '');
        const periodKey = `period${periodNumber}`;
        const docId = `${classroomCode}_${currentMonth}_${dayOfWeekNum}`;
        const docRef = doc(db, 'weeklySchedules', docId);
        const docSnap = await getDoc(docRef);

        const newEntry = {
            name,
            studentId,
            subject: subject === 'その他' ? subjectOther : subject,
            grade,
            seat: '',
            status: '未定',
            classType,
            duration
        };

        const newRow = {
            status: '未定',
            teacher: null,
            periods: {
                [periodKey]: [newEntry]
            }
        };

        if (!docSnap.exists()) {
            await setDoc(docRef, {
                rows: [newRow],
                updatedAt: serverTimestamp()
            });
        } else {
            const existingData = docSnap.data();
            const rows = existingData.rows || [];

            // 既存の status: '未定', teacher: null の行を探す
            const targetIndex = rows.findIndex(
                row => row.status === '未定' && row.teacher === null
            );

            if (targetIndex !== -1) {
                // 既存の行に period をマージ
                const targetRow = rows[targetIndex];
                if (!targetRow.periods[periodKey]) {
                    targetRow.periods[periodKey] = [];
                }
                targetRow.periods[periodKey].push(newEntry);
                rows[targetIndex] = targetRow;
            } else {
                // 該当する行がなければ新しい行を追加
                rows.push(newRow);
            }

            await updateDoc(docRef, {
                rows,
                updatedAt: serverTimestamp()
            });
        }
    }
};

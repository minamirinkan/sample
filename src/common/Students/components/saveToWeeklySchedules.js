import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';

export const saveToWeeklySchedules = async (studentData) => {
    const {
        name,
        studentId,
        grade,
        classroomCode,
        courseFormData,
    } = studentData;

    const normalCourses = courseFormData.filter((course) => course.kind === '通常');

    for (const course of normalCourses) {
        const {
            subject,
            subjectOther,
            weekday,
            period: rawPeriod,
            classType,
            duration,
            startYear,
            startMonth
        } = course;

        const currentMonth = `${startYear}-${String(startMonth).padStart(2, '0')}`;

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

        let rows;

        if (docSnap.exists()) {
            // 既存ドキュメントあり：通常通りマージ
            rows = docSnap.data().rows || [];

            const targetIndex = rows.findIndex(
                row => row.status === '未定' && row.teacher === null
            );

            if (targetIndex !== -1) {
                const targetRow = rows[targetIndex];
                if (!targetRow.periods[periodKey]) {
                    targetRow.periods[periodKey] = [];
                }
                targetRow.periods[periodKey].push(newEntry);
                rows[targetIndex] = targetRow;
            } else {
                rows.push({
                    status: '未定',
                    teacher: null,
                    periods: {
                        [periodKey]: [newEntry]
                    }
                });
            }

            await updateDoc(docRef, { rows, updatedAt: serverTimestamp() });

        } else {
            // 👇 該当月のdocがない → 過去3ヶ月を遡って複製できるか確認
            let copied = false;
            for (let i = 1; i <= 3; i++) {
                const prevDate = new Date(`${currentMonth}-01`);
                prevDate.setMonth(prevDate.getMonth() - i);
                const prevMonth = prevDate.toISOString().slice(0, 7);
                const prevDocId = `${classroomCode}_${prevMonth}_${dayOfWeekNum}`;
                const prevDocRef = doc(db, 'weeklySchedules', prevDocId);
                const prevDocSnap = await getDoc(prevDocRef);

                if (prevDocSnap.exists()) {
                    const prevData = prevDocSnap.data();
                    const clonedRows = JSON.parse(JSON.stringify(prevData.rows || []));

                    // 新規エントリを既存rowにマージ
                    const targetIndex = clonedRows.findIndex(
                        row => row.status === '未定' && row.teacher === null
                    );

                    if (targetIndex !== -1) {
                        const targetRow = clonedRows[targetIndex];
                        if (!targetRow.periods[periodKey]) {
                            targetRow.periods[periodKey] = [];
                        }
                        targetRow.periods[periodKey].push(newEntry);
                        clonedRows[targetIndex] = targetRow;
                    } else {
                        clonedRows.push({
                            status: '未定',
                            teacher: null,
                            periods: {
                                [periodKey]: [newEntry]
                            }
                        });
                    }

                    await setDoc(docRef, {
                        rows: clonedRows,
                        updatedAt: serverTimestamp()
                    });

                    copied = true;
                    break;
                }
            }

            // 👇 過去からも見つからない → 新規作成
            if (!copied) {
                await setDoc(docRef, {
                    rows: [{
                        status: '未定',
                        teacher: null,
                        periods: {
                            [periodKey]: [newEntry]
                        }
                    }],
                    updatedAt: serverTimestamp()
                });
            }
        }
    }
};

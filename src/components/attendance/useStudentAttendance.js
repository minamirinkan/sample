import { useEffect, useState } from 'react';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { getJapaneseDayOfWeek } from '../../utils/dateFormatter';

export const useStudentAttendance = (classroomCode, studentId, selectedMonth) => {
    const [loading, setLoading] = useState(true);
    const [attendanceList, setAttendanceList] = useState([]);

    useEffect(() => {
        if (!classroomCode || !studentId || !selectedMonth) return;

        const fetchPeriodLabels = async (db, classroomCode) => {
            // 教室コード優先で取得
            const schoolDocRef = doc(db, 'periodLabelsBySchool', classroomCode);
            const schoolSnap = await getDoc(schoolDocRef);
            if (schoolSnap.exists()) {
                return schoolSnap.data().periodLabels || [];
            }
            // commonから取得
            const commonDocRef = doc(db, 'common', 'periodLabels');
            const commonSnap = await getDoc(commonDocRef);
            if (commonSnap.exists()) {
                return commonSnap.data().periodLabels || [];
            }
            return [];
        };

        const fetchData = async () => {
            setLoading(true);
            try {
                const db = getFirestore();

                // periodLabelsを先に取得
                const periodLabels = await fetchPeriodLabels(db, classroomCode);

                // 選択された年月の範囲を計算
                const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
                const monthStart = new Date(selectedYear, selectedMonthNum - 1, 1);
                const monthEnd = new Date(selectedYear, selectedMonthNum, 0); // その月の最終日

                // weeklySchedules の曜日別テンプレを全部まとめて取得してキャッシュ（0〜6のキーでMapに）
                const weeklySchedulesCache = new Map();
                for (let weekday = 0; weekday <= 6; weekday++) {
                    const docId = `${classroomCode}_${weekday}`;
                    const weeklySnap = await getDoc(doc(db, 'weeklySchedules', docId));
                    if (weeklySnap.exists()) {
                        weeklySchedulesCache.set(weekday, weeklySnap.data());
                    }
                }

                const results = [];

                for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
                    const yyyyMMdd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const weekdayIndex = d.getDay();

                    // dailySchedules から取得
                    const dailyDocId = `${classroomCode}_${yyyyMMdd}`;
                    const dailySnap = await getDoc(doc(db, 'dailySchedules', dailyDocId));

                    let data;
                    if (dailySnap.exists()) {
                        data = dailySnap.data();
                        console.log(`[daily] ${dailyDocId}`, data);
                    } else if (weeklySchedulesCache.has(weekdayIndex)) {
                        data = weeklySchedulesCache.get(weekdayIndex);
                        console.log(`[weekly fallback] weekday ${weekdayIndex}`, data);
                    } else {
                        console.log(`[skip] No data for ${yyyyMMdd}`);
                        continue; // データなしはスキップ
                    }

                    // periodLabelsはdaily/weeklyに無くても事前に取得済みを使う
                    const rows = data.rows || [];

                    rows.forEach((row, rowIndex) => {
                        const periods = row.periods || {};
                        periodLabels.forEach((periodLabel, i) => {
                            const key = `period${i + 1}`;
                            const students = periods[key] || [];

                            students.forEach((student) => {
                                if (student.studentId?.trim().toLowerCase() === studentId.trim().toLowerCase()) {
                                    results.push({
                                        date: yyyyMMdd,
                                        weekday: getJapaneseDayOfWeek(yyyyMMdd),
                                        periodLabel: periodLabel.label,
                                        time: periodLabel.time,
                                        subject: student.subject || '－',
                                        grade: student.grade || '',
                                        seat: student.seat || '',
                                        teacher: row.teacher || '',
                                        status: student.status || '－',
                                    });
                                }
                            });
                        });
                    });
                }

                setAttendanceList(results);
            } catch (error) {
                console.error(error);
                setAttendanceList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [classroomCode, studentId, selectedMonth]);

    return { loading, attendanceList };
};

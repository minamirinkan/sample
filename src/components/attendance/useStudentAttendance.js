import { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { getJapaneseDayOfWeek, getDayOfWeekFromYyyyMmDd } from '../../utils/dateFormatter';

export const useStudentAttendance = (classroomCode, studentCode, selectedMonth) => {
    const [loading, setLoading] = useState(true);
    const [attendanceList, setAttendanceList] = useState([]);

    useEffect(() => {
        if (!classroomCode || !studentCode || !selectedMonth) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const db = getFirestore();

                const timetableSnap = await getDocs(
                    collection(db, 'classrooms', classroomCode, 'timetables')
                );

                const timetableMap = new Map();
                timetableSnap.forEach((doc) => {
                    timetableMap.set(doc.id, doc.data());
                });

                const templateSnap = await getDocs(
                    collection(db, 'classrooms', classroomCode, 'weekdayTemplates')
                );

                const templateMap = new Map();
                templateSnap.forEach((doc) => {
                    const [year, month, weekday] = doc.id.split('-').map((v, i) => i < 2 ? parseInt(v) : parseInt(v));
                    const key = parseInt(weekday);
                    if (!templateMap.has(key)) templateMap.set(key, []);
                    templateMap.get(key).push({ year, month, data: doc.data() });
                });

                for (const key of templateMap.keys()) {
                    templateMap.get(key).sort((a, b) => {
                        if (a.year !== b.year) return b.year - a.year;
                        return b.month - a.month;
                    });
                }

                // 選択された年月の範囲を計算
                const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
                const monthStart = new Date(selectedYear, selectedMonthNum - 1, 1);
                const monthEnd = new Date(selectedYear, selectedMonthNum, 0); // その月の最終日

                const results = [];

                // 日単位ループを、選択された月の1日〜最終日に限定
                for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
                    const yyyyMMdd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const weekday = getDayOfWeekFromYyyyMmDd(yyyyMMdd);
                    let data;
                    if (timetableMap.has(yyyyMMdd)) {
                        data = timetableMap.get(yyyyMMdd);
                    } else {
                        const templates = templateMap.get(weekday);
                        if (templates) {
                            for (const tpl of templates) {
                                if (
                                    d.getFullYear() > tpl.year ||
                                    (d.getFullYear() === tpl.year && d.getMonth() + 1 >= tpl.month)
                                ) {
                                    data = tpl.data;
                                    break;
                                }
                            }
                        }
                    }

                    if (!data) continue;

                    const periodLabels = data.periodLabels || [];
                    const rows = data.rows || [];

                    rows.forEach((row) => {
                        const periods = row.periods || {};
                        periodLabels.forEach((periodLabel, i) => {
                            const key = `period${i + 1}`;
                            const students = periods[key] || [];

                            students.forEach((student) => {
                                if (student.code === studentCode) {
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
                console.error('読み込みエラー:', error);
                setAttendanceList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [classroomCode, studentCode, selectedMonth]);

    return { loading, attendanceList };
};

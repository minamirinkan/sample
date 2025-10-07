import { useEffect, useState, useMemo } from 'react';
import { doc, getFirestore, onSnapshot } from 'firebase/firestore';
import { getJapaneseDayOfWeek } from '../../common/dateFormatter';
import { fetchPeriodLabels } from './usePeriodLabels';
import { useWeeklySchedules } from './useWeeklySchedules';

export interface AttendanceEntry {
    studentId: string;
    student?: { name?: string;[key: string]: any };
    status: string;
    periodLabel: string;
    period?: number;
    date: string;
    teacher?: { code: string; name: string } | null;
    classType?: string;
    duration?: string;
    seat?: string;
    grade?: string;
    subject?: string;
    [key: string]: any;
}

export const useStudentAttendance = (
    classroomCode: string,
    studentId: string,
    selectedMonth: string
) => {
    const [loading, setLoading] = useState(true);
    const [attendanceList, setAttendanceList] = useState<AttendanceEntry[]>([]);

    // ✅ トップレベルで Hook を呼ぶ
    const { schedules: weeklySchedules, loading: weeklyLoading } = useWeeklySchedules(classroomCode);

    // 週予定を曜日ごとに Map に変換
    const weeklySchedulesCache = useMemo(() => {
        const map = new Map<number, any>();
        weeklySchedules.forEach(schedule => {
            schedule.rows.forEach((row: any) => {
                if (typeof row.weekday === 'number') {
                    map.set(row.weekday, row);
                }
            });
        });
        return map;
    }, [weeklySchedules]);

    useEffect(() => {
        if (!classroomCode || !studentId || !selectedMonth || weeklyLoading) return;

        const db = getFirestore();
        let unsubscribeList: (() => void)[] = [];

        const fetchAndSubscribe = async () => {
            setLoading(true);
            setAttendanceList([]);

            try {
                const periodLabels = await fetchPeriodLabels(db, classroomCode);
                const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
                const monthStart = new Date(selectedYear, selectedMonthNum - 1, 1);
                const monthEnd = new Date(selectedYear, selectedMonthNum, 0);

                for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
                    const yyyy = d.getFullYear();
                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                    const dd = String(d.getDate()).padStart(2, '0');
                    const weekdayIndex = d.getDay();
                    const yyyyMMdd = `${yyyy}-${mm}-${dd}`;

                    const dailyDocId = `${classroomCode}_${yyyy}-${mm}-${dd}_${weekdayIndex}`;
                    const dailyDocRef = doc(db, 'dailySchedules', dailyDocId);

                    const unsubscribe = onSnapshot(
                        dailyDocRef,
                        (docSnap) => {
                            let data;
                            if (docSnap.exists()) {
                                data = docSnap.data();
                            } else if (weeklySchedulesCache.has(weekdayIndex)) {
                                data = weeklySchedulesCache.get(weekdayIndex);
                            } else {
                                setAttendanceList(prev =>
                                    prev.filter(entry =>
                                        entry.date !== yyyyMMdd && entry.date.startsWith(selectedMonth)
                                    )
                                );
                                return;
                            }

                            const rows = data.rows || [];
                            const newResults: any[] = [];

                            rows.forEach((row: any) => {
                                const periods = row.periods || {};
                                periodLabels.forEach((periodLabel, i) => {
                                    const key = `period${i + 1}`;
                                    const students = periods[key] || [];

                                    students.forEach((student: any) => {
                                        if (student.studentId?.trim().toLowerCase() === studentId.trim().toLowerCase()) {
                                            newResults.push({
                                                date: yyyyMMdd,
                                                weekday: getJapaneseDayOfWeek(yyyyMMdd),
                                                periodLabel: periodLabel.label,
                                                time: periodLabel.time,
                                                subject: student.subject || '－',
                                                grade: student.grade || '',
                                                seat: student.seat || '',
                                                teacher: row.teacher || '',
                                                status: student.status || '－',
                                                classType: student.classType || '',
                                                duration: student.duration || '',
                                                classroomCode,
                                                studentId: student.studentId,
                                            });
                                        }
                                    });
                                });
                            });

                            setAttendanceList(prev => {
                                const filtered = prev.filter(
                                    entry => entry.date !== yyyyMMdd && entry.date.startsWith(selectedMonth)
                                );
                                return [...filtered, ...newResults].sort((a, b) => a.date.localeCompare(b.date));
                            });
                        },
                        (error) => console.error(`Error fetching ${yyyyMMdd}:`, error)
                    );

                    unsubscribeList.push(unsubscribe);
                }
            } catch (error) {
                console.error(error);
                setAttendanceList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAndSubscribe();

        return () => unsubscribeList.forEach(unsub => unsub());
    }, [classroomCode, studentId, selectedMonth, weeklySchedulesCache, weeklyLoading]);

    return { loading, attendanceList, setAttendanceList };
};

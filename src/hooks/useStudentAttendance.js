// src/hooks/useStudentAttendance.js
import { useEffect, useState } from 'react';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { getJapaneseDayOfWeek } from '../utils/dateFormatter';
import { fetchPeriodLabels } from './usePeriodLabels';
import { getLatestExistingWeeklySchedule } from './useWeeklySchedules';

export const useStudentAttendance = (classroomCode, studentId, selectedMonth) => {
    const [loading, setLoading] = useState(true);
    const [attendanceList, setAttendanceList] = useState([]);

    useEffect(() => {
        if (!classroomCode || !studentId || !selectedMonth) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const db = getFirestore();

                const periodLabels = await fetchPeriodLabels(db, classroomCode);

                const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
                const monthStart = new Date(selectedYear, selectedMonthNum - 1, 1);
                const monthEnd = new Date(selectedYear, selectedMonthNum, 0);

                const weeklySchedulesCache = new Map();

                for (let weekday = 0; weekday <= 6; weekday++) {
                    const data = await getLatestExistingWeeklySchedule(db, classroomCode, selectedMonth, weekday);
                    if (data) {
                        weeklySchedulesCache.set(weekday, data);
                    }
                }

                const results = [];

                for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
                    const yyyyMMdd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const weekdayIndex = d.getDay();

                    const dailyDocId = `${classroomCode}_${yyyyMMdd}`;
                    const dailySnap = await getDoc(doc(db, 'dailySchedules', dailyDocId));

                    let data;
                    if (dailySnap.exists()) {
                        data = dailySnap.data();
                    } else if (weeklySchedulesCache.has(weekdayIndex)) {
                        data = weeklySchedulesCache.get(weekdayIndex);
                    } else {
                        continue;
                    }

                    const rows = data.rows || [];

                    rows.forEach((row) => {
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
                                        classroomCode,
                                        studentId: student.studentId,
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

    return { loading, attendanceList, setAttendanceList };
};

import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { fetchLatestWeeklySchedule } from '../../hooks/useLatestWeeklySchedule';

// 0（＝日）から始まる曜日マップ
const WEEKDAY_MAP = {
    0: '日',
    1: '月',
    2: '火',
    3: '水',
    4: '木',
    5: '金',
    6: '土',
};

const PERIOD_MAP = {
    period1: '1限',
    period2: '2限',
    period3: '3限',
    period4: '4限',
    period5: '5限',
    period6: '6限',
    period7: '7限',
    period8: '8限',
};

const RegularLessonTable = ({ classroomCode, studentId, selectedMonth }) => {
    const [lessons, setLessons] = useState([]);

    useEffect(() => {
        const fetchLessons = async () => {
            const extracted = [];

            // 曜日0〜6までループして最新の週予定を取得
            for (let weekday = 0; weekday <= 6; weekday++) {
                const data = await fetchLatestWeeklySchedule(db, classroomCode, selectedMonth, weekday);
                if (!data) continue;

                const weekdayLabel = WEEKDAY_MAP[weekday] || '不明';
                const { rows } = data;

                rows.forEach((row) => {
                    const { periods, teacher } = row;

                    Object.entries(periods).forEach(([periodKey, students]) => {
                        students.forEach((studentEntry) => {
                            if (studentEntry.studentId === studentId) {
                                extracted.push({
                                    status: studentEntry.status,
                                    weekday: weekdayLabel,
                                    period: PERIOD_MAP[periodKey] || periodKey,
                                    subject: studentEntry.subject,
                                    teacher: teacher?.name || '未定',
                                    note: '',
                                });
                            }
                        });
                    });
                });
            }

            setLessons(extracted);
        };

        fetchLessons();
    }, [classroomCode, studentId, selectedMonth]);

    return (
        <div className="p-4 border rounded">
            <h2 className="text-lg font-bold mb-4">レギュラー授業（{selectedMonth}）</h2>
            <table className="w-full border text-sm">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="border px-2 py-1">ステータス</th>
                        <th className="border px-2 py-1">曜日</th>
                        <th className="border px-2 py-1">時限</th>
                        <th className="border px-2 py-1">科目</th>
                        <th className="border px-2 py-1">講師</th>
                        <th className="border px-2 py-1">備考</th>
                        <th className="border px-2 py-1">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {lessons.map((lesson, idx) => (
                        <tr key={idx}>
                            <td className="border px-2 py-1">{lesson.status}</td>
                            <td className="border px-2 py-1">{lesson.weekday}</td>
                            <td className="border px-2 py-1">{lesson.period}</td>
                            <td className="border px-2 py-1">{lesson.subject}</td>
                            <td className="border px-2 py-1">{lesson.teacher}</td>
                            <td className="border px-2 py-1">{lesson.note}</td>
                            <td className="border px-2 py-1">
                                <button className="text-blue-600 hover:underline">編集</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RegularLessonTable;

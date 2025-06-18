import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { formatDate } from '../utils/dateFormatter';

const StudentAttendanceTab = ({ classroomCode, studentCode }) => {
    const [loading, setLoading] = useState(true);
    const [attendanceList, setAttendanceList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const db = getFirestore();
                console.log('教室コード:', classroomCode);
                const colRef = collection(db, 'classrooms', classroomCode, 'timetables');
                const snap = await getDocs(colRef);
                console.log('取得件数:', snap.size);

                const results = [];

                snap.forEach((doc) => {
                    const date = doc.id;
                    const data = doc.data();
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
                                        date,
                                        periodLabel: periodLabel.label,
                                        time: periodLabel.time,
                                        subject: student.subject || '－',
                                        grade: student.grade || '',
                                        seat: student.seat || '',
                                        teacher: row.teacher || '',
                                    });
                                }
                            });
                        });
                    });
                });

                setAttendanceList(results);
            } catch (error) {
                console.error('読み込みエラー:', error);
            } finally {
                setLoading(false);
            }
        };

        if (classroomCode && studentCode) {
            fetchData();
        }
    }, [classroomCode, studentCode]);

    if (loading) return <p>読み込み中...</p>;
    if (!attendanceList.length) return <p>受講履歴がありません。</p>;

    return (
        <table className="w-full border-collapse border border-gray-300">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border px-2">出席状況</th>
                    <th className="border px-2">日付</th>
                    <th className="border px-2">時限</th>
                    <th className="border px-2">時間</th>
                    <th className="border px-2">科目</th>
                    <th className="border px-2">学年</th>
                    <th className="border px-2">席番号</th>
                    <th className="border px-2">講師</th>
                </tr>
            </thead>
            <tbody>
                {attendanceList.map((entry, idx) => (
                    <tr key={idx} className="text-center">
                        <td className="border px-2">{entry.status || '－'}</td>
                        <td className="border px-2">{formatDate(entry.date)}</td>
                        <td className="border px-2">{entry.periodLabel}</td>
                        <td className="border px-2">{entry.time}</td>
                        <td className="border px-2">{entry.subject}</td>
                        <td className="border px-2">{entry.grade}</td>
                        <td className="border px-2">{entry.seat}</td>
                        <td className="border px-2">{entry.teacher || '－'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default StudentAttendanceTab;

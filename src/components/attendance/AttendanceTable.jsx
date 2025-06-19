import { formatDate } from '../../utils/dateFormatter';

const AttendanceTable = ({ attendanceList }) => {
    if (attendanceList.length === 0) {
        return <p>受講履歴がありません。</p>;
    }

    return (
        <table className="w-full border-collapse border border-gray-300">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border px-2">出席状況</th>
                    <th className="border px-2">日付</th>
                    <th className="border px-2">曜日</th>
                    <th className="border px-2">時限</th>
                    <th className="border px-2">時間</th>
                    <th className="border px-2">科目</th>
                    <th className="border px-2">学年</th>
                    <th className="border px-2">席番号</th>
                    <th className="border px-2">講師</th>
                </tr>
            </thead>
            <tbody>
                {attendanceList.map((entry, idx) => {
                    const isToday = entry.date === new Date().toISOString().slice(0, 10);
                    return (
                        <tr key={idx} className={`text-center ${isToday ? 'bg-yellow-100 font-semibold' : ''}`}>
                            <td className="border px-2">{entry.status || '－'}</td>
                            <td className="border px-2">{formatDate(entry.date)}</td>
                            <td className="border px-2">{entry.weekday}</td>
                            <td className="border px-2">{entry.periodLabel}</td>
                            <td className="border px-2">{entry.time}</td>
                            <td className="border px-2">{entry.subject}</td>
                            <td className="border px-2">{entry.grade}</td>
                            <td className="border px-2">{entry.seat}</td>
                            <td className="border px-2">{entry.teacher || '－'}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default AttendanceTable;

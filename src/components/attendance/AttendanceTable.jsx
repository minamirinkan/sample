import { formatDate } from '../../utils/dateFormatter';

const AttendanceTable = ({ attendanceList }) => {
    if (attendanceList.length === 0) {
        return <p>受講履歴がありません。</p>;
    }

    const statusStyles = {
        '未定': 'bg-blue-100 text-blue-800',
        '振替': 'bg-green-100 text-green-800',
        '欠席': 'bg-red-100 text-red-800',
        '出席': 'bg-gray-100 text-gray-800',
    };

    const getStatusClass = (status) => statusStyles[status] || '';

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-2 py-1">出席状況</th>
                        <th className="border px-2 py-1">日付</th>
                        <th className="border px-2 py-1">曜日</th>
                        <th className="border px-2 py-1">時限</th>
                        <th className="border px-2 py-1">時間</th>
                        <th className="border px-2 py-1">科目</th>
                        <th className="border px-2 py-1">学年</th>
                        <th className="border px-2 py-1">席番号</th>
                        <th className="border px-2 py-1">講師</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceList.map((entry, idx) => {
                        // 日本時間の今日の日付（YYYY-MM-DD）を作る
                        const today = new Date();
                        const yyyy = today.getFullYear();
                        const mm = String(today.getMonth() + 1).padStart(2, '0');
                        const dd = String(today.getDate()).padStart(2, '0');
                        const todayStr = `${yyyy}-${mm}-${dd}`;

                        const isToday = entry.date === todayStr;
                        const teacherName =
                            typeof entry.teacher === 'object' && entry.teacher !== null
                                ? entry.teacher.name
                                : entry.teacher;

                        return (
                            <tr
                                key={idx}
                                className={`text-center ${getStatusClass(entry.status)} ${isToday ? 'border-2 border-yellow-500' : ''}`}
                            >
                                <td className="border px-2 py-1">{entry.status || '－'}</td>
                                <td className="border px-2 py-1">{formatDate(entry.date)}</td>
                                <td className="border px-2 py-1">{entry.weekday}</td>
                                <td className="border px-2 py-1">{entry.periodLabel}</td>
                                <td className="border px-2 py-1">{entry.time}</td>
                                <td className="border px-2 py-1">{entry.subject}</td>
                                <td className="border px-2 py-1">{entry.grade}</td>
                                <td className="border px-2 py-1">{entry.seat}</td>
                                <td className="border px-2 py-1">{teacherName || '－'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceTable;

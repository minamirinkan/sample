import { useState, useEffect } from 'react';
import { useStudentAttendance } from './useStudentAttendance';
import AttendanceTable from './AttendanceTable';

const StudentAttendanceTab = ({ classroomCode, studentId }) => {
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [monthOptions, setMonthOptions] = useState([]);

    useEffect(() => {
        const today = new Date();
        const options = [];
        for (let i = -6; i <= 5; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
            options.push({
                value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                label: `${d.getFullYear()}年${d.getMonth() + 1}月`,
            });
        }
        setMonthOptions(options);
        setSelectedMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
    }, []);

    const { loading, attendanceList } = useStudentAttendance(classroomCode, studentId, selectedMonth);

    return (
        <div>
            <select
                value={selectedMonth || ''}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mb-4 p-2 border rounded"
            >
                {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {loading ? <p>読み込み中...</p> : <AttendanceTable attendanceList={attendanceList} />}
        </div>
    );
};

export default StudentAttendanceTab;

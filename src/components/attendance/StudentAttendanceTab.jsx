import { useState, useEffect } from 'react';
import AttendanceTable from './AttendanceTable';

const StudentAttendanceTab = ({ classroomCode, studentId, studentName }) => {
    const [selectedMonth, setSelectedMonth] = useState('');
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

    if (!selectedMonth) return <p>初期化中...</p>;

    return (
        <div>
            <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mb-4 p-2 border rounded"
            >
                {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            <AttendanceTable
                classroomCode={classroomCode}
                studentId={studentId}
                studentName={studentName}
                selectedMonth={selectedMonth}
            />
        </div>
    );
};

export default StudentAttendanceTab;

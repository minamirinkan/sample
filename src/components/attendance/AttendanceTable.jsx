//src/components/attendance/AttendanceTable.jsx
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatDate } from '../../utils/dateFormatter';
import { useTeachers } from '../../hooks/useTeachers';

const AttendanceTable = ({ attendanceList }) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValues, setEditValues] = useState({});

    const statusStyles = {
        '未定': 'bg-blue-100 text-blue-800',
        '振替': 'bg-green-100 text-green-800',
        '欠席': 'bg-red-100 text-red-800',
        '出席': 'bg-gray-100 text-gray-800',
    };

    const getStatusClass = (status) => statusStyles[status] || '';

    const handleEditClick = (index) => {
        setEditingIndex(index);
        setEditValues({ ...attendanceList[index] });
    };

    const handleChange = (field, value) => {
        setEditValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveClick = () => {
        console.log('保存データ:', editValues);
        setEditingIndex(null);
    };

    const statusOptions = ['予定', '出席', '欠席', '振替', '未定'];
    const weekdayOptions = ['日', '月', '火', '水', '木', '金', '土'];
    const periodOptions = ['1限', '2限', '3限', '4限', '5限', '6限']; // 適宜調整
    const subjectOptions = ['英語', '数学', '国語']; // 適宜調整
    const { teachers } = useTeachers();

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-2 py-1">出席状況</th>
                        <th className="border px-2 py-1">日付</th>
                        <th className="border px-2 py-1">曜日</th>
                        <th className="border px-2 py-1">時限</th>
                        <th className="border px-2 py-1">科目</th>
                        <th className="border px-2 py-1">講師</th>
                        <th className="border px-2 py-1">備考</th>
                        <th className="border px-2 py-1">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {attendanceList.map((entry, idx) => {
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

                        const isEditing = editingIndex === idx;

                        return (
                            <tr
                                key={idx}
                                className={`text-center ${getStatusClass(entry.status)} ${isToday ? 'border-2 border-yellow-500' : ''}`}
                            >
                                <td className="border px-2 py-1">
                                    {isEditing ? (
                                        <select
                                            value={editValues.status || ''}
                                            onChange={(e) => handleChange('status', e.target.value)}
                                        >
                                            {statusOptions.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        entry.status || '－'
                                    )}
                                </td>
                                <td className="border px-2 py-1">
                                    {isEditing ? (
                                        <DatePicker
                                            selected={editValues.date ? new Date(editValues.date) : null}
                                            onChange={(date) => handleChange('date', date.toISOString().split('T')[0])}
                                            dateFormat="yyyy-MM-dd"
                                            className="border px-2 py-1 rounded"
                                        />
                                    ) : (
                                        formatDate(entry.date)
                                    )}
                                </td>
                                <td className="border px-2 py-1">
                                    {isEditing ? (
                                        // editValues.date をもとに曜日を計算して表示
                                        (() => {
                                            if (!editValues.date) return '－';
                                            const dateObj = new Date(editValues.date);
                                            const dayIndex = dateObj.getDay(); // 0:日曜〜6:土曜
                                            return weekdayOptions[dayIndex];
                                        })()
                                    ) : (
                                        entry.weekday
                                    )}
                                </td>
                                <td className="border px-2 py-1">
                                    {isEditing ? (
                                        <select
                                            value={editValues.periodLabel || ''}
                                            onChange={(e) => handleChange('periodLabel', e.target.value)}
                                        >
                                            {periodOptions.map((p) => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        entry.periodLabel
                                    )}
                                </td>
                                <td className="border px-2 py-1">
                                    {isEditing ? (
                                        <select
                                            value={editValues.subject || ''}
                                            onChange={(e) => handleChange('subject', e.target.value)}
                                        >
                                            {subjectOptions.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        entry.subject
                                    )}
                                </td>
                                <td className="border px-2 py-1">
                                    {isEditing ? (
                                        <select
                                            value={editValues.teacherCode || ''}
                                            onChange={(e) => handleChange('teacherCode', e.target.value)}
                                        >
                                            {teachers.map((teacher) => (
                                                <option key={teacher.code} value={teacher.code}>
                                                    {teacher.lastName} {teacher.firstName}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        teacherName || '－'
                                    )}
                                </td>
                                <td className="border px-2 py-1">－</td>
                                <td className="border px-2 py-1">
                                    {isEditing ? (
                                        <button
                                            onClick={handleSaveClick}
                                            className="px-2 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                                        >
                                            保存
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEditClick(idx)}
                                            className="px-2 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                                        >
                                            編集
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceTable;

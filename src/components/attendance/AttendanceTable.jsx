// src/components/attendance/AttendanceTable.jsx
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatDate } from '../../utils/dateFormatter';
import { useTeachers } from '../../hooks/useTeachers';
import { doc, getDoc, setDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import usePeriodLabels from '../../hooks/usePeriodLabels';

const AttendanceTable = ({ attendanceList, setAttendanceList, classroomCode, studentName }) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValues, setEditValues] = useState({});
    const { teachers } = useTeachers(); // ← 修正：useTeachers() を最初に呼び出し
    const { periodLabels } = usePeriodLabels(classroomCode);


    console.log('classroomCode:', classroomCode);
    console.log('periodLabels:', periodLabels);

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
        setEditValues((prev) => {
            const updated = { ...prev, [field]: value };
            console.log('editValues (on change):', updated); // ★ここ！
            return updated;
        });
    };

    const handleSaveClick = async () => {
        console.log('editValues (on save):', editValues);

        try {
            const db = getFirestore();
            const originalEntry = attendanceList[editingIndex];

            const selectedTeacher = teachers.find(t => t.code === editValues.teacherCode);

            if (editValues.date) {
                const oldDocId = `${editValues.classroomCode}_${originalEntry.date}`;
                const newDocId = `${editValues.classroomCode}_${editValues.date}`;

                // 【旧スケジュール】削除処理
                // 編集前の日付（originalEntry.date）から削除するために、存在しなければテンプレから作成
                const oldDocRef = doc(db, 'dailySchedules', oldDocId);
                const oldSnap = await getDoc(oldDocRef);

                if (!oldSnap.exists()) {
                    const oldDate = new Date(originalEntry.date);
                    const weekday = oldDate.getDay();
                    const year = oldDate.getFullYear();
                    const month = String(oldDate.getMonth() + 1).padStart(2, '0');
                    const weeklyDocId = `${editValues.classroomCode}_${year}-${month}_${weekday}`;
                    const weeklyRef = doc(db, 'weeklySchedules', weeklyDocId);
                    const weeklySnap = await getDoc(weeklyRef);

                    if (weeklySnap.exists()) {
                        const weeklyData = weeklySnap.data();
                        const templateRows = weeklyData.rows || [];

                        const clonedRows = templateRows.map(row => {
                            const newPeriods = {};
                            Object.keys(row.periods || {}).forEach(key => {
                                newPeriods[key] = [...row.periods[key]];
                            });
                            return {
                                ...row,
                                periods: newPeriods,
                            };
                        });

                        await setDoc(oldDocRef, {
                            rows: clonedRows,
                        });

                        // ✅ studentId を削除（テンプレ作成後）
                        const periodIndex = periodLabels.findIndex(p => p.label === originalEntry.periodLabel);
                        const periodKey = `period${periodIndex + 1}`;

                        const updatedRows = clonedRows.map(row => {
                            const students = row.periods?.[periodKey] || [];
                            const filtered = students.filter(s => s.studentId !== editValues.studentId);
                            return {
                                ...row,
                                periods: {
                                    ...row.periods,
                                    [periodKey]: filtered,
                                },
                            };
                        });

                        await setDoc(oldDocRef, {
                            rows: updatedRows,
                            updatedAt: serverTimestamp(),
                        }, { merge: true }); // ← 既存のフィールドを保ったまま更新
                    }
                }

                // 【新スケジュール】追加処理
                const newDocRef = doc(db, 'dailySchedules', newDocId);
                const newSnap = await getDoc(newDocRef);
                let newData = null;

                if (!newSnap.exists()) {
                    const targetDate = new Date(editValues.date);
                    const weekday = targetDate.getDay();
                    const classroomId = editValues.classroomCode;
                    const year = targetDate.getFullYear();
                    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
                    const weeklyDocId = `${classroomId}_${year}-${month}_${weekday}`;

                    const weeklyDocRef = doc(db, 'weeklySchedules', weeklyDocId);
                    const weeklySnap = await getDoc(weeklyDocRef);

                    if (weeklySnap.exists()) {
                        const weeklyData = weeklySnap.data();
                        newData = weeklyData; // ← ここを必ず設定
                        await setDoc(newDocRef, {
                            ...weeklyData,
                            createdFromWeeklyTemplate: weeklyDocId,
                            updatedAt: serverTimestamp(),
                        }, { merge: true }); // ← 既存のフィールドを保ったまま更新
                    } else {
                        newData = { rows: [] }; // テンプレートが存在しない場合のフォールバック
                        await setDoc(newDocRef, newData);
                    }
                } else {
                    newData = newSnap.data(); // ← こちらも必ず代入
                }

                const newPeriodIndex = periodLabels.findIndex(p => p.label === editValues.periodLabel);
                const newPeriodKey = `period${newPeriodIndex + 1}`;

                let newRows = [...newData.rows];
                let inserted = false;

                for (let i = 0; i < newRows.length; i++) {
                    const row = newRows[i];
                    const isSameGroup =
                        (['未定', '振替', '欠席'].includes(editValues.status) && row.status === editValues.status) ||
                        (editValues.status === '予定' && row.teacher?.code === editValues.teacherCode);

                    if (isSameGroup) {
                        const students = row.periods?.[newPeriodKey] || [];
                        newRows[i] = {
                            ...row,
                            periods: {
                                ...row.periods,
                                [newPeriodKey]: [
                                    ...students,
                                    {
                                        studentId: editValues.studentId,
                                        name: studentName || '',
                                        subject: editValues.subject || '',
                                        status: editValues.status || '',
                                        seat: editValues.seat || '',
                                        grade: editValues.grade || '',
                                        teacher: {
                                            code: editValues.teacherCode || '',
                                            name: selectedTeacher ? `${selectedTeacher.lastName} ${selectedTeacher.firstName}` : '',
                                        },
                                    },
                                ],
                            },
                            status: editValues.status || '',
                            teacher: editValues.status === '予定' ? {
                                code: editValues.teacherCode || '',
                                name: selectedTeacher ? `${selectedTeacher.lastName} ${selectedTeacher.firstName}` : '',
                            } : null,
                        };
                        inserted = true;
                        break;
                    }
                }

                if (!inserted) {
                    newRows.push({
                        periods: {
                            [newPeriodKey]: [
                                {
                                    studentId: editValues.studentId,
                                    name: studentName || '',
                                    subject: editValues.subject || '',
                                    status: editValues.status || '',
                                    seat: editValues.seat || '',
                                    grade: editValues.grade || '',
                                    teacher: {
                                        code: editValues.teacherCode || '',
                                        name: selectedTeacher ? `${selectedTeacher.lastName} ${selectedTeacher.firstName}` : '',
                                    },
                                },
                            ],
                        },
                        status: editValues.status || '',
                        teacher: editValues.status === '予定' ? {
                            code: editValues.teacherCode || '',
                            name: selectedTeacher ? `${selectedTeacher.lastName} ${selectedTeacher.firstName}` : '',
                        } : null,
                    });
                }

                await setDoc(newDocRef, {
                    ...newData,
                    rows: newRows,
                    updatedAt: serverTimestamp(),
                }, { merge: true });

            } else {
                // 日付なし（テンプレート更新）
                const weeklyDocRef = doc(db, 'weeklySchedules', editValues.classroomCode);
                const weeklySnap = await getDoc(weeklyDocRef);
                let weeklyData = weeklySnap.exists() ? weeklySnap.data() : { rows: [] };

                const periodIndex = periodLabels.findIndex(p => p.label === editValues.periodLabel);
                const periodKey = `period${periodIndex + 1}`;

                let weeklyRows = [...weeklyData.rows];
                let inserted = false;

                for (let i = 0; i < weeklyRows.length; i++) {
                    const row = weeklyRows[i];
                    const isSameGroup =
                        (['未定', '振替', '欠席'].includes(editValues.status) && row.status === editValues.status) ||
                        (editValues.status === '予定' && row.teacher?.code === editValues.teacherCode);

                    if (isSameGroup) {
                        const students = row.periods?.[periodKey] || [];
                        weeklyRows[i] = {
                            ...row,
                            periods: {
                                ...row.periods,
                                [periodKey]: [
                                    ...students,
                                    {
                                        studentId: editValues.studentId,
                                        name: studentName || '',
                                        subject: editValues.subject || '',
                                        status: editValues.status || '',
                                        seat: editValues.seat || '',
                                        grade: editValues.grade || '',
                                        teacher: {
                                            code: editValues.teacherCode || '',
                                            name: selectedTeacher ? `${selectedTeacher.lastName} ${selectedTeacher.firstName}` : '',
                                        },
                                    },
                                ],
                            },
                            status: editValues.status || '',
                            teacher: editValues.status === '予定' ? {
                                code: editValues.teacherCode || '',
                                name: selectedTeacher ? `${selectedTeacher.lastName} ${selectedTeacher.firstName}` : '',
                            } : null,
                        };
                        inserted = true;
                        break;
                    }
                }

                if (!inserted) {
                    weeklyRows.push({
                        periods: {
                            [periodKey]: [
                                {
                                    studentId: editValues.studentId,
                                    name: studentName || '',
                                    subject: editValues.subject || '',
                                    status: editValues.status || '',
                                    seat: editValues.seat || '',
                                    grade: editValues.grade || '',
                                    teacher: {
                                        code: editValues.teacherCode || '',
                                        name: selectedTeacher ? `${selectedTeacher.lastName} ${selectedTeacher.firstName}` : '',
                                    },
                                },
                            ],
                        },
                        status: editValues.status || '',
                        teacher: editValues.status === '予定' ? {
                            code: editValues.teacherCode || '',
                            name: selectedTeacher ? `${selectedTeacher.lastName} ${selectedTeacher.firstName}` : '',
                        } : null,
                    });
                }

                await setDoc(weeklyDocRef, {
                    ...weeklyData,
                    rows: weeklyRows,
                });
            }

            // ローカル state 更新
            const updatedList = [...attendanceList];
            updatedList[editingIndex] = {
                ...editValues,
                teacher: {
                    code: editValues.teacherCode,
                    name: selectedTeacher ? `${selectedTeacher.lastName} ${selectedTeacher.firstName}` : '',
                },
            };
            setAttendanceList(updatedList);

            alert('保存しました');
        } catch (err) {
            console.error(err);
            alert('保存に失敗しました: ' + err.message);
        } finally {
            setEditingIndex(null);
        }
    };

    const statusOptions = ['予定', '未定', '振替', '欠席', '出席'];
    const weekdayOptions = ['日', '月', '火', '水', '木', '金', '土'];
    const periodOptions = ['1限', '2限', '3限', '4限', '5限', '6限', '7限', '8限'];
    const subjectOptions = ['英語', '数学', '国語', '理科', '社会'];

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
                        const todayStr = new Date().toISOString().split('T')[0];
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
                                    {isEditing
                                        ? (() => {
                                            if (!editValues.date) return '－';
                                            const dateObj = new Date(editValues.date);
                                            const dayIndex = dateObj.getDay();
                                            return weekdayOptions[dayIndex];
                                        })()
                                        : entry.weekday}
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
                                            <option value="">－</option> {/* ← ここが追加部分 */}
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
                                        <>
                                            <button
                                                onClick={handleSaveClick}
                                                className="px-2 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                                            >
                                                保存
                                            </button>
                                            <button
                                                onClick={() => setEditingIndex(null)}
                                                className="ml-2 px-2 py-1 text-sm text-white bg-gray-500 rounded hover:bg-gray-600"
                                            >
                                                キャンセル
                                            </button>
                                        </>
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

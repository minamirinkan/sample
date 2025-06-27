// src/components/attendance/AttendanceTable.jsx
import { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { formatDate } from '../../utils/dateFormatter';
import { useTeachers } from '../../hooks/useTeachers';
import { doc, getDoc, setDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import usePeriodLabels from '../../hooks/usePeriodLabels';
import { showErrorToast } from '../ToastProvider';
import AttendanceSubTable from './AttendanceSubTable';


const AttendanceTable = ({ attendanceList, setAttendanceList, classroomCode, studentName }) => {
    const [setEditingIndex] = useState(null);
    const [editValues, setEditValues] = useState({});
    const { teachers } = useTeachers(); // ← 修正：useTeachers() を最初に呼び出し
    const { periodLabels } = usePeriodLabels(classroomCode);
    const [editingIndexRegular, setEditingIndexRegular] = useState(null);
    const [editingIndexMakeup, setEditingIndexMakeup] = useState(null);

    console.log('classroomCode:', classroomCode);
    console.log('periodLabels:', periodLabels);

    const statusStyles = {
        '未定': 'bg-blue-100 text-blue-800',
        '振替': 'bg-green-100 text-green-800',
        '欠席': 'bg-red-100 text-red-800',
        '出席': 'bg-gray-100 text-gray-800',
    };

    const getStatusClass = (status) => statusStyles[status] || '';

    const handleChange = (field, value) => {
        setEditValues((prev) => {
            const updated = { ...prev, [field]: value };
            console.log('editValues (on change):', updated); // ★ここ！
            return updated;
        });
    };

    const handleSaveClick = async (listType) => {
        console.log('editValues (on save):', editValues);
        try {
            const db = getFirestore();
            let originalEntry = null;
            if (listType === 'makeup') {
                if (editingIndexMakeup === null) {
                    showErrorToast('振替リストの編集対象がありません');
                    return;
                }
                originalEntry = makeUpList[editingIndexMakeup];
            } else if (listType === 'regular') {
                if (editingIndexRegular === null) {
                    showErrorToast('通常リストの編集対象がありません');
                    return;
                }
                originalEntry = regularList[editingIndexRegular];
            } else {
                showErrorToast('不明な編集リストです');
                return;
            }

            const selectedTeacher = teachers.find(t => t.code === editValues.teacherCode);
            const student = {
                studentId: editValues.studentId,
                name: studentName || '',
                subject: editValues.subject || '',
                status: editValues.status || '',
                seat: editValues.seat || '',
                grade: editValues.grade || '',
                teacher: editValues.status === '予定'
                    ? {
                        code: editValues.teacherCode || '',
                        name: selectedTeacher ? `${selectedTeacher.lastName} ${selectedTeacher.firstName}` : '',
                    }
                    : null,
            };

            const getPeriodKey = (label) => {
                const index = periodLabels.findIndex(p => p.label === label);
                return `period${index + 1}`;
            };

            const buildWeeklyDocId = (classroomCode, date) => {
                const d = new Date(date);
                const weekday = d.getDay();
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                return `${classroomCode}_${year}-${month}_${weekday}`;
            };

            const isDateChanged = originalEntry.date !== editValues.date;
            const isPeriodChanged = originalEntry.periodLabel !== editValues.periodLabel;

            const oldPeriodKey = getPeriodKey(originalEntry.periodLabel);
            const newPeriodKey = getPeriodKey(editValues.periodLabel);
            const targetStudentId = String(editValues.studentId).trim();

            // 🔸 保存先: dailySchedules or weeklySchedules
            if (editValues.date) {
                // ------------------- DAILY ---------------------
                const oldDocId = `${editValues.classroomCode}_${originalEntry.date}`;
                const newDocId = `${editValues.classroomCode}_${editValues.date}`;
                const oldDocRef = doc(db, 'dailySchedules', oldDocId);
                const newDocRef = doc(db, 'dailySchedules', newDocId);

                // --- 旧データ取得・削除 ---
                let oldSnap = await getDoc(oldDocRef);
                let oldData = oldSnap.exists() ? oldSnap.data() : null;
                if (!oldData) {
                    const weeklyRef = doc(db, 'weeklySchedules', buildWeeklyDocId(editValues.classroomCode, originalEntry.date));
                    const weeklySnap = await getDoc(weeklyRef);
                    oldData = weeklySnap.exists() ? weeklySnap.data() : { rows: [] };
                }

                const updatedOldRows = (oldData.rows || []).map(row => ({
                    ...row,
                    periods: {
                        ...row.periods,
                        [oldPeriodKey]: (row.periods?.[oldPeriodKey] || []).filter(
                            s => String(s.studentId).trim() !== targetStudentId
                        ),
                    },
                }));

                await setDoc(oldDocRef, {
                    ...oldData,
                    rows: updatedOldRows,
                    updatedAt: serverTimestamp(),
                }, { merge: true });

                // --- 新データ取得・追加 ---
                let newSnap = await getDoc(newDocRef);
                let newData = newSnap.exists() ? newSnap.data() : null;

                if (!newData) {
                    const weeklyRef = doc(db, 'weeklySchedules', buildWeeklyDocId(editValues.classroomCode, editValues.date));
                    const weeklySnap = await getDoc(weeklyRef);
                    newData = weeklySnap.exists() ? weeklySnap.data() : { rows: [] };
                    await setDoc(newDocRef, {
                        ...newData,
                        createdFromWeeklyTemplate: weeklyRef.id,
                        updatedAt: serverTimestamp(),
                    }, { merge: true });
                }

                // --- 重複チェック ---
                if (isDateChanged || isPeriodChanged) {
                    const isDuplicate = newData.rows?.some(row =>
                        row.periods?.[newPeriodKey]?.some(s => s.studentId === student.studentId)
                    );
                    if (isDuplicate) {
                        showErrorToast('既に授業が入っているため変更できません');
                        setEditingIndex(null);
                        return;
                    }
                }

                // --- 追加 ---
                const grouped = [...(newData.rows || [])];
                let inserted = false;

                for (let i = 0; i < grouped.length; i++) {
                    const row = grouped[i];
                    const isSameGroup =
                        (['未定', '振替', '欠席'].includes(editValues.status) && row.status === editValues.status) ||
                        (editValues.status === '予定' && row.teacher?.code === editValues.teacherCode);

                    if (isSameGroup) {
                        const students = row.periods?.[newPeriodKey] || [];
                        grouped[i] = {
                            ...row,
                            periods: {
                                ...row.periods,
                                [newPeriodKey]: [...students, student],
                            },
                            status: editValues.status,
                            teacher: editValues.status === '予定' ? student.teacher : null,
                        };
                        inserted = true;
                        break;
                    }
                }

                if (!inserted) {
                    grouped.push({
                        periods: { [newPeriodKey]: [student] },
                        status: editValues.status,
                        teacher: editValues.status === '予定' ? student.teacher : null,
                    });
                }

                await setDoc(newDocRef, {
                    ...newData,
                    rows: grouped,
                    updatedAt: serverTimestamp(),
                }, { merge: true });
            }

            // 保存が成功したらローカルの attendanceList も更新
            const updatedList = attendanceList.map((entry, index) => {
                if (
                    (listType === 'makeup' && index === editingIndexMakeup) ||
                    (listType === 'regular' && index === editingIndexRegular)
                ) {
                    return {
                        ...entry,
                        ...editValues,
                        teacher: editValues.status === '予定'
                            ? {
                                code: editValues.teacherCode || '',
                                name: selectedTeacher ? `${selectedTeacher.lastName} ${selectedTeacher.firstName}` : '',
                            }
                            : null,
                    };
                }
                return entry;
            });

            setAttendanceList(updatedList);
            setEditingIndexRegular(null);
            setEditingIndexMakeup(null);
            alert('保存しました');
        } catch (error) {
            console.error('保存エラー:', error);
            showErrorToast('保存中にエラーが発生しました');
        }
    };

    const makeUpList = attendanceList.filter((e) => e.status === '振替');
    const regularList = attendanceList.filter((e) => e.status !== '振替');

    return (
        <div className="space-y-6">
            {/* 振替出席情報（上） */}
            <div className="min-w-[700px]">
                <h2 className="text-lg font-bold mb-2 text-yellow-600">振替出席情報</h2>
                <AttendanceSubTable
                    data={makeUpList}
                    teachers={teachers}
                    editingIndex={editingIndexMakeup}
                    setEditingIndex={setEditingIndexMakeup}
                    editValues={editValues}
                    handleEditClick={(idx) => {
                        setEditingIndexRegular(null); // 他方を閉じる（任意）
                        setEditingIndexMakeup(idx);
                        setEditValues(makeUpList[idx]);
                    }}
                    handleChange={handleChange}
                    handleSaveClick={() => handleSaveClick('makeup')}
                    formatDate={formatDate}
                    getStatusClass={getStatusClass}
                />
            </div>

            {/* 通常の出席情報（下） */}
            <div className="min-w-[700px]">
                <h2 className="text-lg font-bold mb-2">通常出席情報</h2>
                <AttendanceSubTable
                    data={regularList}
                    teachers={teachers}
                    editingIndex={editingIndexRegular}
                    setEditingIndex={setEditingIndexRegular}
                    editValues={editValues}
                    handleEditClick={(idx) => {
                        setEditingIndexMakeup(null); // 他方を閉じる（任意）
                        setEditingIndexRegular(idx);
                        setEditValues(regularList[idx]);
                    }}
                    handleChange={handleChange}
                    handleSaveClick={() => handleSaveClick('regular')}
                    formatDate={formatDate}
                    getStatusClass={getStatusClass}
                />
            </div>
        </div>
    );
};
export default AttendanceTable;

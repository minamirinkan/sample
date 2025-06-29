import { useState } from 'react';
import { showErrorToast } from '../components/ToastProvider';
import { db } from '../firebase';
import {
    buildWeeklyDocId,
    getPeriodKey,
    fetchScheduleDoc,
    createScheduleFromWeeklyTemplate,
    saveScheduleDoc,
    saveMakeupLesson,
} from '../utils/firebase/attendanceFirestore';
import { onSnapshot, doc } from 'firebase/firestore';

export const useAttendanceEdit = (attendanceList, setAttendanceList, periodLabels, teachers, classroomCode, studentName) => {
    const [editingIndexRegular, setEditingIndexRegular] = useState(null);
    const [editingIndexMakeup, setEditingIndexMakeup] = useState(null);
    const [editValues, setEditValues] = useState({});

    const [makeUpList, setMakeUpList] = useState(attendanceList.filter(e => e.status === '振替'));
    const regularList = attendanceList.filter((e) => e.status !== '振替');

    const handleChange = (field, value) => {
        setEditValues(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveClick = async (listType) => {
        try {
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

            const isDateChanged = originalEntry.date !== editValues.date;
            const isPeriodChanged = originalEntry.periodLabel !== editValues.periodLabel;

            const oldPeriodKey = getPeriodKey(periodLabels, originalEntry.periodLabel);
            const newPeriodKey = getPeriodKey(periodLabels, editValues.periodLabel);
            const targetStudentId = String(editValues.studentId).trim();

            if (editValues.date) {
                const oldDocId = `${classroomCode}_${originalEntry.date}`;
                const newDocId = `${classroomCode}_${editValues.date}`;

                let newData = await fetchScheduleDoc('dailySchedules', newDocId);
                if (!newData) {
                    const weeklyRefId = buildWeeklyDocId(classroomCode, editValues.date);
                    const weeklyData = await fetchScheduleDoc('weeklySchedules', weeklyRefId);
                    newData = weeklyData || { rows: [] };
                    await createScheduleFromWeeklyTemplate('dailySchedules', newDocId, weeklyRefId, newData);
                }

                if (isDateChanged || isPeriodChanged) {
                    const newPeriodStudents = newData?.rows?.flatMap(row =>
                        row.periods?.[newPeriodKey] || []
                    ) || [];

                    const isDuplicate = newPeriodStudents.some(s =>
                        String(s.studentId).trim() === targetStudentId &&
                        !(editValues.date === originalEntry.date && editValues.periodLabel === originalEntry.periodLabel)
                    );

                    if (isDuplicate) {
                        showErrorToast('既に授業が入っているため変更できません');
                        return;
                    }
                }

                let oldData = await fetchScheduleDoc('dailySchedules', oldDocId);
                if (!oldData) {
                    const weeklyRefId = buildWeeklyDocId(classroomCode, originalEntry.date);
                    const weeklyData = await fetchScheduleDoc('weeklySchedules', weeklyRefId);
                    oldData = weeklyData || { rows: [] };
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

                await saveScheduleDoc('dailySchedules', oldDocId, { ...oldData, rows: updatedOldRows });

                if (editValues.status === '振替') {
                    // 振替授業は saveMakeupLesson で保存
                    await saveMakeupLesson(
                        String(editValues.studentId).trim(),
                        newDocId,
                        {
                            student,
                            periodKey: newPeriodKey,
                            date: editValues.date,
                            status: editValues.status,
                        }
                    );
                    // 🔽 ここで再フェッチして setMakeUpList などを更新する！
                    // 🔽 保存後に最新の振替データを取得して state 更新
                    const docRef = doc(db, 'students', String(editValues.studentId).trim(), 'makeupLessons', newDocId);
                    const updatedMakeupDoc = onSnapshot(
                        docRef,
                        (snapshot) => {
                            if (snapshot.exists()) {
                                const data = snapshot.data();
                                if (data.lessons) {
                                    setMakeUpList(prev => {
                                        const filtered = prev.filter(
                                            l => !(l.studentId === editValues.studentId && l.date === data.date)
                                        );
                                        return [...filtered, ...data.lessons];
                                    });
                                }
                            }
                            // 監視を1回でやめる（再取得の必要がなければ）
                            updatedMakeupDoc();
                        },
                        (error) => {
                            console.error('onSnapshot error:', error);
                        }
                    );

                    if (updatedMakeupDoc?.lessons) {
                        // 振替リストを更新（個別 or 全体 depending on your structure）
                        setMakeUpList(prev => {
                            const filtered = prev.filter(
                                l => !(l.studentId === editValues.studentId && l.date === editValues.date)
                            );
                            return [...filtered, ...updatedMakeupDoc.lessons];
                        });
                    }
                } else {
                    // 通常授業はこれまで通り
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

                    await saveScheduleDoc('dailySchedules', newDocId, { ...newData, rows: grouped });
                }
            }

            // ローカルリストの更新は共通処理のまま
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

    return {
        editingIndexRegular,
        setEditingIndexRegular,
        editingIndexMakeup,
        setEditingIndexMakeup,
        editValues,
        setEditValues,
        handleChange,
        handleSaveClick,
        makeUpList,
        regularList,
    };
};

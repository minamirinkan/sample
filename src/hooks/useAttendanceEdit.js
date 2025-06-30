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
import { onSnapshot, doc, getDoc, setDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';

// 🔽 振替レッスン削除ユーティリティ
async function removeFromMakeupLessons(studentId, date, period, classroomCode) {
    const docId = `${classroomCode}_${date}`;
    console.log(`🪵 removeFromMakeupLessons → docId: ${docId}`);
    const docRef = doc(db, 'students', studentId, 'makeupLessons', docId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
        console.warn(`⛔ makeupLessons/${docId} does not exist for ${studentId}`);
        return;
    }

    const data = snap.data();
    const lessons = data.lessons || [];

    console.log('🟡 現在のlessons:', lessons);
    console.log('🟠 削除対象: studentId=', studentId, ' period=', period);

    const filtered = lessons.filter(
        l => !(l.studentId === studentId && l.period === period)
    );

    console.log('✅ 削除後のlessons:', filtered);

    if (filtered.length === 0) {
        console.log(`🗑️ lessonsが空になったため、${docId} を削除します`);
        await deleteDoc(docRef);
    } else {
        await setDoc(docRef, { lessons: filtered }, { merge: true });
    }
}


// ✅ 振替レッスンをアーカイブに移動
// ✅ 振替レッスンをアーカイブに移動（形式を makeupLessons と同じに）
async function moveMakeupLessonToArchive(studentId, date, lessonData, classroomCode) {
    try {
        const docId = `${classroomCode}_${date}`;
        const archiveDocRef = doc(db, 'students', studentId, 'makeupLessonsArchive', docId);

        await setDoc(archiveDocRef, {
            lessons: [lessonData] // ← 🔧 ここを配列で保存！
        });

        console.log(`✅ アーカイブ保存成功: ${docId}`);
    } catch (error) {
        console.error('❌ アーカイブ保存エラー:', error);
    }
}



export const useAttendanceEdit = (attendanceList, setAttendanceList, periodLabels, teachers, classroomCode, studentName) => {
    const [editingIndexRegular, setEditingIndexRegular] = useState(null);
    const [editingIndexMakeup, setEditingIndexMakeup] = useState(null);
    const [editingMakeupLesson, setEditingMakeupLesson] = useState(null);
    const [editValues, setEditValues] = useState({});

    console.log('🐛 editingMakeupLesson:', editingMakeupLesson);
    const [makeUpList, setMakeUpList] = useState(attendanceList.filter(e => e.status === '振替'));
    const regularList = attendanceList.filter((e) => e.status !== '振替');

    const handleChange = (field, value) => {
        setEditValues(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveClick = async (listType) => {
        console.log('🎯 editingIndexMakeup:', editingIndexMakeup);
        console.log('🎯 makeUpList.length:', makeUpList.length);
        console.log('🎯 makeUpList:', makeUpList);

        try {
            let originalEntry = null;
            if (listType === 'makeup') {
                if (editingIndexMakeup === null) {
                    showErrorToast('振替リストの編集対象がありません');
                    return;
                }
                originalEntry = editingMakeupLesson;
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

            console.log('🪵 edit:', makeUpList[editingIndexMakeup]);
            console.log('🪵 originalEntry:', originalEntry);
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

            console.log('🔍 originalEntry.periodLabel:', originalEntry.periodLabel);
            console.log('🔍 editValues.periodLabel:', editValues.periodLabel);
            console.log('🔍 periodLabels:', periodLabels.map(p => p.label));

            const oldPeriodKey = getPeriodKey(periodLabels, originalEntry.periodLabel);
            const newPeriodKey = getPeriodKey(periodLabels, editValues.periodLabel);

            console.log('✅ oldPeriodKey:', oldPeriodKey);
            console.log('✅ newPeriodKey:', newPeriodKey);
            const targetStudentId = String(editValues.studentId).trim();

            if (editValues.date) {
                const oldDocId = `${classroomCode}_${originalEntry.date}`;
                const newDocId = `${classroomCode}_${editValues.date}`;

                // 🔽 振替 → 通常への変更だった場合、元の振替データを削除
                const oldPeriod = originalEntry.period;
                if (originalEntry.status === '振替' && editValues.status !== '振替') {
                    await removeFromMakeupLessons(targetStudentId, originalEntry.date, oldPeriod, classroomCode);

                    // ✅ アーカイブ用に移動させる
                    await moveMakeupLessonToArchive(targetStudentId, originalEntry.date, originalEntry, classroomCode);
                }

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
                            updatedMakeupDoc();
                        },
                        (error) => {
                            console.error('onSnapshot error:', error);
                        }
                    );

                    if (updatedMakeupDoc?.lessons) {
                        setMakeUpList(prev => {
                            const filtered = prev.filter(
                                l => !(l.studentId === editValues.studentId && l.date === editValues.date)
                            );
                            return [...filtered, ...updatedMakeupDoc.lessons];
                        });
                    }
                } else {
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
        editingMakeupLesson,
        setEditingMakeupLesson,
        handleSaveClick,
        makeUpList,
        regularList,
    };
};

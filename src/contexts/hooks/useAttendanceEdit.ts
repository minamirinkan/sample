import { useState,useEffect } from 'react';
import { showErrorToast } from '../../common/ToastProvider';
import { db } from '../../firebase';
import {
    buildWeeklyDocId,
    getPeriodKey,
    fetchScheduleDoc,
    createScheduleFromWeeklyTemplate,
    saveScheduleDoc,
    saveMakeupLesson,
} from '../../common/Students/firebase/attendanceFirestore';
import { buildDailyDocId } from '../../common/Students/firebase/attendanceFirestore';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export interface AttendanceEntry {
    studentId: string;
    student?: {
        name?: string;
        [key: string]: any;
    };
    status: string; // '振替' | '予定' | '未定' | '欠席' など
    periodLabel: string;
    period?: number;
    date: string; // 'YYYY-MM-DD' 想定
    teacher?: {
        code: string;
        name: string;
    } | null;
    classType?: string;
    duration?: string;
    seat?: string;
    grade?: string;
    subject?: string;
    [key: string]: any;
}

// 期間ラベル型
export interface PeriodLabel {
    label: string;
    start?: string;
    end?: string;
}

// 教師型
export interface Teacher {
    code: string;
    lastName: string;
    firstName: string;
}

// 編集時の入力値
interface EditValues {
    studentId?: string;
    studentName?: string;
    subject?: string;
    status?: string;
    seat?: string;
    grade?: string;
    classType?: string;
    duration?: string;
    teacherCode?: string;
    periodLabel?: string;
    date?: string;
    name?: string;
}
export interface StudentInfo {
    studentId: string;
    name?: string;
    subject?: string;
    status?: string;
    seat?: string;
    grade?: string;
    classType?: string;
    duration?: string;
    teacher?: {
        code: string;
        name: string;
    } | null;
}
export interface ScheduleRow {
    periods: Record<string, StudentInfo[]>; // period1, period2, ...
    status?: string;
    teacher?: {
        code: string;
        name: string;
    } | null;
    [key: string]: any; // Firestoreに他のフィールドがある場合
}
// 🔽 振替レッスン削除ユーティリティ
async function removeFromMakeupLessons(
    studentId: string,
    date: string,
    period: number | undefined,
    classroomCode: string
): Promise<void> {
    const docId = buildDailyDocId(classroomCode, date);
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
        (l: AttendanceEntry) => !(l.studentId === studentId && l.period === period)
    );

    console.log('✅ 削除後のlessons:', filtered);

    if (filtered.length === 0) {
        console.log(`🗑️ lessonsが空になったため、${docId} を削除します`);
        await deleteDoc(docRef);
    } else {
        console.log('📝 setDocする前のデータ:', { lessons: filtered }); // ←ここにログを入れる
        await setDoc(docRef, { lessons: filtered }, { merge: false });
    }
}

// ✅ 振替レッスンをアーカイブに移動
// ✅ 振替レッスンをアーカイブに移動（形式を makeupLessons と同じに）
async function moveMakeupLessonToArchive(
    studentId: string,
    date: string,
    lessonData: AttendanceEntry,
    classroomCode: string
): Promise<void> {
    try {
        const docId = buildDailyDocId(classroomCode, date);
        const archiveDocRef = doc(db, 'students', studentId, 'makeupLessonsArchive', docId);

        await setDoc(archiveDocRef, {
            lessons: [lessonData] // ← 🔧 ここを配列で保存！
        });

        console.log(`✅ アーカイブ保存成功: ${docId}`);
    } catch (error) {
        console.error('❌ アーカイブ保存エラー:', error);
    }
}

export const useAttendanceEdit = (
    attendanceList: AttendanceEntry[],
    setAttendanceList: React.Dispatch<React.SetStateAction<AttendanceEntry[]>>,
    periodLabels: PeriodLabel[],
    teachers: Teacher[],
    classroomCode: string,
    studentName: string
) => {
    const [editingIndexRegular, setEditingIndexRegular] = useState<number | null>(null);
    const [editingIndexMakeup, setEditingIndexMakeup] = useState<number | null>(null);
    const [editingMakeupLesson, setEditingMakeupLesson] = useState<AttendanceEntry | null>(null);
    const [editValues, setEditValues] = useState<EditValues>({});

    const [makeUpList] = useState(() => attendanceList.filter(e => e.status === '振替'));
    const regularList = attendanceList.filter(e => e.status !== '振替');

    const handleChange = (field: keyof EditValues, value: string) => {
        setEditValues(prev => ({ ...prev, [field]: value }));
    };



    const handleSaveClick = async (listType: 'makeup' | 'regular') => {
        try {
            let originalEntry: AttendanceEntry | null = null;

            if (listType === 'makeup') {
                if (editingIndexMakeup === null || !editingMakeupLesson) {
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

            const selectedTeacher = teachers.find(t => t.code === editValues.teacherCode);

            const student = {
                studentId: editValues.studentId ?? '',
                name: editValues.studentName ?? originalEntry.student?.name ?? studentName ?? '',
                subject: editValues.subject ?? '',
                status: editValues.status ?? '',
                seat: editValues.seat ?? '',
                grade: editValues.grade ?? '',
                classType: editValues.classType ?? originalEntry.classType ?? '',
                duration: editValues.duration ?? originalEntry.duration ?? '',
                teacher:
                    editValues.status === '予定'
                        ? {
                            code: editValues.teacherCode ?? '',
                            name: selectedTeacher ? `${selectedTeacher.lastName} ${selectedTeacher.firstName}` : '',
                        }
                        : null,
            };

            const oldPeriodKey = getPeriodKey(periodLabels, originalEntry.periodLabel);
            const periodIndex = periodLabels.findIndex(p => p.label === editValues.periodLabel);
            const newPeriodKey = `period${periodIndex + 1}`;

            const targetStudentId = String(editValues.studentId).trim();

            if (editValues.date) {
                const oldDocId = buildDailyDocId(classroomCode, originalEntry.date);
                const newDocId = buildDailyDocId(classroomCode, editValues.date);

                // 🔽 振替 → 通常への変更だった場合、元の振替データを削除
                const oldPeriod = originalEntry.period;

                if (originalEntry.status === '予定' && editValues.status === '振替') {
                    let oldData = await fetchScheduleDoc('dailySchedules', oldDocId);
                    if (!oldData) {
                        const weeklyRefId = buildWeeklyDocId(classroomCode, originalEntry.date);
                        const weeklyData = await fetchScheduleDoc('weeklySchedules', weeklyRefId);
                        oldData = weeklyData || { rows: [] };
                    }

                    const updatedOldRows = (oldData.rows || []).map((row: ScheduleRow) => ({
                        ...row,
                        periods: {
                            ...row.periods,
                            [oldPeriodKey]: (row.periods?.[oldPeriodKey] || []).filter(
                                s => String(s.studentId).trim() !== targetStudentId
                            ),
                        },
                    }));

                    await saveScheduleDoc('dailySchedules', oldDocId, { ...oldData, rows: updatedOldRows });
                }
                if (originalEntry.status === '未定' && editValues.status === '振替') {
                    let oldData = await fetchScheduleDoc('dailySchedules', oldDocId);
                    if (!oldData) {
                        const weeklyRefId = buildWeeklyDocId(classroomCode, originalEntry.date);
                        const weeklyData = await fetchScheduleDoc('weeklySchedules', weeklyRefId);
                        oldData = weeklyData || { rows: [] };
                    }

                    const updatedOldRows = (oldData.rows || []).map((row: ScheduleRow) => ({
                        ...row,
                        periods: {
                            ...row.periods,
                            [oldPeriodKey]: (row.periods?.[oldPeriodKey] || []).filter(
                                s => String(s.studentId).trim() !== targetStudentId
                            ),
                        },
                    }));

                    await saveScheduleDoc('dailySchedules', oldDocId, { ...oldData, rows: updatedOldRows });
                }


                const noChange =
                    editValues.date === originalEntry.date &&
                    editValues.periodLabel === originalEntry.periodLabel &&
                    editValues.status === originalEntry.status &&
                    editValues.teacherCode === originalEntry.teacher?.code;

                if (noChange) {
                    showErrorToast('変更はありません');
                    return;
                }
                let newData = await fetchScheduleDoc('dailySchedules', newDocId);
                if (!newData) {
                    const weeklyRefId = buildWeeklyDocId(classroomCode, editValues.date);
                    const weeklyData = await fetchScheduleDoc('weeklySchedules', weeklyRefId);
                    newData = weeklyData || { rows: [] };
                    await createScheduleFromWeeklyTemplate('dailySchedules', newDocId, weeklyRefId, newData);
                }

                const newPeriodStudents = newData?.rows?.flatMap((row: ScheduleRow) =>
                    row.periods?.[newPeriodKey] || []
                ) || [];

                const isDuplicate = newPeriodStudents.some((s: StudentInfo) =>
                    String(s.studentId).trim() === targetStudentId &&
                    !(editValues.date === originalEntry.date && editValues.periodLabel === originalEntry.periodLabel)
                );

                if (isDuplicate) {
                    showErrorToast('既に授業が入っているため変更できません');
                    return;
                }

                let oldData = await fetchScheduleDoc('dailySchedules', oldDocId);
                console.log('🟢 oldData (before fallback):', oldData);
                if (!oldData) {
                    const weeklyRefId = buildWeeklyDocId(classroomCode, originalEntry.date);
                    const weeklyData = await fetchScheduleDoc('weeklySchedules', weeklyRefId);
                    console.log('🟢 weeklyData (fallback):', weeklyData);
                    oldData = weeklyData || { rows: [] };
                }
                console.log('oldPeriodKey:', oldPeriodKey);
                console.log('targetStudentId:', targetStudentId);
                console.log('🟢 final oldData used:', oldData);
                const isSameDate = oldDocId === newDocId;

                if (isSameDate) {
                    // 🔁 同じ日付の場合 → newData.rows を直接編集（削除 + 追加）
                    const updatedRows = (newData.rows || []).map((row: ScheduleRow) => {
                        if (row.periods?.[oldPeriodKey]) {
                            return {
                                ...row,
                                periods: {
                                    ...row.periods,
                                    [oldPeriodKey]: (row.periods[oldPeriodKey] || []).filter(
                                        s => String(s.studentId).trim() !== targetStudentId
                                    ),
                                }
                            };
                        }
                        return row;
                    });

                    newData.rows = updatedRows;
                }
                else {
                    // 📅 日付が異なる → oldDataに削除だけして保存
                    const updatedOldRows = (oldData.rows || []).map((row: ScheduleRow) => ({
                        ...row,
                        periods: {
                            ...row.periods,
                            [oldPeriodKey]: (row.periods?.[oldPeriodKey] || []).filter(
                                s => String(s.studentId).trim() !== targetStudentId
                            ),
                        },
                    }));
                    await saveScheduleDoc('dailySchedules', oldDocId, { ...oldData, rows: updatedOldRows });
                }

                if (editValues.status === '振替') {
                    console.log("✅ saveMakeupLesson に渡す student:", student);
                    await saveMakeupLesson(
                        String(editValues.studentId).trim(),
                        newDocId,
                        {
                            student,
                            periodKey: newPeriodKey,
                            period: periodIndex,
                            date: editValues.date,
                            status: editValues.status,
                        }
                    );

                } else {
                    const grouped = [...(newData.rows || [])];
                    let inserted = false;

                    for (let i = 0; i < grouped.length; i++) {
                        const row = grouped[i];
                        const isSameGroup =
                            (['未定', '振替', '欠席'].includes(editValues.status ?? '') && row.status === editValues.status) ||
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

                    if (editValues.status === '予定') {
                        // 🔍 classTypeによる定員チェック
                        const targetClassType = student.classType;
                        const currentRow = (newData.rows || []).find((row: ScheduleRow) =>
                            row.teacher?.code === editValues.teacherCode
                        );

                        const existing = currentRow?.periods?.[newPeriodKey] || [];

                        const allClassTypes = [...existing.map((s: StudentInfo) => s.classType), targetClassType];
                        const uniqueTypes = Array.from(new Set(allClassTypes));
                        const count = existing.length + 1;

                        const isOnly = (type: string) => uniqueTypes.length === 1 && uniqueTypes[0] === type;

                        const isMixedAllowed =
                            (uniqueTypes.every(t => t === '2名クラス' || t === '演習クラス') && count <= 2) ||
                            (isOnly('演習クラス') && count <= 6) ||
                            (isOnly('1名クラス') && count <= 1);


                        if (!isMixedAllowed) {
                            showErrorToast('classTypeによる定員制限または混在制限により追加できません');
                            return;
                        }
                    }

                    if (originalEntry.status === '振替' && editValues.status !== '振替') {
                        await removeFromMakeupLessons(targetStudentId, originalEntry.date, oldPeriod, classroomCode);

                        // ✅ アーカイブ用に移動させる
                        await moveMakeupLessonToArchive(targetStudentId, originalEntry.date, originalEntry, classroomCode);
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

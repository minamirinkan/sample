// utils/timetable/fetchTimetableData.js

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getDateKey, getWeekdayIndex } from '../dateUtils';
import { parseTimetableSnapshot } from './parseTimetableSnapshot';

export async function fetchTimetableData(selectedDate, classroomCode) {
    const dateKey = getDateKey(selectedDate);

    // === 教室名取得 ===
    let classroomName = '';
    const classroomSnap = await getDoc(doc(db, 'classrooms', classroomCode));
    if (classroomSnap.exists()) {
        classroomName = classroomSnap.data().name ?? '';
    }

    // === rows 取得 ===
    let rows = [];

    if (selectedDate.type === 'date') {
        const dailySnap = await getDoc(doc(db, 'dailySchedules', `${classroomCode}_${dateKey}`));
        if (dailySnap.exists()) {
            rows = parseTimetableSnapshot(dailySnap).rows;
        } else {
            const weekdayIndex = getWeekdayIndex(selectedDate);
            const weeklySnap = await getDoc(doc(db, 'weeklySchedules', `${classroomCode}_${weekdayIndex}`));
            if (weeklySnap.exists()) {
                rows = parseTimetableSnapshot(weeklySnap).rows;
            }
        }
    } else {
        const weekdayIndex = getWeekdayIndex(selectedDate);
        const weeklySnap = await getDoc(doc(db, 'weeklySchedules', `${classroomCode}_${weekdayIndex}`));
        if (weeklySnap.exists()) {
            rows = parseTimetableSnapshot(weeklySnap).rows;
        }
    }

    // === periodLabels 取得 ===
    let periodLabels = [];
    const schoolLabelsSnap = await getDoc(doc(db, 'periodLabelsBySchool', classroomCode));
    if (schoolLabelsSnap.exists()) {
        periodLabels = schoolLabelsSnap.data().periodLabels;
    } else {
        const commonLabelsSnap = await getDoc(doc(db, 'common', 'periodLabels'));
        if (commonLabelsSnap.exists()) {
            periodLabels = commonLabelsSnap.data().periodLabels;
        }
    }

    if (!rows || rows.length === 0) {
        rows = [{ teacher: '', periods: Array(8).fill([]).map(() => []), status: '予定' }];
    }

    return {
        rows,
        periodLabels,
        classroomName
    };
}

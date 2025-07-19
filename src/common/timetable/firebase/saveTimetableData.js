// utils/timetable/saveTimetableData.js

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { getDateKey, getWeekdayIndex } from '../../dateUtils';
import { flattenRows } from '../utils/flattenRows';

export async function saveTimetableData(selectedDate, classroomCode, rows) {
    const isDate = selectedDate.type === 'date';

    let docRef;
    if (isDate) {
        docRef = doc(
            db,
            'dailySchedules',
            `${classroomCode}_${getDateKey(selectedDate)}`
        );
    } else {
        const weekdayIndex = getWeekdayIndex(selectedDate);
        docRef = doc(
            db,
            'weeklySchedules',
            `${classroomCode}_${weekdayIndex}`
        );
    }

    const safeData = {
        rows: flattenRows(rows),
        updatedAt: new Date()
    };

    try {
        await setDoc(docRef, safeData);
    } catch (error) {
        console.error('保存エラー:', error);
        throw error;
    }
}

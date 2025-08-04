// utils/timetable/saveTimetableData.js

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { getDateKey, getWeekdayIndex } from '../../dateUtils';
import { flattenRows } from '../utils/flattenRows';
import { SelectedDate } from '../../../contexts/types/data';
import { RowData } from '../../../contexts/types/timetablerow';

export const saveTimetableData = async (
    selectedDate: SelectedDate,
    classroomCode: string,
    rows: RowData[]
  ): Promise<void> => {
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

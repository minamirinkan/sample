// === Firestore の時間割取得・保存ユーティリティ ===

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  getDateKey,
  getWeekdayIndex
} from '../dateUtils';

/**
 * === ✅ 保存 ===
 * 日付: dailySchedules/{classroomCode}_{dateKey}
 * 曜日: weekdaySchedules/{classroomCode}-{weekdayIndex}
 * 🔑 生徒データに必ず grade を含める
 */
export async function saveTimetableData(selectedDate, classroomCode, rows, periodLabels) {
  const isDate = selectedDate.type === 'date';

  if (isDate) {
    const dateKey = getDateKey(selectedDate);
    const docId = `${classroomCode}_${dateKey}`;
    const ref = doc(db, 'dailySchedules', docId);

    const safeRows = rows.map(row => {
      const periodsObj = {};
      row.periods?.forEach((students, idx) => {
        periodsObj[`period${idx + 1}`] = students.map(student => ({
          id: student?.studentId ?? student?.id ?? '',
          name: student?.name ?? '',
          grade: student?.grade ?? '', // ✅ grade を必ず含める！
          seat: student?.seat ?? '',
          subject: student?.subject ?? '',
          status: student?.status ?? '予定'
        }));
      });
      return {
        teacher: {
          id: row.teacher?.code ?? row.teacher?.id ?? '',
          name: row.teacher?.name ?? '',
          status: row.teacher?.status ?? '出勤'
        },
        periods: periodsObj
      };
    });

    await setDoc(ref, { rows: safeRows });

  } else {
    const weekdayIndex = getWeekdayIndex(selectedDate);
    const docId = `${classroomCode}-${weekdayIndex}`;
    const ref = doc(db, 'weekdaySchedules', docId);

    await setDoc(ref, { periodLabels: periodLabels ?? [] });
  }
}

/**
 * === ✅ 取得 ===
 * rows: dailySchedules → teacher & periods を完全整形
 * periodLabels: periodLabelsBySchool → common fallback
 * 🔑 生徒データに必ず grade を含めて戻す
 */
export async function fetchTimetableData(selectedDate, classroomCode) {
  const isDate = selectedDate.type === 'date';
  let rows = [];
  let periodLabels = [];

  if (isDate) {
    const dateKey = getDateKey(selectedDate);
    const docId = `${classroomCode}_${dateKey}`;
    const ref = doc(db, 'dailySchedules', docId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      rows = data.rows?.map(row => {
        const periods = [];
        for (let i = 1; i <= 8; i++) {
          const students = row.periods?.[`period${i}`] ?? [];
          periods.push(
            students.map(s => ({
              id: s.id ?? '',
              name: s.name ?? '',
              grade: s.grade ?? '', // ✅ grade を復元
              seat: s.seat ?? '',
              subject: s.subject ?? '',
              status: s.status ?? '予定'
            }))
          );
        }
        return {
          teacher: {
            id: row.teacher?.id ?? '',
            name: row.teacher?.name ?? '',
            status: row.teacher?.status ?? '出勤'
          },
          periods
        };
      }) ?? [];
    }
  }

  // === periodLabels: School → Common fallback ===
  const schoolRef = doc(db, 'periodLabelsBySchool', classroomCode);
  const schoolSnap = await getDoc(schoolRef);

  if (schoolSnap.exists()) {
    periodLabels = schoolSnap.data().periodLabels ?? [];
  } else {
    const commonRef = doc(db, 'common', 'periodLabels');
    const commonSnap = await getDoc(commonRef);
    if (commonSnap.exists()) {
      periodLabels = commonSnap.data().periodLabels ?? [];
    }
  }

  if (rows.length === 0 && isDate) {
    rows = [{
      teacher: { id: '', name: '', status: '出勤' },
      periods: Array(8).fill([]).map(() => [])
    }];
  }

  return {
    rows,
    periodLabels
  };
}

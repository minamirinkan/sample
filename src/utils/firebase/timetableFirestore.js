// === Firestore の時間割取得・保存ユーティリティ ===

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  getDateKey,
  getWeekdayIndex,
  getYearMonthKey,
  getPreviousYearMonth
} from '../dateUtils';

/**
 * === 並列取得版 ===
 * 日付 → dailySchedules/{code}_{dateKey}
 * 曜日 → 履歴を 12ヶ月分一括 Promise.all
 */
export async function fetchTimetableData(selectedDate, classroomCode) {
  const dateKey = getDateKey(selectedDate);

  // === ✅ 修正: 日付の場合の読み取り先を dailySchedules に変更 ===
  if (selectedDate.type === 'date') {
    const snap = await getDoc(
      doc(db, 'dailySchedules', `${classroomCode}_${dateKey}`)
    );
    if (snap.exists()) {
      return { ...parseData(snap) };
    }
  }

  // === 曜日テンプレ履歴（従来どおり）
  const weekdayIndex = getWeekdayIndex(selectedDate);
  const maxLookback = 12;
  const ids = [];
  let ym = getYearMonthKey(selectedDate);
  for (let i = 0; i < maxLookback; i++) {
    ids.push(`${ym}-${weekdayIndex}`);
    ym = getPreviousYearMonth(ym);
  }

  const promises = ids.map(id =>
    getDoc(doc(db, 'classrooms', classroomCode, 'weekdayTemplates', id))
  );

  const snaps = await Promise.all(promises);
  const found = snaps.find(snap => snap.exists());
  if (found) return { ...parseData(found) };

  // 見つからない場合の初期値
  return {
    rows: [{ teacher: '', periods: Array(8).fill([]).map(() => []), status: '予定' }],
    periodLabels: []
  };
}

/**
 * === 保存ロジック ===
 * 日付 → dailySchedules/{code}_{dateKey}
 * 曜日 → 従来の weekdayTemplates
 */
export async function saveTimetableData(selectedDate, classroomCode, rows, periodLabels) {
  const isDate = selectedDate.type === 'date';

  let docRef;
  if (isDate) {
    // === ✅ 修正: 保存先を dailySchedules に変更 ===
    docRef = doc(
      db,
      'dailySchedules',
      `${classroomCode}_${getDateKey(selectedDate)}`
    );
  } else {
    const ymKey = getYearMonthKey(selectedDate);
    const weekdayIndex = getWeekdayIndex(selectedDate);
    const docId = `${ymKey}-${weekdayIndex}`;
    docRef = doc(db, 'classrooms', classroomCode, 'weekdayTemplates', docId);
  }

  const flattenedRows = rows.map((row) => {
    const rowStatus = row.status ?? '予定';

    const flatPeriods = {};
    row.periods?.forEach((students, idx) => {
      flatPeriods[`period${idx + 1}`] = students.map(student => ({
        studentId: student?.studentId ?? '',
        grade: student?.grade ?? '',
        name: student?.name ?? '',
        seat: student?.seat ?? '',
        subject: student?.subject ?? '',
        status: rowStatus
      }));
    });

    return {
      teacher: row.teacher && (row.teacher.code || row.teacher.name)
        ? {
            code: row.teacher.code ?? '',
            name: row.teacher.name ?? ''
          }
        : null,
      periods: flatPeriods,
      status: rowStatus
    };
  });

  const safeData = {
    rows: flattenedRows,
    periodLabels: periodLabels ?? [],
    updatedAt: new Date()
  };

  try {
    await setDoc(docRef, safeData);
  } catch (error) {
    console.error(error);
  }
}

/**
 * === Firestore snapshot を JSオブジェクトに変換 ===
 */
function parseData(snap) {
  const data = snap.data();
  const rows = data.rows.map((row) => {
    const periodsArray = [];
    for (let i = 1; i <= 8; i++) {
      const periodKey = `period${i}`;
      const students = row.periods?.[periodKey] || [];
      periodsArray.push(
        students.map((s) => ({
          studentId: s.studentId ?? '',
          grade: s.grade ?? '',
          name: s.name ?? '',
          seat: s.seat ?? '',
          subject: s.subject ?? '',
        }))
      );
    }
    return {
      teacher: row.teacher || null,
      periods: periodsArray,
      status: row.status || '予定'
    };
  });

  return {
    rows,
    periodLabels: data.periodLabels
  };
}

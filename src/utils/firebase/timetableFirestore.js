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
 * 日付 → その日を直接
 * 曜日 → 履歴を 12ヶ月分一括 Promise.all
 */
export async function fetchTimetableData(selectedDate, classroomCode) {
  const dateKey = getDateKey(selectedDate);
  const classroomRef = doc(db, 'classrooms', classroomCode);
  const classroomSnap = await getDoc(classroomRef);
  const classroomName = classroomSnap.exists() ? classroomSnap.data().name : '教室名不明';

  // 日付データ
  if (selectedDate.type === 'date') {
    const snap = await getDoc(
      doc(db, 'classrooms', classroomCode, 'timetables', dateKey)
    );
    if (snap.exists()) return { ...parseData(snap), classroomName };
  }

  // 曜日テンプレ履歴 → 並列取得
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
  if (found) return { ...parseData(found), classroomName };

  // 見つからない場合の初期値
  return {
    rows: [{ teacher: '', periods: Array(8).fill([]).map(() => []) }],
    classroomName,
  };
}

/**
 * === 保存ロジック ===
 * 日付か履歴付き曜日テンプレかを自動判定
 */
export async function saveTimetableData(selectedDate, classroomCode, rows, periodLabels) {
  const isDate = selectedDate.type === 'date';

  let docRef;
  if (isDate) {
    docRef = doc(
      db,
      'classrooms',
      classroomCode,
      'timetables',
      getDateKey(selectedDate)
    );
  } else {
    const ymKey = getYearMonthKey(selectedDate);
    const weekdayIndex = getWeekdayIndex(selectedDate);
    const docId = `${ymKey}-${weekdayIndex}`;
    docRef = doc(db, 'classrooms', classroomCode, 'weekdayTemplates', docId);
  }

  // ✅ すべての rows を flatten
  const flattenedRows = rows.map((row) => {
    const flat = {};
    row.periods.forEach((p, idx) => {
      flat[`period${idx + 1}`] = p;
    });
    return { teacher: row.teacher, periods: flat };
  });

  await setDoc(docRef, { rows: flattenedRows, periodLabels });
}


/**
 * === Firestore snapshot を JSオブジェクトに変換 ===
 */
function parseData(snap) {
  const data = snap.data();
  const rows = data.rows.map((row) => {
    const periodsArray = [];
    for (let i = 1; i <= 8; i++) {
      periodsArray.push(row.periods?.[`period${i}`] || []);
    }
    return { teacher: row.teacher, periods: periodsArray };
  });
  return { rows, periodLabels: data.periodLabels };
}

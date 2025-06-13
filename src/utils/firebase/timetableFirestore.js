// src/utils/firebase/timetableFirestore.js
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getDateKey, getWeekdayIndex } from '../dateUtils';

export async function fetchTimetableData(selectedDate, classroomCode) {
  const dateKey = getDateKey(selectedDate);
  const ref = doc(db, 'classrooms', classroomCode);
  const classroomSnap = await getDoc(ref);
  const classroomName = classroomSnap.exists() ? classroomSnap.data().name : '教室名不明';

  // Try: 日付データ
  if (selectedDate.type === 'date') {
    const snap = await getDoc(doc(db, 'classrooms', classroomCode, 'timetables', dateKey));
    if (snap.exists()) return { ...parseData(snap), classroomName };
  }

  // Fallback: 曜日テンプレート
  const weekdayIndex = getWeekdayIndex(selectedDate);
  const fallbackSnap = await getDoc(doc(db, 'classrooms', classroomCode, 'weekdayTemplates', String(weekdayIndex)));
  if (fallbackSnap.exists()) return { ...parseData(fallbackSnap), classroomName };

  return {
    rows: [{ teacher: '', periods: Array(8).fill([]).map(() => []) }],
    classroomName,
  };
}

export async function saveTimetableData(selectedDate, classroomCode, rows, periodLabels) {
  const isDate = selectedDate.type === 'date';
  const docRef = isDate
    ? doc(db, 'classrooms', classroomCode, 'timetables', getDateKey(selectedDate))
    : doc(db, 'classrooms', classroomCode, 'weekdayTemplates', String(getWeekdayIndex(selectedDate)));

  const flattenedRows = rows.map((row) => {
    const flat = {};
    row.periods.forEach((p, idx) => {
      flat[`period${idx + 1}`] = p;
    });
    return { teacher: row.teacher, periods: flat };
  });

  await setDoc(docRef, { rows: flattenedRows, periodLabels });
}

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

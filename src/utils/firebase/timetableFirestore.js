// === Firestore の時間割取得・保存ユーティリティ ===

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  getDateKey,
  getWeekdayIndex,
  getYearMonthKey,
  getPreviousYearMonth
} from '../dateUtils';

// === 共通：週次キー作成 ===
function getWeeklyDocId(selectedDate, classroomCode) {
  const date = new Date(
    selectedDate.year,
    selectedDate.month - 1,
    selectedDate.date || 1
  );
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const weekdayIndex = getWeekdayIndex(selectedDate);
  return `${classroomCode}_${yyyy}-${mm}_${weekdayIndex}`;
}

// === 過去から直近の週次テンプレートIDを検索 ===
async function findLatestWeeklyDoc(selectedDate, classroomCode) {
  const weekdayIndex = getWeekdayIndex(selectedDate);
  let ym = getYearMonthKey(selectedDate);
  const maxLookback = 12;
  const ids = [];
  for (let i = 0; i < maxLookback; i++) {
    ids.push(`${classroomCode}_${ym}_${weekdayIndex}`);
    ym = getPreviousYearMonth(ym);
  }
  const snaps = await Promise.all(
    ids.map(id => getDoc(doc(db, 'weeklySchedules', id)))
  );
  return snaps.find(snap => snap.exists());
}

/**
 * === 日付 or 曜日テンプレを Firestore から取得 ===
 * 日付 → dailySchedules/{code}_{dateKey}
 * 曜日 → weeklySchedules/{code-yyyy-mm-weekdayIndex}
 * periodLabels → periodLabelsBySchool > fallback common
 * classroomName → classrooms/{code}.name
 */
export async function fetchTimetableData(selectedDate, classroomCode) {
  const dateKey = getDateKey(selectedDate);
  const weeklyDocId = getWeeklyDocId(selectedDate, classroomCode);

  // === ✅ 教室名を必ず取得 ===
  let classroomName = '';
  const classroomSnap = await getDoc(doc(db, 'classrooms', classroomCode));
  if (classroomSnap.exists()) {
    classroomName = classroomSnap.data().name ?? '';
  }

  // === rows ===
  let rows = [];

  if (selectedDate.type === 'date') {
    // 日別スケジュールを取得
    const dailySnap = await getDoc(
      doc(db, 'dailySchedules', `${classroomCode}_${dateKey}`)
    );
    if (dailySnap.exists()) {
      rows = parseData(dailySnap).rows;
    } else {
      // フォールバックで曜日スケジュールを取得
      const fallbackSnap = await findLatestWeeklyDoc(selectedDate, classroomCode);
      if (fallbackSnap) {
        rows = parseData(fallbackSnap).rows;
      }
    }
  } else {
    // type !== 'date' → 直接 weeklySchedules を使用
    const weeklySnap = await getDoc(
      doc(db, 'weeklySchedules', weeklyDocId)
    );
    if (weeklySnap.exists()) {
      rows = parseData(weeklySnap).rows;
    } else {
      const fallbackSnap = await findLatestWeeklyDoc(selectedDate, classroomCode);
      if (fallbackSnap) {
        rows = parseData(fallbackSnap).rows;
      }
    }
  }

  // === periodLabels ===
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

  // === 空なら初期値を入れる ===
  if (!rows || rows.length === 0) {
    rows = [{ teacher: '', periods: Array(8).fill([]).map(() => []), status: '予定' }];
  }

  return {
    rows,
    periodLabels,
    classroomName
  };
}

/**
 * === 保存 ===
 * 日付: dailySchedules/{code}_{dateKey}
 * 曜日: weeklySchedules/{code-yyyy-mm-weekdayIndex}
 * periodLabels は保存しない
 */
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
    const weeklyDocId = getWeeklyDocId(selectedDate, classroomCode);
    docRef = doc(
      db,
      'weeklySchedules',
      weeklyDocId
    );
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
    updatedAt: new Date()
    // ✅ periodLabels は保存しない
  };

  try {
    await setDoc(docRef, safeData);
  } catch (error) {
    console.error(error);
  }
}

/**
 * === snapshot → rows 変換 ===
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

  return { rows };
}

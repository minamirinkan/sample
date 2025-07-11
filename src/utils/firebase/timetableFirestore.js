// === Firestore の時間割取得・保存ユーティリティ ===

import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  getDateKey,
  getWeekdayIndex,
  getYearMonthKey,
  getPreviousYearMonth
} from '../dateUtils';

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

export async function fetchTimetableData(selectedDate, classroomCode) {
  const dateKey = getDateKey(selectedDate);
  const weeklyDocId = getWeeklyDocId(selectedDate, classroomCode);
  let classroomName = '';
  const classroomSnap = await getDoc(doc(db, 'classrooms', classroomCode));
  if (classroomSnap.exists()) {
    classroomName = classroomSnap.data().name ?? '';
  }

  let rows = [];
  if (selectedDate.type === 'date') {
    const dateStr = getDateKey(selectedDate); // 例: "2025-07-16"
    const day = selectedDate.day ?? selectedDate.date;
    const dateObj = new Date(selectedDate.year, selectedDate.month - 1, day);
    const weekdayIndex = dateObj.getDay(); // 0=日, ..., 6=土
    const dailyDocId = `${classroomCode}_${dateStr}_${weekdayIndex}`;
    const dailySnap = await getDoc(doc(db, 'dailySchedules', dailyDocId));

    if (dailySnap.exists()) {
      rows = parseData(dailySnap).rows;
    } else {
      const fallbackSnap = await findLatestWeeklyDoc(selectedDate, classroomCode);
      if (fallbackSnap) rows = parseData(fallbackSnap).rows;
    }
  } else {
    const weeklySnap = await getDoc(doc(db, 'weeklySchedules', weeklyDocId));
    if (weeklySnap.exists()) {
      rows = parseData(weeklySnap).rows;
    } else {
      const fallbackSnap = await findLatestWeeklyDoc(selectedDate, classroomCode);
      if (fallbackSnap) rows = parseData(fallbackSnap).rows;
    }
  }

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

  // === 🔍 振替データの取得 ===
  if (selectedDate.type === 'date') {
    const dateStr = getDateKey(selectedDate);
    const makeupDocId = `${classroomCode}_${dateStr}`;
    const makeupRows = [];
    const allStudentsSnap = await getDocs(collection(db, 'students'));
    for (const studentDoc of allStudentsSnap.docs) {
      const studentId = studentDoc.id;
      const prefix = studentId.slice(1, 4);
      if (prefix !== classroomCode) continue;

      const makeupDocRef = doc(db, 'students', studentId, 'makeupLessons', makeupDocId);
      const makeupSnap = await getDoc(makeupDocRef);
      if (makeupSnap.exists()) {
        const lessons = makeupSnap.data().lessons || [];
        if (makeupRows.length === 0) {
          makeupRows.push({
            teacher: null,
            periods: Array(8).fill().map(() => []),
            status: '振替'
          });
        }
        for (const lesson of lessons) {
          const idx = lesson.period - 1;
          if (!makeupRows[0].periods[idx].some(s => s.studentId === lesson.studentId && s.subject === lesson.subject)) {
            makeupRows[0].periods[idx].push({
              studentId: lesson.studentId ?? '',
              grade: lesson.grade ?? '',
              name: lesson.name ?? '',
              seat: lesson.seat ?? '',
              subject: lesson.subject ?? '',
              classType: lesson.classType ?? '',
              duration: lesson.duration ?? '',
              status: '振替'
            });
          }
        }
      }
    }
    if (makeupRows.length > 0) {
      console.log('📦 振替取得:', makeupRows);
      rows.push(...makeupRows);
    } else {
      console.log('ℹ️ 振替データなし');
    }
  }

  if (!rows || rows.length === 0) {
    rows = [{ teacher: '', periods: Array(8).fill([]).map(() => []), status: '予定' }];
  }

  console.log('✅ 取得完了 rows:', rows);

  return {
    rows,
    periodLabels,
    classroomName
  };
}

export async function saveTimetableData(selectedDate, classroomCode, rows) {
  const isDate = selectedDate.type === 'date';
  let docRef;
  if (isDate) {
    const dateStr = getDateKey(selectedDate); // "2025-07-16"
    const day = selectedDate.day ?? selectedDate.date;
    const dateObj = new Date(selectedDate.year, selectedDate.month - 1, day);
    const weekdayIndex = dateObj.getDay(); // 0〜6

    const docId = `${classroomCode}_${dateStr}_${weekdayIndex}`;
    docRef = doc(db, 'dailySchedules', docId);
  }
  else {
    const weeklyDocId = getWeeklyDocId(selectedDate, classroomCode);
    docRef = doc(db, 'weeklySchedules', weeklyDocId);
  }

  const makeupStudents = [];
  const flattenedRows = rows.filter(row => {
    if (row.status === '振替') {
      row.periods.forEach((students, idx) => {
        students.forEach((student) => {
          if (student?.studentId) {
            makeupStudents.push({
              ...student,
              period: idx + 1
            });
          }
        });
      });
      return false;
    }
    return true;
  }).map((row) => {
    const rowStatus = row.status ?? '予定';
    const flatPeriods = {};
    row.periods?.forEach((students, idx) => {
      flatPeriods[`period${idx + 1}`] = students.map(student => ({
        studentId: student?.studentId ?? '',
        grade: student?.grade ?? '',
        name: student?.name ?? '',
        seat: student?.seat ?? '',
        subject: student?.subject ?? '',
        classType: student?.classType ?? '',
        duration: student?.duration ?? '',
        status: rowStatus
      }));
    });
    return {
      teacher: row.teacher && (row.teacher.code || row.teacher.name)
        ? { code: row.teacher.code ?? '', name: row.teacher.name ?? '' }
        : null,
      periods: flatPeriods,
      status: rowStatus
    };
  });

  try {
    await setDoc(docRef, { rows: flattenedRows, updatedAt: new Date() });
  } catch (error) {
    console.error('❌ 保存エラー:', error);
  }

  const dateStr = getDateKey(selectedDate);
  const makeupDocId = `${classroomCode}_${dateStr}`;
  for (const student of makeupStudents) {
    const makeupDocRef = doc(db, 'students', student.studentId, 'makeupLessons', makeupDocId);
    try {
      const snap = await getDoc(makeupDocRef);
      const existingLessons = snap.exists() ? snap.data().lessons || [] : [];
      const alreadyExists = existingLessons.some(l => l.period === student.period && l.studentId === student.studentId && l.subject === student.subject);
      if (!alreadyExists) {
        existingLessons.push({
          period: student.period,
          subject: student.subject,
          seat: student.seat,
          name: student.name,
          grade: student.grade,
          studentId: student.studentId,
          classType: student.classType ?? '',
          duration: student.duration ?? '',
          status: '振替'
        });
        await setDoc(makeupDocRef, { lessons: existingLessons });
        console.log('✅ 振替保存成功:', student.studentId, makeupDocId);
      } else {
        console.log('⏩ 振替重複スキップ:', student.studentId, makeupDocId);
      }
    } catch (err) {
      console.error('❌ 振替保存エラー:', student.studentId, err);
    }
  }
}

function parseData(snap) {
  const data = snap.data();
  return {
    rows: data.rows.map((row) => {
      const periodsArray = [];
      for (let i = 1; i <= 8; i++) {
        const periodKey = `period${i}`;
        const students = row.periods?.[periodKey] || [];
        periodsArray.push(students.map((s) => ({
          studentId: s.studentId ?? '',
          grade: s.grade ?? '',
          name: s.name ?? '',
          seat: s.seat ?? '',
          subject: s.subject ?? '',
          classType: s.classType ?? '',
          duration: s.duration ?? ''
        })));
      }
      return {
        teacher: row.teacher || null,
        periods: periodsArray,
        status: row.status || '予定'
      };
    })
  };
}

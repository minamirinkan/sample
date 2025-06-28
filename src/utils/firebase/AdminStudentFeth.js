import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  getDateKey,
  getWeekdayIndex,
  getYearMonthKey,
  getPreviousYearMonth
} from '../dateUtils';

function findLatestWeeklyDoc(selectedDate, classroomCode, cachedWeeklyDocs) {
  const weekdayIndex = getWeekdayIndex(selectedDate);
  let ym = getYearMonthKey(selectedDate);
  const maxLookback = 12;

  for (let i = 0; i < maxLookback; i++) {
    const weeklyDocId = `${classroomCode}_${ym}_${weekdayIndex}`;
    if (cachedWeeklyDocs.has(weeklyDocId)) {
      const snap = cachedWeeklyDocs.get(weeklyDocId);
      if (snap.exists()) return snap;
    }
    ym = getPreviousYearMonth(ym);
  }
  return null;
}

export async function fetchCustomerEvents(user, startDate, endDate, selectedStudentId) {
  const result = {
    studentIds: [],
    matchedLessons: [],
    events: [],
    makeupCount: 0,
  };

  try {
    if (!user || !selectedStudentId) throw new Error("未ログインまたは生徒未選択");

    const ids = [selectedStudentId];
    const classroomCode = selectedStudentId.substring(1, 4);
    console.log("\u{1F4D6} classroomCode:", classroomCode);

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

    const weeklyDocIds = [];
    const baseYM = getYearMonthKey({ year: startDate.getFullYear(), month: startDate.getMonth() + 1 });
    const weekdayIndices = [...Array(7).keys()];
    let ym = baseYM;
    for (let i = 0; i < 12; i++) {
      for (const weekdayIndex of weekdayIndices) {
        weeklyDocIds.push(`${classroomCode}_${ym}_${weekdayIndex}`);
      }
      ym = getPreviousYearMonth(ym);
    }

    const weeklySnaps = await Promise.all(
      weeklyDocIds.map(id => getDoc(doc(db, 'weeklySchedules', id)))
    );
    const cachedWeeklyDocs = new Map();
    weeklyDocIds.forEach((id, i) => cachedWeeklyDocs.set(id, weeklySnaps[i]));

    const dateList = [];
    const dateMap = {};
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const selectedDate = {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        date: d.getDate(),
        type: 'date'
      };
      const dateKey = getDateKey(selectedDate);
      const docId = `${classroomCode}_${dateKey}`;
      dateList.push(docId);
      dateMap[docId] = { dateKey, selectedDate };
    }

    const dailySnaps = await Promise.all(
      dateList.map(docId => getDoc(doc(db, 'dailySchedules', docId)))
    );

    for (let i = 0; i < dailySnaps.length; i++) {
      let snap = dailySnaps[i];
      const docId = dateList[i];
      const { dateKey, selectedDate } = dateMap[docId];

      if (!snap.exists()) {
        snap = findLatestWeeklyDoc(selectedDate, classroomCode, cachedWeeklyDocs);
        if (!snap || !snap.exists()) continue;
      }

      const rows = snap.data().rows || [];
      for (const row of rows) {
        const periods = row.periods || {};
        for (const [periodKey, periodValue] of Object.entries(periods)) {
          for (const student of periodValue) {
            if (!ids.includes(student.studentId)) continue;
            const status = student.status || '';
            if (status === '未定') continue;

            const index = parseInt(periodKey.replace('period', '')) - 1;
            const periodLabel = periodLabels[index]?.label || periodKey;
            const time = periodLabels[index]?.time || '';
            const subject = student.subject || '';
            const studentName = student.name || '';

            let title = `${periodLabel} ${subject}`;
            let color = '';
            if (status === '欠席') {
              title = `${periodLabel} 欠席`;
              color = '#FF6347';
            } else if (status === '振替') {
              title = `${periodLabel} 振替`;
              color = '#32CD32';
            }

            result.matchedLessons.push({
              date: dateKey,
              periodLabel,
              time,
              subject,
              studentName,
              status
            });

            result.events.push({
              title,
              start: dateKey,
              color: color || undefined,
              extendedProps: {
                period: periodLabel,
                time,
                subject,
                studentName,
                status
              }
            });
          }
        }
      }
    }

    for (const studentId of ids) {
      const prefix = studentId.slice(1, 4);
      if (prefix !== classroomCode) continue;

      const makeupCollection = collection(db, 'students', studentId, 'makeupLessons');
      const makeupSnaps = await getDocs(makeupCollection);

      for (const snap of makeupSnaps.docs) {
        const dateKey = snap.id;
        const lessons = snap.data().lessons || [];
        result.makeupCount += lessons.length;

        for (const lesson of lessons) {
          const index = lesson.period - 1;
          const periodLabel = periodLabels[index]?.label || `period${lesson.period}`;
          const time = periodLabels[index]?.time || '';
          const title = `${periodLabel} 振替`;

          result.matchedLessons.push({
            date: dateKey,
            periodLabel,
            time,
            subject: lesson.subject,
            studentName: lesson.name,
            status: '振替'
          });

          result.events.push({
            title,
            start: dateKey,
            color: '#32CD32',
            extendedProps: {
              period: periodLabel,
              time,
              subject: lesson.subject,
              studentName: lesson.name,
              status: '振替'
            }
          });
        }
      }
    }

    result.studentIds = ids;
    console.log("\u2705 fetchCustomerEvents 完了:", result);
    return result;
  } catch (error) {
    console.error("\u274C Firestore エラー:", error.message);
    return result;
  }
}

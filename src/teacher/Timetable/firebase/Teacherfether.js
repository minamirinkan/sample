import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import {
  getDateKey,
  getWeekdayIndex,
  getYearMonthKey,
  getPreviousYearMonth
} from '../../../common/dateUtils';

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

export async function fetchTeacherEvents(user, startDate, endDate) {
  const result = {
    matchedLessons: [],
    events: [],
  };

  try {
    if (!user) throw new Error("未ログイン");

    const teacherSnap = await getDoc(doc(db, 'teachers', user.uid));
    if (!teacherSnap.exists()) throw new Error("teacher ドキュメントが見つかりません");

    const teacherCode = teacherSnap.data().code;
    if (!teacherCode) throw new Error("teacherCode が undefined です");

    const classroomCode = teacherCode.slice(1, 4);

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
      const teachingList = [];

      for (const row of rows) {
        const rowTeacher = row.teacher;
        if (!rowTeacher || rowTeacher.code !== teacherCode) continue;

        const periods = row.periods || {};
        for (const [periodKey, periodValue] of Object.entries(periods)) {
          const periodIndex = parseInt(periodKey.replace('period', '')) - 1;
          const periodLabel = periodLabels[periodIndex]?.label || periodKey;
          const time = periodLabels[periodIndex]?.time || '';

          for (const student of periodValue) {
            const subject = student.subject || '';
            const grade = student.grade || '';
            teachingList.push({ periodIndex, periodLabel, time, subject, grade });
          }
        }
      }

      if (teachingList.length === 0) continue;

      // 範囲ラベル作成
      const periodIndices = teachingList.map(t => t.periodIndex);
      const minPeriod = Math.min(...periodIndices) + 1;
      const maxPeriod = Math.max(...periodIndices) + 1;
      const periodRange = (minPeriod === maxPeriod)
        ? `${minPeriod}限`
        : `${minPeriod}～${maxPeriod}限`;

      result.events.push({
        title: periodRange,
        start: dateKey,
        extendedProps: {
          periodRange,
          teachingList
        }
      });

      result.matchedLessons.push(...teachingList.map(t => ({
        date: dateKey,
        ...t
      })));
    }

    return result;
  } catch (error) {
    console.error("❌ Firestore エラー:", error.message);
    return result;
  }
}

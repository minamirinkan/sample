// src/utils/firebase/EventFetcher.js
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  getDateKey,
  getWeekdayIndex,
  getYearMonthKey,
  getPreviousYearMonth
} from '../dateUtils';

// === 🔁 改良版 fallback 検索（キャッシュ使用） ===
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

export async function fetchCustomerEvents(user, startDate, endDate) {
  const result = {
    studentIds: [],
    matchedLessons: [],
    events: [],
  };

  try {
    if (!user) throw new Error("未ログイン");

    const customerSnap = await getDoc(doc(db, 'customers', user.uid));
    if (!customerSnap.exists()) throw new Error("customer ドキュメントが見つかりません");

    const ids = customerSnap.data().studentIds || [];
    if (ids.length === 0) throw new Error("studentIds が空です");

    const classroomCode = ids[0].substring(1, 4);

    // === periodLabels 取得 ===
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

    // === 事前に fallback 用 weeklySchedules をキャッシュ ===
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

    // === 日付配列の作成 ===
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

    // === dailySchedules 一括取得 ===
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
            if (status === '未定') continue; // 未定はスキップ

            const index = parseInt(periodKey.replace('period', '')) - 1;
            const periodLabel = periodLabels[index]?.label || periodKey;
            const time = periodLabels[index]?.time || '';
            const subject = student.subject || '';
            const studentName = student.name || '';

            let title = `${periodLabel} ${subject}`;
            let color = '';

            if (status === '欠席') {
              title = `${periodLabel} 欠席`;
              color = '#FF6347'; // 赤
            } else if (status === '振替') {
              title = `${periodLabel} 振替`;
              color = '#FFA500'; // オレンジ
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

    result.studentIds = ids;
    return result;
  } catch (error) {
    console.error("❌ Firestore エラー:", error.message);
    return result;
  }
}

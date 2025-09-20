import {
    doc,
    getDoc,
    DocumentSnapshot,
    DocumentData,
  } from "firebase/firestore";
  import { db } from "../../../../firebase";
  import {
    getDateKey,
    getWeekdayIndex,
    getYearMonthKey,
    getPreviousYearMonth,
  } from "../../../../common/dateUtils";
  
  // 共通型
  import { SelectedDate } from "../../../../contexts/types/data";
  
  // 型定義
  interface PeriodLabel {
    label: string;
    time: string;
  }
  interface TeachingInfo {
    periodIndex: number;
    periodLabel: string;
    time: string;
    subject: string;
    grade: string;
  }
  export interface MatchedLesson {   // ← export を追加
    date: string;
    periodIndex: number;
    periodLabel: string;
    time: string;
    subject: string;
    grade: string;
  }
  interface CalendarEvent {
    title: string;
    start: string;
    extendedProps: {
      periodRange: string;
      teachingList: TeachingInfo[];
    };
  }
  interface FetchResult {
    matchedLessons: MatchedLesson[];
    events: CalendarEvent[];
  }
  
  function findLatestWeeklyDoc(
    selectedDate: SelectedDate,
    classroomCode: string,
    cachedWeeklyDocs: Map<string, DocumentSnapshot<DocumentData>>
  ): DocumentSnapshot<DocumentData> | null {
    const weekdayIndex = getWeekdayIndex(selectedDate);
    let ym: string | null = getYearMonthKey(selectedDate);
    const maxLookback = 12;
  
    for (let i = 0; i < maxLookback; i++) {
      if (!ym) break;
      const weeklyDocId = `${classroomCode}_${ym}_${weekdayIndex}`;
      if (cachedWeeklyDocs.has(weeklyDocId)) {
        const snap = cachedWeeklyDocs.get(weeklyDocId);
        if (snap && snap.exists()) return snap;
      }
      ym = getPreviousYearMonth(ym);
    }
    return null;
  }
  
  /**
   * 講師コードに紐づく授業予定を取得
   */
  export async function fetchTeacherEvents(
    teacherCode: string,
    startDate: Date,
    endDate: Date
  ): Promise<FetchResult> {
    const result: FetchResult = { matchedLessons: [], events: [] };
  
    try {
      if (!teacherCode) throw new Error("teacherCode が未定義です");
  
      // 教室コードは teacherCode の 2～4桁目
      const classroomCode = teacherCode.slice(1, 4);
  
      // 時限ラベル取得
      let periodLabels: PeriodLabel[] = [];
      const schoolLabelsSnap = await getDoc(
        doc(db, "periodLabelsBySchool", classroomCode)
      );
      if (schoolLabelsSnap.exists()) {
        periodLabels = schoolLabelsSnap.data().periodLabels;
      } else {
        const commonLabelsSnap = await getDoc(doc(db, "common", "periodLabels"));
        if (commonLabelsSnap.exists()) {
          periodLabels = commonLabelsSnap.data().periodLabels;
        }
      }
  
      // 週テンプレート用キャッシュ
      const weeklyDocIds: string[] = [];
      let ym: string | null = getYearMonthKey({
        year: startDate.getFullYear(),
        month: startDate.getMonth() + 1,
        date: startDate.getDate(),
        weekday: startDate.getDay().toString(),
        type: "date",
      });
  
      const weekdayIndices = [...Array(7).keys()];
      for (let i = 0; i < 12; i++) {
        if (!ym) break;
        for (const weekdayIndex of weekdayIndices) {
          weeklyDocIds.push(`${classroomCode}_${ym}_${weekdayIndex}`);
        }
        ym = getPreviousYearMonth(ym);
      }
  
      const weeklySnaps = await Promise.all(
        weeklyDocIds.map((id) => getDoc(doc(db, "weeklySchedules", id)))
      );
      const cachedWeeklyDocs = new Map<string, DocumentSnapshot<DocumentData>>();
      weeklyDocIds.forEach((id, i) => cachedWeeklyDocs.set(id, weeklySnaps[i]));
  
      // 日付ごとのデータ
      const dateList: string[] = [];
      const dateMap: { [key: string]: { dateKey: string; selectedDate: SelectedDate } } = {};
  
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const selectedDate: SelectedDate = {
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          date: d.getDate(),
          weekday: d.getDay().toString(),
          type: "date",
        };
        const dateKey = getDateKey(selectedDate);
        const docId = `${classroomCode}_${dateKey}`;
        dateList.push(docId);
        dateMap[docId] = { dateKey, selectedDate };
      }
  
      const dailySnaps = await Promise.all(
        dateList.map((docId) => getDoc(doc(db, "dailySchedules", docId)))
      );
  
      // データを授業予定に変換
      for (let i = 0; i < dailySnaps.length; i++) {
        let snap: DocumentSnapshot<DocumentData> | null = dailySnaps[i];
        const docId = dateList[i];
        const { dateKey, selectedDate } = dateMap[docId];
  
        if (!snap || !snap.exists()) {
          snap = findLatestWeeklyDoc(selectedDate, classroomCode, cachedWeeklyDocs);
          if (!snap || !snap.exists()) continue;
        }
  
        const rows = snap.data()?.rows || [];
        const teachingList: TeachingInfo[] = [];
  
        for (const row of rows) {
          const rowTeacher = row.teacher;
          if (!rowTeacher || rowTeacher.code !== teacherCode) continue;
  
          const periods = row.periods || {};
          for (const [periodKey, periodValue] of Object.entries(periods as Record<string, any[]>)) {
            const periodIndex = parseInt(periodKey.replace("period", "")) - 1;
            const periodLabel = periodLabels[periodIndex]?.label || periodKey;
            const time = periodLabels[periodIndex]?.time || "";
  
            for (const student of periodValue) {
              teachingList.push({
                periodIndex,
                periodLabel,
                time,
                subject: student.subject ?? "",
                grade: student.grade ?? "",
              });
            }
          }
        }
  
        if (teachingList.length === 0) continue;
  
        const periodIndices = teachingList.map((t) => t.periodIndex);
        const minPeriod = Math.min(...periodIndices) + 1;
        const maxPeriod = Math.max(...periodIndices) + 1;
        const periodRange =
          minPeriod === maxPeriod ? `${minPeriod}限` : `${minPeriod}～${maxPeriod}限`;
  
        result.events.push({
          title: periodRange,
          start: dateKey,
          extendedProps: {
            periodRange,
            teachingList,
          },
        });
  
        result.matchedLessons.push(
          ...teachingList.map((t) => ({
            date: dateKey,
            ...t,
          }))
        );
      }
  
      return result;
    } catch (error) {
      console.error("❌ fetchTeacherEvents エラー:", error);
      return result;
    }
  }
  
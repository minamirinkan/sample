import {
  doc,
  getDoc,
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  getDateKey,
  getWeekdayIndex,
  getYearMonthKey,
  getPreviousYearMonth,
} from "../../../common/dateUtils";
import { User } from "firebase/auth"; // FirebaseのUser型をインポート

// --- ▼ 型定義を追加 ▼ ---

// selectedDateオブジェクトの型
interface SelectedDate {
  year: number;
  month: number;
  date: number;
  type: string;
}

// 期間ラベルの型
interface PeriodLabel {
  label: string;
  time: string;
}

// 指導情報の型
interface TeachingInfo {
  periodIndex: number;
  periodLabel: string;
  time: string;
  subject: string;
  grade: string;
}

// 日付ごとの指導情報の型
interface MatchedLesson extends TeachingInfo {
  date: string;
}

// カレンダーに表示するイベントの型
interface CalendarEvent {
  title: string;
  start: string;
  extendedProps: {
    periodRange: string;
    teachingList: TeachingInfo[];
  };
}

// この関数の戻り値の型
interface FetchResult {
  matchedLessons: MatchedLesson[];
  events: CalendarEvent[];
}

// --- ▼ 関数と引数に型を定義 ▼ ---

// ★修正点1: 引数に型を定義
function findLatestWeeklyDoc(
  selectedDate: SelectedDate,
  classroomCode: string,
  cachedWeeklyDocs: Map<string, DocumentSnapshot<DocumentData>>
): DocumentSnapshot<DocumentData> | null {
  const weekdayIndex = getWeekdayIndex(selectedDate);
  let ym: string | null = getYearMonthKey(selectedDate);
  const maxLookback = 12;

  for (let i = 0; i < maxLookback; i++) {
    // ★修正点2: ymがnullの場合のチェックを追加
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

// ★修正点3: 関数の引数に型を定義 (User, Date)
export async function fetchTeacherEvents(
  user: User | null,
  startDate: Date,
  endDate: Date
): Promise<FetchResult> {
  // ★修正点4: resultの型を明確に定義
  const result: FetchResult = {
    matchedLessons: [],
    events: [],
  };

  try {
    if (!user) throw new Error("未ログイン");

    const teacherSnap = await getDoc(doc(db, "teachers", user.uid));
    if (!teacherSnap.exists())
      throw new Error("teacher ドキュメントが見つかりません");

    const teacherCode = teacherSnap.data().code;
    if (!teacherCode) throw new Error("teacherCode が undefined です");

    const classroomCode = teacherCode.slice(1, 4);

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

    const weeklyDocIds: string[] = [];
    // ★修正点5: ymのnullチェックを追加
    let ym: string | null = getYearMonthKey({
      year: startDate.getFullYear(),
      month: startDate.getMonth() + 1,
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

    const dateList: string[] = [];
    // ★修正点6: dateMapの型を定義
    const dateMap: {
      [key: string]: { dateKey: string; selectedDate: SelectedDate };
    } = {};
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const selectedDate: SelectedDate = {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        date: d.getDate(),
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

    for (let i = 0; i < dailySnaps.length; i++) {
      let snap: DocumentSnapshot<DocumentData> | null = dailySnaps[i];
      const docId = dateList[i];
      const { dateKey, selectedDate } = dateMap[docId];

      if (!snap || !snap.exists()) {
        snap = findLatestWeeklyDoc(
          selectedDate,
          classroomCode,
          cachedWeeklyDocs
        );
        if (!snap || !snap.exists()) continue;
      }

      const rows = snap.data()?.rows || [];
      const teachingList: TeachingInfo[] = [];

      for (const row of rows) {
        const rowTeacher = row.teacher;
        if (!rowTeacher || rowTeacher.code !== teacherCode) continue;

        // ★修正点7: periodValueが配列であることを型アサーションで示す
        const periods = row.periods || {};
        for (const [periodKey, periodValue] of Object.entries(
          periods as Record<string, any[]>
        )) {
          const periodIndex = parseInt(periodKey.replace("period", "")) - 1;
          const periodLabel = periodLabels[periodIndex]?.label || periodKey;
          const time = periodLabels[periodIndex]?.time || "";

          // ★修正点8: studentの型を定義
          for (const student of periodValue) {
            const subject = student.subject || "";
            const grade = student.grade || "";
            teachingList.push({
              periodIndex,
              periodLabel,
              time,
              subject,
              grade,
            });
          }
        }
      }

      if (teachingList.length === 0) continue;

      const periodIndices = teachingList.map((t) => t.periodIndex);
      const minPeriod = Math.min(...periodIndices) + 1;
      const maxPeriod = Math.max(...periodIndices) + 1;
      const periodRange =
        minPeriod === maxPeriod
          ? `${minPeriod}限`
          : `${minPeriod}～${maxPeriod}限`;

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
    // ★修正点9: errorの型をチェックして安全にアクセスする
    if (error instanceof Error) {
      console.error("❌ Firestore エラー:", error.message);
    } else {
      console.error("❌ 予期せぬエラー:", error);
    }
    return result;
  }
}

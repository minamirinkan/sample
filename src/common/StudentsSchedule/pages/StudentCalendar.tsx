import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStudentAttendance, AttendanceEntry } from "../../../contexts/hooks/useStudentAttendance";
import { getFirestore, doc, getDoc } from "firebase/firestore";

type WDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const PERIODS = ["1限", "2限", "3限", "4限", "5限", "6限", "7限", "8限"];
const WDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

// ---- カレンダーユーティリティ ----
function startOfCalendar(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const day = first.getDay() as WDay;
  const start = new Date(first);
  start.setDate(first.getDate() - day);
  return start;
}
function endOfCalendar(year: number, month: number) {
  const last = new Date(year, month, 0);
  const day = last.getDay() as WDay;
  const end = new Date(last);
  end.setDate(last.getDate() + (6 - day));
  return end;
}
function buildWeeks(year: number, month: number) {
  const start = startOfCalendar(year, month);
  const end = endOfCalendar(year, month);
  const days: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

// URL クエリ取得
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}
const pad2 = (n: number) => String(n).padStart(2, "0");

// ステータス→色
const STATUS_CLASS: Record<string, string> = {
  "予定": "bg-yellow-100 text-yellow-900",
  "出席": "bg-green-100 text-green-900",
  "欠席": "bg-red-100 text-red-900",
  "未定": "bg-blue-100 text-blue-900",
  "振替": "bg-amber-100 text-amber-900",
};

type InjectedProps = {
  classroomCode?: string;
  studentId?: string;
  studentName?: string;
  selectedMonth?: string; // "YYYY-MM"
};

type StudentProfile = {
  name: string;
  grade?: string;
  classType?: string;
  classroomCode?: string;
};

export default function StudentCalendar() {
  const q = useQuery();

  // 親ウィンドウが注入した値（/admin/student-timetable を about:blank で開かず URL で開く想定でも併用可）
  const injected: InjectedProps | undefined = ((): InjectedProps | undefined => {
    try {
      return (window as any).__CALENDAR_PROPS__ as InjectedProps | undefined;
    } catch {
      return undefined;
    }
  })();

  // クエリ優先 → 無ければ注入値 → 無ければ空
  const classroomCode = q.get("classroomCode") ?? injected?.classroomCode ?? "";
  const studentId = q.get("studentId") ?? injected?.studentId ?? "";
  const studentNameFromQuery = q.get("studentName") ?? injected?.studentName ?? "";
  const selectedMonthParam = q.get("selectedMonth") ?? injected?.selectedMonth ?? "";

  // 生徒プロフィール（名前だけでもOK）
  const [student, setStudent] = useState<StudentProfile | null>(
    studentNameFromQuery ? { name: studentNameFromQuery, classroomCode } : null
  );

  // studentName が未指定なら Firestore から補完
  useEffect(() => {
    if (!studentId || studentNameFromQuery) return;
    (async () => {
      try {
        const db = getFirestore();
        const snap = await getDoc(doc(db, "students", studentId));
        if (snap.exists()) {
          const s = snap.data() as any;
          const name = `${s?.lastName ?? ""} ${s?.firstName ?? ""}`.trim() || "(氏名未登録)";
          setStudent({
            name,
            grade: s?.grade,
            classType: s?.classType,
            classroomCode: s?.classroomCode ?? classroomCode,
          });
        } else {
          setStudent({ name: "(生徒データなし)" });
        }
      } catch {
        setStudent({ name: "(取得エラー)" });
      }
    })();
  }, [studentId, studentNameFromQuery, classroomCode]);

  // 月の初期値
  const today = new Date();
  const initialYear = selectedMonthParam ? Number(selectedMonthParam.split("-")[0]) : today.getFullYear();
  const initialMonth = selectedMonthParam ? Number(selectedMonthParam.split("-")[1]) : today.getMonth() + 1;

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const weeks = useMemo(() => buildWeeks(year, month), [year, month]);

  // Firestore からこの月の出席（予定）を購読
  const ym = `${year}-${pad2(month)}`;
  const { loading, attendanceList } = useStudentAttendance(classroomCode, studentId, ym);

  // 「日付 + 時限」→ AttendanceEntry の辞書（例: "19-2限"）
  const byDayPeriod = useMemo(() => {
    const map = new Map<string, AttendanceEntry>();
    for (const e of attendanceList) {
      if (!e.date?.startsWith?.(ym)) continue;
      const day = Number(e.date.slice(8, 10));
      map.set(`${day}-${e.periodLabel}`, e);
    }
    return map;
  }, [attendanceList, ym]);

  // ===== レイアウト（ヘッダー30px、歪みなし完全フィット） =====
  const W_HEADER = 19;
  const W_DATE = 10;
  const W_PERIOD = 9;

  const weeksCount = weeks.length;
  const totalWeight = W_HEADER + weeksCount * (W_DATE + W_PERIOD * PERIODS.length);

  const timeColRatio = 0.12;
  const colsDef = `minmax(0, ${Math.round(timeColRatio * 100)}%) repeat(7, minmax(0, 1fr))`;

  const unitRow = `calc((100vh - 30px) / ${totalWeight})`;
  const rowsDef =
    `calc(${unitRow} * ${W_HEADER}) ` +
    weeks
      .map(
        () =>
          `calc(${unitRow} * ${W_DATE}) ` +
          Array(PERIODS.length).fill(`calc(${unitRow} * ${W_PERIOD})`).join(" ")
      )
      .join(" ");

  const cell = "outline outline-1 outline-gray-300 bg-white leading-none";
  const headCell = "outline outline-1 outline-gray-400 bg-gray-200 leading-none";
  const timeColCell = "bg-gray-100 text-center font-medium leading-none";

  const weekdayText = "text-[13px]";
  const dateText = "text-[12px]";
  const periodText = "text-[12px]";

  const handlePrevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else { setMonth(m => m - 1); }
  };
  const handleNextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else { setMonth(m => m + 1); }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 grid" style={{ gridTemplateRows: "30px 1fr" }}>
      {/* ヘッダー */}
      <div className="h-[30px] px-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            aria-label="前月へ"
          >
            ◀
          </button>
          <button
            onClick={handleNextMonth}
            className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            aria-label="翌月へ"
          >
            ▶
          </button>
        </div>

        {/* 月表示 */}
        <h1 className="text-lg font-bold leading-none">
          {year}年 <span className="text-red-600">{month}</span>月 予定表
          {loading && <span className="ml-2 text-xs text-gray-500">(同期中…)</span>}
        </h1>

        {/* 生徒情報表示（右寄せ） */}
        <div className="text-right leading-tight">
          <div className="text-sm font-semibold">
            {(student?.name ?? studentNameFromQuery ?? "(生徒名未設定)")}
            {studentId && <span className="text-xs text-gray-500">（{studentId}）</span>}
          </div>
          {/* 必要なら以下を表示（取得できる場合のみ） */}
          {(student?.grade || student?.classType || student?.classroomCode) && (
            <div className="text-[11px] text-gray-600">
              {student?.grade ? `学年: ${student.grade}　` : ""}
              {student?.classType ? `クラス: ${student.classType}　` : ""}
              {student?.classroomCode ? `教室: ${student.classroomCode}` : ""}
            </div>
          )}
        </div>
      </div>

      {/* カレンダー本体 */}
      <div className="w-full h-full">
        <div
          className="w-full h-full grid select-none"
          style={{ gridTemplateColumns: colsDef, gridTemplateRows: rowsDef }}
        >
          {/* 曜日ヘッダ */}
          <div className={`${headCell} flex items-center justify-center font-semibold ${weekdayText}`}>時限</div>
          {WDAYS_JA.map((ja, i) => (
            <div
              key={`whead-${i}`}
              className={`${headCell} flex items-center justify-center ${weekdayText} ${
                i === 0 ? "text-red-600" : i === 6 ? "text-blue-600" : ""
              }`}
            >
              <span className="font-bold">{ja}</span>
            </div>
          ))}

          {/* 週ごとの行 */}
          {weeks.map((week, wIdx) => (
            <React.Fragment key={`w-${wIdx}`}>
              {/* 日付行 */}
              <div className={`outline outline-1 outline-gray-400 bg-gray-300 text-center ${dateText} flex items-center justify-center leading-none`}>
                日付
              </div>
              {week.map((d, i) => {
                const inMonth = d.getMonth() === month - 1;
                const isSun = d.getDay() === 0;
                const isSat = d.getDay() === 6;
                return (
                  <div
                    key={`date-${wIdx}-${i}`}
                    className={`outline outline-1 outline-gray-400 bg-gray-300 text-center ${dateText} flex items-center justify-center leading-none
                      ${isSun ? "text-red-600" : isSat ? "text-blue-600" : "text-gray-800"}`}
                  >
                    <span className={inMonth ? "" : "text-gray-400"}>{d.getDate()}</span>
                  </div>
                );
              })}

              {/* 各時限 */}
              {PERIODS.map((label, rIdx) => (
                <React.Fragment key={`p-${wIdx}-${rIdx}`}>
                  <div className={`${cell} ${timeColCell} ${periodText} flex items-center justify-center`}>{label}</div>

                  {week.map((d, i) => {
                    const inMonth = d.getMonth() === month - 1;
                    const isSun = d.getDay() === 0;
                    const isSat = d.getDay() === 6;

                    const entry = byDayPeriod.get(`${d.getDate()}-${label}`);
                    const has = !!entry && inMonth;

                    const baseColor =
                      !inMonth ? "bg-gray-100 text-gray-400"
                      : has
                        ? (STATUS_CLASS[entry!.status] ?? "bg-yellow-50")
                        : "bg-white";

                    return (
                      <div
                        key={`cell-${wIdx}-${rIdx}-${i}`}
                        className={`${cell} ${baseColor} ${isSun ? "bg-red-50" : isSat ? "bg-blue-50" : ""} flex items-center justify-center text-[11px]`}
                        title={entry ? `${entry.subject ?? ""} ${entry.status ?? ""}` : ""}
                      >
                        {entry ? (entry.subject || entry.status || "") : ""}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

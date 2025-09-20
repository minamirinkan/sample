// src/pages/Admin/Teachers/tabs/TeacherCalendar.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    useTeacherAttendance,
    type TeacherAttendanceEntry,
} from "../../../../contexts/hooks/useTeacherAttendance";
// ↑ あなたの構成に合わせてパスを調整してください

import {
    fetchTeacherEvents,
    type MatchedLesson,
} from "../firebase/fetchTeacherLesson";
// ↑ こちらもパスを調整してください

// ===== ユーティリティ =====

// "period1" / "1限" / 1 / "1 限" / "1限(〜)" → "1限"
const normalizePeriodLabel = (v: string | number | undefined | null): string | null => {
    if (v == null) return null;
    if (typeof v === "number") return `${v}限`;
    const s = String(v).replace(/\s+/g, ""); // 空白除去
    const m1 = /^period(\d+)$/.exec(s);
    if (m1) return `${Number(m1[1])}限`;
    const m2 = /^(\d{1})限/.exec(s);
    if (m2) return `${Number(m2[1])}限`;
    if (/^\d+$/.test(s)) return `${Number(s)}限`;
    return s; // 既に "1限" など
};

// string/Timestamp/Date → "YYYY-MM-DD"
const toYMD = (input: any): string | null => {
    try {
        if (!input) return null;
        if (typeof input === "string") {
            // "2025-09-03" or "2025-09-03T..." 想定
            // Date にできれば Date → YYYY-MM-DD、できなければ先頭10文字
            const d = new Date(input);
            if (!isNaN(d.getTime())) {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${y}-${m}-${day}`;
            }
            return input.slice(0, 10);
        }
        if (input?.toDate) {
            const d: Date = input.toDate();
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
        }
        if (input instanceof Date) {
            const y = input.getFullYear();
            const m = String(input.getMonth() + 1).padStart(2, "0");
            const day = String(input.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
        }
        return null;
    } catch {
        return null;
    }
};

type WDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const PERIODS = ["1限", "2限", "3限", "4限", "5限", "6限", "7限", "8限"];
const WDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];
const pad2 = (n: number) => String(n).padStart(2, "0");

const STATUS_CLASS: Record<string, string> = {
    予定: "bg-yellow-100 text-yellow-900",
    出席: "bg-green-100 text-green-900",
    欠席: "bg-red-100 text-red-900",
    未定: "bg-blue-100 text-blue-900",
    振替: "bg-amber-100 text-amber-900",
};

// Lesson 優先色（内容は両方表示）
const LESSON_COLOR = "bg-yellow-100 text-yellow-900";

function startOfCalendar(y: number, m: number) {
    const first = new Date(y, m - 1, 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return start;
}
function endOfCalendar(y: number, m: number) {
    const last = new Date(y, m, 0);
    const end = new Date(last);
    end.setDate(last.getDate() + (6 - last.getDay()));
    return end;
}
function buildWeeks(y: number, m: number) {
    const s = startOfCalendar(y, m);
    const e = endOfCalendar(y, m);
    const days: Date[] = [];
    const cur = new Date(s);
    while (cur <= e) {
        days.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
    }
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return weeks;
}

export default function TeacherCalendar(props: {
    teacherCode: string;
    teacherName?: string;
    selectedMonth?: string; // "YYYY-MM" 指定で初期月固定
}) {
    const { teacherCode, teacherName, selectedMonth } = props;

    // 初期年月
    const today = new Date();
    const initialYear = selectedMonth ? Number(selectedMonth.split("-")[0]) : today.getFullYear();
    const initialMonth = selectedMonth ? Number(selectedMonth.split("-")[1]) : today.getMonth() + 1;

    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);

    const ym = `${year}-${pad2(month)}`;
    const weeks = useMemo(() => buildWeeks(year, month), [year, month]);

    // Attendance（あなたのフック）
    const { loading: loadingAttendance, attendanceList } = useTeacherAttendance(teacherCode, ym);

    // Lessons
    const [lessons, setLessons] = useState<MatchedLesson[]>([]);
    const [loadingLessons, setLoadingLessons] = useState(false);

    useEffect(() => {
        if (!teacherCode) return;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        setLoadingLessons(true);
        fetchTeacherEvents(teacherCode, startDate, endDate)
            .then((res) => setLessons(res.matchedLessons ?? []))
            .finally(() => setLoadingLessons(false));
    }, [teacherCode, year, month]);

    const loading = loadingLessons || loadingAttendance;

    // ===== マージ（キーは "日付数値-1限" など）=====
    type CellData = {
        lessons: { subject?: string; grade?: string }[];
        attendanceList: TeacherAttendanceEntry[];
    };

    const byDayPeriod = useMemo(() => {
        const map = new Map<string, CellData>();

        // Lesson → 正規化して投入
        for (const l of lessons) {
            const ymd = toYMD((l as any).date ?? l?.date);
            if (!ymd || !ymd.startsWith(ym)) continue;
            const dd = Number(ymd.slice(8, 10));
            const p = normalizePeriodLabel((l as any).periodLabel ?? l?.periodLabel);
            if (!p) continue;
            const key = `${dd}-${p}`;
            if (!map.has(key)) map.set(key, { lessons: [], attendanceList: [] });
            map.get(key)!.lessons.push({ subject: (l as any).subject, grade: (l as any).grade });
        }

        // Attendance → 正規化して投入（teacherCode で絞るならここで）
        for (const a of attendanceList) {
            const ymd = toYMD(a?.date);
            if (!ymd || !ymd.startsWith(ym)) continue;
            const dd = Number(ymd.slice(8, 10));
            const p = normalizePeriodLabel(a?.periodLabel);
            if (!p) continue;
            const key = `${dd}-${p}`;
            if (!map.has(key)) map.set(key, { lessons: [], attendanceList: [] });
            map.get(key)!.attendanceList.push(a);
        }

        return map;
    }, [lessons, attendanceList, ym]);

    // ===== レイアウト =====
    const ROW_H_HEADER = 30;
    const ROW_H_WEEKDAY = 32;
    const ROW_H_DATE = 28;
    const ROW_H_PERIOD = 28; // 同時表示に少し余裕

    const timeColRatio = 0.12;
    const colsDef = `${Math.round(timeColRatio * 100)}% repeat(7, minmax(0, 1fr))`;
    const rowsDef =
        `${ROW_H_WEEKDAY}px ` +
        weeks
            .map(
                () =>
                    `${ROW_H_DATE}px ` +
                    Array(PERIODS.length).fill(`${ROW_H_PERIOD}px`).join(" ")
            )
            .join(" ");

    const cell = "min-w-0 outline outline-1 outline-gray-300 bg-white leading-none";
    const headCell = "min-w-0 outline outline-1 outline-gray-300 bg-gray-100 leading-none";
    const timeColCell = "min-w-0 bg-gray-50 text-center font-medium leading-none";
    const weekdayText = "text-[13px]";
    const dateText = "text-[12px]";
    const periodText = "text-[12px]";

    const handlePrevMonth = () => {
        if (month === 1) { setYear((y) => y - 1); setMonth(12); }
        else { setMonth((m) => m - 1); }
    };
    const handleNextMonth = () => {
        if (month === 12) { setYear((y) => y + 1); setMonth(1); }
        else { setMonth((m) => m + 1); }
    };

    return (
        <div className="w-full bg-white rounded-md">
            {/* ヘッダー */}
            <div
                className="h-[30px] px-2 flex items-center justify-between gap-2 border-b"
                style={{ height: ROW_H_HEADER }}
            >
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

                <h1 className="text-base font-bold leading-none">
                    {year}年 <span className="text-red-600">{month}</span>月 講師予定表
                    {loading && <span className="ml-2 text-xs text-gray-500">(同期中…)</span>}
                </h1>

                <div className="text-right leading-tight">
                    <div className="text-sm font-semibold">
                        {teacherName ?? "(講師名)"}
                        {teacherCode ? <span className="text-xs text-gray-500">（{teacherCode}）</span> : null}
                    </div>
                </div>
            </div>

            {/* 本体 */}
            <div className="w-full max-h-[70vh] overflow-auto">
                <div
                    className="w-full grid select-none"
                    style={{ gridTemplateColumns: colsDef, gridTemplateRows: rowsDef }}
                >
                    {/* 曜日ヘッダ */}
                    <div
                        className={`${headCell} flex items-center justify-center font-semibold ${weekdayText}`}
                        style={{ height: ROW_H_WEEKDAY }}
                    >
                        時限
                    </div>
                    {WDAYS_JA.map((ja, i) => (
                        <div
                            key={`whead-${i}`}
                            className={`${headCell} flex items-center justify-center ${weekdayText} ${i === 0 ? "text-red-600" : i === 6 ? "text-blue-600" : ""
                                }`}
                            style={{ height: ROW_H_WEEKDAY }}
                        >
                            <span className="font-bold">{ja}</span>
                        </div>
                    ))}

                    {/* 週ごとの行 */}
                    {weeks.map((week, wIdx) => (
                        <React.Fragment key={`w-${wIdx}`}>
                            {/* 日付行 */}
                            <div
                                className={`outline outline-1 outline-gray-300 bg-gray-200 text-center ${dateText} flex items-center justify-center leading-none`}
                                style={{ height: ROW_H_DATE }}
                            >
                                日付
                            </div>
                            {week.map((d, i) => {
                                const inMonth = d.getMonth() === month - 1;
                                const isSun = d.getDay() === 0;
                                const isSat = d.getDay() === 6;
                                return (
                                    <div
                                        key={`date-${wIdx}-${i}`}
                                        className={`outline outline-1 outline-gray-300 bg-gray-200 text-center ${dateText} flex items-center justify-center leading-none
                      ${isSun ? "text-red-600" : isSat ? "text-blue-600" : "text-gray-800"}`}
                                        style={{ height: ROW_H_DATE }}
                                    >
                                        <span className={inMonth ? "" : "text-gray-400"}>{d.getDate()}</span>
                                    </div>
                                );
                            })}

                            {/* 各時限 */}
                            {PERIODS.map((label, rIdx) => (
                                <React.Fragment key={`p-${wIdx}-${rIdx}`}>
                                    <div
                                        className={`${cell} ${timeColCell} ${periodText} flex items-center justify-center`}
                                        style={{ height: ROW_H_PERIOD }}
                                    >
                                        {label}
                                    </div>

                                    {week.map((d, i) => {
                                        const inMonth = d.getMonth() === month - 1;
                                        const isSun = d.getDay() === 0;
                                        const isSat = d.getDay() === 6;

                                        // 表示側のキーも必ず正規化を通す
                                        const p = normalizePeriodLabel(label)!; // "1限"
                                        const key = `${Number(d.getDate())}-${p}`;
                                        const data = byDayPeriod.get(key);

                                        const hasLesson = !!data?.lessons?.length;
                                        const hasAttendance = !!data?.attendanceList?.length;

                                        // 背景色は Lesson 優先、Attendance はフォールバック色を用意
                                        const statusForColor =
                                            (data?.attendanceList?.[0]?.status?.trim()
                                                ? data.attendanceList[0].status
                                                : "出席") || "出席";

                                        const baseColor = !inMonth
                                            ? "bg-gray-100 text-gray-400"
                                            : hasLesson
                                                ? LESSON_COLOR
                                                : hasAttendance
                                                    ? (STATUS_CLASS[statusForColor] ?? "bg-green-100 text-green-900")
                                                    : "bg-white";

                                        // ツールチップ
                                        const title = data
                                            ? [
                                                ...(data.lessons || []).map((l) =>
                                                    l.grade ? `${l.subject ?? ""}(${l.grade})` : `${l.subject ?? ""}`
                                                ),
                                                ...(data.attendanceList || []).map((a) =>
                                                    a.status ? `[${a.status}] ${a.subject ?? ""}` : a.subject ?? ""
                                                ),
                                            ]
                                                .filter(Boolean)
                                                .join(", ")
                                            : "";

                                        return (
                                            <div
                                                key={`cell-${wIdx}-${rIdx}-${i}`}
                                                className={`${cell} ${baseColor} ${isSun ? "bg-red-50" : isSat ? "bg-blue-50" : ""
                                                    } flex flex-col items-center justify-center text-[11px] px-1 text-center relative`}
                                                style={{ height: ROW_H_PERIOD }}
                                                title={title}
                                            >
                                                {/* Attendance 背景（セル全面） */}
                                                {hasAttendance && (
                                                    <div
                                                        className={`absolute inset-0 z-0 ${hasLesson
                                                            ? "bg-red-500" // 🔴 Lesson + Attendance で重なったら赤に固定
                                                            : STATUS_CLASS[data!.attendanceList[0]?.status?.trim() || "出席"]
                                                            }`}
                                                    />
                                                )}

                                                {/* Lesson（テキストは前面に） */}
                                                {hasLesson &&
                                                    data!.lessons.map((l, idx) => (
                                                        <div
                                                            key={`lesson-${idx}`}
                                                            className={`leading-tight truncate w-full z-10 ${hasAttendance ? "text-white font-semibold" : "text-gray-800"
                                                                }`}
                                                        >
                                                            {l.subject} {l.grade ?? ""}
                                                        </div>
                                                    ))}

                                                {/* どちらも無い時の高さ確保 */}
                                                {!hasLesson && !hasAttendance && <span className="z-10">&nbsp;</span>}
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

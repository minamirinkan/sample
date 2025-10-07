// src/teacher/Attendance/components/AttendanceCalendar.tsx
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { addMonths, subMonths, format, getDaysInMonth, parse } from "date-fns";
import { ja } from "date-fns/locale";
import { motion } from "framer-motion";
import SelectedCellsPanel from "./SelectedCellsPanel";
import {
  useCalendarSelection,
  makeCellKey,
  parseCellKey,
} from "../hooks/useCalendarSelection";
import { saveMonthSelection } from "../firebase/firestoreSave";
import { loadMonthSelection } from "../firebase/firestoreLoad";

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export type DaySummary = { count?: number };

export interface PeriodLabel {
  label: string;
  start: string;
  end: string;
}

export interface CalendarMonthProps {
  onDateSelect?: (isoDate: string) => void;
  initialDate?: string; // yyyy-MM-dd
  eventsByDate?: Record<string, DaySummary>;
  className?: string;
  periods?: PeriodLabel[]; // デフォルト8
  teacherCode: string; // 保存・読込に必要
}

const DEFAULT_PERIODS: PeriodLabel[] = [
  { label: "1限", start: "09:50", end: "11:10" },
  { label: "2限", start: "11:20", end: "12:40" },
  { label: "3限", start: "12:50", end: "14:10" },
  { label: "4限", start: "14:20", end: "15:40" },
  { label: "5限", start: "15:50", end: "17:10" },
  { label: "6限", start: "17:20", end: "18:40" },
  { label: "7限", start: "18:50", end: "20:10" },
  { label: "8限", start: "20:20", end: "21:40" },
];

const fmtYmd = (d: Date) => format(d, "yyyy-MM-dd");
const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];
const safeFromYmd = (s?: string) =>
  s ? parse(s, "yyyy-MM-dd", new Date()) : new Date();

function toReiwa(year: number) {
  if (year < 2019) return null;
  const n = year - 2018;
  return n === 1 ? "令和元年" : `令和${n}年`;
}

export default function AttendanceCalendar({
  onDateSelect,
  initialDate,
  eventsByDate = {},
  className,
  periods = DEFAULT_PERIODS,
  teacherCode,
}: CalendarMonthProps) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    safeFromYmd(initialDate)
  );
  const [selectedDate, setSelectedDate] = useState<Date>(
    safeFromYmd(initialDate)
  );

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadMsg, setLoadMsg] = useState<string | null>(null);

  // セル選択/色付けはフックに任せる
  const sel = useCalendarSelection();

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth(); // 0-11
  const monthNumber = monthIndex + 1;

  const monthLabel = format(currentMonth, "LLLL", { locale: ja });
  const era = toReiwa(year);
  const daysIn = getDaysInMonth(currentMonth);

  const handlePrev = useCallback(() => setCurrentMonth((m) => subMonths(m, 1)), []);
  const handleNext = useCallback(() => setCurrentMonth((m) => addMonths(m, 1)), []);
  const handleToday = useCallback(() => setCurrentMonth(today), [today]);

  const selectDate = useCallback(
    (d: Date) => {
      setSelectedDate(d);
      onDateSelect?.(fmtYmd(d));
    },
    [onDateSelect]
  );

  // 保存
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setSaveMsg(null);
      await saveMonthSelection(teacherCode, currentMonth, sel.selectionList);
      const monthId = format(currentMonth, "yyyy-MM");
      setSaveMsg(
        `保存しました：Attendance/${teacherCode}/${monthId}/（日別ドキュメントに periods を保存）`
      );
      // 保存後に再読込させたい場合は lastLoadedRef をリセットしてもよい
      lastLoadedRef.current = "";
    } catch (e: any) {
      setSaveMsg(`保存に失敗しました：${e?.message ?? String(e)}`);
    } finally {
      setSaving(false);
    }
  }, [teacherCode, currentMonth, sel.selectionList]);

  // 読み込み（teacherCode or 月が変わったら）
  const monthId = useMemo(() => format(currentMonth, "yyyy-MM"), [currentMonth]);
  const setAll = sel.setAll;
  const lastLoadedRef = useRef<string>("");

  useEffect(() => {
    let cancelled = false;

    const key = `${teacherCode}|${monthId}`;
    if (!teacherCode || lastLoadedRef.current === key) return;

    (async () => {
      try {
        setLoadingMonth(true);
        setLoadMsg(null);
        const keys = await loadMonthSelection(teacherCode, currentMonth);

        if (cancelled) return;

        // 現在と同じ選択なら更新しない
        const curr = new Set(sel.selectionList);
        const next = new Set(keys);
        const same =
          curr.size === next.size && [...curr].every((k) => next.has(k));

        if (!same) setAll(keys);

        lastLoadedRef.current = key;
        setLoadMsg(
          keys.length ? `読み込み: ${keys.length} セル` : "読み込み: 0 セル"
        );
      } catch (e: any) {
        if (!cancelled)
          setLoadMsg(`読み込み失敗: ${e?.message ?? String(e)}`);
      } finally {
        if (!cancelled) setLoadingMonth(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [teacherCode, monthId, setAll, currentMonth, sel.selectionList]);

  const LEFT_WIDTH = "w-28";

  const selectedItems = sel.selectionList
    .map(parseCellKey)
    .map(({ ymd, periodIndex }) => ({
      ymd,
      periodIndex,
      label: periods[periodIndex]?.label ?? `#${periodIndex + 1}`,
    }));

  // periods 列数に応じてグリッド列を可変に
  const cols = periods.length;
  const gridColsClass =
    {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      7: "grid-cols-7",
      8: "grid-cols-8",
      9: "grid-cols-9",
      10: "grid-cols-10",
      11: "grid-cols-11",
      12: "grid-cols-12",
    }[cols] ?? "grid-cols-8";

  const todayYmd = fmtYmd(today);
  const selectedYmd = fmtYmd(selectedDate);

  return (
    <div className={cn("w-full", className)}>
      {/* ヘッダ */}
      <div className="mb-4">
        <div className="flex items-end gap-2 text-xl font-semibold">
          <span>
            {year}
            {era ? `(${era})` : ""}
          </span>
          <span>
            {monthNumber} | {monthLabel}
          </span>
        </div>
        <div className="mt-2 h-1 w-full bg-blue-800" />
      </div>

      {/* コントロール */}
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={handlePrev}
          className="h-8 w-8 rounded border text-sm hover:bg-gray-50"
          aria-label="前の月"
        >
          ◀
        </button>
        <button
          onClick={handleNext}
          className="h-8 w-8 rounded border text-sm hover:bg-gray-50"
          aria-label="次の月"
        >
          ▶
        </button>
        <button
          onClick={handleToday}
          className="h-8 rounded border px-3 text-sm hover:bg-gray-50"
        >
          今日
        </button>

        {/* 保存/読込表示 */}
        <div className="ml-auto flex items-center gap-3">
          {loadingMonth && (
            <span className="text-xs text-gray-500">読込中…</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-8 rounded bg-blue-600 px-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "保存中..." : "この月を保存"}
          </button>
        </div>
      </div>

      {/* 時限ヘッダ */}
      <div className="mb-2 rounded-lg border">
        <div className="flex items-stretch">
          <div className={cn(LEFT_WIDTH, "px-3 py-2 text-sm text-gray-500")} />
          <div className="w-[2px] bg-black" />
          <div className={cn("grid flex-1 divide-x", gridColsClass)}>
            {periods.map((p, idx) => (
              <div key={idx} className="px-2 py-2 text-center text-sm">
                <div className="font-semibold">{p.label}</div>
                <div className="leading-tight">{p.start}〜</div>
                <div className="leading-tight">{p.end}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 縦リスト */}
      <div className="divide-y rounded-lg border">
        {Array.from({ length: daysIn }, (_, i) => i + 1).map((dayNum) => {
          const d = new Date(year, monthIndex, dayNum);
          const weekday = d.getDay();
          const ymd = fmtYmd(d);
          const isSelectedRow = ymd === selectedYmd;
          const isToday = ymd === todayYmd;
          const daySummary = eventsByDate[ymd];

          return (
            <motion.div
              key={ymd}
              whileTap={{ scale: 0.999 }}
              className={cn(
                "flex w-full items-stretch text-left transition",
                isSelectedRow && "bg-blue-50",
                !isSelectedRow && "hover:bg-gray-50"
              )}
              onClick={() => selectDate(d)}
            >
              {/* 左：日付番号 + 曜日 */}
              <div
                className={cn(
                  LEFT_WIDTH,
                  "px-3 py-2 flex items-center gap-3"
                )}
              >
                <div
                  className={cn(
                    "w-6 text-lg font-bold text-center",
                    weekday === 0 && "text-red-600",
                    weekday === 6 && "text-blue-600"
                  )}
                >
                  {dayNum}
                </div>
                <div
                  className={cn(
                    "text-sm",
                    weekday === 0 && "text-red-600",
                    weekday === 6 && "text-blue-600"
                  )}
                >
                  {WEEKDAYS_JA[weekday]}
                </div>
                {isToday && (
                  <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                    今日
                  </span>
                )}
                {daySummary?.count ? (
                  <span className="ml-auto rounded-full bg-gray-200 px-2 py-0.5 text-xs">
                    {daySummary.count}
                  </span>
                ) : null}
              </div>

              {/* 黒い縦線 */}
              <div className="w-[2px] bg-black" />

              {/* 右：periods 列 */}
              <div className={cn("grid flex-1 divide-x", gridColsClass)}>
                {periods.map((_, idx) => {
                  const key = makeCellKey(ymd, idx);
                  const selected = sel.isSelected(key);
                  const extraClass = sel.getCellClass(key);
                  return (
                    <button
                      key={idx}
                      type="button"
                      aria-pressed={selected}
                      onClick={(e) => {
                        e.stopPropagation();
                        sel.toggle(key);
                      }}
                      className={cn(
                        "min-h-12 w-full px-2 py-2 text-sm text-gray-800 text-left transition",
                        selected && "outline outline-2 outline-blue-400",
                        extraClass
                      )}
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* メッセージ */}
      {(loadMsg || saveMsg) && (
        <div className="mt-3 space-y-1 text-sm text-gray-700">
          {loadMsg && <div>{loadMsg}</div>}
          {saveMsg && <div>{saveMsg}</div>}
        </div>
      )}

      {/* 選択一覧パネル */}
      <SelectedCellsPanel
        items={selectedItems}
        onRemove={(ymd, idx) => sel.remove(makeCellKey(ymd, idx))}
        onClear={sel.clear}
      />

      <div className="h-2" />
    </div>
  );
}

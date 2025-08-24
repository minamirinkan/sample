import React, { useMemo, useState, useCallback } from "react";
import { addMonths, subMonths, format, getDaysInMonth } from "date-fns";
import { ja } from "date-fns/locale";
import { motion } from "framer-motion";
import SelectedCellsPanel from "./SelectedCellsPanel";
import { useCalendarSelection, makeCellKey, parseCellKey } from "../hooks/useCalendarSelection";

function cn(...classes: Array<string | undefined | null | false>) { return classes.filter(Boolean).join(" "); }

export type DaySummary = { count?: number };

export interface PeriodLabel {
  label: string; start: string; end: string;
}

export interface CalendarMonthProps {
  onDateSelect?: (isoDate: string) => void;
  initialDate?: string; // yyyy-MM-dd
  eventsByDate?: Record<string, DaySummary>;
  className?: string;
  periods?: PeriodLabel[]; // 8コマ想定
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
const WEEKDAYS_JA = ["日","月","火","水","木","金","土"]; // 0=Sun

function toReiwa(year: number) { if (year < 2019) return null; const n = year - 2018; return n === 1 ? "令和元年" : `令和${n}年`; }

export default function AttendanceCalendar({
  onDateSelect,
  initialDate,
  eventsByDate = {},
  className,
  periods = DEFAULT_PERIODS,
}: CalendarMonthProps) {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate ? new Date(initialDate) : today);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate ? new Date(initialDate) : today);

  // セル選択/色付けはフックに任せる
  const sel = useCalendarSelection();

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth(); // 0-11
  const monthNumber = monthIndex + 1;

  const monthLabelEn = format(currentMonth, "LLLL", { locale: ja }).toUpperCase();
  const era = toReiwa(year);

  const daysIn = getDaysInMonth(currentMonth);

  const handlePrev = useCallback(() => setCurrentMonth(m => subMonths(m, 1)), []);
  const handleNext = useCallback(() => setCurrentMonth(m => addMonths(m, 1)), []);
  const handleToday = useCallback(() => setCurrentMonth(today), [today]);

  const selectDate = useCallback((d: Date) => {
    setSelectedDate(d);
    onDateSelect?.(fmtYmd(d));
  }, [onDateSelect]);

  const LEFT_WIDTH = "w-28";

  const selectedItems = sel.selectionList
    .map(parseCellKey)
    .map(({ ymd, periodIndex }) => ({ ymd, periodIndex, label: periods[periodIndex]?.label ?? `#${periodIndex + 1}` }));

  return (
    <div className={cn("w-full", className)}>
      {/* ヘッダ */}
      <div className="mb-4">
        <div className="flex items-end gap-2 text-xl font-semibold">
          <span>{year}{era ? `(${era})` : ""}</span>
          <span>{monthNumber} | {monthLabelEn}</span>
        </div>
        <div className="mt-2 h-1 w-full bg-blue-800" />
      </div>

      {/* コントロール */}
      <div className="mb-3 flex items-center gap-2">
        <button onClick={handlePrev} className="h-8 w-8 rounded border text-sm hover:bg-gray-50" aria-label="前の月">◀</button>
        <button onClick={handleNext} className="h-8 w-8 rounded border text-sm hover:bg-gray-50" aria-label="次の月">▶</button>
        <button onClick={handleToday} className="h-8 rounded border px-3 text-sm hover:bg-gray-50">今日</button>
      </div>

      {/* 時限ヘッダ */}
      <div className="mb-2 rounded-lg border">
        <div className="flex items-stretch">
          <div className={cn(LEFT_WIDTH, "px-3 py-2 text-sm text-gray-500")} />
          <div className="w-[2px] bg-black" />
          <div className="grid flex-1 grid-cols-8 divide-x">
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
          const isSelectedRow = fmtYmd(d) === fmtYmd(selectedDate);
          const isToday = fmtYmd(d) === fmtYmd(today);

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
              <div className={cn(LEFT_WIDTH, "px-3 py-2 flex items-center gap-3")}>
                <div className={cn(
                  "w-6 text-lg font-bold text-center",
                  weekday === 0 && "text-red-600",
                  weekday === 6 && "text-blue-600"
                )}>{dayNum}</div>
                <div className={cn(
                  "text-sm",
                  weekday === 0 && "text-red-600",
                  weekday === 6 && "text-blue-600"
                )}>{WEEKDAYS_JA[weekday]}</div>
                {isToday && <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">今日</span>}
              </div>

              {/* 黒い縦線 */}
              <div className="w-[2px] bg-black" />

              {/* 右：8コマ（クリックでセル選択） */}
              <div className="grid flex-1 grid-cols-8 divide-x">
                {periods.map((_, idx) => {
                  const key = makeCellKey(ymd, idx);
                  const selected = sel.isSelected(key);
                  const extraClass = sel.getCellClass(key);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); sel.toggle(key); }}
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

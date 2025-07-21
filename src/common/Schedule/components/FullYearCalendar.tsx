import React, { useState } from "react";


type Holiday = {
  date: string;
  name: string;
  type: "holiday" | "customClose";
};


const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();


const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];


const FullYearCalendar: React.FC<{
  year: number;
  holidays: Holiday[];
  deletedHolidays: Holiday[];
}> = ({ year, holidays, deletedHolidays }) => {
  const [hoveredHoliday, setHoveredHoliday] = useState<Holiday | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });


  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    holiday: Holiday | undefined
  ) => {
    if (holiday) {
      setHoveredHoliday(holiday);
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
    }
  };


  const handleMouseLeave = () => {
    setHoveredHoliday(null);
  };


  const renderMonth = (month: number): React.ReactElement => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const dayBoxes: React.ReactElement[] = [];


    for (let i = 0; i < firstDay; i++) {
      dayBoxes.push(
        <div key={`empty-${i}`} className="aspect-square border border-gray-300" />
      );
    }


    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const holiday = holidays.find((h) => h.date === dateStr);
      const deleted = deletedHolidays.find(
        (d) => d.date === dateStr && d.type === holiday?.type
      );
      const dayOfWeek = new Date(dateStr).getDay();


      if (deleted) continue;


      let classNames =
        "aspect-square border border-gray-300 flex items-center justify-center text-sm font-semibold";


      let textColor = "text-gray-800";
      let bgColor = "bg-white";


      if (holiday || dayOfWeek === 0) {
        textColor = "text-red-500";
      } else if (dayOfWeek === 6) {
        textColor = "text-blue-500";
      }


      dayBoxes.push(
        <div
          key={dateStr}
          className={`${classNames} ${textColor} ${bgColor} relative`}
          onMouseEnter={(e) => handleMouseEnter(e, holiday)}
          onMouseLeave={handleMouseLeave}
        >
          {day}
        </div>
      );
    }


    const totalCells = firstDay + daysInMonth;
    const remainder = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remainder; i++) {
      dayBoxes.push(
        <div key={`empty-end-${i}`} className="aspect-square border border-gray-300" />
      );
    }


    return (
      <div
        key={month}
        className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200"
      >
        <div className="text-xl font-bold text-center text-blue-700 border-b pb-2 mb-3">
          {month + 1}月
        </div>


        {/* 曜日ラベル */}
        <div className="grid grid-cols-7 gap-0 text-sm font-semibold text-center text-gray-600 bg-gray-100 border border-gray-300">
          {dayLabels.map((d) => (
            <div
              key={d}
              className="aspect-square border border-gray-300 flex items-center justify-center"
            >
              {d}
            </div>
          ))}
        </div>


        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-0">
          {dayBoxes}
        </div>
      </div>
    );
  };


  return (
    <div className="relative max-w-screen-lg mx-auto px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Array.from({ length: 12 }).map((_, i) => renderMonth(i))}
      </div>


      {/* ツールチップ */}
      {hoveredHoliday && (
        <div
          className="fixed z-50 bg-white text-black px-4 py-2 rounded-xl shadow-lg border text-base font-semibold"
          style={{
            top: tooltipPosition.y - 10,
            left: tooltipPosition.x,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {hoveredHoliday.name}
        </div>
      )}
    </div>
  );
};

export default FullYearCalendar;

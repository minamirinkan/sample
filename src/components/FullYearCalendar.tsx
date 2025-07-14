import React from "react";

type Holiday = {
  date: string; // "YYYY-MM-DD"
  name: string;
  type: "holiday" | "customClose";
};

type Props = {
  year: number;
  holidays: Holiday[];
  deletedHolidays: Holiday[];
};

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

const FullYearCalendar: React.FC<Props> = ({
  year,
  holidays,
  deletedHolidays,
}) => {
  const renderMonth = (month: number): React.ReactElement => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();

    const dayBoxes: React.ReactElement[] = [];

    for (let i = 0; i < firstDay; i++) {
      dayBoxes.push(
        <div key={`empty-${i}`} className="text-gray-300">
          .
        </div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      const holiday = holidays.find((h) => h.date === dateStr);
      const deleted = deletedHolidays.find(
        (d) => d.date === dateStr && d.type === holiday?.type
      );

      const baseStyle = "text-center p-1 rounded";
      let textColor = "text-black";
      let bgColor = "";
      let decoration = "";

      const dayOfWeek = new Date(dateStr).getDay(); // 0: 日, 6: 土

      // 削除優先
      if (deleted) {
        textColor = "text-gray-400";
        decoration = "line-through";
      } else if (holiday) {
        textColor = "text-red-600";
        bgColor = "bg-red-100";
      } else {
        // 曜日ベースの色
        if (dayOfWeek === 0) {
          textColor = "text-red-600"; // 日曜
        } else if (dayOfWeek === 6) {
          textColor = "text-blue-600"; // 土曜
        }
      }

      dayBoxes.push(
        <div
          key={dateStr}
          className={`${baseStyle} ${textColor} ${bgColor} ${decoration}`}
          title={holiday?.name || deleted?.name || ""}
        >
          {day}
        </div>
      );
    }

    return (
      <div key={month} className="p-2 border rounded">
        <h3 className="text-lg font-bold mb-1">{month + 1}月</h3>
        <div className="grid grid-cols-7 text-sm text-gray-600 mb-1">
          {dayLabels.map((d) => (
            <div key={d} className="text-center font-semibold">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{dayBoxes}</div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 12 }).map((_, i) => renderMonth(i))}
    </div>
  );
};

export default FullYearCalendar;

// src/teacher/Attendance/AttendancePage.tsx
import React, { useState } from "react";
import CalendarMonth, { DaySummary } from "./components/AttendanceCalendar"; // キャンバスの中身を保存したパス

export default function AttendancePage() {
  const [selected, setSelected] = useState<string>("");

  const eventsByDate: Record<string, DaySummary> = {
    // "2025-01-01": { count: 2 },
  };

  return (
    <div className="p-4">
      <CalendarMonth
        initialDate={"2025-01-01"} // 任意
        eventsByDate={eventsByDate}
        onDateSelect={setSelected}
      />
      {selected && <div className="mt-4 text-sm">選択日: {selected}</div>}
    </div>
  );
}

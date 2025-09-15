import React from "react";
import StudentCalendars from "./pages/StudentCalendar";  // ← カレンダー本体
import StudentListButton from "./components/StudentListButton"; // ← 生徒一覧ボタン

const PERIODS = [
    { label: "1限", time: "09:50〜11:10" },
    { label: "2限", time: "11:20〜12:40" },
    { label: "3限", time: "12:50〜14:10" },
    { label: "4限", time: "14:20〜15:40" },
    { label: "5限", time: "15:50〜17:10" },
    { label: "6限", time: "17:20〜18:40" },
    { label: "7限", time: "18:50〜20:10" },
    { label: "8限", time: "20:20〜21:40" },
  ];
  
  // 時間テキスト（2行で表示）
  function PeriodInline() {
    return (
      <div className="text-lg font-semibold text-gray-900 leading-relaxed">
        <div className="flex flex-wrap items-center gap-x-6">
          {PERIODS.map((p, i) => (
            <span key={p.label}>
              {p.label}:{p.time}
              {i === 3 && <span className="basis-full h-0" />}
            </span>
          ))}
        </div>
      </div>
    );
  }
  

function StudentCalendar() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
          
    
          {/* 下段：カレンダー本体 */}
          <div className="w-full max-w-6xl">
            <StudentCalendars />
          </div>
        </div>
      );
}

export default StudentCalendar;
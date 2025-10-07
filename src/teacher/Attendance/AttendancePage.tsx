import React, { useEffect, useState } from "react";
import AttendanceCalendar, { DaySummary } from "./components/AttendanceCalendar";
import { useAuth } from "../../contexts/AuthContext";
import { resolveTeacherCode } from "./common/resolveTeacherCode"; // 先に共有したユーティリティ

export default function AttendancePage() {
  const { user, loading } = useAuth();
  const [teacherCode, setTeacherCode] = useState<string>("");

  useEffect(() => {
    if (!user || loading) return;
    (async () => {
      try {
        const code = await resolveTeacherCode(user);
        setTeacherCode(code);
      } catch (e) {
        console.error("teacherCode の解決に失敗:", e);
      }
    })();
  }, [user, loading]);

  const [selected, setSelected] = useState<string>("");
  const eventsByDate: Record<string, DaySummary> = {};

  if (loading) return <div className="p-4 text-sm">Auth 読み込み中...</div>;
  if (!user) return <div className="p-4 text-sm">❌ ログインしていません</div>;
  if (!teacherCode) return <div className="p-4 text-sm">👩‍🏫 teacherCode 解決中...</div>;

  return (
    <div className="p-4">
      <AttendanceCalendar
        teacherCode={teacherCode}
        initialDate={"2025-08-01"}
        eventsByDate={eventsByDate}
        onDateSelect={setSelected}
      />
      {selected && <div className="mt-4 text-sm">選択日: {selected}</div>}
    </div>
  );
}

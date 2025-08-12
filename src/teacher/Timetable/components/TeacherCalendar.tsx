import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import FullCalendar from "@fullcalendar/react";
// ★修正点: 型定義を @fullcalendar/core からインポートする
import {
  EventSourceInput,
  EventClickArg,
  DatesSetArg,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import LessonModal from "../../../common/Schedule/data/TeacherModal";
import "../../../common/styles/fullcalendar-overrides.css";
import { fetchTeacherEvents } from "../firebase/Teacherfetcher";

interface TeacherCalendarProps {
  // 必要に応じてPropsの型を定義
}

export default function TeacherCalendar(props: TeacherCalendarProps) {
  const { user, loading } = useAuth();
  const [events, setEvents] = useState<EventSourceInput>([]);
  const [selectedLesson, setSelectedLesson] = useState<
    EventClickArg["event"] | null
  >(null);

  const fetchAndSetEvents = useCallback(
    async (startDate: Date, endDate: Date) => {
      if (!user) return;
      try {
        const { events } = await fetchTeacherEvents(user, startDate, endDate);
        setEvents(events);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("❌ データ読み込みエラー:", err.message);
        } else {
          console.error("❌ 予期せぬデータ読み込みエラー:", err);
        }
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user || loading) return;
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    fetchAndSetEvents(firstDay, lastDay);
  }, [user, loading, fetchAndSetEvents]);

  const handleEventClick = (info: EventClickArg) => {
    setSelectedLesson(info.event);
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    const firstDayOfMonth = arg.start;
    const lastDayOfMonth = arg.end;
    fetchAndSetEvents(firstDayOfMonth, lastDayOfMonth);
  };

  return (
    <div className="p-6 sm:p-6 relative">
      <h1 className="text-base sm:text-xl font-bold mb-4">
        📅 Teacher Calendar
      </h1>

      {loading && <p>AuthContext loading中...</p>}

      {!loading && user && (
        <>
          <h2 className="mt-4 font-semibold">カレンダー表示:</h2>

          <div className="relative w-full overflow-x-auto">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ja"
              events={events}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              fixedWeekCount={false}
              height="auto"
              aspectRatio={0.8}
              headerToolbar={{
                start: "prev,next",
                center: "title",
                end: "today",
              }}
              titleFormat={{ year: "numeric", month: "short" }}
              dayMaxEventRows={true}
              dayMaxEvents={2}
              moreLinkClick="popover"
              dayCellContent={(arg) => {
                return {
                  html: `<div class="text-xs text-gray-800">${arg.date.getDate()}</div>`,
                };
              }}
              eventContent={(arg) => {
                return {
                  html: `<div class="text-xs truncate">${arg.event.title}</div>`,
                };
              }}
            />
          </div>

          <LessonModal
            lesson={selectedLesson}
            onClose={() => setSelectedLesson(null)}
          />
        </>
      )}

      {!loading && !user && <p>❌ ログインしていません</p>}
    </div>
  );
}

// src/components/CustomerCalendar.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import LessonModal from '../../common/modal/LessonModal.js';
import '../../common/styles/fullcalendar-overrides.css';
import { fetchCustomerEvents } from './firebase/EventFetcher.js';

export default function CustomerCalendar() {
  const { user, loading } = useAuth();
  const [studentIds, setStudentIds] = useState([]);
  const [matchedLessons, setMatchedLessons] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [makeupCount, setMakeupCount] = useState(0);

  const fetchAndSetEvents = async (startDate, endDate) => {
    if (!user) return;
    try {
      const { studentIds, matchedLessons, events } = await fetchCustomerEvents(user, startDate, endDate);
      setStudentIds(studentIds);
      setMatchedLessons(matchedLessons);
      setEvents(events);

      const count = matchedLessons.filter((lesson) => lesson.status === '振替').length;
      setMakeupCount(count);
    } catch (err) {
      console.error("\u274C データ読み込みエラー:", err.message);
    }
  };

  useEffect(() => {
    if (!user || loading) return;
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    fetchAndSetEvents(firstDay, lastDay);
  }, [user, loading]);

  const handleEventClick = (info) => {
    setSelectedLesson(info.event);
  };

  const handleDatesSet = (arg) => {
    const middle = new Date((arg.start.getTime() + arg.end.getTime()) / 2);
    const currentMonth = middle.getMonth();
    const currentYear = middle.getFullYear();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    fetchAndSetEvents(firstDayOfMonth, lastDayOfMonth);
  };

  return (
    <div className="p-6 sm:p-6 relative">
      <h1 className="text-base sm:text-xl font-bold mb-4">📅 Customer Calendar</h1>

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
                start: 'prev,next',
                center: 'title',
                end: 'today'
              }}
              titleFormat={{ year: 'numeric', month: 'short' }}
              dayMaxEventRows={true}
              dayMaxEvents={2}
              moreLinkClick="popover"
              dayCellContent={(arg) => {
                return { html: `<div class="text-xs text-gray-800">${arg.date.getDate()}</div>` };
              }}
              eventContent={(arg) => {
                return {
                  html: `<div class="text-xs truncate">${arg.event.title}</div>`
                };
              }}
            />

            <div className="absolute right-0 bottom-[-3rem] bg-green-100 text-green-700 px-3 py-1 rounded shadow text-sm sm:text-base">
              振替回数: {makeupCount}
            </div>
          </div>

          <LessonModal
            lesson={selectedLesson}
            onClose={() => setSelectedLesson(null)}
          />
        </>
      )}

      {!loading && !user && (
        <p>❌ ログインしていません</p>
      )}
    </div>
  );
}

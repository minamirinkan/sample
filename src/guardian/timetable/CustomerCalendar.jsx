import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import LessonModal from '../../common/modal/LessonModal';
import '../../common/styles/fullcalendar-overrides.css';
import { fetchCustomerEvents } from './firebase/EventFetcher';

export default function CustomerCalendar() {
  const { user, loading } = useAuth();
  const [studentIds, setStudentIds] = useState([]);
  const [matchedLessons, setMatchedLessons] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [makeupCount, setMakeupCount] = useState(0);
  const [currentTitle, setCurrentTitle] = useState('');

  const calendarRef = useRef(null);

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
      console.error("❌ データ読み込みエラー:", err.message);
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
    const currentYear = middle.getFullYear();
    const currentMonth = middle.getMonth() + 1;
    setCurrentTitle(`${currentYear}年${currentMonth}月`);

    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
    fetchAndSetEvents(firstDayOfMonth, lastDayOfMonth);
  };

  // スワイプ処理をカレンダー全体ラッパーに付与
  useEffect(() => {
    const calendarEl = document.getElementById('calendar-wrapper');
    if (!calendarEl || !calendarEl.parentElement) return;

    const wrapper = calendarEl.parentElement;

    let startX = null;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      if (startX === null) return;
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;

      if (Math.abs(deltaX) > 50) {
        const calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) return;

        if (deltaX > 0) {
          calendarApi.prev();
        } else {
          calendarApi.next();
        }
      }
      startX = null;
    };

    wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
    wrapper.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      wrapper.removeEventListener('touchstart', handleTouchStart);
      wrapper.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleNext = () => {
    calendarRef.current?.getApi().next();
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
  };

  return (
    <div className="p-4 sm:p-6 h-screen overflow-hidden flex flex-col">
      {/* ヘッダー部分：タイトルと振替回数を横並び */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-base sm:text-xl font-bold flex items-center space-x-2">
          <span>📅 Customer Calendar</span>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded shadow text-sm sm:text-base">
          振替回数: {makeupCount}
        </div>
      </div>

      {!loading && user && (
        <>
          {/* 矢印＋年月表示 */}
          <div className="flex items-center justify-center mb-2 space-x-4 select-none">
            <button
              onClick={handlePrev}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-lg"
              aria-label="前の月"
            >
              ◀
            </button>
            <div className="text-lg sm:text-xl font-semibold">{currentTitle}</div>
            <button
              onClick={handleNext}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-lg"
              aria-label="次の月"
            >
              ▶
            </button>
          </div>

          {/* カレンダー本体 */}
          <div
            id="calendar-wrapper"
            className="flex-1 overflow-hidden"
            style={{ touchAction: 'pan-y', height: '100%' }} // 高さ100%で領域確保
          >
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ja"
              events={events}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              fixedWeekCount={true}
              expandRows={false}
              height="auto"
              aspectRatio={1.2}
              headerToolbar={false}
              dayMaxEventRows={true}
              dayMaxEvents={2}
              moreLinkClick="popover"
              dayCellContent={(arg) => ({
                html: `<div class="text-xs text-gray-800">${arg.date.getDate()}</div>`,
              })}
              eventContent={(arg) => ({
                html: `<div class="text-xs truncate">${arg.event.title}</div>`,
              })}
            />
          </div>

          <LessonModal lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />
        </>
      )}

      {!loading && !user && <p>❌ ログインしていません</p>}
    </div>
  );
}

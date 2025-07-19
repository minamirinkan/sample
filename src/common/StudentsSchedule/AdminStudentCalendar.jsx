// src/pages/AdminStudentCalendar.jsx
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import LessonModal from '../modal/LessonModal';
import { fetchCustomerEvents } from './AdminStudentFeth';
import SelectableStudentList from '../../components/SelectableStudentList';

export default function AdminStudentCalendar() {
  const { user, loading } = useAuth();
  const calendarRef = useRef(null);
  const [studentIds, setStudentIds] = useState([]);
  const [matchedLessons, setMatchedLessons] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [makeupCount, setMakeupCount] = useState(0);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const fetchAndSetEvents = async (startDate, endDate) => {
    if (!user || !selectedStudentId) return;
    try {
      const { studentIds, matchedLessons, events } = await fetchCustomerEvents(
        user,
        startDate,
        endDate,
        selectedStudentId
      );
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
    if (!user || loading || !selectedStudentId) return;
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    fetchAndSetEvents(firstDay, lastDay);
  }, [user, loading, selectedStudentId]);

  // FullCalendarのサイズ再調整（初期化後）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    }, 300); // 少し遅延してサイズ調整

    return () => clearTimeout(timer);
  }, [events]);

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

  const handleStudentSelect = (studentId) => {
    console.log("✅ 選択されたstudentId:", studentId);
    setSelectedStudentId(studentId);
  };

  return (
    <div className="p-4 md:p-6 relative w-full">
      <h1 className="text-lg md:text-xl font-bold mb-4">📅 Customer Calendar</h1>

      {loading && <p>AuthContext loading中...</p>}

      {!loading && user && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="mb-2">
              <p><strong>ログイン中の uid:</strong> {user.uid}</p>
              <p><strong>studentIds:</strong> {studentIds.join(', ')}</p>
              <p><strong>選択中の studentId:</strong> {selectedStudentId}</p>
            </div>

            <div className="w-full">
              <SelectableStudentList onStudentSelect={handleStudentSelect} />
            </div>
          </div>

          <h2 className="mt-4 font-semibold">カレンダー表示:</h2>

          <div className="relative w-full max-w-full overflow-auto min-h-[400px]">
            {selectedStudentId && (
              <FullCalendar
                height="auto"
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale="ja"
                events={events}
                eventClick={handleEventClick}
                datesSet={handleDatesSet}
                fixedWeekCount={false}
              />
            )}

            <div className="absolute right-0 bottom-[-3rem] bg-green-100 text-green-700 px-3 py-1 rounded shadow">
              振替回数: {makeupCount}
            </div>
          </div>

          <LessonModal lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />
        </>
      )}

      {!loading && !user && <p>❌ ログインしていません</p>}
    </div>
  );
}

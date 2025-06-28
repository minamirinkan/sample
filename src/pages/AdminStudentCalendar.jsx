// src/pages/AdminStudentCalendar.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import LessonModal from '../data/LessonModal';
import { fetchCustomerEvents } from '../utils/firebase/AdminStudentFeth';
import SelectableStudentList from '../components/SelectableStudentList';

export default function AdminStudentCalendar() {
  const { user, loading } = useAuth();
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
    <div className="p-6 relative">
      <h1 className="text-xl font-bold mb-4">📅 Customer Calendar</h1>

      {loading && <p>AuthContext loading中...</p>}

      {!loading && user && (
        <>
          <div className="flex justify-between items-start">
            <div className="mb-4">
              <p><strong>ログイン中の uid:</strong> {user.uid}</p>
              <p><strong>studentIds:</strong> {studentIds.join(', ')}</p>
              <p><strong>選択中の studentId:</strong> {selectedStudentId}</p>
            </div>

            <div className="ml-4">
              <SelectableStudentList onStudentSelect={handleStudentSelect} />
            </div>
          </div>

          <h2 className="mt-4 font-semibold">カレンダー表示:</h2>
          <div className="relative">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ja"
              events={events}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              fixedWeekCount={false}
            />
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

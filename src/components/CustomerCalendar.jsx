// src/components/CustomerCalendar.jsx

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// === シンプルモーダルを同ファイル内に定義 ===
function LessonModal({ lesson, onClose }) {
  if (!lesson) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-80 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">授業詳細</h2>
        <p className="mb-2"><strong>時間割:</strong> {lesson.extendedProps.period}</p>
        <p className="mb-2"><strong>時間:</strong> {lesson.extendedProps.time}</p>
        <p className="mb-2"><strong>教科:</strong> {lesson.title}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

export default function CustomerCalendar() {
  const [selectedLesson, setSelectedLesson] = useState(null);

  // === ✅ モック授業データ ===
  const lessons = [
    { date: '2025-06-22', period: '1限', time: '09:50~11:10', subject: '英語' },
    { date: '2025-06-22', period: '2限', time: '11:20~12:40', subject: '数学' },
    { date: '2025-06-22', period: '3限', time: '18:50~20:10', subject: '国語' },
    { date: '2025-06-25', period: '2限', time: '11:20~12:40', subject: '数学' },
  ];

  // === FullCalendar の events 用に変換 ===
  const events = lessons.map((lesson, idx) => ({
    id: idx,
    title: `${lesson.period} ${lesson.subject}`,
    start: lesson.date,
    extendedProps: {
      period: lesson.period,
      time: lesson.time,
    },
  }));

  return (
    <div className="p-6">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="ja"
        events={events}
        eventClick={(info) => {
          setSelectedLesson(info.event);
        }}
      />

      <LessonModal
        lesson={selectedLesson}
        onClose={() => setSelectedLesson(null)}
      />
    </div>
  );
}

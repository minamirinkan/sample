import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

// === モーダル ===
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
        <p className="mb-2"><strong>教科:</strong> {lesson.extendedProps.subject}</p>
        <p className="mb-2"><strong>生徒:</strong> {lesson.extendedProps.studentName}</p>
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
  const { user, loading } = useAuth();
  const [studentIds, setStudentIds] = useState([]);
  const [matchedLessons, setMatchedLessons] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (loading) return;
      if (!user) {
        console.log("❌ ログインユーザーなし");
        return;
      }

      try {
        const customerRef = doc(db, 'customers', user.uid);
        const customerSnap = await getDoc(customerRef);
        if (!customerSnap.exists()) {
          console.log("❌ customer ドキュメントなし");
          return;
        }

        const customerData = customerSnap.data();
        const ids = customerData.studentIds || [];
        setStudentIds(ids);

        if (ids.length === 0) {
          console.log("❌ studentIds が空です");
          return;
        }

        const classroomCode = ids[0].substring(1, 4);
        console.log("✅ 抽出した classroomCode:", classroomCode);

        const classroomSnap = await getDoc(doc(db, 'classrooms', classroomCode));
        if (!classroomSnap.exists()) {
          console.log("❌ classroom が存在しません:", classroomCode);
          return;
        }

        const schedulesRef = collection(db, 'dailySchedules');
        const scheduleDocs = await getDocs(schedulesRef);

        let matched = [];
        let eventList = [];

        let periodLabels = [];
        const schoolLabelsSnap = await getDoc(doc(db, 'periodLabelsBySchool', classroomCode));
        if (schoolLabelsSnap.exists()) {
          periodLabels = schoolLabelsSnap.data().periodLabels;
        } else {
          const commonLabelsSnap = await getDoc(doc(db, 'common', 'periodLabels'));
          if (commonLabelsSnap.exists()) {
            periodLabels = commonLabelsSnap.data().periodLabels;
          }
        }

        scheduleDocs.forEach((docSnap) => {
          const docId = docSnap.id;
          if (!docId.startsWith(`${classroomCode}_`)) return;

          const date = docId.split('_')[1];
          const data = docSnap.data();
          const rows = data.rows || [];

          rows.forEach((row) => {
            const periods = row.periods || {};
            Object.entries(periods).forEach(([periodKey, periodValue]) => {
              periodValue.forEach((student) => {
                if (ids.includes(student.studentId)) {
                  const periodIndex = parseInt(periodKey.replace('period', '')) - 1;
                  const periodLabel = periodLabels[periodIndex]?.label || periodKey;
                  const time = periodLabels[periodIndex]?.time || '';
                  const subject = student.subject || '';
                  const studentName = student.name || '';

                  matched.push({
                    date,
                    periodLabel,
                    time,
                    subject,
                    studentName,
                  });

                  eventList.push({
                    title: `${periodLabel} ${subject}`,
                    start: date,
                    extendedProps: {
                      period: periodLabel,
                      time: time,
                      subject: subject,
                      studentName: studentName,
                    },
                  });
                }
              });
            });
          });
        });

        console.log("✅ 一致した授業:", matched);
        setMatchedLessons(matched);
        setEvents(eventList);

      } catch (error) {
        console.error("❌ Firestore エラー:", error);
      }
    };

    fetchData();
  }, [user, loading]);

  const handleEventClick = (info) => {
    setSelectedLesson(info.event);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📅 Customer Calendar</h1>

      {loading && <p>AuthContext loading中...</p>}

      {!loading && user && (
        <>
          <p><strong>ログイン中の uid:</strong> {user.uid}</p>
          <p><strong>studentIds:</strong> {studentIds.join(', ')}</p>

          <h2 className="mt-4 font-semibold">カレンダー表示:</h2>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="ja"
            events={events}
            eventClick={handleEventClick}
          />

          <LessonModal
            lesson={selectedLesson}
            onClose={() => setSelectedLesson(null)}
          />

          <h2 className="mt-4 font-semibold">一致した授業一覧:</h2>
          {matchedLessons.length === 0 && <p>一致する授業がありません。</p>}
          <ul className="list-disc ml-6">
            {matchedLessons.map((lesson, idx) => (
              <li key={idx}>
                📅 {lesson.date} | {lesson.periodLabel} ({lesson.time}) | {lesson.subject} | {lesson.studentName}
              </li>
            ))}
          </ul>
        </>
      )}

      {!loading && !user && (
        <p>❌ ログインしていません</p>
      )}
    </div>
  );
}

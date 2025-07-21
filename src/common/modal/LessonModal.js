// data/LessonModal.jsx
export default function LessonModal({ lesson, onClose }) {
  if (!lesson) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[10000]">
      <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-md relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">✕</button>
        <h2 className="text-xl font-bold mb-4">授業詳細</h2>
        <p className="mb-2"><strong>時間割:</strong> {lesson.extendedProps.period}</p>
        <p className="mb-2"><strong>時間:</strong> {lesson.extendedProps.time}</p>
        <p className="mb-2"><strong>教科:</strong> {lesson.extendedProps.subject}</p>
        <p className="mb-2"><strong>生徒:</strong> {lesson.extendedProps.studentName}</p>
        <button onClick={onClose} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">閉じる</button>
      </div>
    </div>
  );
}

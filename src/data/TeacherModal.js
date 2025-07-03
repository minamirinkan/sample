// data/LessonModal.jsx
export default function LessonModal({ lesson, onClose }) {
  if (!lesson) return null;

  const teachingList = lesson.extendedProps?.teachingList || [];
  const period = lesson.extendedProps?.period || '';
  const time = lesson.extendedProps?.time || '';

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

        <p className="mb-2">
          <strong>時間割:</strong> {period}
        </p>

        <p className="mb-2">
          <strong>時間:</strong> {time}
        </p>

        <p className="mb-2">
          <strong>対象授業:</strong>
        </p>
        <ul className="list-disc list-inside">
          {teachingList.map((item, idx) => (
            <li key={idx}>
              {item.subject}（{item.grade}）
            </li>
          ))}
        </ul>

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

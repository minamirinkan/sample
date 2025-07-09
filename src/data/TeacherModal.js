// data/LessonModal.jsx
export default function LessonModal({ lesson, onClose }) {
  if (!lesson) return null;

  const { teachingList = [], periodRange = '' } = lesson.extendedProps;

  // 時限ごとにグループ化（時間も保持）
  const groupedByPeriod = teachingList.reduce((acc, item) => {
    if (!acc[item.periodLabel]) {
      acc[item.periodLabel] = {
        time: item.time,
        periodIndex: item.periodIndex, // 🔽 ソートのため追加
        subjects: [],
      };
    }
    acc[item.periodLabel].subjects.push({
      subject: item.subject,
      grade: item.grade,
    });
    return acc;
  }, {});

  // 🔽 periodIndex順に並べる（periodLabelは例：'2限', '3限'）
  const sortedPeriods = Object.entries(groupedByPeriod).sort(
    (a, b) => a[1].periodIndex - b[1].periodIndex
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-[360px] max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">授業詳細（{periodRange}）</h2>

        {sortedPeriods.map(([period, data]) => (
          <div key={period} className="mb-4 border-b pb-2">
            <p className="font-semibold text-gray-700 mb-1">
              📘 {period}（{data.time}）
            </p>
            <ul className="ml-4 list-disc text-sm text-gray-800">
              {data.subjects.map((item, index) => (
                <li key={index}>
                  {item.subject}（{item.grade}）
                </li>
              ))}
            </ul>
          </div>
        ))}

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

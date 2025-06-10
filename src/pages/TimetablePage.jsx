import { useState } from 'react';
import TimetableTable from '../components/TimetableTable';
import PDFButton from '../components/PDFButton';
import CalendarPopup from '../components/CalendarPopup';

export default function TimetablePage() {
  const today = new Date();
  const [rows, setRows] = useState([
    {
      teacher: '',
      periods: Array(8).fill([]).map(() => []),
    },
  ]);

  const [selectedDateInfo, setSelectedDateInfo] = useState({
    type: 'date',
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    date: today.getDate(),
    weekday: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'][today.getDay()],
  });

  const updateRow = (rowIdx, newRow) => {
    const updated = [...rows];
    updated[rowIdx] = newRow;
    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { teacher: '', periods: Array(8).fill([]).map(() => []) }
    ]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-4 space-x-4">
        <h1 className="text-2xl font-bold">時間割（南林間教室）</h1>

        <span className="text-gray-700 text-sm">
          {selectedDateInfo.type === 'date'
            ? `${selectedDateInfo.year}年${selectedDateInfo.month}月${selectedDateInfo.date}日`
            : `${selectedDateInfo.weekday}`}
        </span>

        <CalendarPopup onDateSelect={setSelectedDateInfo} />
      </div>

      <TimetableTable rows={rows} onChange={updateRow} />

      <div className="text-center mt-4 space-x-2">
        <button
          onClick={addRow}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          講師行を追加
        </button>
        <PDFButton rows={rows} />
      </div>
    </div>
  );
}

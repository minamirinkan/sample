import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TimetableTable from '../components/TimetableTable';
import CalendarPopup from '../components/CalendarPopup';
import { fetchTimetableData, saveTimetableData } from '../utils/firebase/timetableFirestore';
import { formatDateDisplay } from '../utils/dateUtils';
// import PDFButton from '../components/PDFButton';

export default function TimetablePage() {
  const { adminData } = useAuth();
  const today = new Date();

  const [selectedDate, setSelectedDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    date: today.getDate(),
    weekday: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'][today.getDay()],
    type: 'date'
  });

  const [rows, setRows] = useState([
    { teacher: '', periods: Array(8).fill([]).map(() => []) }
  ]);
  const [classroomName, setClassroomName] = useState('');
  const [periodLabels, setPeriodLabels] = useState([
    { label: '1限', time: '09:50〜11:10' },
    { label: '2限', time: '11:20〜12:40' },
    { label: '3限', time: '12:50〜14:10' },
    { label: '4限', time: '14:20〜15:40' },
    { label: '5限', time: '15:50〜17:10' },
    { label: '6限', time: '17:20〜18:40' },
    { label: '7限', time: '18:50〜20:10' },
    { label: '8限', time: '20:20〜21:40' },
  ]);

  useEffect(() => {
    if (!adminData?.classroomCode) return;

    fetchTimetableData(selectedDate, adminData.classroomCode).then(({ rows, periodLabels, classroomName }) => {
      if (rows) {
        // 🔑 必ず固定行が無い場合は追加
        const hasTransfer = rows.find(r => r.teacher === '振り替え');
        const hasAbsent = rows.find(r => r.teacher === '欠席');
        const normalRows = rows.filter(r => r.teacher !== '振り替え' && r.teacher !== '欠席');
        const finalRows = [
          ...normalRows,
          hasTransfer || { teacher: '振り替え', periods: Array(8).fill([]).map(() => []) },
          hasAbsent || { teacher: '欠席', periods: Array(8).fill([]).map(() => []) },
        ];
        setRows(finalRows);
      }
      if (periodLabels) setPeriodLabels(periodLabels);
      if (classroomName) setClassroomName(classroomName);
    });
  }, [selectedDate, adminData]);

  // ✅ rows全体更新をイベントで受ける
  useEffect(() => {
    const handler = (e) => {
      setRows(e.detail);
    };
    window.addEventListener('updateAllRows', handler);
    return () => window.removeEventListener('updateAllRows', handler);
  }, []);

  const saveTimetable = async () => {
    if (!adminData?.classroomCode) return;

    // 🔑 slice をやめて全 rows を保存する
    await saveTimetableData(selectedDate, adminData.classroomCode, rows, periodLabels);
    alert(`${selectedDate.type === 'date' ? '日付' : '曜日'}の時間割を保存しました！`);
  };

  const updateRow = (rowIdx, newRow) => {
    const updated = [...rows];
    updated[rowIdx] = newRow;
    setRows(updated);
  };

  const addRow = () => {
    const normalRows = rows.slice(0, -2);
    const fixedRows = rows.slice(-2);
    setRows([...normalRows, { teacher: '', periods: Array(8).fill([]).map(() => []) }, ...fixedRows]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-4 space-x-4">
        <h1 className="text-2xl font-bold">時間割（{classroomName || '教室名取得中...'}）</h1>
        <span className="text-gray-700 text-sm">{formatDateDisplay(selectedDate)}</span>
        <CalendarPopup onDateSelect={setSelectedDate} />
      </div>

      <TimetableTable rows={rows} onChange={updateRow} periodLabels={periodLabels} />

      <div className="text-center mt-4 space-x-2">
        <button onClick={addRow} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          講師行を追加
        </button>
        <button onClick={saveTimetable} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          この{selectedDate.type === 'date' ? '日付' : '曜日'}の時間割を保存
        </button>
        {/* <PDFButton rows={rows} /> */}
      </div>
    </div>
  );
}

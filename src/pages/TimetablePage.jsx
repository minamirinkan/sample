import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TimetableTable from '../components/TimetableTable';
import CalendarPopup from '../components/CalendarPopup';
import { fetchTimetableData, saveTimetableData } from '../utils/firebase/timetableFirestore';
import { formatDateDisplay } from '../utils/dateUtils';

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

    (async () => {
      console.log('[TimetablePage] === useEffect triggered ===');
      console.log('SelectedDate:', selectedDate);
      console.log('ClassroomCode:', adminData.classroomCode);

      const { rows: fetchedRows, periodLabels: fetchedLabels, classroomName } =
        await fetchTimetableData(selectedDate, adminData.classroomCode);

      console.log('[TimetablePage] 🔑 Fetched Rows:', fetchedRows);
      console.log('[TimetablePage] 🔑 Fetched Period Labels:', fetchedLabels);
      console.log('[TimetablePage] 🔑 Fetched Classroom Name:', classroomName);

      const defaultPeriodLabels = [
        { label: '1限', time: '09:50〜11:10' },
        { label: '2限', time: '11:20〜12:40' },
        { label: '3限', time: '12:50〜14:10' },
        { label: '4限', time: '14:20〜15:40' },
        { label: '5限', time: '15:50〜17:10' },
        { label: '6限', time: '17:20〜18:40' },
        { label: '7限', time: '18:50〜20:10' },
        { label: '8限', time: '20:20〜21:40' },
      ];

      const finalPeriodLabels = fetchedLabels?.length > 0 ? fetchedLabels : defaultPeriodLabels;
      setPeriodLabels(finalPeriodLabels);

      let finalRows;
      if (fetchedRows && fetchedRows.length > 0) {
        const hasUndecided = fetchedRows.find(r => r.teacher?.status === '未定');
        const hasTransfer = fetchedRows.find(r => r.teacher?.status === '振替');
        const hasAbsent = fetchedRows.find(r => r.teacher?.status === '欠席');
        const normalRows = fetchedRows.filter(r => !['未定', '振替', '欠席'].includes(r.teacher?.status));

        finalRows = [
          ...normalRows,
          hasUndecided || { teacher: { status: '未定' }, periods: Array(8).fill([]).map(() => []) },
          hasTransfer || { teacher: { status: '振替' }, periods: Array(8).fill([]).map(() => []) },
          hasAbsent || { teacher: { status: '欠席' }, periods: Array(8).fill([]).map(() => []) },
        ];
      } else {
        finalRows = [
          { teacher: { status: '未定' }, periods: Array(8).fill([]).map(() => []) },
          { teacher: { status: '振替' }, periods: Array(8).fill([]).map(() => []) },
          { teacher: { status: '欠席' }, periods: Array(8).fill([]).map(() => []) },
        ];
      }

      console.log('[TimetablePage] ✅ Final Rows after merging:', finalRows);
      setRows(finalRows);

      if (!fetchedLabels || fetchedLabels.length === 0) {
        console.log('[TimetablePage] 💾 Saving default period labels to Firestore...');
        await saveTimetableData(selectedDate, adminData.classroomCode, finalRows, defaultPeriodLabels);
      }

      if (classroomName) setClassroomName(classroomName);
    })();
  }, [selectedDate, adminData]);

  useEffect(() => {
    const handler = (e) => {
      console.log('[TimetablePage] ⚡ updateAllRows triggered:', e.detail);
      setRows(e.detail);
    };
    window.addEventListener('updateAllRows', handler);
    return () => window.removeEventListener('updateAllRows', handler);
  }, []);

  const changeDateBy = (days) => {
    const date = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.date);
    date.setDate(date.getDate() + days);
    setSelectedDate({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      date: date.getDate(),
      weekday: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'][date.getDay()],
      type: 'date'
    });
  };

  const saveTimetable = async () => {
    if (!adminData?.classroomCode) return;
    const cleanedRows = rows.map(row => ({
      ...row,
      status: row.teacher?.status || '予定'
    }));
    console.log('[TimetablePage] 💾 Saving Rows:', cleanedRows);
    await saveTimetableData(selectedDate, adminData.classroomCode, cleanedRows, periodLabels);
    alert(`${selectedDate.type === 'date' ? '日付' : '曜日'}の時間割を保存しました！`);
  };

  const updateRow = (rowIdx, newRow) => {
    const updated = [...rows];
    updated[rowIdx] = newRow;
    console.log('[TimetablePage] 📝 Updated Row:', updated);
    setRows(updated);
  };

  const addRow = () => {
    const normalRows = rows.filter(r => !['未定', '振替', '欠席'].includes(r.teacher?.status));
    const fixedRows = rows.filter(r => ['未定', '振替', '欠席'].includes(r.teacher?.status));
    const newRows = [
      ...normalRows,
      { teacher: { status: '予定' }, periods: Array(8).fill([]).map(() => []) },
      ...fixedRows
    ];
    console.log('[TimetablePage] ➕ Row Added:', newRows);
    setRows(newRows);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-4 space-x-4">
        <h1 className="text-2xl font-bold">時間割（{classroomName || '教室名取得中...'}）</h1>
        <span className="text-gray-700 text-sm">{formatDateDisplay(selectedDate)}</span>
        <CalendarPopup onDateSelect={setSelectedDate} />
        <button
          onClick={() => changeDateBy(-1)}
          className="bg-gray-300 hover:bg-gray-400 text-sm px-2 py-1 rounded"
        >
          前日
        </button>
        <button
          onClick={() => changeDateBy(1)}
          className="bg-gray-300 hover:bg-gray-400 text-sm px-2 py-1 rounded"
        >
          翌日
        </button>
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

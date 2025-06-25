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
  const [periodLabels, setPeriodLabels] = useState([]); // ✅ デフォルトなし

  useEffect(() => {
    if (!adminData?.classroomCode) return;

    (async () => {
      const { rows, periodLabels, classroomName } = await fetchTimetableData(selectedDate, adminData.classroomCode);

      setPeriodLabels(periodLabels ?? []);

      let finalRows;
      if (rows && rows.length > 0) {
        const hasUndecided = rows.find(r => r.status === '未定');
        const hasTransfer = rows.find(r => r.status === '振替');
        const hasAbsent = rows.find(r => r.status === '欠席');
        const normalRows = rows.filter(r => !['未定', '振替', '欠席'].includes(r.status));

        finalRows = [
          ...normalRows.map(r => ({ ...r, status: '予定' })),
          hasUndecided || { status: '未定', teacher: null, periods: Array(8).fill([]).map(() => []) },
          hasTransfer || { status: '振替', teacher: null, periods: Array(8).fill([]).map(() => []) },
          hasAbsent || { status: '欠席', teacher: null, periods: Array(8).fill([]).map(() => []) },
        ];
      } else {
        finalRows = [
          { status: '未定', teacher: null, periods: Array(8).fill([]).map(() => []) },
          { status: '振替', teacher: null, periods: Array(8).fill([]).map(() => []) },
          { status: '欠席', teacher: null, periods: Array(8).fill([]).map(() => []) },
        ];
      }

      setRows(finalRows);
      setClassroomName(classroomName); // ✅ 必ずセット
    })();
  }, [selectedDate, adminData]);

  useEffect(() => {
    const handler = (e) => {
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

  // ✅ 追加：同じ生徒が同じ時限に2回以上入っていないかチェック
  const checkDuplicateStudentsPerPeriod = (rows) => {
    const periodStudentMap = Array(8).fill(null).map(() => new Set());
    const duplicates = [];

    rows.forEach((row, rowIndex) => {
      row.periods.forEach((students, periodIdx) => {
        students.forEach((student) => {
          const id = student?.studentId;
          if (id) {
            if (periodStudentMap[periodIdx].has(id)) {
              duplicates.push({ studentId: id, period: periodIdx + 1 });
            } else {
              periodStudentMap[periodIdx].add(id);
            }
          }
        });
      });
    });

    return duplicates;
  };

  const saveTimetable = async () => {
    if (!adminData?.classroomCode) return;

    // ✅ チェック：同一時限に同一生徒がいないか
    const duplicates = checkDuplicateStudentsPerPeriod(rows);
    if (duplicates.length > 0) {
      alert('同じ生徒が同じ時限に複数の講師に割り当てられています。保存できません。');
      return;
    }

    const cleanedRows = rows.map(row => ({
      ...row,
      status: row.status || '予定'
    }));
    await saveTimetableData(selectedDate, adminData.classroomCode, cleanedRows);
    alert(`${selectedDate.type === 'date' ? '日付' : '曜日'}の時間割を保存しました！`);
  };

  const updateRow = (rowIdx, newRow) => {
    const updated = [...rows];
    updated[rowIdx] = newRow;
    setRows(updated);
  };

  const addRow = () => {
    const normalRows = rows.filter(r => !['未定', '振替', '欠席'].includes(r.status));
    const fixedRows = rows.filter(r => ['未定', '振替', '欠席'].includes(r.status));
    setRows([
      ...normalRows,
      { teacher: null, status: '予定', periods: Array(8).fill([]).map(() => []) },
      ...fixedRows
    ]);
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
      </div>
    </div>
  );
}

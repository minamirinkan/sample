// src/pages/TimetablePage.jsx
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

import TimetableTable from '../components/TimetableTable';
import CalendarPopup from '../components/CalendarPopup';
//import PDFButton from '../components/PDFButton';

export default function TimetablePage() {
  const { adminData } = useAuth();
  const today = new Date();

  const [selectedDate, setSelectedDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    date: today.getDate(),
    weekday: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'][today.getDay()],
    type: 'date' // 'date' or 'weekday'
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
    const fetchClassroomName = async () => {
      if (!adminData?.classroomCode) return;
      const ref = doc(db, 'classrooms', adminData.classroomCode);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setClassroomName(snap.data().name);
      } else {
        setClassroomName('教室名不明');
      }
    };
    fetchClassroomName();
  }, [adminData]);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!adminData?.classroomCode) return;

      const classroomCode = adminData.classroomCode;

      // ▼ 日付からキー生成
      const dateKey =
        selectedDate.type === 'date'
          ? `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.date).padStart(2, '0')}`
          : null;

      // ▼ 先に日付ベースのデータ取得（date or weekday fallback）
      let snap = null;
      if (selectedDate.type === 'date') {
        const ref = doc(db, 'classrooms', classroomCode, 'timetables', dateKey);
        snap = await getDoc(ref);
        if (snap.exists()) {
          return loadSnapshot(snap);
        }
      }

      // ▼ fallback: 曜日テンプレートから取得
      const dow = selectedDate.type === 'weekday'
        ? ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'].indexOf(selectedDate.weekday)
        : new Date(dateKey).getDay();

      const fallbackRef = doc(db, 'classrooms', classroomCode, 'weekdayTemplates', String(dow));
      const fallbackSnap = await getDoc(fallbackRef);

      if (fallbackSnap.exists()) {
        return loadSnapshot(fallbackSnap);
      } else {
        setRows([{ teacher: '', periods: Array(8).fill([]).map(() => []) }]);
      }
    };

    const loadSnapshot = (snap) => {
      const data = snap.data();
      if (data.periodLabels) setPeriodLabels(data.periodLabels);

      const loadedRows = data.rows.map((row) => {
        const periodsArray = [];
        for (let i = 1; i <= 8; i++) {
          periodsArray.push(row.periods?.[`period${i}`] || []);
        }
        return {
          teacher: row.teacher,
          periods: periodsArray,
        };
      });

      setRows(loadedRows);
    };

    fetchTimetable();
  }, [selectedDate, adminData]);

  const saveTimetable = async () => {
    if (!adminData?.classroomCode) return;

    const classroomCode = adminData.classroomCode;

    let docRef;
    if (selectedDate.type === 'date') {
      const dateKey = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.date).padStart(2, '0')}`;
      docRef = doc(db, 'classrooms', classroomCode, 'timetables', dateKey);
    } else {
      const weekdayIndex = ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'].indexOf(selectedDate.weekday);
      docRef = doc(db, 'classrooms', classroomCode, 'weekdayTemplates', String(weekdayIndex));
    }

    const sanitizedRows = rows.map((row) => ({
      teacher: row.teacher,
      periods: row.periods.map((period) =>
        Array.isArray(period) ? period.map((entry) => ({ ...entry })) : []
      ),
    }));

    const flattenedRows = sanitizedRows.map((row) => {
      const flat = {};
      row.periods.forEach((p, idx) => {
        flat[`period${idx + 1}`] = p;
      });
      return {
        teacher: row.teacher,
        periods: flat,
      };
    });

    await setDoc(docRef, {
      periodLabels,
      rows: flattenedRows,
    });

    alert(`${selectedDate.type === 'date' ? '日付' : '曜日'}の時間割を保存しました！`);
  };

  const updateRow = (rowIdx, newRow) => {
    const updated = [...rows];
    updated[rowIdx] = newRow;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { teacher: '', periods: Array(8).fill([]).map(() => []) }]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-4 space-x-4">
        <h1 className="text-2xl font-bold">時間割（{classroomName || '教室名取得中...'}）</h1>
        <span className="text-gray-700 text-sm">
          {selectedDate.type === 'date'
            ? `${selectedDate.year}年${selectedDate.month}月${selectedDate.date}日`
            : `${selectedDate.weekday}`}
        </span>
        <CalendarPopup onDateSelect={setSelectedDate} />
      </div>

      <TimetableTable rows={rows} onChange={updateRow} periodLabels={periodLabels} />

      <div className="text-center mt-4 space-x-2">
        <button
          onClick={addRow}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          講師行を追加
        </button>

        <button
          onClick={saveTimetable}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          この{selectedDate.type === 'date' ? '日付' : '曜日'}の時間割を保存
        </button>
        {/*<PDFButton rows={rows} />*/}
      </div>
    </div>
  );
}

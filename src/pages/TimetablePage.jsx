//pages/TimetablePage.jsx
import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TimetableTable from '../components/TimetableTable';
import CalendarPopup from '../components/CalendarPopup';
import { fetchTimetableData, saveTimetableData } from '../utils/firebase/timetableFirestore';
import { confirmAttendanceStatus, fetchConfirmedAttendanceDatesFromDailySchedules } from '../utils/firestoreAttendanceUtils';
import ConfirmAttendanceModal from '../components/ConfirmAttendanceModal';
import { formatDateDisplay } from '../utils/dateUtils';
<<<<<<< HEAD
import PDFButton from '../components/PDFButton';
=======
import ConfirmOverwriteModal from "../components/ConfirmOverwriteModal";
>>>>>>> 3379f8c734b502545e2b70466caa023256b42cd2

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
  {
    status: '予定',
    teacher: '佐藤1先生',
    periods: [
      [],
      [],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中太郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中三郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中四郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中五郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中六郎' }],
      [],
      [],
      [],
      [],
      []
    ]
  },
  {
    status: '予定',
    teacher: '鈴木1先生',
    periods: [
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '佐々木太郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '佐々木次郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中1郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中2郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中3郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中4郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中5郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中6郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '小林次郎' }],
      [],
      [],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '木村次郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '村上次郎' }]
    ]
  },

  {
    status: '予定',
    teacher: '鈴木2先生',
    periods: [
      [],
      [],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '鈴木次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '鈴木次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '高橋次郎' }],
      [],
      [],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '大山次郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '岩田次郎' }]
    ]
  },
  {
    status: '予定',
    teacher: '鈴木3先生',
    periods: [
      [],
      [],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '大谷次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '赤井次郎' }],
      [],
      [],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '中村次郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '毛利次郎' }]
    ]
  },
  {
    status: '予定',
    teacher: '鈴木4先生',
    periods: [
      [],
      [],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' }],
      [],
      [],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '小田次郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '武田次郎' }]
    ]
  },
  {
    status: '予定',
    teacher: '鈴木5先生',
    periods: [
      [],
      [],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中三郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '向山次郎' }],
      [],
      [],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '大木次郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '村田次郎' }]
    ]
  },
  {
    status: '予定',
    teacher: '鈴木6先生',
    periods: [
      [],
      [],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中三郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' },{ subject: '国語',grade : '中1',studentId: 'stu003', name: '田中次郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '向山次郎' }],
      [],
      [],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '大木次郎' }],
      [{ subject: '国語',grade : '中1',studentId: 'stu003', name: '村田次郎' }]
    ]
  },
  {
    status: '未定',
    teacher: null,
    periods: Array(8).fill([]).map(() => [])
  },
  {
    status: '振替',
    teacher: null,
    periods: Array(8).fill([]).map(() => [])
  },
  {
    status: '欠席',
    teacher: null,
    periods: Array(8).fill([]).map(() => [])
  }
]);
  const [classroomName, setClassroomName] = useState('');
  const [periodLabels, setPeriodLabels] = useState([]);

  // 追加: モーダル開閉と処理中フラグ
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProcessingConfirm, setIsProcessingConfirm] = useState(false);
  const [isConfirmOverwriteModalOpen, setIsConfirmOverwriteModalOpen] = useState(false);

  // Firestoreから時間割データ取得関数を切り出し（再利用するため）
  const [isSaved, setIsSaved] = useState(false);

  const loadTimetableData = React.useCallback(async () => {
    if (!adminData?.classroomCode) return;

    const { rows, periodLabels, classroomName } = await fetchTimetableData(selectedDate, adminData.classroomCode);
    setPeriodLabels(periodLabels ?? []);
    // ここでisSavedを判定
    const saved = rows?.some(row => row.status === '出勤') ?? false;
    setIsSaved(saved);

    let finalRows;
    if (rows && rows.length > 0) {
      const hasUndecided = rows.find(r => r.status === '未定');
      const hasTransfer = rows.find(r => r.status === '振替');
      const hasAbsent = rows.find(r => r.status === '欠席');
      const normalRows = rows.filter(r => !['未定', '振替', '欠席'].includes(r.status));

      finalRows = [
        ...normalRows.map(r => ({ ...r, status: '予定' })),
        hasUndecided || { status: '未定', teacher: null, periods: Array.from({ length: 8 }, () => []) },
        hasTransfer || { status: '振替', teacher: null, periods: Array.from({ length: 8 }, () => []) },
        hasAbsent || { status: '欠席', teacher: null, periods: Array.from({ length: 8 }, () => []) },
      ];
    } else {
      finalRows = [
        { status: '未定', teacher: null, periods: Array.from({ length: 8 }, () => []) },
        { status: '振替', teacher: null, periods: Array.from({ length: 8 }, () => []) },
        { status: '欠席', teacher: null, periods: Array.from({ length: 8 }, () => []) },
      ];
    }

    setRows(finalRows);
    setClassroomName(classroomName);
  }, [selectedDate, adminData?.classroomCode]);

  useEffect(() => {
    loadTimetableData();
  }, [loadTimetableData]);

  useEffect(() => {
    const handler = (e) => {
      setRows(e.detail);
    };
    window.addEventListener('updateAllRows', handler);
    return () => window.removeEventListener('updateAllRows', handler);
  }, []);

  const [confirmedDates, setConfirmedDates] = useState([]);

  useEffect(() => {
    const loadConfirmedDates = async () => {
      if (!adminData?.classroomCode) return;
      const dates = await fetchConfirmedAttendanceDatesFromDailySchedules(adminData.classroomCode);
      setConfirmedDates(dates);
    };

    loadConfirmedDates();
  }, [adminData?.classroomCode]);

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

  // モーダルで「はい」を押した後に実際に保存するための一時的な関数格納
  const [pendingSave, setPendingSave] = useState(null);

  const handleClickSaveButton = () => {
    if (isSaved) {
      // すでに確定済みならモーダルを表示
      setPendingSave(() => saveTimetable);
      setIsConfirmOverwriteModalOpen(true);
    } else {
      // 未確定なら即保存
      saveTimetable();
    }
  };

  const saveTimetable = async () => {
    if (!adminData?.classroomCode) return;

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
    setIsSaved(false); // 修正後は再確定が必要
    setIsConfirmOverwriteModalOpen(false); // 忘れず閉じる
    setPendingSave(null);
  };


  // 「出席を確定」ボタン押下 → モーダルを開く
  const openConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  // モーダルのOK押下 → 出席確定処理
  const onConfirmAttendance = async () => {
    if (!adminData?.classroomCode) return;
    setIsProcessingConfirm(true);
    try {
      const formattedDate = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.date).padStart(2, '0')}`;
      await confirmAttendanceStatus(adminData.classroomCode, formattedDate);
      alert('出席を確定しました。');
      setIsConfirmModalOpen(false);
      await loadTimetableData(); // 再読み込みして最新状態反映
    } catch (error) {
      alert('出席確定処理でエラーが発生しました。');
      console.error(error);
    } finally {
      setIsProcessingConfirm(false);
    }
  };

  const isTodayOrPast = () => {
    const today = new Date();
    const targetDate = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.date); // 月は0始まり
    return targetDate <= today;
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
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <span>時間割（{classroomName || '教室名取得中...'}）</span>
          <span
            className={`text-sm px-2 py-1 rounded-full font-medium ${isSaved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}
          >
            {isSaved ? '出席確定済み' : '出席未確定'}
          </span>
        </h1>
        <span className="text-gray-700 text-sm">{formatDateDisplay(selectedDate)}</span>
        <CalendarPopup
          onDateSelect={setSelectedDate}
          confirmedDates={confirmedDates}
          classroomCode={adminData?.classroomCode}  // ここを追加
        />
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
        <button
          onClick={handleClickSaveButton}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          この{selectedDate.type === 'date' ? '日付' : '曜日'}の時間割を保存
        </button>
<<<<<<< HEAD
        
        {<PDFButton rows={rows} />}


=======
        <button
          onClick={openConfirmModal}
          disabled={!isTodayOrPast() || isProcessingConfirm || isSaved}
          className={`px-4 py-2 rounded text-white
          ${!isTodayOrPast() || isProcessingConfirm || isSaved
              ? 'bg-red-300 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'}`}
        >
          出席を確定
        </button>
        {(!isTodayOrPast() || isSaved) && (
          <p className="text-sm text-gray-500 mt-2">
            {!isTodayOrPast()
              ? '出席の確定は当日または過去の日付のみ可能です。'
              : '既に出席が確定済みです。'
            }
          </p>
        )}
>>>>>>> 3379f8c734b502545e2b70466caa023256b42cd2
      </div>
      <ConfirmOverwriteModal
        isOpen={isConfirmOverwriteModalOpen}
        onCancel={() => setIsConfirmOverwriteModalOpen(false)}
        onConfirm={() => {
          pendingSave?.(); // 保存処理実行
        }}
      />
      <ConfirmAttendanceModal
        isOpen={isConfirmModalOpen}
        onRequestClose={() => setIsConfirmModalOpen(false)}
        onConfirm={onConfirmAttendance}
        isProcessing={isProcessingConfirm}
      />
    </div>
  );
}

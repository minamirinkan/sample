//pages/TimetablePage.tsx
import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useAuth, AuthProvider } from '../../contexts/AuthContext';
import TimetableTable from './components/TimetableTable';
import CalendarPopup from './components/CalendarPopup';
import { fetchTimetableData, saveTimetableData } from './firebase/timetableFirestore';
import { confirmAttendanceStatus, fetchConfirmedAttendanceDatesFromDailySchedules } from './firebase/firestoreAttendanceUtils';
import ConfirmAttendanceModal from '../modal/ConfirmAttendanceModal';
import { formatDateDisplay } from '../dateUtils';
import ConfirmOverwriteModal from '../modal/ConfirmOverwriteModal';
import PDFButton from './pdf/components/PDFButton';
import { useAdminData, AdminDataProvider } from '../../contexts/providers/AdminDataProvider';
import { Student } from '@/contexts/types/student';
import { DuplicateInfo } from '@/contexts/types/timetable';
import { RowData } from '@/contexts/types/timetablerow';
import { TimetableRow, TimetableStudent } from '@/contexts/types/data';
import StudentList from './components/StudentList';

function toTimetableStudent(student: any): TimetableStudent {

  return {
    studentId: student.studentId ?? '',
    grade: student.grade ?? '',
    name: student.name ?? '',  // 修正: firstNameとlastNameから構築した名前を使用
    seat: student.seat ?? '',
    subject: student.subject ?? '',
    classType: student.classType ?? '',
    duration: student.duration,
    status: student.status ?? '予定',
  };
}

export default function TimetablePage() {
  const { userData } = useAuth();
  const { classroom } = useAdminData();

  // URL から日付を初期化
  const getInitialDate = (): Date => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date'); // 'YYYY-MM-DD'
    if (dateParam) {
      const [year, month, day] = dateParam.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  };

  const initialDate = getInitialDate();
  const [selectedDate, setSelectedDate] = useState({
    year: initialDate.getFullYear(),
    month: initialDate.getMonth() + 1,
    date: initialDate.getDate(),
    weekday: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'][initialDate.getDay()],
    type: 'date' as 'date' | 'weekday'
  });

  const [rows, setRows] = useState<RowData[]>([
    { teacher: null, status: '予定', periods: Array(8).fill([]).map(() => []) }
  ]);
  const [classroomName, setClassroomName] = useState('');
  const [periodLabels, setPeriodLabels] = useState<string[]>([]);

  // PDFButton用のrefを追加
  const pdfButtonRef = useRef<{ updatePDFData: () => void; resetPDFData: () => void } | null>(null);

  // 追加: モーダル開閉と処理中フラグ
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProcessingConfirm, setIsProcessingConfirm] = useState(false);
  const [isConfirmOverwriteModalOpen, setIsConfirmOverwriteModalOpen] = useState(false);

  // Firestoreから時間割データ取得関数を切り出し（再利用するため）
  const [isSaved, setIsSaved] = useState(false);

  const loadTimetableData = React.useCallback(async () => {
    if (!userData?.classroomCode) return;

    const { rows, periodLabels, classroomName } = await fetchTimetableData(selectedDate, userData.classroomCode);
    setPeriodLabels(periodLabels ?? []);
    // ここでisSavedを判定
    const saved = rows?.some((row: RowData) => row.status === '出勤') ?? false;
    setIsSaved(saved);

    let finalRows;
    if (rows && rows.length > 0) {
      const hasUndecided = rows.find((r: RowData) => r.status === '未定');
      const hasTransfer = rows.find((r: RowData) => r.status === '振替');
      const hasAbsent = rows.find((r: RowData) => r.status === '欠席');
      const normalRows = rows.filter((r: RowData) => !['未定', '振替', '欠席'].includes(r.status));

      finalRows = [
        ...normalRows.map((r: RowData) => ({ ...r, status: '予定' })),
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
  }, [selectedDate, userData?.classroomCode]);

  useEffect(() => {
    loadTimetableData();
  }, [loadTimetableData]);

  // rowsが変更されるたびにPDFのデータをリセット
  useEffect(() => {
    if (pdfButtonRef.current) {
      pdfButtonRef.current.resetPDFData();
    }
  }, [rows, classroomName]);

  useEffect(() => {
    const handler = (e: CustomEvent<RowData[]>) => {
      setRows(e.detail);
    };
    window.addEventListener('updateAllRows', handler as EventListener);
    return () => window.removeEventListener('updateAllRows', handler as EventListener);
  }, []);

  const [confirmedDates, setConfirmedDates] = useState<string[]>([]);

  useEffect(() => { loadTimetableData(); }, [loadTimetableData]);

  // 確定済み日付取得
  useEffect(() => {
    const loadConfirmedDates = async () => {
      if (!userData?.classroomCode) return;
      const dates = await fetchConfirmedAttendanceDatesFromDailySchedules(userData.classroomCode);
      setConfirmedDates(dates);
    };
    loadConfirmedDates();
  }, [userData?.classroomCode]);

  // 日付変更時に URL を更新
  const updateURLDate = (date: { year: number; month: number; date: number }) => {
    const params = new URLSearchParams(window.location.search);
    params.set('date', `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.date).padStart(2, '0')}`);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const changeDateBy = (days: number) => {
    const date = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.date);
    date.setDate(date.getDate() + days);
    const newDate = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      date: date.getDate(),
      weekday: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'][date.getDay()],
      type: 'date' as 'date' | 'weekday'
    };
    setSelectedDate(newDate);
    updateURLDate(newDate);
  };

  const checkDuplicateStudentsPerPeriod = (rows: RowData[]): DuplicateInfo[] => {
    const periodStudentMap: Set<string>[] = Array(8).fill(null).map(() => new Set<string>());
    const duplicates: DuplicateInfo[] = [];

    rows.forEach((row: RowData, rowIndex: number) => {
      row.periods.forEach((students: Student[], periodIdx: number) => {
        students.forEach((student: Student) => {
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
  const [pendingSave, setPendingSave] = useState<(() => Promise<void>) | null>(null);

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
    if (!userData?.classroomCode) return;

    const duplicates = checkDuplicateStudentsPerPeriod(rows);
    if (duplicates.length > 0) {
      alert('同じ生徒が同じ時限に複数の講師に割り当てられています。保存できません。');
      return;
    }

    const cleanedRows: TimetableRow[] = rows.map(row => ({
      status: row.status || '予定',
      teacher: row.teacher
        ? { code: row.teacher.code ?? '', name: row.teacher.name ?? '' }
        : { code: '', name: '' },
      periods: row.periods.map(period =>
        period.map(toTimetableStudent)
      ),
    }));
    console.log('cleanedRows', cleanedRows)
    await saveTimetableData(selectedDate, userData.classroomCode, cleanedRows);

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
    if (!userData?.classroomCode) return;
    setIsProcessingConfirm(true);
    try {
      const formattedDate = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.date).padStart(2, '0')}`;
      await confirmAttendanceStatus(userData.classroomCode, formattedDate);
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

  const updateRow = (rowIdx: number, newRow: RowData) => {
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

  const handleDateSelect = (info: { type: 'date' | 'weekday'; year: number; month: number; date?: number; weekday: string }) => {
    const newDate = {
      ...info,
      date: info.date ?? 1
    };
    setSelectedDate(newDate);
    updateURLDate(newDate);
  };

  const openStudentListWindow = () => {
    const newWindow = window.open('/admin/timetable/studentlist', '_blank', 'width=600,height=800');
    if (newWindow) {
      newWindow.document.title = "生徒一覧";
      const root = newWindow.document.createElement('div');
      newWindow.document.body.appendChild(root);

      createRoot(root).render(
        <AuthProvider>
          <AdminDataProvider>
            <StudentList />
          </AdminDataProvider>
        </AuthProvider>
      );
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-4 space-x-4">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <span>時間割（{classroom?.classroom?.name ?? '教室名取得中...'}）</span>
          <span
            className={`text-sm px-2 py-1 rounded-full font-medium ${isSaved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}
          >
            {isSaved ? '出席確定済み' : '出席未確定'}
          </span>
        </h1>
        <span className="text-gray-700 text-sm">{formatDateDisplay(selectedDate)}</span>
        <CalendarPopup
          onDateSelect={handleDateSelect}
          confirmedDates={confirmedDates}
          classroomCode={userData?.classroomCode ?? null}  // ここを追加
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

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button
          onClick={addRow}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          講師行を追加
        </button>
        <button
          onClick={handleClickSaveButton}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          この{selectedDate.type === 'date' ? '日付' : '曜日'}の時間割を保存
        </button>
        <PDFButton
          ref={pdfButtonRef}
          getData={() => ({
            rows,
            classroomName,
          })}
        />
        <button
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
          onClick={openStudentListWindow}
        >
          生徒一覧を開く
        </button>
      </div>

      {/* --- 出席確定ボタン --- */}
      <div className="text-center mt-10">
        <button
          onClick={openConfirmModal}
          disabled={!isTodayOrPast() || isProcessingConfirm || isSaved}
          className={`px-6 py-3 rounded text-white font-bold shadow-md transition ${!isTodayOrPast() || isProcessingConfirm || isSaved
              ? 'bg-red-300 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
            }`}
        >
          出席を確定
        </button>

        {(!isTodayOrPast() || isSaved) && (
          <p className="text-sm text-gray-500 mt-3">
            {!isTodayOrPast()
              ? '出席の確定は当日または過去の日付のみ可能です。'
              : '既に出席が確定済みです。'}
          </p>
        )}
      </div>

      {/* --- モーダル類 --- */}
      <ConfirmOverwriteModal
        isOpen={isConfirmOverwriteModalOpen}
        onCancel={() => setIsConfirmOverwriteModalOpen(false)}
        onConfirm={() => {
          pendingSave?.();
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
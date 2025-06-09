import { useState } from 'react';
import TimetableTable from '../components/TimetableTable';
import PDFButton from '../components/PDFButton';
import CalendarPopup from '../components/CalendarPopup';

export default function TimetablePage() {
    const today = new Date();
    const [rows, setRows] = useState([
        {
            teacher: '',
            periods: Array(8).fill([]).map(() => [])
        }
    ]);

    // 今日の日付を初期値として設定
    const [selectedDate, setSelectedDate] = useState({
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        date: today.getDate()
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
            {/* タイトル + 選択日 + カレンダーを横並び */}
            <div className="flex items-center justify-center mb-4 space-x-4">
                <h1 className="text-2xl font-bold">時間割（南林間教室）</h1>

                <span className="text-gray-700 text-sm">
                    {selectedDate.year}年{selectedDate.month}月{selectedDate.date}日
                </span>

                <CalendarPopup onDateSelect={setSelectedDate} />
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
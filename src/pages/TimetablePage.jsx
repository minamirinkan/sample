// src/pages/TimetablePage.jsx
import { useState } from 'react';
import TimetableTable from '../components/TimetableTable';
import PDFButton from '../components/PDFButton';

export default function TimetablePage() {
    const [rows, setRows] = useState([
        {
            teacher: '',
            periods: Array(8).fill([]).map(() => [])
        }
    ]);

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
            <h1 className="text-2xl font-bold mb-4 text-center">時間割（南林間教室）</h1>
            <TimetableTable rows={rows} onChange={updateRow} />
            <div className="text-center mt-4">
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

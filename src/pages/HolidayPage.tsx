import React, { useEffect, useState, useCallback } from "react";
import HolidaySelector from "../components/HolidaySelector.tsx";
import { fetchJapanHolidays } from "../api/fetchHolidays.ts"; // API呼び出し関数（次で説明）

type Holiday = { name: string; date: string };

const HolidayPage = () => {
    const [year, setYear] = useState<number>(2025);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [selected, setSelected] = useState<Holiday[]>([]);

    useEffect(() => {
        const load = async () => {
            const result = await fetchJapanHolidays(year);
            setHolidays(result);
            setSelected([]); // 年変更時は選択リセット
        };
        load();
    }, [year]);

    const handleSelection = useCallback((selectedHolidays: Holiday[]) => {
    setSelected(selectedHolidays);
}, []);

    const handleYearChange = (delta: number) => {
        setYear((prev) => prev + delta);
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-center space-x-6 mb-6">
                <button
                    onClick={() => handleYearChange(-1)}
                    className="text-2xl font-bold px-3 py-1 rounded hover:bg-gray-100"
                    aria-label="前の年"
                >
                    &lt;
                </button>
                <span className="text-3xl font-extrabold text-gray-800">{year}年</span>
                <button
                    onClick={() => handleYearChange(1)}
                    className="text-2xl font-bold px-3 py-1 rounded hover:bg-gray-100"
                    aria-label="次の年"
                >
                    &gt;
                </button>
            </div>

            <HolidaySelector holidays={holidays} onChange={handleSelection} />

            <button
                onClick={() => console.log("保存対象:", selected)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Firestoreに保存
            </button>
        </div>
    );
};

export default HolidayPage;
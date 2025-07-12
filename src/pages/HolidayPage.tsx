import React, { useEffect, useState, useCallback } from "react";
import HolidaySelector from "../components/HolidaySelector.tsx";
import { fetchJapanHolidays } from "../api/fetchHolidays.ts"; // API呼び出し関数（次で説明）
import { saveSchoolClosures, Closure } from "../api/saveClosures.ts";
import { fetchSchoolClosures } from "../api/fetchSchoolClosures.ts";


type Holiday = { name: string; date: string, type: "holiday" | "customClose" };

const HolidayPage = () => {
    const [year, setYear] = useState<number>(2025);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [selected, setSelected] = useState<Holiday[]>([]);
    const [deletedHolidays, setDeletedHolidays] = useState<Holiday[]>([]);

    useEffect(() => {
        const load = async () => {
            const { closures, deleted } = await fetchSchoolClosures(year);
            // 日付フォーマットをそろえて比較（2025-01-02 など）
            const normalizeDate = (d: string) => d.slice(0, 10);
            const deletedDates = deleted.map(d => normalizeDate(d.date));

            if (closures.length > 0 || deleted.length > 0) {
                const filteredClosures = closures.filter(
                    c => !deletedDates.includes(normalizeDate(c.date))
                );
                setHolidays(filteredClosures);
                console.log("deleted from firestore:", deleted);
                setDeletedHolidays(deleted);
            } else {
                const raw = await fetchJapanHolidays(year);
                const result: Holiday[] = raw.map(h => ({
                    ...h,
                    type: "holiday", // ← 必ず type を追加
                }));
                setHolidays(result);
            }
            setSelected([]);
        };

        load();
    }, [year]);

    const handleSelection = useCallback((selectedHolidays: Holiday[]) => {
        setSelected(selectedHolidays);
    }, []);

    const handleYearChange = (delta: number) => {
        setYear((prev) => prev + delta);
    };

    const handleSave = useCallback(async () => {
        const closures: Closure[] = holidays.map(h => ({
            date: h.date,
            name: h.name,
            type: h.type,
        }));

        const deleted: Closure[] = deletedHolidays.map(h => ({
            date: h.date,
            name: h.name,
            type: h.type,
        }));

        const currentMonth = `${year}`;

        try {
            await saveSchoolClosures(currentMonth, closures, deleted);
            alert("保存しました");
        } catch (error) {
            alert("保存に失敗しました");
        }
    }, [holidays, deletedHolidays, year]);

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

            <HolidaySelector
                holidays={holidays}
                onChange={handleSelection}
                year={year}
                onDeletedChange={setDeletedHolidays}
                deletedHolidays={deletedHolidays}
            />
            <button
                onClick={handleSave}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Firestoreに保存
            </button>
        </div>
    );
};

export default HolidayPage;
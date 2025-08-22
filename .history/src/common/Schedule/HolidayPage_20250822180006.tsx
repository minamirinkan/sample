import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HolidayMonthCard from "./components/HolidayMonthCard";
import HolidayModal from "./data/HolidayModal";
import DeleteConfirmModal from "./data/DeleteConfirmModal";
import { fetchJapanHolidays } from "./fetchHolidays";
import { saveSchoolClosures, Closure } from "./saveClosures";
import { fetchSchoolClosures } from "./fetchSchoolClosures";
import FullYearCalendar from "./components/FullYearCalendar";
import type { UserRole } from "@/contexts/types/user"

type Holiday = { name: string; date: string; type: "holiday" | "customClose" };

const TABS = [
    { key: "holidayList", label: "祝日一覧" },
    { key: "calendar", label: "休講日カレンダー" }
];

const HolidayPage = () => {
    const [year, setYear] = useState<number>(2025);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [deletedHolidays, setDeletedHolidays] = useState<Holiday[]>([]);
    const [activeTab, setActiveTab] = useState<'holidayList' | 'calendar'>('holidayList');
    const [addModalMonth, setAddModalMonth] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const { userData, user } = useAuth();
    const classroomCode = user?.classroomCode;
    const role = userData?.role as UserRole | undefined;

    const load = async () => {
        if (!role) return;
        const { closures, deleted } = await fetchSchoolClosures(year, role, classroomCode);
        const normalizeDate = (d: string) => d.slice(0, 10);
        if (closures.length > 0 || deleted.length > 0) {
            const filtered = closures.filter(
                c => !deleted.some(d => normalizeDate(d.date) === normalizeDate(c.date) && d.type === c.type)
            );
            setHolidays(filtered);
            setDeletedHolidays(deleted);
        } else {
            const raw = await fetchJapanHolidays(year);
            const result: Holiday[] = raw.map(h => ({ ...h, type: "holiday" }));
            setHolidays(result);
        }
        setSelected([]);
    };

    useEffect(() => { load(); }, [year, role, classroomCode]);

    const toggleSelected = useCallback((date: string) => {
        setSelected((prev) =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    }, []);

    const openAddModal = (month: string) => setAddModalMonth(month);
    const closeAddModal = () => setAddModalMonth(null);

    const handleAddRange = (name: string, start: string, end: string, type: "holiday" | "customClose") => {
        const newDates: Holiday[] = [];
        for (let d = new Date(start); d <= new Date(end); d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().slice(0, 10);
            newDates.push({ name, date: dateStr, type });
        }
        setHolidays((prev) => [...prev, ...newDates]);
        closeAddModal();
    };

    const openDeleteConfirm = () => {
        if (selected.length > 0) setDeleteConfirmOpen(true);
    };
    const cancelDelete = () => setDeleteConfirmOpen(false);

    const confirmDelete = () => {
        const toAddToDeleted = holidays.filter(
            h => selected.includes(h.date) && h.type !== "customClose"
        );
        setHolidays(prev => prev.filter(h => !selected.includes(h.date)));
        setDeletedHolidays(prev => [...prev, ...toAddToDeleted].sort((a, b) => a.date.localeCompare(b.date)));
        setSelected([]);
        setDeleteConfirmOpen(false);
    };

    const changeYear = (delta: number) => setYear(prev => prev + delta);

    const handleSave = useCallback(async () => {
        const closures: Closure[] = holidays.map(h => ({ date: h.date, name: h.name, type: h.type }));
        const deleted: Closure[] = deletedHolidays.map(h => ({ date: h.date, name: h.name, type: h.type }));
        try {
            console.log('role', role);
            if (role === "superadmin") {
                await saveSchoolClosures(`${year}`, closures, deleted, role);
            } else if (role === "admin" && classroomCode) {
                await saveSchoolClosures(`${year}`, closures, deleted, role, classroomCode);
            } else {
                alert("権限がありません");
                return;
            }
            alert("保存しました");
        } catch (error) {
            console.error("保存エラー:", error);
            alert("保存に失敗しました");
        }
    }, [holidays, deletedHolidays, year, role, classroomCode]);

    const allMonths = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
    const holidaysByMonth = holidays.reduce<Record<string, Holiday[]>>((acc, h) => {
        const month = h.date.slice(0, 7);
        if (!acc[month]) acc[month] = [];
        acc[month].push(h);
        return acc;
    }, {});


    const [selectedDeleted, setSelectedDeleted] = useState<string[]>([]);
    const toggleDeleted = (date: string) => {
        setSelectedDeleted(prev =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    };
    const handleRestoreSelected = () => {
        const toRestore = deletedHolidays.filter(h => selectedDeleted.includes(h.date));
        setDeletedHolidays(prev => prev.filter(h => !selectedDeleted.includes(h.date)));
        setHolidays(prev => [...prev, ...toRestore]);
        setSelectedDeleted([]);
    };

    return (
        <div className="p-6 bg-white rounded shadow-md max-w-6xl mx-auto">
            {/* タイトル */}
            <div className="flex items-center mb-4 space-x-6">
                <h1 className="text-2xl font-bold text-gray-800">カレンダー管理</h1>
            </div>

            {/* 年度切替 */}
            <div className="flex justify-start items-center mb-6">
                <button onClick={() => changeYear(-1)} className="text-xl px-2">&lt;</button>
                <span className="text-2xl font-semibold mx-4">{year}年</span>
                <button onClick={() => changeYear(1)} className="text-xl px-2">&gt;</button>
            </div>

            {/* タブ（StudentDetailと同様のスタイル） */}
            <div className="flex gap-3 border-b border-gray-300 mb-6 bg-gray-50 rounded-t">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`px-5 py-2 text-sm font-semibold border-t-[2px] transition-all duration-200
                            ${activeTab === tab.key
                                ? 'border-blue-600 text-blue-700 bg-white'
                                : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-400'
                            }
                        `}
                        onClick={() => setActiveTab(tab.key as 'holidayList' | 'calendar')}
                        aria-selected={activeTab === tab.key}
                        role="tab"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* コンテンツ表示 */}
            {activeTab === "holidayList" && (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        {allMonths.map((month) => (
                            <HolidayMonthCard
                                key={month}
                                month={month}
                                holidays={holidaysByMonth[month] ?? []}
                                selected={selected}
                                toggle={toggleSelected}
                                onOpenAddModal={openAddModal}
                                onRemoveSelectedInMonth={() => {
                                    const selectedInMonth = selected.filter((d) => d.startsWith(month));
                                    if (selectedInMonth.length > 0) {
                                        setSelected(selectedInMonth);
                                        openDeleteConfirm();
                                    }
                                }}
                            />
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-white rounded shadow max-h-80 overflow-auto">
                        <h2 className="text-lg font-bold mb-2">削除済み祝日（復元可能）</h2>
                        {deletedHolidays.length === 0 ? (
                            <p className="text-gray-500">削除された祝日はありません。</p>
                        ) : (
                            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {deletedHolidays.map((h) => (
                                    <li key={h.date} className="flex items-center space-x-2">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedDeleted.includes(h.date)}
                                                onChange={() => toggleDeleted(h.date)}
                                            />
                                            <span>{h.date}：{h.name}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {selectedDeleted.length > 0 && (
                            <button
                                onClick={handleRestoreSelected}
                                className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
                            >
                                選択した祝日を復元
                            </button>
                        )}
                    </div>


                    <button onClick={handleSave} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
                        Firestoreに保存
                    </button>
                </>
            )}


            {activeTab === "calendar" && (
                <div className="mb-6">
                    <FullYearCalendar
                        year={year}
                        holidays={holidays}
                        deletedHolidays={deletedHolidays}
                    />
                </div>
            )}


            {/* モーダル */}
            {addModalMonth && (
                <HolidayModal
                    month={addModalMonth}
                    existingHolidays={holidays}
                    onAddRange={handleAddRange}
                    onCancel={closeAddModal}
                />
            )}
            {deleteConfirmOpen && (
                <DeleteConfirmModal
                    holidaysToDelete={holidays.filter((h) => selected.includes(h.date))}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    );
};

export default HolidayPage;
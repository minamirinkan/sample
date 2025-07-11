import React, { useState, useEffect } from "react";
import HolidayMonthCard from "./HolidayMonthCard.tsx";
import HolidayModal from "../data/HolidayModal.tsx";
import DeleteConfirmModal from "../data/DeleteConfirmModal.tsx";

type Holiday = {
    name: string;
    date: string;
};

type Props = {
    holidays: Holiday[];
    onChange: (selectedHolidays: Holiday[]) => void;
    year: number;
};

const HolidaySelector: React.FC<Props> = ({ holidays, onChange, year }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [currentMonthForAdd, setCurrentMonthForAdd] = useState<string | null>(null);
    const [newHoliday, setNewHoliday] = useState<{ name: string; date: string }>({ name: "", date: "" });
    const [localHolidays, setLocalHolidays] = useState<Holiday[]>(holidays);
    const [deletedHolidays, setDeletedHolidays] = useState<Holiday[]>([]);
    const [restoreSelected, setRestoreSelected] = useState<string[]>([]);

    const toggleRestore = (date: string) => {
        setRestoreSelected(prev =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    };
    const handleRestore = () => {
        const toRestore = deletedHolidays.filter(h => restoreSelected.includes(h.date));
        setLocalHolidays(prev => [...prev, ...toRestore]); // 祝日リストに復元
        setDeletedHolidays(prev => prev.filter(h => !restoreSelected.includes(h.date))); // 削除リストから除去
        setRestoreSelected([]); // チェックをリセット
    };

    useEffect(() => {
        setLocalHolidays(holidays);
    }, [holidays]);

    // selected変更で親通知
    useEffect(() => {
        const selectedHolidays = holidays.filter(h => selected.includes(h.date));
        onChange(selectedHolidays);
    }, [selected, holidays, onChange]);

    const toggle = (date: string) => {
        setSelected(prev =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    };

    const handleOpenAddModal = (month: string) => {
        setCurrentMonthForAdd(month);
        setNewHoliday({ name: "", date: `${month}-01` }); // 月初日セット
        setShowAddModal(true);
    };

    const handleAddHoliday = () => {
        if (!newHoliday.name || !newHoliday.date) return;

        const newItem = { ...newHoliday };

        // localHolidaysに追加
        setLocalHolidays(prev => [...prev, newItem]);

        setShowAddModal(false);
    };

    const handleAddRangeHoliday = (name: string, start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const holidaysToAdd: Holiday[] = [];

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            holidaysToAdd.push({ name, date: dateStr });
        }

        setLocalHolidays(prev => [...prev, ...holidaysToAdd]);
        setShowAddModal(false);
    };

    const handleRemoveSelectedInMonth = (month: string) => {
        const prefix = `${month}-`;
        const selectedInMonth = selected.filter(date => date.startsWith(prefix));

        const toDelete = localHolidays.filter(h => selectedInMonth.includes(h.date));

        // selectedから削除
        setSelected(prev => prev.filter(date => !selectedInMonth.includes(date)));

        // 表示中holidayから削除
        setLocalHolidays(prev => prev.filter(h => !selectedInMonth.includes(h.date)));

        // 削除済みリストに追加
        setDeletedHolidays(prev => [...prev, ...toDelete]);
    };

    const confirmDeleteSelected = () => {
        setSelected([]);
        setShowDeleteConfirm(false);
    };

    const cancelDeleteSelected = () => {
        setShowDeleteConfirm(false);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">祝日を選択（非表示にしたい日を外す）</h2>

            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 12 }, (_, i) => {
                    const month = `${year}-${(i + 1).toString().padStart(2, "0")}`;
                    const monthlyHolidays = localHolidays.filter(h => h.date.startsWith(month));

                    return (
                        <HolidayMonthCard
                            key={month}
                            month={month}
                            holidays={monthlyHolidays}
                            selected={selected}
                            toggle={toggle}
                            onOpenAddModal={handleOpenAddModal}
                            onRemoveSelectedInMonth={handleRemoveSelectedInMonth}
                        />
                    );
                })}
            </div>
            {deletedHolidays.length > 0 && (
                <div className="mt-8 bg-white shadow rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-2">削除された祝日</h3>
                    <ul className="space-y-2 max-h-48 overflow-auto">
                        {deletedHolidays.map(h => (
                            <li key={h.date} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={restoreSelected.includes(h.date)}
                                    onChange={() => toggleRestore(h.date)}
                                />
                                <span>{h.date}：{h.name}</span>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={handleRestore}
                        className="mt-3 px-4 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50"
                        disabled={restoreSelected.length === 0}
                    >
                        選択した祝日を復元
                    </button>
                </div>
            )}

            {showAddModal && currentMonthForAdd && (
                <HolidayModal
                    month={currentMonthForAdd}
                    onAddRange={handleAddRangeHoliday}
                    onCancel={() => setShowAddModal(false)}
                />
            )}

            {showDeleteConfirm && (
                <DeleteConfirmModal
                    onConfirm={confirmDeleteSelected}
                    onCancel={cancelDeleteSelected}
                />
            )}
        </div>
    );
};

export default HolidaySelector;

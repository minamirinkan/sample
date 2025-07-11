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
};

const HolidaySelector: React.FC<Props> = ({ holidays, onChange }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [currentMonthForAdd, setCurrentMonthForAdd] = useState<string | null>(null);
    const [newHoliday, setNewHoliday] = useState<{ name: string; date: string }>({ name: "", date: "" });

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
        // 追加は親にonChangeにより反映してもらう想定。ここはローカルでselected操作しない
        // もし追加データ保持がこのコンポーネントにあるなら状態管理を変える必要あり
        // ここでは簡略化してalertのみ
        alert(`祝日追加: ${newHoliday.date} ${newHoliday.name}\n※実装に合わせて処理を変更してください`);
        setShowAddModal(false);
    };

    const handleDeleteSingle = (date: string) => {
        setSelected(prev => prev.filter(d => d !== date));
    };

    const handleDeleteSelected = () => {
        setShowDeleteConfirm(true);
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

            <button
                className="mb-4 px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleDeleteSelected}
                disabled={selected.length === 0}
            >
                選択した祝日を削除
            </button>

            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 12 }, (_, i) => {
                    const month = `2025-${(i + 1).toString().padStart(2, "0")}`;
                    const monthlyHolidays = holidays.filter(h => h.date.startsWith(month));

                    return (
                        <HolidayMonthCard
                            key={month}
                            month={month}
                            holidays={monthlyHolidays}
                            selected={selected}
                            toggle={toggle}
                            onDeleteSingle={handleDeleteSingle}
                            onOpenAddModal={handleOpenAddModal}
                        />
                    );
                })}
            </div>

            {showAddModal && currentMonthForAdd && (
                <HolidayModal
                    month={currentMonthForAdd}
                    newHoliday={newHoliday}
                    setNewHoliday={setNewHoliday}
                    onAdd={handleAddHoliday}
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

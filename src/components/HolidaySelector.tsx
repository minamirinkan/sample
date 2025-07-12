import React, { useState, useEffect } from "react";
import HolidayMonthCard from "./HolidayMonthCard.tsx";
import HolidayModal from "../data/HolidayModal.tsx";
import DeleteConfirmModal from "../data/DeleteConfirmModal.tsx";

type Holiday = {
    name: string;
    date: string;
    type: "holiday" | "customClose";
};

type Props = {
    holidays: Holiday[];
    onChange: (selectedHolidays: Holiday[]) => void;
    year: number;
    onDeletedChange: (deleted: Holiday[]) => void;
    deletedHolidays: Holiday[];
};

const HolidaySelector: React.FC<Props> = ({
    holidays,
    onChange,
    year,
    onDeletedChange,
    deletedHolidays: deletedHolidaysProp,
}) => {
    // 選択中の祝日の日付配列
    const [selected, setSelected] = useState<string[]>([]);
    // 祝日リストのローカル管理（追加・削除を反映）
    const [localHolidays, setLocalHolidays] = useState<Holiday[]>(holidays);
    // 削除済み祝日のローカル管理（復元対応）
    const [deletedHolidays, setDeletedHolidays] = useState<Holiday[]>(deletedHolidaysProp);
    // 追加モーダル表示フラグ
    const [showAddModal, setShowAddModal] = useState(false);
    // 削除確認モーダル表示フラグ
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    // 現在追加モーダルで対象となる月（例: "2025-07"）
    const [currentMonthForAdd, setCurrentMonthForAdd] = useState<string | null>(null);
    // 復元対象にチェックされた祝日の日付リスト
    const [restoreSelected, setRestoreSelected] = useState<string[]>([]);

    // props から localHolidays と deletedHolidays を更新
    useEffect(() => {
        setLocalHolidays(holidays);
    }, [holidays]);

    useEffect(() => {
        setDeletedHolidays(deletedHolidaysProp);
    }, [deletedHolidaysProp]);

    // selected の変更があったら親に選択祝日リストを通知
    useEffect(() => {
        const selectedHolidays = localHolidays.filter((h) => selected.includes(h.date));
        onChange(selectedHolidays);
    }, [selected, localHolidays, onChange]);

    // deletedHolidays の変更があったら親に通知
    useEffect(() => {
        onDeletedChange(deletedHolidays);
    }, [deletedHolidays, onDeletedChange]);

    // 祝日の日付をトグル選択
    const toggle = (date: string) => {
        setSelected((prev) =>
            prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
        );
    };

    // 追加モーダルを開く処理
    const handleOpenAddModal = (month: string) => {
        setCurrentMonthForAdd(month);
        setShowAddModal(true);
    };

    // 範囲指定祝日の追加処理
    const handleAddRangeHoliday = (
    name: string,
    start: string,
    end: string,
    type: "holiday" | "customClose" = "customClose"
) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const holidaysToAdd: Holiday[] = [];

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            holidaysToAdd.push({ name, date: dateStr, type });
        }

        setLocalHolidays((prev) => [...prev, ...holidaysToAdd]);
        setShowAddModal(false);
    };

    // 指定月の選択中祝日を削除し、削除済みに移動
    const handleRemoveSelectedInMonth = (month: string) => {
        const prefix = `${month}-`;
        const selectedInMonth = selected.filter((date) => date.startsWith(prefix));

        const toDelete = localHolidays.filter((h) => selectedInMonth.includes(h.date));

        // selected から削除
        setSelected((prev) => prev.filter((date) => !selectedInMonth.includes(date)));

        // localHolidays から削除
        setLocalHolidays((prev) => prev.filter((h) => !selectedInMonth.includes(h.date)));

        // deletedHolidays に追加
        setDeletedHolidays((prev) => [...prev, ...toDelete]);
    };

    // 削除確定の確認モーダル操作
    const confirmDeleteSelected = () => {
        setSelected([]);
        setShowDeleteConfirm(false);
    };

    const cancelDeleteSelected = () => {
        setShowDeleteConfirm(false);
    };

    // 削除済み祝日の復元用トグル選択
    const toggleRestore = (date: string) => {
        setRestoreSelected((prev) =>
            prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
        );
    };

    // 選択された削除済祝日を復元
    const handleRestore = () => {
        const toRestore = deletedHolidays.filter((h) => restoreSelected.includes(h.date));
        const newDeleted = deletedHolidays.filter((h) => !restoreSelected.includes(h.date));
        setLocalHolidays((prev) => [...prev, ...toRestore]);
        setDeletedHolidays(newDeleted);
        setRestoreSelected([]);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">祝日を選択（非表示にしたい日を外す）</h2>

            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 12 }, (_, i) => {
                    const month = `${year}-${(i + 1).toString().padStart(2, "0")}`;
                    const monthlyHolidays = localHolidays.filter((h) => h.date.startsWith(month));

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
                        {deletedHolidays.map((h) => (
                            <li key={h.date} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={restoreSelected.includes(h.date)}
                                    onChange={() => toggleRestore(h.date)}
                                />
                                <span>
                                    {h.date}：{h.name}
                                </span>
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
                    existingHolidays={localHolidays}
                />
            )}

            {showDeleteConfirm && (
                <DeleteConfirmModal onConfirm={confirmDeleteSelected} onCancel={cancelDeleteSelected} />
            )}
        </div>
    );
};

export default HolidaySelector;

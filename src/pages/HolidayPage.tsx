import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
import HolidayMonthCard from "../components/HolidayMonthCard.tsx";
import HolidayModal from "../data/HolidayModal.tsx";
import DeleteConfirmModal from "../data/DeleteConfirmModal.tsx";
import { fetchJapanHolidays } from "../api/fetchHolidays.ts";
import { saveSchoolClosures, Closure } from "../api/saveClosures.ts";
import { fetchSchoolClosures } from "../api/fetchSchoolClosures.ts";
import FullYearCalendar from "../components/FullYearCalendar.tsx"; // パスは適宜調整

type Holiday = { name: string; date: string; type: "holiday" | "customClose" };

const HolidayPage = () => {
    const [year, setYear] = useState<number>(2025);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [selected, setSelected] = useState<string[]>([]); // チェック済みの日付の配列
    const [deletedHolidays, setDeletedHolidays] = useState<Holiday[]>([]);
    const [showFullYearCalendar, setShowFullYearCalendar] = useState<boolean>(false);

    // モーダルの開閉状態
    const [addModalMonth, setAddModalMonth] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const { role, classroomCode } = useAuth();
    const [showCalendar, setShowCalendar] = useState<boolean>(false);

    // 祝日読み込み
    useEffect(() => {
        const load = async () => {
            if (!role) return; // roleがまだ未取得なら処理しない

            const { closures, deleted } = await fetchSchoolClosures(year, role, classroomCode);
            const normalizeDate = (d: string) => d.slice(0, 10);

            if (closures.length > 0 || deleted.length > 0) {
                // typeまで考慮して削除処理
                const filteredClosures = closures.filter(
                    c =>
                        !deleted.some(
                            d =>
                                normalizeDate(d.date) === normalizeDate(c.date) &&
                                d.type === c.type
                        )
                );
                setHolidays(filteredClosures);
                setDeletedHolidays(deleted);
            } else {
                const raw = await fetchJapanHolidays(year);
                const result: Holiday[] = raw.map(h => ({
                    ...h,
                    type: "holiday",
                }));
                setHolidays(result);
            }

            setSelected([]);
        };

        load();
    }, [year, role, classroomCode]);

    // チェックボックスのトグル
    const toggleSelected = useCallback((date: string) => {
        setSelected((prev) =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    }, []);

    // 「追加」モーダルを開く
    const openAddModal = (month: string) => {
        setAddModalMonth(month);
    };

    // 「追加」モーダルを閉じる
    const closeAddModal = () => {
        setAddModalMonth(null);
    };
    const toggleShowFullYearCalendar = () => {
        setShowFullYearCalendar(prev => !prev);
    };
    // 祝日範囲追加処理
    const handleAddRange = (name: string, start: string, end: string, type: "holiday" | "customClose") => {
        // 追加処理（祝日配列を更新）
        const newDates: Holiday[] = [];
        for (let d = new Date(start); d <= new Date(end); d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().slice(0, 10);
            newDates.push({ name, date: dateStr, type });
        }
        setHolidays((prev) => [...prev, ...newDates]);
        closeAddModal();
    };

    // 選択済みの祝日を削除モーダル表示
    const openDeleteConfirm = () => {
        if (selected.length === 0) return;
        setDeleteConfirmOpen(true);
    };

    // 削除キャンセル
    const cancelDelete = () => {
        setDeleteConfirmOpen(false);
    };

    // 削除確定（チェック済み祝日を祝日リストから削除し、deletedHolidaysに追加）
    const confirmDelete = () => {
        // 削除対象を type ごとに分ける
        const toAddToDeleted = holidays.filter(
            h => selected.includes(h.date) && h.type !== "customClose"
        );
        const toRemove = holidays.filter(h => selected.includes(h.date));

        setHolidays(prev => prev.filter(h => !selected.includes(h.date)));

        setDeletedHolidays(prev => {
            const updated = [...prev, ...toAddToDeleted];
            updated.sort((a, b) => a.date.localeCompare(b.date));
            return updated;
        });

        setSelected([]);
        setDeleteConfirmOpen(false);
    };

    // 年変更ボタン
    const changeYear = (delta: number) => {
        setYear((prev) => prev + delta);
    };

    // Firestoreに保存
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

        try {
            if (role === "superadmin") {
                await saveSchoolClosures(`${year}`, closures, deleted, role);
            } else if (role === "admin" && classroomCode) {
                await saveSchoolClosures(`${year}`, closures, deleted, role, classroomCode);
            } else if (role === "teacher" || role === "customer") {
                alert("権限がありません");
                return;
            } else {
                throw new Error("不明なロールまたは classroomCode が不足しています");
            }
            alert("保存しました");
        } catch (error) {
            console.error("保存エラー:", error);
            alert("保存に失敗しました: " + (error instanceof Error ? error.message : String(error)));
        }
    }, [holidays, deletedHolidays, year, role, classroomCode]);

    const allMonths = Array.from({ length: 12 }, (_, i) => {
        const month = (i + 1).toString().padStart(2, "0"); // 01, 02, ... 12
        return `${year}-${month}`;
    });
    // 月ごとに祝日をまとめるヘルパー
    const holidaysByMonth = holidays.reduce<Record<string, Holiday[]>>((acc, h) => {
        const month = h.date.slice(0, 7);
        if (!acc[month]) acc[month] = [];
        acc[month].push(h);
        return acc;
    }, {});

    const [selectedDeleted, setSelectedDeleted] = useState<string[]>([]);

    // チェックボックス切替
    const toggleDeleted = (date: string) => {
        setSelectedDeleted(prev =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    };

    // 復元ボタン押下時
    const handleRestoreSelected = () => {
        const toRestore = deletedHolidays.filter(h => selectedDeleted.includes(h.date));
        setDeletedHolidays(prev => prev.filter(h => !selectedDeleted.includes(h.date)));
        setHolidays(prev => [...prev, ...toRestore]);
        setSelectedDeleted([]);
    };
    const handleShowCalendar = () => {
        setShowCalendar(true); // モーダル表示など
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                {/* 年度変更ボタン */}
                <div className="flex items-center space-x-6">
                    <button onClick={() => changeYear(-1)} className="text-xl px-2">&lt;</button>
                    <span className="text-3xl font-bold">{year}年</span>
                    <button onClick={() => changeYear(1)} className="text-xl px-2">&gt;</button>
                </div>

                {/* カレンダー表示ボタン */}
                <button
                    onClick={toggleShowFullYearCalendar}
                    className={`px-4 py-2 rounded text-white ${showFullYearCalendar ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-500 hover:bg-blue-600"}`}
                >
                    {showFullYearCalendar ? "カレンダーを閉じる" : "カレンダー表示"}
                </button>
            </div>

            {/* ✅ カレンダー表示セクション（条件付き） */}
            {showFullYearCalendar && (
                <div className="mb-6">
                    <FullYearCalendar
                        year={year}
                        holidays={holidays}
                        deletedHolidays={deletedHolidays}
                    />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {allMonths.map((month) => (
                    <HolidayMonthCard
                        key={month}
                        month={month}
                        holidays={holidaysByMonth[month] ?? []} // データなければ空配列
                        selected={selected}
                        toggle={toggleSelected}
                        onOpenAddModal={openAddModal}
                        onRemoveSelectedInMonth={(month) => {
                            const selectedInMonth = selected.filter(d => d.startsWith(month));
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
                {deletedHolidays.length === 0 && <p className="text-gray-500">削除された祝日はありません。</p>}

                <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {deletedHolidays.map(h => (
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

                {selectedDeleted.length > 0 && (
                    <button
                        onClick={handleRestoreSelected}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
                    >
                        選択した祝日を復元
                    </button>
                )}
            </div>

            <button onClick={handleSave} className="mt-4 ml-4 px-4 py-2 bg-blue-600 text-white rounded">
                Firestoreに保存
            </button>

            {/* 祝日追加モーダル */}
            {addModalMonth && (
                <HolidayModal
                    month={addModalMonth}
                    existingHolidays={holidays}
                    onAddRange={handleAddRange}
                    onCancel={closeAddModal}
                />
            )}

            {/* 削除確認モーダル */}
            {deleteConfirmOpen && (
                <DeleteConfirmModal
                    holidaysToDelete={holidays.filter(h => selected.includes(h.date))}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    );
};

export default HolidayPage;

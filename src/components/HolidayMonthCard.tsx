import React from "react";

type Holiday = {
    name: string;
    date: string;
};

type Props = {
    month: string; // 例: "2025-01"
    holidays: Holiday[];
    selected: string[];
    toggle: (date: string) => void;
    onOpenAddModal: (month: string) => void;
    onRemoveSelectedInMonth: (month: string) => void;
};

const HolidayMonthCard: React.FC<Props> = ({
    month,
    holidays,
    selected,
    toggle,
    onOpenAddModal,
    onRemoveSelectedInMonth,
}) => {
    const displayMonth = month.slice(-2) + "月";

    return (
        <div className="bg-white rounded-xl shadow p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{displayMonth}</h3>
                <button
                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                    onClick={() => onOpenAddModal(month)}
                >
                    追加
                </button>
                <button
                    onClick={() => onRemoveSelectedInMonth(month)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                    チェック済み削除
                </button>
            </div>

            {holidays.length > 0 ? (
                <ul className="space-y-2 flex-grow overflow-auto">
                    {holidays
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map(h => (
                            <li key={h.date} className="flex items-center justify-between">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(h.date)}
                                        onChange={() => toggle(h.date)}
                                    />
                                    <span>
                                        {h.date.slice(-5)}：{h.name}
                                    </span>
                                </label>
                            </li>
                        ))}
                </ul>
            ) : (
                <p className="text-gray-400">祝日なし</p>
            )}
        </div>
    );
};

export default HolidayMonthCard;

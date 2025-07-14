import React, { useState } from "react";

type Holiday = { name: string; date: string; type: "holiday" | "customClose"; };

type Props = {
    month: string;
    onAddRange: (name: string, start: string, end: string, type: "holiday" | "customClose") => void;
    onCancel: () => void;
    existingHolidays: Holiday[];
};

const HolidayModal: React.FC<Props> = ({ month, onAddRange, onCancel, existingHolidays }) => {
    const [name, setName] = useState("指定休講日");
    const [start, setStart] = useState(`${month}-01`);
    const [end, setEnd] = useState(`${month}-01`);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        setError(null);

        if (!name || !start || !end) {
            setError("全ての項目を入力してください");
            return;
        }

        if (new Date(start) > new Date(end)) {
            setError("開始日は終了日より前にしてください");
            return;
        }

        // 重複チェック
        const startDate = new Date(start);
        const endDate = new Date(end);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            if (existingHolidays.some(h => h.date === dateStr)) {
                setError(`${dateStr} は既に祝日として登録されています。`);
                return;
            }
        }

        onAddRange(name, start, end, "customClose");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">祝日を範囲で追加 ({month})</h3>

                {error && (
                    <div className="mb-4 text-red-600 font-semibold">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block mb-1 font-medium">名称</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">開始日</label>
                    <input
                        type="date"
                        value={start}
                        min={`${month}-01`}
                        max={`${month}-31`}
                        onChange={e => {
                            const value = e.target.value;
                            setStart(value);
                            setEnd(value);  // 開始日を変えたら終了日も同じにする
                        }}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">終了日</label>
                    <input
                        type="date"
                        value={end}
                        min={`${month}-01`}
                        max={`${month}-31`}
                        onChange={e => setEnd(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded"
                        onClick={onCancel}
                    >
                        キャンセル
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={handleSubmit}
                        disabled={!name || !start || !end}
                    >
                        範囲で追加
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HolidayModal;

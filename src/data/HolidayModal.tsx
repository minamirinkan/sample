import React, { useState } from "react";

type Props = {
    month: string; // 例: "2025-01"
    onAddRange: (name: string, start: string, end: string) => void;
    onCancel: () => void;
};

const HolidayModal: React.FC<Props> = ({ month, onAddRange, onCancel }) => {
    const [name, setName] = useState("");
    const [start, setStart] = useState(`${month}-01`);
    const [end, setEnd] = useState(`${month}-01`);

    const handleSubmit = () => {
        if (!name || !start || !end) return;
        if (new Date(start) > new Date(end)) {
            alert("開始日は終了日より前にしてください");
            return;
        }
        onAddRange(name, start, end);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                <h3 className="text-lg font-semibold mb-4">祝日を範囲で追加 ({month})</h3>

                <div className="mb-4">
                    <label className="block mb-1 font-medium">祝日名</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
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
                        onChange={e => setStart(e.target.value)}
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

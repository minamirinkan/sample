import React from "react";

type Props = {
    month: string; // 例: "2025-01"
    newHoliday: { name: string; date: string };
    setNewHoliday: React.Dispatch<React.SetStateAction<{ name: string; date: string }>>;
    onAdd: () => void;
    onCancel: () => void;
};

const HolidayModal: React.FC<Props> = ({ month, newHoliday, setNewHoliday, onAdd, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                <h3 className="text-lg font-semibold mb-4">祝日を追加 ({month})</h3>
                <div className="mb-4">
                    <label className="block mb-1 font-medium">日付</label>
                    <input
                        type="date"
                        value={newHoliday.date}
                        min={`${month}-01`}
                        max={`${month}-31`}
                        onChange={e => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-medium">祝日名</label>
                    <input
                        type="text"
                        value={newHoliday.name}
                        onChange={e => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
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
                        onClick={onAdd}
                        disabled={!newHoliday.name || !newHoliday.date}
                    >
                        追加
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HolidayModal;

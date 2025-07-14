import React, { useState } from "react";

type Holiday = { name: string; date: string; type: "holiday" | "customClose" };

type Props = {
  holidays: Holiday[];
  deletedHolidays: Holiday[];
  onChange: (selected: Holiday[]) => void;
  onAdd: (holiday: Holiday) => void;
  onDelete: (holidaysToDelete: Holiday[]) => void;
  onRestore: (holiday: Holiday) => void;
  year: number;
};

const HolidaySelector: React.FC<Props> = ({
  holidays,
  deletedHolidays,
  onChange,
  onAdd,
  onDelete,
  onRestore,
  year,
}) => {
  const [selected, setSelected] = useState<Holiday[]>([]);

  // 選択状態変更（チェックボックスなど）
  const toggleSelect = (holiday: Holiday) => {
    const exists = selected.find(h => h.date === holiday.date);
    let newSelected;
    if (exists) {
      newSelected = selected.filter(h => h.date !== holiday.date);
    } else {
      newSelected = [...selected, holiday];
    }
    setSelected(newSelected);
    onChange(newSelected);
  };

  // 削除ボタン押下（確認モーダルは親で）
  const handleDeleteClick = () => {
    if (selected.length === 0) {
      alert("削除する祝日を選択してください");
      return;
    }
    onDelete(selected);
    setSelected([]);
    onChange([]);
  };

  // 削除済み祝日の復元ボタン押下
  const handleRestoreClick = (holiday: Holiday) => {
    onRestore(holiday);
  };

  // 追加用の簡単フォーム例（必要に応じて）
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");

  const handleAddClick = () => {
    if (!newName || !newDate) {
      alert("日付と名前を入力してください");
      return;
    }
    const newHoliday: Holiday = {
      name: newName,
      date: newDate,
      type: "customClose",
    };
    onAdd(newHoliday);
    setNewName("");
    setNewDate("");
  };

  return (
    <div>
      <h2 className="font-bold mb-2">祝日一覧 ({year}年)</h2>
      <ul>
        {holidays.map((holiday) => (
          <li key={holiday.date} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={!!selected.find(h => h.date === holiday.date)}
              onChange={() => toggleSelect(holiday)}
            />
            <span>{holiday.date} - {holiday.name} {holiday.type === "customClose" && "(カスタム)"}</span>
          </li>
        ))}
      </ul>
      <button onClick={handleDeleteClick} className="mt-2 px-3 py-1 bg-red-500 text-white rounded">
        選択祝日を削除
      </button>

      <h3 className="mt-6 font-semibold">削除済み祝日</h3>
      <ul>
        {deletedHolidays.map(holiday => (
          <li key={holiday.date} className="flex items-center space-x-3">
            <span>{holiday.date} - {holiday.name}</span>
            <button
              onClick={() => handleRestoreClick(holiday)}
              className="ml-4 px-2 py-1 bg-green-500 text-white rounded"
            >
              復元
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <h3 className="font-semibold mb-1">祝日追加</h3>
        <input
          type="date"
          value={newDate}
          onChange={e => setNewDate(e.target.value)}
          className="mr-2 p-1 border rounded"
        />
        <input
          type="text"
          placeholder="祝日名"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="mr-2 p-1 border rounded"
        />
        <button
          onClick={handleAddClick}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          追加
        </button>
      </div>
    </div>
  );
};

export default HolidaySelector;

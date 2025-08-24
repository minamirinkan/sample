import React from "react";

export interface SelectedItem { ymd: string; periodIndex: number; label: string }

interface Props {
  items: SelectedItem[];
  onRemove: (ymd: string, periodIndex: number) => void;
  onClear: () => void;
}

export default function SelectedCellsPanel({ items, onRemove, onClear }: Props) {
  const groups: Record<string, SelectedItem[]> = {};
  for (const it of items) (groups[it.ymd] ??= []).push(it);
  const dates = Object.keys(groups).sort();

  return (
    <div className="mt-4 rounded-lg border">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="text-sm font-semibold">選択した日付・時限</div>
        <button className="rounded border px-2 py-1 text-xs hover:bg-gray-50" onClick={onClear}>全クリア</button>
      </div>
      <div className="p-3 space-y-3">
        {dates.length === 0 && <div className="text-sm text-gray-500">（まだ選択はありません）</div>}
        {dates.map((ymd) => (
          <div key={ymd} className="text-sm">
            <div className="mb-1 font-medium">{ymd}</div>
            <div className="flex flex-wrap gap-2">
              {groups[ymd]
                .sort((a, b) => a.periodIndex - b.periodIndex)
                .map(({ periodIndex, label }) => (
                  <span key={`${ymd}-${periodIndex}`} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                    <span>{label}</span>
                    <button
                      className="inline-grid h-4 w-4 place-items-center rounded-full border text-[10px] leading-none"
                      onClick={() => onRemove(ymd, periodIndex)}
                      aria-label="削除"
                    >×</button>
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

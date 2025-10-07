// useCalendarSelection.ts
import { useCallback, useMemo, useState } from "react";

export type CellKey = string; // `${yyyy-mm-dd}|${periodIndex}`
export const makeCellKey = (isoDate: string, periodIndex: number): CellKey => `${isoDate}|${periodIndex}`;
export const parseCellKey = (key: CellKey) => {
  const [ymd, idxStr] = key.split("|");
  return { ymd, periodIndex: Number(idxStr) };
};

export type ColorClass =
  | "bg-blue-100"
  | "bg-green-100"
  | "bg-yellow-100"
  | "bg-pink-100"
  | "bg-purple-100"
  | "bg-orange-100"
  | "bg-red-100"
  | "bg-cyan-100";

const DEFAULT_SELECTED_COLOR: ColorClass = "bg-blue-100";

export function useCalendarSelection(initial?: CellKey[]) {
  const [selected, setSelected] = useState<Set<CellKey>>(() => new Set(initial ?? []));
  const [colorsByCell, setColorsByCell] = useState<Record<CellKey, ColorClass>>({});

  const isSelected = useCallback((key: CellKey) => selected.has(key), [selected]);

  const toggle = useCallback((key: CellKey, color?: ColorClass) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    if (color) setColorsByCell(prev => ({ ...prev, [key]: color }));
  }, []);

  const remove = useCallback((key: CellKey) => {
    setSelected(prev => { const next = new Set(prev); next.delete(key); return next; });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const setAll = useCallback((keys: CellKey[]) => {
    setSelected(new Set(keys));
  }, []);

  const getCellClass = useCallback((key: CellKey): string => {
    if (!isSelected(key)) return "";
    return colorsByCell[key] ?? DEFAULT_SELECTED_COLOR;
  }, [isSelected, colorsByCell]);

  const selectionList = useMemo(() => Array.from(selected), [selected]);

  return {
    selectionList, isSelected, toggle, remove, clear, getCellClass, setAll,
    setColor: (key: CellKey, c: ColorClass) => setColorsByCell(prev => ({ ...prev, [key]: c })),
  } as const;
}

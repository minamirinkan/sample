// src/teacher/Attendance/firestoreSave.ts
import { getFirestore, writeBatch, doc, serverTimestamp, collection } from "firebase/firestore";
import { parseCellKey } from "../hooks/useCalendarSelection";
import { format } from "date-fns";

// 0-based index -> "period1".."period8"
export const periodKeyFromIndex = (i: number) => `period${i + 1}`;

export async function saveMonthSelection(
  teacherCode: string,
  monthDate: Date,
  selectedKeys: string[] // ["2025-08-30|0", "2025-08-30|2", ...]
) {
  const db = getFirestore();
  const monthId = format(monthDate, "yyyy-MM");

  // 同月のセルのみ抽出＆日付ごとに periods 配列へまとめる
  const byDate: Record<string, Set<string>> = {};
  for (const key of selectedKeys) {
    const { ymd, periodIndex } = parseCellKey(key);
    if (!ymd.startsWith(monthId)) continue; // 今表示中の月だけ保存
    (byDate[ymd] ??= new Set()).add(periodKeyFromIndex(periodIndex));
  }

  const batch = writeBatch(db);
  const monthCollRef = collection(db, "Attendance", teacherCode, monthId);

  Object.entries(byDate).forEach(([ymd, set]) => {
    const docRef = doc(monthCollRef, ymd); // Attendance/{teacherCode}/{yyyy-MM}/{yyyy-MM-dd}
    batch.set(docRef, {
      periods: Array.from(set).sort(),      // 例: ["period1","period3"]
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });

  await batch.commit();
}

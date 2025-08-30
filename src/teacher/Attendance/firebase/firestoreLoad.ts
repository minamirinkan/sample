import { getFirestore, collection, getDocs } from "firebase/firestore";
import { format } from "date-fns";
import { makeCellKey } from "../hooks/useCalendarSelection";

/** "period7" → 6（0始まり）に変換。想定外は null を返す */
export const periodIndexFromKey = (s: string): number | null => {
  const m = /^period(\d+)$/.exec(s?.trim() ?? "");
  if (!m) return null;
  const idx = Number(m[1]) - 1; // 1→0, 8→7
  return Number.isFinite(idx) && idx >= 0 ? idx : null;
};

/**
 * 指定月の「選択セル」を Firestore から読み込んで CellKey 配列にして返す。
 * 保存スキーマ: Attendance/{teacherCode}/{yyyy-MM}/{yyyy-MM-dd} { periods: ["period1", ...] }
 */
export async function loadMonthSelection(
  teacherCode: string,
  monthDate: Date
): Promise<string[]> {
  const db = getFirestore();
  const monthId = format(monthDate, "yyyy-MM");

  // Attendance/{teacherCode}/{yyyy-MM}/ の配下にある日付ドキュメントを全取得
  const snap = await getDocs(collection(db, "Attendance", teacherCode, monthId));

  const keys: string[] = [];
  snap.forEach((docSnap) => {
    const ymd = docSnap.id; // "yyyy-MM-dd"
    const data = docSnap.data() as { periods?: string[] } | undefined;
    const periods = Array.isArray(data?.periods) ? data!.periods! : [];
    for (const p of periods) {
      const idx = periodIndexFromKey(p);
      if (idx != null) {
        keys.push(makeCellKey(ymd, idx));
      }
    }
  });

  return keys;
}

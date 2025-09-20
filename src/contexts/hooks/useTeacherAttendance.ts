import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";

export interface TeacherAttendanceEntry {
  date: string;        // "YYYY-MM-DD"
  periodLabel: string; // "1限" など
  status?: string;
  subject?: string;
  classType?: string;
  duration?: string;
}

type PeriodRecord =
  | { periodLabel?: string; status?: string; subject?: string; classType?: string; duration?: string }
  | undefined;

function normalizePeriodLabel(indexOrLabel: string | number): string {
  if (typeof indexOrLabel === "string") {
    if (/^\d+限$/.test(indexOrLabel)) return indexOrLabel;
    const m = /^period(\d+)$/.exec(indexOrLabel);
    if (m) return `${Number(m[1])}限`;
    return indexOrLabel;
  }
  return `${indexOrLabel}限`;
}

export function useTeacherAttendance(teacherCode: string, ym: string) {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<TeacherAttendanceEntry[]>([]);

  useEffect(() => {
    if (!teacherCode || !ym) {
      setList([]);
      setLoading(false);
      return;
    }

    const db = getFirestore();

    // ✅ サブコレクション方式のみ（Attendance/{teacherCode}/{YYYY-MM} は collection）
    const subcolRef = collection(db, "Attendance", teacherCode, ym);

    const unsub = onSnapshot(
      subcolRef,
      (snap) => {
        const entries: TeacherAttendanceEntry[] = [];
        snap.forEach((d: QueryDocumentSnapshot) => {
          const data = d.data() as any;
          const date = d.id; // 例: "2025-09-18"
          const periods: string[] = Array.isArray(data?.periods) ? data.periods : [];

          periods.forEach((pKey: string, idx: number) => {
            const periodData: PeriodRecord = data?.[pKey] ?? data?.[`period${idx + 1}`];
            const label = normalizePeriodLabel(pKey || idx + 1);
            entries.push({
              date,
              periodLabel: label,
              status: periodData?.status ?? "",
              subject: periodData?.subject ?? "",
              classType: periodData?.classType ?? "",
              duration: periodData?.duration ?? "",
            });
          });
        });
        setList(entries);
        setLoading(false);
      },
      (err) => {
        console.error("useTeacherAttendance onSnapshot error:", err);
        setList([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [teacherCode, ym]);

  return { loading, attendanceList: list };
}

import { useEffect, useState } from "react";
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "../../firebase";
import { DailyScheduleDocument } from "../types/dailySchedule";
import { useAuth } from "../AuthContext";

export const useDailySchedules = () => {
  const { classroomCode, loading: authLoading } = useAuth(); // ← classroomCode をContextから取得
  const [schedules, setSchedules] = useState<DailyScheduleDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailySchedules = async () => {
      if (!classroomCode) {
        setSchedules([]);
        setLoading(false);
        return;
      }

      try {
        const dailyRef = collection(db, "dailySchedules");
        const snapshot = await getDocs(dailyRef);

        const result: DailyScheduleDocument[] = [];

        snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const id = doc.id; // 例: "024_2025-07-16_3"
          const codePrefix = id.split("_")[0]; // "024" を抽出

          if (codePrefix === classroomCode) {
            const data = doc.data();
            result.push({
              id,
              rows: data.rows ?? [],
              updatedAt: data.updatedAt ?? null,
            });
          }
        });

        setSchedules(result);
        console.log(`📘 DailySchedules for classroomCode "${classroomCode}":`, result);
      } catch (err) {
        console.error("❌ Error fetching daily schedules:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDailySchedules();
    }
  }, [classroomCode, authLoading]);

  return { schedules, loading };
};

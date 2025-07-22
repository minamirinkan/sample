import { useEffect, useState } from "react";
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "../../firebase";
import { DailyScheduleDocument } from "../types/dailySchedule";

export const useDailySchedules = (classroomCode?: string) => {
  const [schedules, setSchedules] = useState<DailyScheduleDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailySchedules = async () => {
      try {
        const dailyRef = collection(db, "dailySchedules");
        const snapshot = await getDocs(dailyRef);

        const result: DailyScheduleDocument[] = [];

        snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const id = doc.id;
          const codePrefix = id.slice(0, 3); // 先頭3文字が教室コード

          if (!classroomCode || codePrefix === classroomCode) {
            const data = doc.data();
            result.push({
              id,
              rows: data.rows ?? [],
              updatedAt: data.updatedAt ?? null,
            });
          }
        });

        setSchedules(result);
        console.log("✅ Fetched dailySchedules:", result);
      } catch (err) {
        console.error("Error fetching daily schedules:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDailySchedules();
  }, [classroomCode]);

  return { schedules, loading };
};

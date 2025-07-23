import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { DailyScheduleDocument } from "../types/dailySchedule";
import { useAuth } from "../AuthContext";

export const useDailySchedules = (classroomCode?: string, studentIds?: string | string[]) => {
  const { loading: authLoading } = useAuth();
  const [schedules, setSchedules] = useState<DailyScheduleDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // studentIdを文字列化して依存配列に渡す
  const studentIdKey = useMemo(() => {
    if (!studentIds) return "";
    return Array.isArray(studentIds) ? studentIds.join(",") : studentIds;
  }, [studentIds]);

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

        snapshot.forEach((doc) => {
          const data = doc.data();
          const id = doc.id;
          const codePrefix = id.split("_")[0];

          if (codePrefix !== classroomCode) return;

          if (studentIdKey) {
            // studentIdKeyはカンマ区切りの文字列なので配列に戻す
            const studentIdArray = studentIdKey.split(",");
            const hasStudent = data.rows?.some((row: any) =>
              studentIdArray.includes(row.studentId)
            );
            if (!hasStudent) return;
          }

          result.push({
            id,
            rows: data.rows ?? [],
            updatedAt: data.updatedAt ?? null,
          });
        });

        setSchedules(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDailySchedules();
    }
  }, [classroomCode, studentIdKey, authLoading]); // studentIdKeyのみ依存配列に入れる

  return { schedules, loading };
};

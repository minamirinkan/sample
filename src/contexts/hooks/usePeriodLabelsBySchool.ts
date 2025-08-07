import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { PeriodLabel } from "../types/periodLabel";

export const usePeriodLabelsByClassroomCode = (classroomCode?: string) => {
  const [labels, setLabels] = useState<PeriodLabel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeriodLabels = async () => {
      if (!classroomCode) return;

      try {
        const docRef = doc(db, "periodLabelsBySchool", classroomCode); // classroomCodeをそのまま使う
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          setLabels(data.periodLabels ?? []);
          console.log(`🏫 periodLabelsBySchool/${classroomCode}:`, data.periodLabels);
        } else {
          console.warn(`⚠️ periodLabels for "${classroomCode}" not found`);
        }
      } catch (err) {
        console.error("Error fetching periodLabelsBySchool:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodLabels();
  }, [classroomCode]);

  return { labels, loading };
};

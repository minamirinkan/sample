import { useEffect, useState } from "react";
import { collection, getDocs, query, where, Query, DocumentData } from "firebase/firestore";
import { db } from "../../firebase";
import { Student } from "../types/student";
import { useAuth } from "../AuthContext"; // ← classroomCodeとroleを取得

export const useStudents = () => {
  const { classroomCode, role, loading: authLoading } = useAuth(); // ← 自動取得
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      if (authLoading) return;

      try {
        const studentsRef = collection(db, "students");
        let q: Query<DocumentData> = studentsRef;

        if (role !== "superadmin" && classroomCode) {
          q = query(studentsRef, where("classroomCode", "==", classroomCode));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[];

        setStudents(data);
        console.log(`👨‍🎓 Students for ${role} with classroomCode "${classroomCode}"`, data);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classroomCode, role, authLoading]);

  return { students, loading };
};

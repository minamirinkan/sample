import { Query, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Student } from "../types/student";
import { useEffect, useState } from "react";

export const useStudents = (classroomCode?: string) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const studentsRef = collection(db, "students");
                let q: Query = studentsRef; // ← CollectionReference も Query のサブ型

                if (classroomCode) {
                    q = query(studentsRef, where("classroomCode", "==", classroomCode));
                }

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Student[];

                setStudents(data);
            } catch (err) {
                console.error("Error fetching students:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [classroomCode]);

    return { students, loading };
};

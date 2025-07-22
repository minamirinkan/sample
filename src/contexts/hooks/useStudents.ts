import { Query, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Student } from "../types/student";
import { useEffect, useState } from "react";

export const useStudents = (classroomCode?: string, role?: string) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const studentsRef = collection(db, "students");
                let q: Query = studentsRef;

                if (role !== "superadmin" && classroomCode) {
                    q = query(studentsRef, where("classroomCode", "==", classroomCode));
                }
                // superadminは何もフィルターしないので、全件取得。

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
    }, [classroomCode, role]); // roleが変わったら再取得

    return { students, loading };
};

// firebase/fetchers.ts
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

export const fetchStudentsByClassroom = async (classroomCode: string) => {
    const q = query(collection(db, "students"), where("classroomCode", "==", classroomCode));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const fetchAdminsByClassroom = async (classroomCode: string) => {
    const q = query(collection(db, "admins"), where("classroomCode", "==", classroomCode));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

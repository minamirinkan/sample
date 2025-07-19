import { db } from "../../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export type Closure = {
    date: string;
    name: string;
    type: "holiday" | "customClose";
};

export const saveSchoolClosures = async (
    year: string,
    closures: Closure[],
    deletedClosures: Closure[],
    role: "superadmin" | "admin",
    classroomCode?: string
) => {
    try {
        if (role === "superadmin") {
            const ref = doc(db, "schoolClosures", year);
            await setDoc(ref, {
                closures,
                deletedClosures,
                updatedAt: serverTimestamp(),
            });
        } else if (role === "admin") {
            if (!classroomCode) throw new Error("classroomCodeが必要です");

            const closureRef = doc(db, "classrooms", classroomCode, "closures", year);
            await setDoc(closureRef, {
                closures,
                deletedClosures,
                updatedAt: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error("保存エラー:", error);
        throw error;
    }
};

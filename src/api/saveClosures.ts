import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export type Closure = {
    date: string;
    name: string;
    type: "holiday" | "customClose";
};

export const saveSchoolClosures = async (
    month: string,
    closures: Closure[],
    deletedClosures: Closure[]
) => {
    try {
        const ref = doc(db, "schoolClosures", month);
        await setDoc(ref, {
            closures,
            deletedClosures,
            updatedAt: serverTimestamp(),
        });
        console.log("保存完了:", closures);
    } catch (error) {
        console.error("保存エラー:", error);
        throw error;
    }
};

import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase"; // 事前に設定された firebase インスタンス

export type Closure = {
    date: string;
    name: string;
    type: "holiday" | "customClose";
};

export const fetchSchoolClosures = async (year: number): Promise<{
    closures: Closure[];
    deleted: Closure[];
}> => {
    const ref = doc(db, "schoolClosures", `${year}`);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        const data = snap.data();
        return {
            closures: data.closures || [],
            deleted: data.deletedClosures || [], // ← ココが "deletedClosures" に修正必要！
        };
    } else {
        return {
            closures: [],
            deleted: [],
        };
    }
};


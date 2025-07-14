import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase"; // 事前に設定された firebase インスタンス

export type Closure = {
    date: string;
    name: string;
    type: "holiday" | "customClose";
};

export const fetchSchoolClosures = async (
    year: number,
    role?: "superadmin" | "admin" | "teacher" | "customer" | null,
    classroomCode?: string | null
): Promise<{
    closures: Closure[];
    deleted: Closure[];
}> => {
    if (role === "admin" && classroomCode) {
        // admin用：classrooms/{classroomCode}/closures/{year} をチェック
        const adminRef = doc(db, "classrooms", classroomCode, "closures", `${year}`);
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists()) {
            const data = adminSnap.data();
            return {
                closures: data.closures || [],
                deleted: data.deletedClosures || [],
            };
        } else {
            // admin用ドキュメントがなければ superadmin 用を試す
            const superRef = doc(db, "schoolClosures", `${year}`);
            const superSnap = await getDoc(superRef);
            if (superSnap.exists()) {
                const data = superSnap.data();
                return {
                    closures: data.closures || [],
                    deleted: data.deletedClosures || [],
                };
            } else {
                // どちらもない場合は空配列返す
                return {
                    closures: [],
                    deleted: [],
                };
            }
        }
    } else {
        // superadmin またはその他の役割用
        const ref = doc(db, "schoolClosures", `${year}`);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            return {
                closures: data.closures || [],
                deleted: data.deletedClosures || [],
            };
        } else {
            return {
                closures: [],
                deleted: [],
            };
        }
    }
};

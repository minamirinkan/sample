// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

type UserRole = "superadmin" | "admin" | "teacher" | "customer" | null;

type AdminData = {
    role: UserRole;
    name?: string;
    classroomName?: string;
    // 必要に応じて追加
};

type AuthContextType = {
    user: any | null;
    role: UserRole;
    adminData: AdminData | null;
    classroomCode: string | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    adminData: null,
    classroomCode: null,
    loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [adminData, setAdminData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [classroomCode, setclassroomCode] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(true);

            if (!user) {
                setRole(null);
                setAdminData(null);
                setLoading(false);
                return;
            }

            try {
                let userRole: UserRole = null;
                let data: AdminData | null = null;

                const superadminRef = doc(db, "superadmins", user.uid);
                const superadminSnap = await getDoc(superadminRef);

                if (superadminSnap.exists()) {
                    userRole = "superadmin";
                    data = { role: "superadmin", ...superadminSnap.data() } as AdminData;
                } else {
                    const adminRef = doc(db, "admins", user.uid);
                    const adminSnap = await getDoc(adminRef);

                    if (adminSnap.exists()) {
                        userRole = "admin";
                        const adminData = adminSnap.data();
                        let classroomName: string | undefined = undefined;
                        //data = { role: "admin", ...adminData } as AdminData;

                        // classroomCode を取得
                        if (adminData.classroomCode) {
                            const classroomsRef = collection(db, "classrooms");
                            const q2 = query(classroomsRef, where("code", "==", adminData.classroomCode));
                            const classroomSnapshot = await getDocs(q2);
                            if (!classroomSnapshot.empty) {
                                const classroomDoc = classroomSnapshot.docs[0];
                                setclassroomCode(classroomDoc.id);                  // 既存の処理
                                classroomName = classroomDoc.data().name ?? "";
                            }
                        }
                        data = {
                            role: "admin",
                            ...adminData,
                            classroomName,  // ← ここが抜けていた！
                        } as AdminData;
                    } else {
                        const teacherRef = doc(db, "teachers", user.uid);
                        const teacherSnap = await getDoc(teacherRef);

                        if (teacherSnap.exists()) {
                            userRole = "teacher";
                            data = { role: "teacher", ...teacherSnap.data() } as AdminData;
                        } else {
                            userRole = "customer";
                            data = { role: "customer" };
                        }
                    }
                }

                setRole(userRole);
                setAdminData(data);
            } catch (error) {
                console.error("Failed to fetch user role data:", error);
                setRole(null);
                setAdminData(null);
            }

            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, adminData, classroomCode, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

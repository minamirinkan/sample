import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Admin } from "./types/admin"; // ← 実際のパスに合わせて修正してください

type UserRole = "superadmin" | "admin" | "teacher" | "customer" | null;

type AuthContextType = {
    user: any | null;
    role: UserRole;
    adminData: Admin | null;
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
    const [adminData, setAdminData] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);
    const [classroomCode, setClassroomCode] = useState<string | null>(null);

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

                const superadminRef = doc(db, "superadmins", user.uid);
                const superadminSnap = await getDoc(superadminRef);

                if (superadminSnap.exists()) {
                    userRole = "superadmin";
                    // superadmin は Admin 型でないため null を設定
                    setAdminData(null);
                } else {
                    const adminRef = doc(db, "admins", user.uid);
                    const adminSnap = await getDoc(adminRef);

                    if (adminSnap.exists()) {
                        userRole = "admin";
                        const adminRaw = adminSnap.data();

                        let classroomName = "";
                        if (adminRaw.classroomCode) {
                            const classroomsRef = collection(db, "classrooms");
                            const q2 = query(classroomsRef, where("code", "==", adminRaw.classroomCode));
                            const classroomSnapshot = await getDocs(q2);
                            if (!classroomSnapshot.empty) {
                                const classroomDoc = classroomSnapshot.docs[0];
                                setClassroomCode(classroomDoc.id);
                                classroomName = classroomDoc.data().name ?? "";
                            }
                        }

                        const data: Admin = {
                            uid: user.uid,
                            name: adminRaw.name,
                            email: adminRaw.email,
                            role: "admin",
                            classroomCode: adminRaw.classroomCode,
                            classroomName: adminRaw.classroomName,
                            createdAt: adminRaw.createdAt,
                            lastLogin: adminRaw.lastLogin,
                        };
                        setAdminData(data);
                    } else {
                        const teacherRef = doc(db, "teachers", user.uid);
                        const teacherSnap = await getDoc(teacherRef);

                        if (teacherSnap.exists()) {
                            userRole = "teacher";
                            setAdminData(null);
                        } else {
                            userRole = "customer";
                            setAdminData(null);
                        }
                    }
                }

                setRole(userRole);
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

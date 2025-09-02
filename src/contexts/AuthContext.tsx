// contexts/TestAuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getUserDataByRole } from "./utils/getUserDataByRole";
import { UserRole, UserData } from "./types/user";
import { AuthContextType } from "./types/auth";

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    userData: null,
    classroomCode: null,
    loading: true,
    updateUserData: () => { }, // デフォルトは空関数
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // 外部から userData を更新する関数
    const updateUserData = (newData: UserData) => {
        setUserData(newData);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(true);

            if (!user) {
                setRole(null);
                setUserData(null);
                setLoading(false);
                return;
            }

            try {
                const { role, userData } = await getUserDataByRole(user.uid);
                setRole(role);
                setUserData(userData);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setRole(null);
                setUserData(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // value を useMemo で安定化
    const value = React.useMemo(() => ({
        user,
        role,
        userData,
        classroomCode: userData?.classroomCode ?? null,
        loading,
        updateUserData, // 外部から更新可能
    }), [user, role, userData, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

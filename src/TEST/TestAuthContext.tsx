// contexts/TestAuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getUserDataByRole } from "../contexts/utils/getUserDataByRole";
import { UserRole, UserData } from "../contexts/types/user";

type AuthContextType = {
    user: any | null;
    role: UserRole;
    userData: UserData | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    userData: null,
    loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <AuthContext.Provider value={{ user, role, userData, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

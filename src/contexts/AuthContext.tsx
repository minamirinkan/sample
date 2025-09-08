// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getIdTokenResult, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { getUserDataByRole } from "./utils/getUserDataByRole";
import { UserRole, UserData } from "./types/user";
import { AuthContextType } from "./types/auth";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    userData: null,
    classroomCode: null,
    loading: true,
    updateUserData: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 外部から userData を更新する関数
    const updateUserData = (newData: UserData) => {
        setUserData(newData);
    };

    // ログイン状態の監視
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(true);

            if (!user) {
                setRole(null);
                setUserData(null);
                setLoading(false); // ← 必ず false に
                return;
            }

            try {
                const result = await getUserDataByRole(user.uid);
                if (result) {
                    setRole(result.role);
                    setUserData(result.userData);
                } else {
                    setRole(null);
                    setUserData(null);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setRole(null);
                setUserData(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // user が null になったら自動でログイン画面へ
    useEffect(() => {
        if (!loading && !user) {
            const pathname = window.location.pathname;
            if (!pathname.includes("-login")) {
                navigate("/");
            }
        }
    }, [user, loading, navigate]);

    // 2時間セッションチェック（カスタムクレームの expiry）
    useEffect(() => {
        if (!user) return;

        let interval: ReturnType<typeof setInterval>;

        const checkExpiry = async () => {
            try {
                const tokenResult = await getIdTokenResult(user, true);
                const expiry = tokenResult.claims.expiry as number | undefined;

                if (expiry && Date.now() > expiry) {
                    await signOut(auth);
                    setRole(null);
                    setUserData(null);
                    alert("セッションが期限切れです。再ログインしてください。");
                    // navigate は不要、上の effect が処理
                }
            } catch (error) {
                console.error("Error checking session expiry:", error);
            }
        };

        // 初回チェック
        checkExpiry();
        // 1分ごとにチェック
        interval = setInterval(checkExpiry, 60 * 1000);

        return () => clearInterval(interval);
    }, [user]);

    const value = React.useMemo(
        () => ({
            user,
            role,
            userData,
            classroomCode: userData?.classroomCode ?? null,
            loading,
            updateUserData,
        }),
        [user, role, userData, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

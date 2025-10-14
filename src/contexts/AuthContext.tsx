// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
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
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const updateUserData = (newData: UserData) => {
        setUserData(newData);
    };

    const resetAuthState = () => {
        setUser(null);
        setRole(null);
        setUserData(null);
    };

    // ログイン状態の監視
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(true);

            if (!firebaseUser) {
                resetAuthState();
                setLoading(false);
                return;
            }

            // 本番用：2時間後に自動ログアウト
            const expiry = Date.now() + 2 * 60 * 60 * 1000;
            (firebaseUser as any).claims = { expiry };

            try {
                const result = await getUserDataByRole(firebaseUser.uid);
                if (result) {
                    setRole(result.role);
                    setUserData(result.userData);
                } else {
                    resetAuthState();
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                resetAuthState();
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 自動ログイン画面遷移
    useEffect(() => {
        if (!loading && !user) {
            // ここでは「フォームなど処理中の画面」は除外する
            const pathname = window.location.pathname;
            const ignorePaths = ['/admin/students/new']; // 登録フォームなど
            if (!pathname.includes("-login") && !ignorePaths.includes(pathname)) {
                navigate("/");
            }
        }
    }, [user, loading, navigate]);

    // セッション期限チェック
    useEffect(() => {
        if (!user) return;

        const checkExpiry = async () => {
            try {
                const expiry = (user as any).claims?.expiry as number | undefined;
                if (expiry && Date.now() > expiry) {
                    await signOut(auth);
                    resetAuthState();
                    alert("セッションが期限切れです。再ログインしてください。");
                }
            } catch (error) {
                console.error("Error checking session expiry:", error);
            }
        };

        checkExpiry();
        const interval = setInterval(checkExpiry, 5 * 60 * 1000);

        // タブ切り替え時にもチェック
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") checkExpiry();
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
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

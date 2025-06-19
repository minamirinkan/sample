//src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Firebase Auth user
    const [adminData, setAdminData] = useState(null); // 管理者データ
    const [loading, setLoading] = useState(true); // ← 追加

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(true);
            try {
                if (user) {
                    const adminRef = doc(db, 'admins', user.uid);
                    const adminSnap = await getDoc(adminRef);
                    if (adminSnap.exists()) {
                        const rawData = adminSnap.data();
                        setAdminData({
                            ...rawData,
                            classroomName: rawData.name, // ← ここで classroomName に変換
                        });
                    } else {
                        setAdminData(null);
                    }
                } else {
                    setAdminData(null);
                }
            } catch (error) {
                console.error("Failed to fetch admin data:", error);
                setAdminData(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, adminData, setAdminData, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

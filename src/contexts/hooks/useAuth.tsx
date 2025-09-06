// src/hooks/useAuth.tsx
import { useEffect, useState } from 'react';
// ▼▼▼ Firebaseの型定義をインポート ▼▼▼
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/firebase';

// ▼▼▼ フックの戻り値の型を定義 ▼▼▼
interface AuthState {
    user: User | null;
    loading: boolean;
}

export const useAuth = (): AuthState => {
    // ▼▼▼ userの状態に型を適用（Userオブジェクトか、ログアウト状態のnull） ▼▼▼
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            console.log('Firebase onAuthStateChanged:', firebaseUser);
            // firebaseUserは自動的に `User | null` 型になる
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return { user, loading };
};

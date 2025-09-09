// src/pages/ChangePassword.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
    signOut,
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const ChangePassword = () => {
    const { setUserPassword } = useAuth();
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleChangePassword = async () => {
        const user = auth.currentUser;

        if (!user) {
            alert('ログイン情報が見つかりません。再ログインしてください。');
            navigate('/customer/login');
            return;
        }

        if (!currentPassword || !newPassword) {
            alert('現在のパスワードと新しいパスワードを入力してください');
            return;
        }

        // 【改善点.1】現在のパスワードと新しいパスワードが同じかチェック
        if (currentPassword === newPassword) {
            alert('新しいパスワードが現在のパスワードと同じです。別のパスワードを設定してください。');
            return;
        }

        setLoading(true);
        try {
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user, credential);

            await updatePassword(user, newPassword);

            const userRef = doc(db, 'customers', user.uid);
            await updateDoc(userRef, {
                isFirstLogin: false,
            });

            alert('パスワードを変更しました。再ログインしてください。');
            await signOut(auth);
            setUserPassword(null);
            navigate('/mypage/dashboard'); // ログインページに遷移させる方が親切かもしれません
        } catch (error: any) { // エラーオブジェクトに型を付ける
            console.error(error);
            if (error.code === 'auth/wrong-password') {
                alert('現在のパスワードが間違っています');
            } else if (error.code === 'auth/weak-password') {
                alert('新しいパスワードは6文字以上で入力してください');
            } else {
                alert('パスワード変更に失敗しました: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center text-red-600">
                    パスワード変更
                </h2>
                <input
                    type="password"
                    placeholder="現在のパスワード"
                    value={currentPassword}
                    // 【改善点.2】イベントオブジェクトに型を付ける
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                    className="border border-gray-300 rounded-md p-3 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="新しいパスワード（6文字以上）"
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    className="border border-gray-300 rounded-md p-3 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={loading}
                />
                <button
                    onClick={handleChangePassword}
                    className={`w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md transition ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    disabled={loading}
                >
                    {loading ? '変更中...' : 'パスワードを変更'}
                </button>
            </div>
        </div>
    );
};

export default ChangePassword;

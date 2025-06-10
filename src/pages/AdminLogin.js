import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password) {
            alert('メールアドレスとパスワードを入力してください');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Firestoreからroleを取得
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                alert('ユーザー情報が見つかりません');
                await signOut(auth);
                return;
            }

            const userData = userSnap.data();
            if (userData.role !== 'superadmin' && userData.role !== 'admin') {
                alert('このアカウントには管理者権限がありません');
                await signOut(auth);
                return;
            }

            // ロールに応じて遷移
            if (userData.role === 'superadmin') {
                alert('SuperAdminとしてログイン成功');
                navigate('/superadmin/dashboard');
            } else {
                alert('Adminとしてログイン成功');
                navigate('/admin/dashboard');
            }

        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                alert('ユーザーが見つかりません');
            } else if (error.code === 'auth/wrong-password') {
                alert('パスワードが間違っています');
            } else if (error.code === 'auth/invalid-email') {
                alert('メールアドレスの形式が正しくありません');
            } else if (error.code === 'auth/invalid-credential') {
                alert('認証情報が無効です。再度お試しください。');
            } else {
                alert('ログイン失敗: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">
                    管理者ログイン
                </h2>

                <input
                    type="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 rounded-md p-3 w-full mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-300 rounded-md p-3 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                />
                <button
                    onClick={handleLogin}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    disabled={loading}
                >
                    {loading ? 'ログイン中...' : 'ログイン'}
                </button>
            </div>
        </div>
    );
};

export default AdminLogin;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { UserData } from '../contexts/types/user';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { updateUserData, userData } = useAuth();
    const navigate = useNavigate();
    console.log('userData', userData)
    // userData が揃ったら自動でダッシュボードへ遷移
    useEffect(() => {
        if (!userData) return;

        if (userData.role === 'admin') {
            navigate('/admin/dashboard');
        }
    }, [userData, navigate]);

    const handleLogin = async () => {
        if (!email || !password) {
            alert('メールアドレスとパスワードを入力してください');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Firestore から管理者データ取得
            const adminRef = doc(db, 'admins', user.uid);
            const adminSnap = await getDoc(adminRef);

            if (!adminSnap.exists()) {
                alert('管理者データが見つかりません');
                return;
            }

            const adminData = adminSnap.data();
            const role = adminData.role;
            const classroomCode = adminData.classroomCode;

            if (role !== 'admin' && role !== 'superadmin') {
                alert('管理者権限がありません');
                return;
            }

            // lastLogin 更新
            await updateDoc(adminRef, { lastLogin: serverTimestamp() });
            if (classroomCode) {
                const classroomRef = doc(db, 'classrooms', classroomCode);
                await updateDoc(classroomRef, { lastLogin: serverTimestamp() });
            }

            // AuthContext に userData をセット（これで useEffect が反応）
            updateUserData({
                ...adminData,
                uid: user.uid
            } as UserData);

        } catch (error: any) {
            alert('ログイン失敗: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">管理者ログイン</h2>

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
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'ログイン中...' : 'ログイン'}
                </button>
            </div>
        </div>
    );
};

export default AdminLogin;

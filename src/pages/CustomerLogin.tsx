import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut, AuthError } from 'firebase/auth';
import { doc, getDoc, DocumentData } from 'firebase/firestore';

interface CustomerData extends DocumentData {
    role: 'superadmin' | 'admin' | 'customer';
    isFirstLogin?: boolean;
}

const CustomerLogin: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
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

            const userRef = doc(db, 'customers', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                alert('ユーザー情報が見つかりません');
                await signOut(auth);
                setLoading(false);
                return;
            }

            const userData = userSnap.data() as CustomerData;

            switch (userData.role) {
                case 'superadmin':
                    alert('SuperAdminとしてログイン成功');
                    navigate('/superadmin/dashboard');
                    break;
                case 'admin':
                    alert('Adminとしてログイン成功');
                    navigate('/admin/dashboard');
                    break;
                case 'customer':
                    alert('customerとしてログイン成功');
                    if (userData.isFirstLogin) {
                        navigate('/customer/change-password');
                    } else {
                        navigate('/mypage/dashboard');
                    }
                    break;
                default:
                    alert('無効なユーザー種別です');
                    await signOut(auth);
            }
        } catch (error) {
            const authError = error as AuthError;
            switch (authError.code) {
                case 'auth/user-not-found':
                    alert('ユーザーが見つかりません');
                    break;
                case 'auth/wrong-password':
                    alert('パスワードが間違っています');
                    break;
                case 'auth/invalid-email':
                    alert('メールアドレスの形式が正しくありません');
                    break;
                case 'auth/invalid-credential':
                    alert('認証情報が無効です。再度お試しください。');
                    break;
                default:
                    alert('ログイン失敗: ' + authError.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-3xl font-bold mb-8 text-center text-red-600">
                    Customer ログイン
                </h2>

                <input
                    type="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 rounded-md p-3 w-full mb-5 focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-300 rounded-md p-3 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={loading}
                />
                <button
                    onClick={handleLogin}
                    className={`w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md transition ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={loading}
                >
                    {loading ? 'ログイン中...' : 'ログイン'}
                </button>
            </div>
        </div>
    );
};

export default CustomerLogin;

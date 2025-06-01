import { useState } from 'react';
import { auth, provider, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const CustomerSignup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [studentCode, setStudentCode] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [googleStudentCode, setGoogleStudentCode] = useState('');
    const [userCredential, setUserCredential] = useState(null);

    // メール＋パスワードで新規登録
    const handleEmailSignup = async () => {
        if (!/^\d{8}$/.test(studentCode)) {
            alert('生徒コードは8桁の数字で入力してください');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            await setDoc(doc(db, 'users', uid), {
                studentCode,
                email,
                createdAt: new Date(),
                role: 'customer',
            });

            alert('登録成功！ログインしてください');
        } catch (error) {
            alert('登録失敗: ' + error.message);
        }
    };

    // Googleで新規登録
    const handleGoogleSignup = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const isNewUser = result._tokenResponse?.isNewUser;

            if (isNewUser) {
                setUserCredential(result);
                setShowModal(true);
            } else {
                alert('既に登録済みのGoogleアカウントです。ログインしてください。');
            }
        } catch (error) {
            alert('Google認証に失敗しました: ' + error.message);
        }
    };

    // モーダルで生徒コード入力
    const handleModalSubmit = async () => {
        if (!/^\d{8}$/.test(googleStudentCode)) {
            alert('生徒コードは8桁の数字で入力してください');
            return;
        }

        try {
            const uid = userCredential.user.uid;

            await setDoc(doc(db, 'users', uid), {
                studentCode: googleStudentCode,
                email: userCredential.user.email,
                createdAt: new Date(),
                role: 'customer',
            });

            alert('登録完了！ログインしてください');
            setShowModal(false);
        } catch (error) {
            alert('登録処理に失敗しました: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-8">
                <h2 className="text-3xl font-bold text-center text-green-700">保護者・生徒 新規登録</h2>

                {/* メール＋パスワード登録フォーム */}
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="メールアドレス"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="password"
                        placeholder="パスワード"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="text"
                        placeholder="生徒コード（8桁）"
                        maxLength={8}
                        value={studentCode}
                        onChange={(e) => setStudentCode(e.target.value)}
                        className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        onClick={handleEmailSignup}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md transition"
                    >
                        メールで新規登録
                    </button>
                </div>

                {/* 区切り線 */}
                <div className="flex items-center justify-center space-x-3">
                    <hr className="flex-grow border-gray-300" />
                    <span className="text-gray-400 font-semibold">または</span>
                    <hr className="flex-grow border-gray-300" />
                </div>

                {/* Google登録ボタン */}
                <button
                    onClick={handleGoogleSignup}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md transition flex items-center justify-center space-x-3"
                >
                    <svg
                        className="w-6 h-6"
                        viewBox="0 0 533.5 544.3"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M533.5 278.4c0-18.4-1.6-36-4.7-53.2H272v100.7h147.1c-6.3 33.7-25 62.3-53.4 81.4v67.5h86.4c50.7-46.7 81.4-115.3 81.4-196.4z"
                            fill="#4285f4"
                        />
                        <path
                            d="M272 544.3c72.7 0 133.8-24.1 178.3-65.5l-86.4-67.5c-24.1 16.2-55.2 25.9-91.9 25.9-70.6 0-130.4-47.8-151.9-112.3H32.5v70.4C77 482 167.6 544.3 272 544.3z"
                            fill="#34a853"
                        />
                        <path
                            d="M120.1 321.1c-7.5-22.4-7.5-46.4 0-68.8V181.9H32.5c-29.7 58.6-29.7 127.3 0 185.9l87.6-46.7z"
                            fill="#fbbc04"
                        />
                        <path
                            d="M272 107.7c38.5 0 73 13.3 100.3 39.4l75-75C399.7 24.1 338.6 0 272 0 167.6 0 77 62.3 32.5 158.2l87.6 46.7c21.5-64.5 81.3-112.3 151.9-112.3z"
                            fill="#ea4335"
                        />
                    </svg>
                    <span>Googleで新規登録</span>

                </button>

                {/* Google登録時のモーダル */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                            <h3 className="text-xl font-semibold mb-4">生徒コードを入力してください</h3>
                            <input
                                type="text"
                                maxLength={8}
                                placeholder="8桁の生徒コード"
                                value={googleStudentCode}
                                onChange={(e) => setGoogleStudentCode(e.target.value)}
                                className="border border-gray-300 rounded-md p-3 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleModalSubmit}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    登録
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerSignup;

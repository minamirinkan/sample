// src/components/GoogleLoginButton.js
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';

const GoogleLoginButton = () => {
    const [showModal, setShowModal] = useState(false);
    const [studentCode, setStudentCode] = useState('');

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const isNewUser = result._tokenResponse?.isNewUser;
            const uid = result.user.uid;

            if (isNewUser) {
                setShowModal(true);
            } else {
                console.log('既存ユーザーとしてログイン');
                // 例: navigate("/customer/home")
            }
        } catch (error) {
            console.error('Googleログインエラー:', error);
        }
    };

    const handleStudentCodeSubmit = async () => {
        if (!/^\d{8}$/.test(studentCode)) {
            alert('生徒コードは8桁の数字で入力してください');
            return;
        }

        try {
            await setDoc(doc(db, 'users', auth.currentUser.uid), {
                studentCode,
                createdAt: new Date()
            });
            setShowModal(false);
            console.log('生徒コードを保存しました');
            // 例: navigate("/customer/home")
        } catch (error) {
            console.error('Firestoreへの保存エラー:', error);
        }
    };

    return (
        <div>
            <button
                onClick={handleGoogleLogin}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Googleでログイン
            </button>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-lg font-bold mb-2">生徒コードを入力してください</h2>
                        <input
                            type="text"
                            value={studentCode}
                            onChange={(e) => setStudentCode(e.target.value)}
                            className="border p-2 w-full mb-4"
                            placeholder="8桁の生徒コード"
                        />
                        <button
                            onClick={handleStudentCodeSubmit}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            登録
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleLoginButton;

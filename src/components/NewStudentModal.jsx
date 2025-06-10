import { useState, useEffect, useCallback } from 'react';
import { addDoc, collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { generateStudentCode } from '../utils/studentCodeGenerator';

const NewStudentModal = ({ isOpen, onClose, onAdded }) => {
    const { user } = useAuth();
    const db = getFirestore();

    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [kana, setKana] = useState('');
    const [grade, setGrade] = useState('');
    const [entryDate, setEntryDate] = useState('');
    const [studentCode, setStudentCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 生徒コード生成（教室コードを使う）
    const fetchStudentCode = useCallback(async () => {
        if (!user?.code) return;
        try {
            const code = await generateStudentCode(user.code);
            setStudentCode(code);
        } catch (err) {
            console.error('コード生成エラー:', err);
            setError('生徒コードの生成に失敗しました。');
        }
    }, [user?.code]);

    // モーダル開閉時の初期化
    useEffect(() => {
        if (isOpen) {
            fetchStudentCode();
            setLastName('');
            setFirstName('');
            setKana('');
            setGrade('');
            setEntryDate('');
            setError('');
        }
    }, [isOpen, fetchStudentCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 重複チェック
            const q = query(collection(db, 'students'), where('code', '==', studentCode));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                setError(`コード「${studentCode}」は既に使われています。`);
                setLoading(false);
                return;
            }

            // 登録処理
            await addDoc(collection(db, 'students'), {
                code: studentCode,
                lastName,
                firstName,
                kana,
                grade,
                entryDate,
                classroomCode: user.code,
                createdAt: new Date(),
            });

            onAdded();
            onClose();
        } catch (err) {
            console.error('登録失敗:', err);
            setError('登録に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4"
            >
                <h2 className="text-xl font-bold">新規生徒登録</h2>

                <input
                    className="w-full border rounded px-3 py-2 bg-gray-100"
                    value={studentCode}
                    readOnly
                    placeholder="自動生成されたコード"
                />

                <input
                    className="w-full border rounded px-3 py-2"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="姓"
                    required
                />
                <input
                    className="w-full border rounded px-3 py-2"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="名"
                    required
                />
                <input
                    className="w-full border rounded px-3 py-2"
                    value={kana}
                    onChange={e => setKana(e.target.value)}
                    placeholder="カナ"
                    required
                />
                <input
                    className="w-full border rounded px-3 py-2"
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    placeholder="学年"
                    required
                />
                <input
                    className="w-full border rounded px-3 py-2"
                    type="date"
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    required
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end space-x-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        登録
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewStudentModal;

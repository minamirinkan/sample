import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, query, where, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import SchoolAccountList from './SchoolAccountList';
import SchoolAccountForm from './SchoolAccountForm';

const SchoolAccountAdmin = () => {
    const [schools, setSchools] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        const q = query(collection(db, 'users'), where('role', '==', 'admin'), orderBy('code'));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSchools(fetched);
    };

    const handleAddSchool = async ({ newName, newCode, newEmail, newPassword }) => {
        setError('');
        setSuccess('');

        if (!newName.trim() || !/^\d{3}$/.test(newCode) || !newEmail.trim() || newPassword.length < 6) {
            setError('すべての項目を正しく入力してください（パスワードは6文字以上）。');
            return;
        }

        if (schools.some(s => s.code === newCode)) {
            setError('その教室コードはすでに使われています。');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
            const uid = userCredential.user.uid;

            await setDoc(doc(db, 'users', uid), {
                uid,
                name: newName.trim(),
                code: newCode,
                email: newEmail.trim(),
                role: 'admin',
                createdAt: new Date().toISOString(),
            });

            setSuccess('教室アカウントを登録しました。');
            fetchSchools();
        } catch (e) {
            setError('登録に失敗しました：' + e.message);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto bg-gray-50 rounded-lg shadow-lg">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-2">教室アカウント一覧</h2>
            <SchoolAccountList users={schools} />

            <h3 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">教室アカウントの新規登録</h3>
            <SchoolAccountForm onAdd={handleAddSchool} />

            {error && (
                <p className="flex items-center text-red-600 text-sm font-medium">
                    <FaExclamationCircle className="mr-2" /> {error}
                </p>
            )}
            {success && (
                <p className="flex items-center text-green-600 text-sm font-medium">
                    <FaCheckCircle className="mr-2" /> {success}
                </p>
            )}
        </div>
    );
};

export default SchoolAccountAdmin;

// utils/firebase/saveCustomerAndStudent.js
import { auth, db } from '../../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';

export const registerCustomerAndStudent = async ({
    uid,              // 生徒ID
    customerName,     // 保護者名
    phoneNumber,      // 保護者電話
    studentData,
    isFirstLogin = true,
}) => {
    const { guardianEmail } = studentData;

    const currentAdmin = auth.currentUser;
    const adminEmail = currentAdmin?.email;

    const adminPassword = prompt('管理者アカウントのパスワードを入力してください（認証復帰用）');
    if (!adminPassword) {
        alert('登録処理を中断しました。');
        return false;
    }

    try {
        // 保護者アカウント作成（仮パスワードは生徒ID）
        const tempPassword = studentData.studentId;
        const userCredential = await createUserWithEmailAndPassword(auth, guardianEmail, tempPassword);
        const customerUid = userCredential.user.uid;

        // Firestore参照
        const customerRef = doc(db, 'customers', customerUid);
        const customerSnap = await getDoc(customerRef);

        if (customerSnap.exists()) {
            // 既に保護者がいる場合 → 生徒IDを配列に追加
            await updateDoc(customerRef, {
                studentIds: arrayUnion(uid),
            });
        } else {
            // 新規保護者登録
            await setDoc(customerRef, {
                uid: customerUid,
                name: customerName,
                email: guardianEmail,
                phoneNumber,
                role: 'customer',
                isFirstLogin,
                createdAt: studentData.registrationDate,
                studentIds: [uid], // 最初の生徒IDをセット
            });
        }

        // 生徒情報登録（student に customerUid をセット）
        const studentRef = doc(db, 'students', uid);
        await setDoc(studentRef, {
            ...studentData,
            customerUid,
        });

        // 一旦サインアウトして管理者復帰
        await signOut(auth);
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

        return true;
    } catch (error) {
        console.error('登録失敗:', error);
        alert('登録に失敗しました: ' + error.message);

        try {
            await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        } catch (e) {
            console.error('管理者への復帰にも失敗しました:', e);
        }
        return false;
    }
};

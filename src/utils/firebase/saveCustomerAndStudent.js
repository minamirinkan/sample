// utils/firebase/saveCustomerAndStudent.js
import { auth, db } from '../../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const registerCustomerAndStudent = async ({
    uid,
    customerName,
    phoneNumber,
    studentData,
    isFirstLogin = true,
}) => {
    const { guardianEmail } = studentData;

    // 1. 管理者の現在のログイン情報を保持（復帰用）
    const currentAdmin = auth.currentUser;
    const adminEmail = currentAdmin?.email;

    const adminPassword = prompt('管理者アカウントのパスワードを入力してください（認証復帰用）');
    if (!adminPassword) {
        alert('登録処理を中断しました。');
        return false;
    }

    try {
        // 2. 保護者用 Authentication アカウントを仮パスワードで作成
        const tempPassword = studentData.studentId; // 初回ログイン時に生徒IDを仮パスワードに
        const userCredential = await createUserWithEmailAndPassword(auth, guardianEmail, tempPassword);
        const customerUid = userCredential.user.uid;

        // 3. Firestore に保護者データを登録
        const customerRef = doc(db, 'customers', customerUid);
        await setDoc(customerRef, {
            uid: customerUid,
            name: customerName,
            email: guardianEmail,
            phoneNumber,
            role: 'customer',
            isFirstLogin,
            createdAt: studentData.registrationDate,
        });

        // 4. Firestore に生徒データを登録
        const studentRef = doc(db, 'students', uid);
        await setDoc(studentRef, {
            ...studentData,
            customerUid,
        });

        // 5. 保護者の作成に伴い、現在の認証が保護者になっているので signOut
        await signOut(auth);

        // 6. 管理者として再ログイン（セッション維持）
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

        return true;
    } catch (error) {
        console.error('登録失敗:', error);
        alert('登録に失敗しました: ' + error.message);
        try {
            // 念のため管理者に復帰
            await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        } catch (e) {
            console.error('管理者への復帰にも失敗しました:', e);
        }
        return false;
    }
};

// utils/firebase/saveTeacher.js
import { auth, db } from '../../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const registerTeacher = async ({
    code,
    teacherName,
    teacherKanaName,
    email,
    teacherData,
    isFirstLogin = true,
}) => {
    // 管理者のログイン情報保持・復帰用パスワード入力
    const currentAdmin = auth.currentUser;
    const adminEmail = currentAdmin?.email;

    const adminPassword = prompt('管理者アカウントのパスワードを入力してください（認証復帰用）');
    if (!adminPassword) {
        alert('登録処理を中断しました。');
        return false;
    }

    try {
        // 仮パスワードは講師コードなどで作成（任意）
        const tempPassword = code;

        // 1. 講師用 Authentication アカウントを作成
        const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
        const teacherUid = userCredential.user.uid;

        // 2. Firestore に講師データを登録
        const teacherRef = doc(db, 'teachers', teacherUid);
        await setDoc(teacherRef, {
            uid: teacherUid,
            name: teacherName,
            kananame: teacherKanaName,
            email,
            phone: teacherData.phone, 
            role: 'teacher',
            isFirstLogin,
            ...teacherData,
        });

        // 3. 現認証が講師アカウントに変わるため、一旦 signOut
        await signOut(auth);

        // 4. 管理者へ再ログイン
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

        return true;
    } catch (error) {
        console.error('講師登録失敗:', error);
        alert('登録に失敗しました: ' + error.message);

        try {
            await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        } catch (e) {
            console.error('管理者への復帰にも失敗しました:', e);
        }

        return false;
    }
};

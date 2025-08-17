// utils/firebase/saveTeacher.ts
import { auth, db } from '../../../../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface RegisterTeacherParams {
    code: string;
    classroomCode: string;
    classroomName: string;
    fullName: string;
    fullNameKana: string;
    email: string;
    teacherData: {
        phone?: string;
        [key: string]: any;
    };
    isFirstLogin?: boolean;
    idToken: string;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

export const registerTeacher = async ({
    code,
    fullName,
    fullNameKana,
    email,
    teacherData,
    isFirstLogin = true,
}: RegisterTeacherParams): Promise<boolean> => {
    const currentAdmin = auth.currentUser;
    const adminEmail = currentAdmin?.email;

    const adminPassword = prompt('管理者アカウントのパスワードを入力してください（認証復帰用）');
    if (!adminPassword) {
        alert('登録処理を中断しました。');
        return false;
    }

    try {
        const tempPassword = code;

        const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
        const teacherUid = userCredential.user.uid;

        const teacherRef = doc(db, 'teachers', teacherUid);
        await setDoc(teacherRef, {
            uid: teacherUid,
            fullName,
            fullNameKana,
            email,
            phone: teacherData.phone,
            role: 'teacher',
            isFirstLogin,
            ...teacherData,
        });

        await signOut(auth);

        if (adminEmail) {
            await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        }

        return true;
    } catch (error: unknown) {
        console.error('講師登録失敗:', error);
        alert('登録に失敗しました: ' + getErrorMessage(error));

        try {
            if (adminEmail) {
                await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            }
        } catch (e: unknown) {
            console.error('管理者への復帰にも失敗しました:', e);
        }

        return false;
    }
};

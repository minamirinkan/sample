// utils/firebase/saveTeacher.ts
import { auth, db } from '../../../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { TeacherSchema } from '../../../../schemas';
import { z } from 'zod';

interface RegisterTeacherParams {
    code: string;
    classroomCode: string;
    classroomName: string;
    email: string;
    teacherData: z.infer<typeof TeacherSchema>;
    isFirstLogin?: boolean;
    idToken: string;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

export const registerTeacher = async ({
    code,
    classroomCode,
    classroomName,
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
        // teacherDataをスキーマで検証
        const parsedData = TeacherSchema.partial().parse(teacherData);

        const tempPassword = code;
        const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
        const teacherUid = userCredential.user.uid;

        const teacherRef = doc(db, 'teachers', teacherUid);
        await setDoc(teacherRef, {
            uid: teacherUid,
            code,
            classroomCode,
            classroomName,
            email,
            role: 'teacher',
            isFirstLogin,
            registrationDate: serverTimestamp(),
            ...parsedData, // zodで型安全になったデータ
        });

        // 管理者に戻る
        await signOut(auth);
        if (adminEmail) {
            await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        }

        return true;
    } catch (error: unknown) {
        console.error('講師登録失敗:', error);
        alert('登録に失敗しました: ' + getErrorMessage(error));

        // 管理者復帰も試みる
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

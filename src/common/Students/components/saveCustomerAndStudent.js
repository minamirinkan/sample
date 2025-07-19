// utils/firebase/saveCustomerAndStudent.js
import { auth, db } from '../../../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, setDoc, updateDoc, arrayUnion, getDoc, collection } from 'firebase/firestore';
import { saveToWeeklySchedules } from './saveToWeeklySchedules';

export const registerCustomerAndStudent = async ({
    uid,              // 生徒ID
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

        try {
            // Firestore参照
            const customerRef = doc(db, 'customers', customerUid);
            const customerSnap = await getDoc(customerRef);

            if (customerSnap.exists()) {
                await updateDoc(customerRef, {
                    studentIds: arrayUnion(uid),
                });
            } else {
                await setDoc(customerRef, {
                    uid: customerUid,
                    guardianLastName: studentData.guardianLastName,
                    guardianFirstName: studentData.guardianFirstName,
                    guardianName: `${studentData.guardianLastName} ${studentData.guardianFirstName}`, // 👈 ここでguardianNameを合成
                    email: guardianEmail,
                    phoneNumber,
                    role: 'customer',
                    isFirstLogin,
                    createdAt: studentData.registrationDate,
                    studentIds: [uid],
                });
            }

            // 生徒情報登録（student に customerUid をセット）
            const studentRef = doc(db, 'students', uid);
            const { courseFormData, school, grade, ...restStudentData } = studentData;

            console.log('Firestoreに保存する生徒データ:', {
                ...restStudentData,
                grade,         // school の外に出す
                customerUid,
            });

            await setDoc(studentRef, {
                ...restStudentData,
                grade,               // 学年はschoolの外にセット
                customerUid,
                guardianName: `${studentData.guardianLastName} ${studentData.guardianFirstName}`,
                status: '在籍中',
            });
            // コースデータ保存
            // サブコレクション courses にコースデータを追加
            if (Array.isArray(studentData.courseFormData)) {
                const coursesCollectionRef = collection(db, 'students', uid, 'courses');

                for (const course of studentData.courseFormData) {
                    if (!course.kind || !course.startYear) continue;

                    const { kind, subject, startYear, startMonth } = course;

                    // ドキュメントID生成
                    let docId = '';
                    if (['通常', '補習'].includes(kind) && startMonth) {
                        docId = `${kind}-${subject}-${startYear}-${startMonth}`;
                    } else {
                        docId = `${kind}-${subject}-${startYear}`;
                    }

                    const { ...courseData } = course; // selected は不要

                    await setDoc(doc(coursesCollectionRef, docId), courseData);                    
                }
                // 生徒情報の保存後に追加する
                    await saveToWeeklySchedules(studentData);
            }
        } catch (error) {
            // 👇 Firestore 保存失敗 → Auth ユーザー削除
            await userCredential.user.delete();
            throw error;
        }

        // 👇 管理者復帰処理（成功時）
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

// src/components/firebase/saveCustomerAndStudent.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { saveToWeeklySchedules } from './saveToWeeklySchedules';
import { Student } from '../../../contexts/types/student';
import { Customer } from '../../../contexts/types/customer';
import { SchoolDataItem } from '../../../contexts/types/schoolData';

export const registerCustomerAndStudent = async ({
  uid,
  phoneNumber,
  studentData,
  userPassword,
  isFirstLogin = true,
  courseFormData,
  setLoading,
}: {
  uid: string;
  phoneNumber: string;
  studentData: Student;
  userPassword: string;
  isFirstLogin?: boolean;
  courseFormData?: SchoolDataItem[];
  customerName?: string;
  setLoading?: (loading: boolean) => void;
}): Promise<boolean> => {
  const { guardianEmail } = studentData;
  const currentAdmin = auth.currentUser;
  const adminEmail = currentAdmin?.email ?? '';

  // const adminPassword = prompt('管理者アカウントのパスワードを入力してください（認証復帰用）');
  // if (!adminPassword) { ... }
  const adminPassword = userPassword;
  if (!adminPassword) {
    alert('管理者のパスワードが取得できません。再ログインしてください。');
    return false;
  }

  try {
    setLoading?.(true);

    const tempPassword = uid;
    const userCredential = await createUserWithEmailAndPassword(auth, guardianEmail, tempPassword);
    const customerUid = userCredential.user.uid;

    const customerRef = doc(db, 'customers', customerUid);
    const customerSnap = await getDoc(customerRef);

    const customerData: Customer = {
      uid: customerUid,
      email: guardianEmail,
      classroomCode: studentData.classroomCode,
      guardianLastName: studentData.guardianLastName,
      guardianFirstName: studentData.guardianFirstName,
      guardianLastNameKana: studentData.guardianLastNameKana,
      guardianFirstNameKana: studentData.guardianFirstNameKana,
      guardianfullName: studentData.guardianfullName,
      guardianfullNameKana: studentData.guardianfullNameKana,
      isFirstLogin,
      phoneNumber,
      role: 'customer',
      studentIds: [uid],
      createdAt: serverTimestamp() as any,
    };

    if (customerSnap.exists()) {
      await updateDoc(customerRef, {
        studentIds: arrayUnion(uid),
      });
    } else {
      await setDoc(customerRef, customerData);
    }

    const studentRef = doc(db, 'students', uid);
    const { courses, ...restStudentData } = studentData;
    await setDoc(studentRef, {
      ...restStudentData,
      customerUid,
      //courses,
    });

    if (Array.isArray(courses)) {
      const coursesCollectionRef = collection(db, 'students', uid, 'courses');
      for (const course of courses) {
        if (!course.kind || !course.startYear) continue;
        const { kind, subject, startYear, startMonth } = course;
        let docId = ['通常', '補習'].includes(kind) && startMonth
          ? `${kind}-${subject}-${startYear}-${startMonth}`
          : `${kind}-${subject}-${startYear}`;
        await setDoc(doc(coursesCollectionRef, docId), course);
      }
      const scheduleData = {
        ...studentData,
        courseFormData: courses,
      };
      console.log('🧪 saveToWeeklySchedules に渡すデータ:', scheduleData);
      await saveToWeeklySchedules({
        ...studentData,
        courseFormData: courses, // または courseFormData でも可
      });
    }
    await signOut(auth);
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    return true;
  } catch (error: any) {
    console.error('登録失敗:', error);
    alert('登録に失敗しました: ' + error.message);
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    } catch (e) {
      console.error('管理者への復帰にも失敗しました:', e);
    }
    return false;
  } finally {
    setLoading?.(false);
  }
};

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
import { Student } from '../../../contexts/types/student';
import { Customer } from '../../../contexts/types/customer';

export const registerCustomerAndStudent = async ({
  uid,
  phoneNumber,
  studentData,
  userPassword,
  isFirstLogin = true,
  setLoading,
}: {
  uid: string;
  phoneNumber: string;
  studentData: Student;
  userPassword: string;
  customerName?: string;
  isFirstLogin?: boolean;
  setLoading?: (loading: boolean) => void;
}): Promise<boolean> => {
  const { guardianEmail, courses } = studentData;
  const currentAdmin = auth.currentUser;
  const adminEmail = currentAdmin?.email ?? '';
  const adminPassword = userPassword;

  if (!adminPassword) {
    alert('管理者のパスワードが取得できません。再ログインしてください。');
    return false;
  }

  try {
    setLoading?.(true);

    // 保護者ユーザー作成
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

    // 生徒基本情報をセット
    const studentRef = doc(db, 'students', uid);
    const { courses: _ignoreCourses, ...restStudentData } = studentData;
    await setDoc(studentRef, {
      ...restStudentData,
      customerUid,
    });

    // courses サブコレクション作成
    if (Array.isArray(courses)) {
      const contractsCollectionRef = collection(db, 'customers', customerUid, 'contracts');
      const getGradeCode = (grade: string): string => {
        if (grade.startsWith("小")) return "E";       // 小学生
        if (grade.startsWith("中1") || grade.startsWith("中2")) return "J";
        if (grade.startsWith("中3")) return "J3";
        if (grade.startsWith("高1") || grade.startsWith("高2")) return "H";
        if (grade.startsWith("高3") || grade.includes("既卒")) return "H3";
        return "";
      };

      const createFeeCode = (classType: string, grade: string, times: string, duration: string): string => {
        const classTypeLetter = classType === "2名クラス" ? "W" : "A"; // W=2名, A=1名
        const gradeCode = getGradeCode(grade);                        // E, J, J3, H, H3
        const timesCode = `W${times}`;                                // W1, W2, W4
        const durationCode = `T${duration}`;                          // T70, T80, T40
        return `${classTypeLetter}_${gradeCode}_${timesCode}_${durationCode}`;
      };

      for (const course of courses) {
        if (!course.kind || !course.startYear) continue;

        const studentGrade = studentData.grade;
        const startMonthPart = course.startMonth ? `${course.startMonth.padStart(2, '0')}` : '';
        const feeCode = createFeeCode(course.classType, studentData.grade, course.times, course.duration);
        const docId = `${uid}-${course.startYear}${startMonthPart}-${feeCode}`;

        const contractData = {
          studentId: uid,
          grade: studentGrade, // そのまま保存
          feeCode,
          lessonType: course.kind,
          classType: course.classType,
          times: course.times,
          duration: course.duration,
          startYear: course.startYear,
          startMonth: course.startMonth,
          endYear: course.endYear || '',
          endMonth: course.endMonth || '',
          note: course.note || '',
          status: 'active',
          createdAt: serverTimestamp(),
        };

        await setDoc(doc(contractsCollectionRef, docId), contractData);
      }
    }

    // 管理者に戻る
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

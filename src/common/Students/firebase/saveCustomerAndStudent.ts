import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../../firebase";
import { Student } from "../../../contexts/types/student";
import { Customer } from "../../../contexts/types/customer";

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
  isFirstLogin?: boolean;
  setLoading?: (loading: boolean) => void;
}): Promise<boolean> => {
  const { guardianEmail, courses } = studentData;
  const currentAdmin = auth.currentUser;
  const adminEmail = currentAdmin?.email ?? "";

  if (!adminEmail) {
    alert("現在の管理者情報が取得できませんでした");
    return false;
  }

  try {
    setLoading?.(true);

    // --- 保護者アカウント作成 ---
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      guardianEmail,
      uid // 仮パスワード
    );
    const customerUid = userCredential.user.uid;

    const customerRef = doc(db, "customers", customerUid);
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
      role: "customer",
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

    // --- 生徒登録 ---
    const studentRef = doc(db, "students", uid);
    const { courses: _ignore, ...rest } = studentData;
    await setDoc(studentRef, {
      ...rest,
      customerUid,
      status: "入会",
    });

    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

    const statusHistoryRef = doc(db, "students", uid, "statusHistory", yearMonth);
    await setDoc(statusHistoryRef, {
      status: "入会",
      changedBy: adminEmail,
      reason: "初回登録",
      changedAt: serverTimestamp(),
      yearMonth,
    });

    // --- コース登録（contracts） ---
    if (Array.isArray(courses)) {
      const contractsCollectionRef = collection(db, 'customers', customerUid, 'contracts');

      for (const course of courses) {
        if (!course.kind || !course.startYear) continue;

        const studentGrade = studentData.grade;
        const startMonthPart = course.startMonth ? `${course.startMonth.padStart(2, '0')}` : '';

        const createFeeCode = (
          kind: string,
          classType: string,
          grade: string,
          times: string,
          duration: string,
          lecturePeriod?: string
        ): string => {
          let classCode = '';

          if (kind === '通常') {
            if (classType === '1名クラス') classCode = 'A';
            else if (classType === '2名クラス') classCode = 'W';
            else classCode = 'E';
          } else if (kind === '補習') {
            if (classType === '1名クラス') classCode = 'EA';
            else if (classType === '2名クラス') classCode = 'EW';
            else classCode = 'EE';
          } else if (kind === '講習') {
            let prefix = '';
            if (lecturePeriod === '春季講習') prefix = 'SP';
            else if (lecturePeriod === '夏季講習') prefix = 'SU';
            else if (lecturePeriod === '冬季講習') prefix = 'WI';

            if (classType === '1名クラス') classCode = `${prefix}_A`;
            else if (classType === '2名クラス') classCode = `${prefix}_W`;
            else classCode = `${prefix}_E`;
          }

          const getGradeCode = (grade: string) => {
            if (grade.startsWith("小")) return "E";
            if (grade.startsWith("中1") || grade.startsWith("中2")) return "J";
            if (grade.startsWith("中3")) return "J3";
            if (grade.startsWith("高1") || grade.startsWith("高2")) return "H";
            if (grade.startsWith("高3") || grade.includes("既卒")) return "H3";
            return "";
          };
          const gradeCode = getGradeCode(grade);
          const timesCode = times ? `W${times}` : '';
          const durationCode = duration ? `T${duration}` : '';

          return `${classCode}_${gradeCode}${timesCode ? `_${timesCode}` : ''}${durationCode ? `_${durationCode}` : ''}`;
        };

        const feeCode = createFeeCode(course.kind, course.classType, studentData.grade, course.times, course.duration, course.lecturePeriod);
        const docId = `${uid}-${course.startYear}${startMonthPart}-${feeCode}`;

        const contractData = {
          studentId: uid,
          grade: studentGrade,
          feeCode,
          lessonType: course.kind,
          classType: course.classType,
          times: course.times,
          duration: course.duration,
          startYear: course.startYear,
          startMonth: course.startMonth,
          endYear: course.endYear || '',
          endMonth: course.endMonth || '',
          lecturePeriod: course.lecturePeriod || '',
          note: course.note || '',
          status: 'active',
          createdAt: serverTimestamp(),
        };

        await setDoc(doc(contractsCollectionRef, docId), contractData);
      }
    }

    // --- 管理者アカウントに復帰 ---
    await signOut(auth);
    await signInWithEmailAndPassword(auth, adminEmail, userPassword);

    return true;
  } catch (error: any) {
    console.error("登録失敗:", error);
    alert("登録に失敗しました: " + error.message);

    // ロールバックで管理者に戻す
    try {
      await signInWithEmailAndPassword(auth, adminEmail, userPassword);
    } catch (e) {
      console.error("管理者への復帰にも失敗:", e);
    }
    return false;
  } finally {
    setLoading?.(false);
  }
};

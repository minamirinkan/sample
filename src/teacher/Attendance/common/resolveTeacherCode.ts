// src/teacher/common/resolveTeacherCode.ts
import { User } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

type TeacherDoc = {
  code?: string;     // ← ここに "t0470015" などが入っている想定
  email?: string;
  teacherCode?: string; // 互換: 旧フィールドがある場合の保険
};

const asNonEmptyString = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/**
 * Auth ユーザーから「教師コード（例: t0470015）」を解決して返す。
 * 優先順:
 *  1) custom claims: claims.teacherCode
 *  2) Firestore: teachers/{uid}.code（スクショの構造）
 *     （なければ teachers/{uid}.teacherCode も見る）
 *  3) Firestore: teachers where email == user.email の先頭 .code
 *  4) Firestore: users/{uid}.teacherCode（互換フォールバック）
 */
export async function resolveTeacherCode(user: User): Promise<string> {
  // 1) custom claims
  try {
    const token = await user.getIdTokenResult();
    const claim = asNonEmptyString((token?.claims as any)?.teacherCode);
    if (claim) return claim;
  } catch { /* 次へ */ }

  const db = getFirestore();

  // 2) teachers/{uid}.code
  try {
    const snap = await getDoc(doc(db, "teachers", user.uid));
    if (snap.exists()) {
      const data = snap.data() as TeacherDoc;
      const code = asNonEmptyString(data?.code) || asNonEmptyString(data?.teacherCode);
      if (code) return code;
    }
  } catch { /* 次へ */ }

  // 3) teachers where email == user.email
  if (user.email) {
    try {
      const q = query(collection(db, "teachers"), where("email", "==", user.email));
      const qs = await getDocs(q);
      if (!qs.empty) {
        const data = qs.docs[0].data() as TeacherDoc;
        const code = asNonEmptyString(data?.code) || asNonEmptyString(data?.teacherCode);
        if (code) return code;
      }
    } catch { /* 次へ */ }
  }

  // 4) users/{uid}.teacherCode（旧仕様フォールバック）
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const code = asNonEmptyString((snap.data() as any)?.teacherCode);
      if (code) return code;
    }
  } catch { /* 最終的にエラー */ }

  throw new Error("教師コード（teachers.code）を解決できませんでした。claims/teachers/users をご確認ください。");
}

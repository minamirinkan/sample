// utils/firebase/saveTeacherFees.js
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // ← Firebase設定ファイルを参照してください

export async function saveTeacherFees(locationName, data) {
  const ref = doc(db, 'TeacherFees', locationName);
  await setDoc(ref, data);
}

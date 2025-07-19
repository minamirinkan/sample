import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * Firestoreの既存ドキュメントを上書き更新する関数
 * @param {string} id - ドキュメントID（例: "T96I6EgMPNXqWo5aJt2G"）
 * @param {Object} updatedData - 上書きするフィールド（registrationLocation など含む）
 */
export async function updateTuitionSettings(id, updatedData) {
  const ref = doc(db, 'tuitionSettings', id);

  // createdAt を除外して更新
  const { createdAt, ...dataToUpdate } = updatedData;

  await updateDoc(ref, {
    ...dataToUpdate,
    updatedAt: new Date(),
  });
}

// 保存ロジック（Firebase Firestore への保存）
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

/**
 * Firestore に授業料金設定を保存する関数
 * @param {string} registrationLocation - 例: "渋谷校"
 * @param {Array[]} tuitionDataW - Wコース料金データ（flatten済み）
 * @param {Array[]} tuitionDataA - Aコース料金データ（flatten済み）
 * @param {Object} expenses - 諸費用（admissionFee, materialFee, testFee, maintenanceFee）
 * @param {string[]} testPreparationData - テスト演習料金（2つ）
 */
export async function saveTuitionSettings({
  registrationLocation,
  tuitionDataW,
  tuitionDataA,
  expenses,
  testPreparationData
}) {
  try {
    // 🔍 確認用ログ
    console.log('🔥 保存直前データ:', {
      registrationLocation,
      tuitionDataW,
      tuitionDataA,
      tuitionFees: expenses,
      testPreparationData
    });

    // Firestore に保存
    const settingsRef = collection(db, 'tuitionSettings');
    const docRef = await addDoc(settingsRef, {
      registrationLocation,
      tuitionDataW,
      tuitionDataA,
      tuitionFees: expenses,
      testPreparationData,
      createdAt: new Date(),
      tuition_code: '' + Math.floor(100000 + Math.random() * 900000)
    });

    console.log(`✅ 保存成功: tuitionCode = ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('❌ 保存エラー:', error);
    throw error;
  }
}

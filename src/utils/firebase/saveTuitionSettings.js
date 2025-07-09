import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Firestore に授業料金設定を登録地（ドキュメントID）ごとに保存する関数
 * @param {Object} params - 登録内容
 * @param {string} params.registrationLocation - 例: "渋谷校"
 * @param {Array[]} params.tuitionDataW - Wコース料金データ（flatten済み）
 * @param {Array[]} params.tuitionDataA - Aコース料金データ（flatten済み）
 * @param {Object} params.expenses - 諸費用（admissionFee, materialFee, testFee, maintenanceFee）
 * @param {string[]} params.testPreparationData - テスト演習料金（2つ）
 */
export async function saveTuitionSettings({
  registrationLocation,
  tuitionDataW,
  tuitionDataA,
  expenses,
  testPreparationData
}) {
  try {
    console.log('🔥 保存直前データ:', {
      registrationLocation,
      tuitionDataW,
      tuitionDataA,
      tuitionFees: expenses,
      testPreparationData
    });

    // 🔽 ドキュメントID = 登録地（例："渋谷校"）
    const docRef = doc(db, 'Tuition', registrationLocation);

    await setDoc(docRef, {
      tuitionDataW,
      tuitionDataA,
      tuitionFees: expenses,
      testPreparationData,
      updatedAt: new Date()
    });

    console.log(`✅ 保存成功: 登録地 = ${registrationLocation}`);
    return registrationLocation;
  } catch (error) {
    console.error('❌ 保存エラー:', error);
    throw error;
  }
}

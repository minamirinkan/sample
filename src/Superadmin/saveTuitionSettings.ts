import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface SaveTuitionSettingsParams {
  registrationLocation: string;
  tuitionDataW: Record<string, string>[];
  tuitionDataA: Record<string, string>[];
  expenses: {
    admissionFee: number;
    materialFee: number;
    testFee: { elementary: number; middle: number };
    maintenanceFee: number;
  };
  testPreparationData: string[];
}

/**
 * Firestore に授業料金設定を登録地（ドキュメントID）ごとに保存する関数
 */
export async function saveTuitionSettings({
  registrationLocation,
  tuitionDataW,
  tuitionDataA,
  expenses,
  testPreparationData,
}: SaveTuitionSettingsParams): Promise<string> {
  try {
    console.log('🔥 保存直前データ:', {
      registrationLocation,
      tuitionDataW,
      tuitionDataA,
      tuitionFees: expenses,
      testPreparationData,
    });

    // 🔽 ドキュメントID = 登録地（例："渋谷校"）
    const docRef = doc(db, 'Tuition', registrationLocation);

    await setDoc(docRef, {
      tuitionDataW,
      tuitionDataA,
      tuitionFees: expenses,
      testPreparationData,
      updatedAt: new Date(),
    });

    console.log(`✅ 保存成功: 登録地 = ${registrationLocation}`);
    return registrationLocation;
  } catch (error) {
    console.error('❌ 保存エラー:', error);
    throw error;
  }
}

import { db } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

interface FeeRow {
  item: string;
  amount: number | string;
}

interface SaveTuitionSettingsParams {
  registrationLocation: string;
  yyyyMM: string;
  tuitionDataW: string[][];
  tuitionDataA: string[][];
  tuitionDataE?: string[][]; // 個別クラス
  schedulesW: string[];
  schedulesA: string[];
  individualSets?: { name: string; description: string }[];
  durationW?: string;
  durationA?: string;
  admissionRows?: FeeRow[];
  maintenanceRows?: FeeRow[];
  discountRows?: FeeRow[];
  penaltyRows?: FeeRow[];
  materialRows?: FeeRow[];
  testRows?: FeeRow[];
  material_onceRows?: FeeRow[];
  extraRowsW?: string[][]; // Wコース追加1コマ
  extraRowsA?: string[][]; // Aコース追加1コマ
}

const gradeCodes = ['E', 'J', 'J3', 'H', 'H3'];

export async function saveTuitionSettings({
  registrationLocation,
  yyyyMM,
  tuitionDataW,
  tuitionDataA,
  tuitionDataE = [],
  schedulesW,
  schedulesA,
  individualSets = [],
  durationW = '80',
  durationA = '80',
  admissionRows = [],
  maintenanceRows = [],
  discountRows = [],
  penaltyRows = [],
  materialRows = [],
  testRows = [],
  material_onceRows = [],
  extraRowsW = [],
  extraRowsA = [],
}: SaveTuitionSettingsParams) {
  const baseRef = doc(db, 'FeeMaster', `${yyyyMM}_${registrationLocation}`);
  // === 年月フィールドを FeeMaster ドキュメントに保存 ===
  await setDoc(baseRef, { yearMonth: yyyyMM }, { merge: true });

  const tuitionDocRef = doc(collection(baseRef, 'categories'), 'tuition');

  // === 通常授業料 (W/A) ===
  const createTuitionMap = (
    schedules: string[],
    classType: 'W' | 'A',
    tuitionData: string[][],
    radioDuration: string
  ) => {
    const map: Record<string, any> = {};
    schedules.forEach((schedule, rowIdx) => {
      tuitionData[rowIdx]?.forEach((amountStr, colIdx) => {
        const amount = Number(amountStr);
        if (!amount) return;

        const matches = schedule.match(/週(\d+)回(?:（(\d+)分）)?/);
        if (!matches) return;
        const [, times, durationMatch] = matches;

        let duration = '80';
        if (classType === 'W' && rowIdx === 0) duration = '40';
        else if (durationMatch) duration = durationMatch;
        else duration = radioDuration;

        const gradeCode = gradeCodes[colIdx] || 'E';
        const fieldId = `${classType}_${gradeCode}_W${times}_T${duration}`;

        map[fieldId] = { amount, classType, times, duration, lessonType: '通常' };
      });
    });
    return map;
  };

  const tuitionWMap = createTuitionMap(schedulesW, 'W', tuitionDataW, durationW);
  const tuitionAMap = createTuitionMap(schedulesA, 'A', tuitionDataA, durationA);

  // === 個別クラス (E: 中学生のみ) ===
  const createIndividualMap = (sets: { name: string; description: string }[], tuitionData: string[][]) => {
    const map: Record<string, any> = {};
    sets.forEach((set, rowIdx) => {
      tuitionData[rowIdx]?.forEach((amountStr, colIdx) => {
        const amount = Number(amountStr);
        if (!amount) return;

        const gradeCode = 'J'; // ✅ 中学生に固定
        const fieldId = `E_${gradeCode}_SET${rowIdx + 1}`;
        const durationMatch = set.description.match(/(\d+)分×(\d+)回/);
        const duration = durationMatch ? durationMatch[1] : '80';
        const times = durationMatch ? durationMatch[2] : '4';

        map[fieldId] = { amount, classType: 'E', times, duration, lessonType: '個別' };
      });
    });
    return map;
  };

  const tuitionEMap = createIndividualMap(individualSets, tuitionDataE);
  const extraEMap = createIndividualMap(individualSets, tuitionDataE);

  // === 保存: tuition コレクション ===
  await setDoc(
    tuitionDocRef,
    { ...tuitionWMap, ...tuitionAMap, ...tuitionEMap },
    { merge: true }
  );

  // === 追加1コマ（補習）を categories/extra に保存 ===
  const extraDocRef = doc(collection(baseRef, 'categories'), 'extra');
  const extraMap: Record<string, any> = { ...extraEMap }; // ← 個別クラスも追加

  const addExtraRows = (extraData: string[][], classType: 'W' | 'A', schedules: string[], radioDuration: string) => {
    extraData.forEach((row, rowIdx) => {
      row.forEach((amountStr, colIdx) => {
        const amount = Number(amountStr);
        if (!amount) return;

        const schedule = schedules[rowIdx] || '追加1コマ';
        const matches = schedule.match(/週(\d+)回(?:（(\d+)分）)?/);
        const [, times, durationMatch] = matches || [null, '1', radioDuration];
        const duration = durationMatch || radioDuration;
        const gradeCode = gradeCodes[colIdx] || 'E';
        const fieldId = `${classType}_${gradeCode}_W${times}_T${duration}`;

        extraMap[fieldId] = { amount, classType, times, duration, lessonType: '補習' }; // ← lessonTypeも個別に
      });
    });
  };

  addExtraRows(extraRowsW, 'W', schedulesW, durationW);
  addExtraRows(extraRowsA, 'A', schedulesA, durationA);

  await setDoc(extraDocRef, extraMap, { merge: true });

  // === その他カテゴリ ===
  const saveMapCategory = async (collectionName: string, rows: FeeRow[], startDigit: number) => {
    if (!rows.length) return;
    const docRef = doc(collection(baseRef, 'categories'), collectionName);
    const mapData = Object.fromEntries(
      rows.map((r, idx) => {
        const id = `${startDigit}${String(idx + 1).padStart(3, '0')}`;
        return [id, { id, item: r.item, amount: Number(r.amount) }];
      })
    );
    await setDoc(docRef, mapData, { merge: true });
  };

  await saveMapCategory('admission', admissionRows, 1);
  await saveMapCategory('maintenance', maintenanceRows, 2);
  await saveMapCategory('test', testRows, 3);
  await saveMapCategory('material', materialRows, 4);
  await saveMapCategory('discount', discountRows, 5);
  await saveMapCategory('penalty', penaltyRows, 6);
  await saveMapCategory('material_once', material_onceRows, 7);
}

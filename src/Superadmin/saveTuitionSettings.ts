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
  schedulesW: string[];
  schedulesA: string[];
  durationW?: string; // Wコースのラジオ選択（2行目以降に反映）
  durationA?: string; // Aコースのラジオ選択
  maintenanceRows?: FeeRow[];
  discountRows?: FeeRow[];
  penaltyRows?: FeeRow[];
  materialRows?: FeeRow[];
  testRows?: FeeRow[];
  material_onceRows?: FeeRow[];
}

const gradeCodes = ['E', 'J', 'J3', 'H', 'H3'];

export async function saveTuitionSettings({
  registrationLocation,
  yyyyMM,
  tuitionDataW,
  tuitionDataA,
  schedulesW,
  schedulesA,
  durationW = '80',
  durationA = '80',
  maintenanceRows = [],
  discountRows = [],
  penaltyRows = [],
  materialRows = [],
  testRows = [],
  material_onceRows = [],
}: SaveTuitionSettingsParams) {
  const baseRef = doc(db, 'FeeMaster', `${yyyyMM}_${registrationLocation}`);
  const tuitionDocRef = doc(collection(baseRef, 'categories'), 'tuition');

  const createTuitionMap = (
    schedules: string[],
    classType: 'W' | 'A',
    tuitionData: string[][],
    radioDuration: string
  ) => {
    const map: Record<string, any> = {};

    schedules.forEach((schedule, rowIdx) => {
      tuitionData[rowIdx].forEach((amountStr, colIdx) => {
        const amount = Number(amountStr);
        if (!amount) return;

        const matches = schedule.match(/週(\d+)回(?:（(\d+)分）)?/);
        if (!matches) return;
        const [, times, durationMatch] = matches;

        // Wコース1行目は40分固定、他はラジオボタンで選択した時間
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

  await setDoc(tuitionDocRef, { ...tuitionWMap, ...tuitionAMap }, { merge: true });

  // W/A以外の料金
  const saveMapCategory = async (collectionName: string, rows: FeeRow[]) => {
    if (!rows.length) return;
    const docRef = doc(collection(baseRef, 'categories'), collectionName);
    const mapData = Object.fromEntries(
      rows.map(r => [r.item.replace(/\s/g, '_'), { item: r.item, amount: Number(r.amount) }])
    );
    await setDoc(docRef, mapData, { merge: true });
  };

  await saveMapCategory('maintenance', maintenanceRows);
  await saveMapCategory('discount', discountRows);
  await saveMapCategory('penalty', penaltyRows);
  await saveMapCategory('material', materialRows);
  await saveMapCategory('test', testRows);
  await saveMapCategory('material_once', material_onceRows);
}

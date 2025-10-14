import React, { useEffect, useState } from 'react';
import { saveTuitionSettings } from './saveTuitionSettings';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface TuitionFormProps {
    yyyyMM: string;
    registrationLocation: string;
}

const initialSchedulesW = ['週1回（40分）', '週1回', '週2回', '週3回', '週4回', '週5回'];
const initialSchedulesA = ['週1回', '週2回', '週3回', '週4回', '週5回'];
const grades = ['小学生', '中1/中2', '中3', '高1/高2', '高3/既卒'];
const gradeMap: Record<string, number> = { E: 0, J: 1, J3: 2, H: 3, H3: 4 };

const createEmptyData = (rows: string[], cols: string[]) =>
    rows.map(() => new Array(cols.length).fill(''));

const TuitionForm: React.FC<TuitionFormProps> = ({ yyyyMM, registrationLocation }) => {
    const [schedulesW, setSchedulesW] = useState(initialSchedulesW);
    const [schedulesA, setSchedulesA] = useState(initialSchedulesA);
    const [tuitionDataW, setTuitionDataW] = useState(createEmptyData(initialSchedulesW, grades));
    const [tuitionDataA, setTuitionDataA] = useState(createEmptyData(initialSchedulesA, grades));
    const [week6Added, setWeek6Added] = useState(false);
    const [durationW, setDurationW] = useState<'70' | '80'>('80');
    const [durationA, setDurationA] = useState<'70' | '80'>('80');

    // ✅ 個別クラス（1セット・2セット）
    const individualSets = [
        { name: '1セット', description: '80分×4回' },
        { name: '2セット', description: '80分×8回' },
    ];

    const [individualData, setIndividualData] = useState(
        createEmptyData(individualSets.map((s) => s.name), ['料金'])
    );

    // Firestore から取得
    useEffect(() => {
        const fetchData = async () => {
            if (!yyyyMM || !registrationLocation) return;

            const docId = `${yyyyMM}_${registrationLocation}`;
            const tuitionRef = doc(db, "FeeMaster", docId, "categories", "tuition");
            const extraRef = doc(db, "FeeMaster", docId, "categories", "extra");

            const [tuitionSnap, extraSnap] = await Promise.all([
                getDoc(tuitionRef),
                getDoc(extraRef),
            ]);

            // 通常行分だけ用意（追加1コマは後で append する）
            const wData = createEmptyData(schedulesW, grades);
            const aData = createEmptyData(schedulesA, grades);

            let detectedDurationW: '70' | '80' = '80';
            let detectedDurationA: '70' | '80' = '80';

            // --- tuition（通常）を処理: T40 は先頭(0)に入れる ---
            if (tuitionSnap.exists()) {
                const data = tuitionSnap.data();
                Object.entries(data).forEach(([key, value]) => {
                    // W_/A_ のキーだけ処理（E_ は個別クラスとして後で処理）
                    if (!(key.startsWith("W_") || key.startsWith("A_"))) return;

                    const parts = key.split("_");
                    // 期待: ["W","J","W1","T80"] のような形式
                    if (parts.length < 4) return;
                    const [classType, gradeCode, weekStr, durationStr] = parts;
                    const colIdx = gradeMap[gradeCode];
                    if (colIdx === undefined) return;

                    const weekNum = weekStr.replace("W", "");
                    let rowIdx = -1;

                    if (classType === "W") {
                        // T40 は先頭行（1回40分固定）
                        if (durationStr === "T40") {
                            rowIdx = 0;
                        } else {
                            rowIdx = schedulesW.findIndex((s, idx) => idx > 0 && s.startsWith(`週${weekNum}回`));
                        }
                        if (durationStr === "T70" || durationStr === "T80") {
                            detectedDurationW = durationStr === "T70" ? "70" : "80";
                        }
                    } else if (classType === "A") {
                        rowIdx = schedulesA.findIndex(s => s.startsWith(`週${weekNum}回`));
                        if (durationStr === "T70" || durationStr === "T80") {
                            detectedDurationA = durationStr === "T70" ? "70" : "80";
                        }
                    }

                    if (rowIdx >= 0) {
                        const amount = (value as any).amount ?? "";
                        if (classType === "W") wData[rowIdx][colIdx] = amount.toString();
                        else aData[rowIdx][colIdx] = amount.toString();
                    }
                });
            }

            // --- extra（補習）を処理: こちらは必ず"最終行"に入れる ---
            if (extraSnap.exists()) {
                const data = extraSnap.data();
                Object.entries(data).forEach(([key, value]) => {
                    if (!(key.startsWith("W_") || key.startsWith("A_"))) return;

                    const parts = key.split("_");
                    // W_J_W1_T80 などを想定。最低限 classType と gradeCode を読む
                    if (parts.length < 2) return;
                    const [classType, gradeCode] = parts;
                    const colIdx = gradeMap[gradeCode];
                    if (colIdx === undefined) return;

                    if (classType === "W") {
                        const lastIdx = schedulesW.length; // 最終行インデックス（追加1コマ）
                        if (!wData[lastIdx]) wData.push(new Array(grades.length).fill(''));
                        const amount = (value as any).amount ?? "";
                        wData[lastIdx][colIdx] = amount.toString();
                    } else if (classType === "A") {
                        const lastIdx = schedulesA.length;
                        if (!aData[lastIdx]) aData.push(new Array(grades.length).fill(''));
                        const amount = (value as any).amount ?? "";
                        aData[lastIdx][colIdx] = amount.toString();
                    }
                });
            }

            // set states for W/A
            setTuitionDataW(wData);
            setTuitionDataA(aData);
            setDurationW(detectedDurationW);
            setDurationA(detectedDurationA);

            // --- 個別クラス (E) を取得して individualData に反映 ---
            // 優先順: tuition -> extra（tuition にあればそれを使い、なければ extra で補う）
            const newIndiv = createEmptyData(individualSets.map(s => s.name), ['料金']);

            const fillFrom = (source: Record<string, any>, allowOverwrite: boolean) => {
                Object.entries(source || {}).forEach(([key, value]) => {
                    // E_J_SET1, E_J_SET2 の形式を想定
                    if (!key.startsWith("E_J_SET")) return;
                    const m = key.match(/SET(\d+)/);
                    if (!m) return;
                    const idx = parseInt(m[1], 10) - 1;
                    if (idx < 0 || idx >= newIndiv.length) return;
                    const amount = (value as any).amount ?? "";
                    if (!amount && amount !== 0) return;
                    if (allowOverwrite || !newIndiv[idx][0]) {
                        newIndiv[idx][0] = amount.toString();
                    }
                });
            };

            if (tuitionSnap.exists()) fillFrom(tuitionSnap.data() as any, true);   // 優先的に埋める
            if (extraSnap.exists()) fillFrom(extraSnap.data() as any, false);      // 足りない分だけ補填

            setIndividualData(newIndiv);
        };

        fetchData();
    }, [yyyyMM, registrationLocation, schedulesW, schedulesA]);

    const handleChange = (data: string[][], setData: React.Dispatch<React.SetStateAction<string[][]>>, rowIdx: number, colIdx: number, value: string) => {
        const updated = [...data];
        updated[rowIdx][colIdx] = value;
        setData(updated);
    };

    const toggleWeek6 = () => {
        if (!week6Added) {
            setSchedulesW([...schedulesW, '週6回']);
            setSchedulesA([...schedulesA, '週6回']);
            setTuitionDataW([...tuitionDataW, new Array(grades.length).fill('')]);
            setTuitionDataA([...tuitionDataA, new Array(grades.length).fill('')]);
        } else {
            setSchedulesW(schedulesW.slice(0, -1));
            setSchedulesA(schedulesA.slice(0, -1));
            setTuitionDataW(tuitionDataW.slice(0, -1));
            setTuitionDataA(tuitionDataA.slice(0, -1));
        }
        setWeek6Added(!week6Added);
    };

    const handleSubmitTuition = async (e: React.FormEvent) => {
        e.preventDefault();

        // 追加1コマを tuitionData から切り出す
        const extraRowsW = tuitionDataW.length > schedulesW.length ? [tuitionDataW[schedulesW.length]] : [];
        const extraRowsA = tuitionDataA.length > schedulesA.length ? [tuitionDataA[schedulesA.length]] : [];

        // 通常行だけ残す
        const tuitionRowsW = tuitionDataW.slice(0, schedulesW.length);
        const tuitionRowsA = tuitionDataA.slice(0, schedulesA.length);

        try {
            await saveTuitionSettings({
                registrationLocation,
                yyyyMM,
                tuitionDataW: tuitionRowsW,
                tuitionDataA: tuitionRowsA,
                schedulesW,
                schedulesA,
                durationW,
                durationA,
                tuitionDataE: individualData, // ← ここはそのまま（2行分想定）
                individualSets, // ← 個別設定情報
                extraRowsW, // 補習W
                extraRowsA, // 補習A
            });
            alert('授業料データ保存完了');
        } catch (err) {
            console.error(err);
            alert('授業料データの保存に失敗しました');
        }
    };

    // 通常コースの表描画
    const renderTable = (
        rows: string[],
        data: string[][],
        setData: React.Dispatch<React.SetStateAction<string[][]>>
    ) => (
        <table className="table-auto border border-collapse border-gray-400 rounded-lg overflow-hidden">
            <thead>
                <tr className="bg-gray-200">
                    <th className="border px-2 py-1">回数＼学年</th>
                    {grades.map((g, i) => (
                        <th key={i} className="border px-4 py-2">{g}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((schedule, rowIdx) => (
                    <tr key={rowIdx}>
                        <td className="border px-2 py-1 font-medium bg-gray-100">{schedule}</td>
                        {grades.map((grade, colIdx) => {
                            const isDisabled = rowIdx === 0 && grade !== '小学生'; // 入力不可判定
                            return (
                                <td key={colIdx} className="border px-2 py-1 text-center">
                                    <input
                                        type="text"
                                        value={isDisabled ? '-' : data[rowIdx][colIdx]} // 入力不可は'-'
                                        onChange={e =>
                                            handleChange(data, setData, rowIdx, colIdx, e.target.value)
                                        }
                                        className={`border w-[80px] px-1 py-0.5 text-center appearance-none ${isDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                                            }`}
                                        required={!isDisabled}
                                        disabled={isDisabled}
                                    />
                                </td>
                            );
                        })}
                    </tr>
                ))}

                {/* 追加1コマ行 */}
                <tr className="bg-yellow-50">
                    <td className="border px-2 py-1 font-medium text-orange-700">追加1コマ</td>
                    {grades.map((_, colIdx) => (
                        <td key={colIdx} className="border px-2 py-1 text-center">
                            <input
                                type="number"
                                value={data[rows.length]?.[colIdx] ?? ''}
                                onChange={e => {
                                    const updated = [...data];
                                    if (!updated[rows.length]) {
                                        updated.push(new Array(grades.length).fill(''));
                                    }
                                    updated[rows.length][colIdx] = e.target.value;
                                    setData(updated);
                                }}
                                className="border w-[80px] px-1 py-0.5 text-center appearance-none"
                            />
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    );

    return (
        <form onSubmit={handleSubmitTuition} className="space-y-6 overflow-x-auto">
            {/* Wコース */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold">料金登録</h2>
                    <button type="button" onClick={toggleWeek6} className="text-green-600 hover:text-green-800 border border-green-600 px-3 py-1 rounded">
                        {week6Added ? '週6行削除' : '週6行追加'}
                    </button>
                </div>
                <div className="mb-3">
                    <span className="mr-3 font-medium">Wコース授業時間（1行目は40分固定）:</span>
                    <label className="mr-4"><input type="radio" value="70" checked={durationW === '70'} onChange={() => setDurationW('70')} />70分</label>
                    <label><input type="radio" value="80" checked={durationW === '80'} onChange={() => setDurationW('80')} />80分</label>
                </div>
                {renderTable(schedulesW, tuitionDataW, setTuitionDataW)}
            </div>

            {/* Aコース */}
            <div>
                <div className="mb-3">
                    <span className="mr-3 font-medium">Aコース授業時間:</span>
                    <label className="mr-4"><input type="radio" value="70" checked={durationA === '70'} onChange={() => setDurationA('70')} />70分</label>
                    <label><input type="radio" value="80" checked={durationA === '80'} onChange={() => setDurationA('80')} />80分</label>
                </div>
                {renderTable(schedulesA, tuitionDataA, setTuitionDataA)}
            </div>

            {/* ✅ 個別クラス */}
            <div>
                <h3 className="text-xl font-bold mb-2 mt-6">個別クラス</h3>
                <table className="table-auto border border-collapse border-gray-400 rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-2 py-1">セット数</th>
                            <th className="border px-2 py-1">内容</th>
                            <th className="border px-4 py-2">中1 〜 中3</th>
                        </tr>
                    </thead>
                    <tbody>
                        {individualSets.map((set, idx) => (
                            <tr key={idx}>
                                <td className="border px-2 py-1 font-medium bg-gray-100">{set.name}</td>
                                <td className="border px-2 py-1 text-center">{set.description}</td>
                                <td className="border px-2 py-1 text-center">
                                    <input
                                        type="number"
                                        value={individualData[idx][0]}
                                        onChange={(e) => {
                                            const updated = [...individualData];
                                            updated[idx][0] = e.target.value;
                                            setIndividualData(updated);
                                        }}
                                        className="border w-[100px] px-1 py-0.5 text-center appearance-none"
                                        required
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                登録
            </button>
        </form>
    );
};

export default TuitionForm;

import React, { useEffect, useState } from 'react';
import { saveTuitionSettings } from './saveTuitionSettings';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface TuitionFormProps {
    yyyyMM: string;
    registrationLocation: string;
}

// 初期行・列
const initialSchedulesW = ['週1回（40分）', '週1回', '週2回', '週3回', '週4回', '週5回'];
const initialSchedulesA = ['週1回', '週2回', '週3回', '週4回', '週5回'];
const grades = ['小学生', '中1/中2', '中3', '高1/高2', '高3/既卒'];

// 学年コード→列インデックス
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

    // Firestore から取得
    useEffect(() => {
        const fetchData = async () => {
            if (!yyyyMM || !registrationLocation) return;

            const docId = `${yyyyMM}_${registrationLocation}`;
            const ref = doc(db, "FeeMaster", docId, "categories", "tuition");
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const data = snap.data();

                const wData = createEmptyData(schedulesW, grades);
                const aData = createEmptyData(schedulesA, grades);

                let detectedDurationW: '70' | '80' = '80';
                let detectedDurationA: '70' | '80' = '80';

                Object.entries(data).forEach(([key, value]) => {
                    const [classType, gradeCode, weekStr, durationStr] = key.split("_");
                    if (!classType || !gradeCode || !weekStr || !durationStr) return;

                    const colIdx = gradeMap[gradeCode];
                    if (colIdx === undefined) return;

                    const weekNum = weekStr.replace("W", "");
                    let rowIdx = -1;

                    if (classType === "W") {
                        if (weekNum === "1" && durationStr === "T40") {
                            rowIdx = 0; // 1行目固定
                        } else {
                            rowIdx = schedulesW.findIndex((s, idx) => idx > 0 && s.startsWith(`週${weekNum}回`));
                        }

                        // Wコースのラジオボタン判定（T70/T80）
                        if (durationStr === 'T70' || durationStr === 'T80') {
                            detectedDurationW = durationStr === 'T70' ? '70' : '80';
                        }

                    } else {
                        rowIdx = schedulesA.findIndex(s => s.startsWith(`週${weekNum}回`));

                        // Aコースのラジオボタン判定
                        if (durationStr === 'T70' || durationStr === 'T80') {
                            detectedDurationA = durationStr === 'T70' ? '70' : '80';
                        }
                    }

                    if (rowIdx >= 0) {
                        const amount = (value as any).amount ?? "";
                        if (classType === "W") wData[rowIdx][colIdx] = amount.toString();
                        else aData[rowIdx][colIdx] = amount.toString();
                    }
                });

                setTuitionDataW(wData);
                setTuitionDataA(aData);

                // Firestore の値に合わせてラジオボタンを初期チェック
                setDurationW(detectedDurationW);
                setDurationA(detectedDurationA);
            }
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
        try {
            await saveTuitionSettings({ registrationLocation, yyyyMM, tuitionDataW, tuitionDataA, schedulesW, schedulesA, durationW, durationA });
            alert('授業料データ保存完了');
        } catch (err) {
            console.error(err);
            alert('授業料データの保存に失敗しました');
        }
    };

    const renderTable = (rows: string[], data: string[][], setData: React.Dispatch<React.SetStateAction<string[][]>>) => (
        <table className="table-auto border border-collapse border-gray-400">
            <thead>
                <tr className="bg-gray-200">
                    <th className="border px-2 py-1">回数＼学年</th>
                    {grades.map((g, i) => <th key={i} className="border px-4 py-2">{g}</th>)}
                </tr>
            </thead>
            <tbody>
                {rows.map((schedule, rowIdx) => (
                    <tr key={rowIdx}>
                        <td className="border px-2 py-1 font-medium bg-gray-100">{schedule}</td>
                        {grades.map((_, colIdx) => (
                            <td key={colIdx} className="border px-2 py-1 text-center">
                                <input
                                    type="number"
                                    value={data[rowIdx][colIdx]}
                                    onChange={e => handleChange(data, setData, rowIdx, colIdx, e.target.value)}
                                    className="border w-[80px] px-1 py-0.5 text-center appearance-none"
                                    required
                                />
                            </td>
                        ))}
                    </tr>
                ))}
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

            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">登録</button>
        </form>
    );
};

export default TuitionForm;

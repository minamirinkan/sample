import React, { useState } from 'react';
import { grades } from './constants';
import { saveTuitionSettings } from './saveTuitionSettings';

interface TuitionFormProps {
    yyyyMM: string;
    registrationLocation: string;
}

const initialSchedulesW = ['週1回（40分）', '週1回', '週2回', '週3回', '週4回', '週5回'];
const initialSchedulesA = ['週1回', '週2回', '週3回', '週4回', '週5回'];

const createInitialData = (rows: string[], cols: readonly string[]): string[][] =>
    rows.map(() => new Array(cols.length).fill(''));

const TuitionForm: React.FC<TuitionFormProps> = ({ yyyyMM, registrationLocation }) => {
    const [schedulesW, setSchedulesW] = useState(initialSchedulesW);
    const [schedulesA, setSchedulesA] = useState(initialSchedulesA);
    const [tuitionDataW, setTuitionDataW] = useState(createInitialData(initialSchedulesW, grades));
    const [tuitionDataA, setTuitionDataA] = useState(createInitialData(initialSchedulesA, grades));
    const [week6Added, setWeek6Added] = useState(false);

    // 授業時間（ラジオボタン用）
    const [durationW, setDurationW] = useState<'70' | '80'>('80');
    const [durationA, setDurationA] = useState<'70' | '80'>('80');

    const handleChange = (
        data: string[][],
        setData: React.Dispatch<React.SetStateAction<string[][]>>,
        rowIdx: number,
        colIdx: number,
        value: string
    ) => {
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
            await saveTuitionSettings({
                registrationLocation,
                yyyyMM,
                tuitionDataW,
                tuitionDataA,
                schedulesW,
                schedulesA,
                durationW,
                durationA,
            });
            alert('授業料データ保存完了');
        } catch (error) {
            console.error(error);
            alert('授業料データの保存に失敗しました');
        }
    };

    return (
        <form onSubmit={handleSubmitTuition} className="space-y-6 overflow-x-auto">
            {/* ▼ Wコース */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold">料金登録</h2>
                    <button
                        type="button"
                        onClick={toggleWeek6}
                        className="text-green-600 hover:text-green-800 border border-green-600 px-3 py-1 rounded"
                    >
                        {week6Added ? '週6行削除' : '週6行追加'}
                    </button>
                </div>

                {/* ラジオボタン: Wコース残り行の授業時間 */}
                <div className="mb-3">
                    <span className="mr-3 font-medium">Wコース授業時間（1行目は40分固定）:</span>
                    <label className="mr-4">
                        <input
                            type="radio"
                            value="70"
                            checked={durationW === '70'}
                            onChange={() => setDurationW('70')}
                        />{' '}
                        70分
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="80"
                            checked={durationW === '80'}
                            onChange={() => setDurationW('80')}
                        />{' '}
                        80分
                    </label>
                </div>

                <table className="table-auto border border-collapse border-gray-400">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-2 py-1">回数＼学年</th>
                            {grades.map((grade, i) => (
                                <th key={i} className="border px-4 py-2">{grade}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {schedulesW.map((schedule, rowIdx) => (
                            <tr key={rowIdx}>
                                <td className="border px-2 py-1 font-medium bg-gray-100">{schedule}</td>
                                {grades.map((_, colIdx) => (
                                    <td key={colIdx} className="border px-2 py-1 text-center">
                                        <input
                                            type="number"
                                            value={tuitionDataW[rowIdx][colIdx]}
                                            onChange={(e) =>
                                                handleChange(tuitionDataW, setTuitionDataW, rowIdx, colIdx, e.target.value)
                                            }
                                            className="border w-[80px] px-1 py-0.5 text-center appearance-none"
                                            required
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ▼ Aコース */}
            <div>
                {/* ラジオボタン: Aコース授業時間 */}
                <div className="mb-3">
                    <span className="mr-3 font-medium">Aコース授業時間:</span>
                    <label className="mr-4">
                        <input
                            type="radio"
                            value="70"
                            checked={durationA === '70'}
                            onChange={() => setDurationA('70')}
                        />{' '}
                        70分
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="80"
                            checked={durationA === '80'}
                            onChange={() => setDurationA('80')}
                        />{' '}
                        80分
                    </label>
                </div>

                <table className="table-auto border border-collapse border-gray-400">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-2 py-1">回数＼学年</th>
                            {grades.map((grade, i) => (
                                <th key={i} className="border px-4 py-2">{grade}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {schedulesA.map((schedule, rowIdx) => (
                            <tr key={rowIdx}>
                                <td className="border px-2 py-1 font-medium bg-gray-100">{schedule}</td>
                                {grades.map((_, colIdx) => (
                                    <td key={colIdx} className="border px-2 py-1 text-center">
                                        <input
                                            type="number"
                                            value={tuitionDataA[rowIdx][colIdx]}
                                            onChange={(e) =>
                                                handleChange(tuitionDataA, setTuitionDataA, rowIdx, colIdx, e.target.value)
                                            }
                                            className="border w-[80px] px-1 py-0.5 text-center appearance-none"
                                            required
                                        />
                                    </td>
                                ))}
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

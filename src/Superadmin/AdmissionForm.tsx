import React, { useState, useEffect } from 'react';
import { saveTuitionSettings } from './saveTuitionSettings';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { db } from '../firebase';
import { doc, collection, getDoc } from 'firebase/firestore';

interface AdmissionFormProps {
    yyyyMM: string;
    registrationLocation: string;
}

interface AdmissionRow {
    code: string; // 自動付番
    item: string;
    amount: number | string;
}

const AdmissionForm: React.FC<AdmissionFormProps> = ({ yyyyMM, registrationLocation }) => {
    const [admissionRows, setAdmissionRows] = useState<AdmissionRow[]>([]);

    // Firestoreから読み込み
    useEffect(() => {
        const fetchData = async () => {
            const baseRef = doc(db, 'FeeMaster', `${yyyyMM}_${registrationLocation}`);
            const docRef = doc(collection(baseRef, 'categories'), 'admission');
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                const data = snapshot.data();
                const rows: AdmissionRow[] = Object.entries(data).map(([id, value]: any) => ({
                    code: id,
                    item: value.item,
                    amount: value.amount,
                }));
                rows.sort((a, b) => Number(a.code) - Number(b.code));
                setAdmissionRows(rows);
            } else {
                // デフォルト1行
                setAdmissionRows([{ code: '1001', item: '入会金', amount: '' }]);
            }
        };

        fetchData();
    }, [yyyyMM, registrationLocation]);

    const handleChange = (index: number, field: keyof AdmissionRow, value: string) => {
        const updated = [...admissionRows];
        if (field === 'amount') updated[index][field] = value === '' ? '' : Number(value);
        else updated[index][field] = value;
        setAdmissionRows(updated);
    };

    const addRow = () => {
        const nextCode = String(1000 + admissionRows.length + 1);
        setAdmissionRows([...admissionRows, { code: nextCode, item: '', amount: '' }]);
    };

    const removeRow = (index: number) => {
        const updated = admissionRows.filter((_, i) => i !== index);
        const renumbered = updated.map((r, i) => ({ ...r, code: String(1000 + i + 1) }));
        setAdmissionRows(renumbered);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saveTuitionSettings({
                registrationLocation,
                yyyyMM,
                tuitionDataW: [],
                tuitionDataA: [],
                maintenanceRows: [], // 維持費は空
                discountRows: [],
                penaltyRows: [],
                materialRows: [],
                testRows: [],
                material_onceRows: [],
                // 入会金を admissionRows として送る
                admissionRows: admissionRows.map(r => ({
                    id: r.code,
                    item: r.item,
                    amount: Number(r.amount),
                })),
                schedulesW: [],
                schedulesA: [],
            });
            alert('入会金データ保存完了');
        } catch (error) {
            console.error(error);
            alert('入会金データの保存に失敗しました');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">入会金登録</h2>
                <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-1 text-green-600 hover:text-green-800 px-3 py-1 border border-green-600 rounded"
                >
                    <FaPlus /> 行追加
                </button>
            </div>

            <table className="table-auto border border-gray-300 w-full">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border px-4 py-2 text-left">コード</th>
                        <th className="border px-4 py-2 text-left">項目</th>
                        <th className="border px-4 py-2 text-left">金額 (円)</th>
                        <th className="border px-4 py-2 text-center">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {admissionRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="border px-2 py-1 text-left font-mono">{row.code}</td>
                            <td className="border px-2 py-1">
                                <input
                                    type="text"
                                    value={row.item}
                                    onChange={e => handleChange(idx, 'item', e.target.value)}
                                    className="w-full border px-1 py-0.5"
                                    placeholder="入会金項目"
                                    required
                                />
                            </td>
                            <td className="border px-2 py-1">
                                <input
                                    type="number"
                                    value={row.amount}
                                    onChange={e => handleChange(idx, 'amount', e.target.value)}
                                    className="w-full border px-1 py-0.5 text-right"
                                    placeholder="0"
                                    required
                                />
                            </td>
                            <td className="border px-2 py-1 text-center">
                                <button
                                    type="button"
                                    onClick={() => removeRow(idx)}
                                    className="text-red-600 hover:text-red-800"
                                    title="行を削除"
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                登録
            </button>
        </form>
    );
};

export default AdmissionForm;

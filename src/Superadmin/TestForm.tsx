import React, { useState } from 'react';
import { saveTuitionSettings } from './saveTuitionSettings';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface TestFormProps {
    yyyyMM: string;
    registrationLocation: string;
}

interface TestFeeRow {
    item: string;
    amount: number | string;
}

const TestForm: React.FC<TestFormProps> = ({ yyyyMM, registrationLocation }) => {
    const [testRows, setTestRows] = useState<TestFeeRow[]>([
        { item: '小学生', amount: '' },
        { item: '中学生', amount: '' },
    ]);

    const handleChange = (index: number, field: keyof TestFeeRow, value: string) => {
        const updated = [...testRows];
        if (field === 'amount') {
            updated[index][field] = value === '' ? '' : Number(value);
        } else {
            updated[index][field] = value;
        }
        setTestRows(updated);
    };

    const addRow = () => {
        setTestRows([...testRows, { item: '', amount: '' }]);
    };

    const removeRow = (index: number) => {
        setTestRows(testRows.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saveTuitionSettings({
                registrationLocation,
                yyyyMM,
                tuitionDataW: [],
                tuitionDataA: [],
                testRows: testRows.map(r => ({
                    id: r.item || crypto.randomUUID(),
                    item: r.item,
                    amount: Number(r.amount),
                })),
                schedulesW: [],
                schedulesA: [],
            });

            alert('テスト料金データ保存完了');
        } catch (error) {
            console.error(error);
            alert('テスト料金データの保存に失敗しました');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">テスト料金登録</h2>
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
                        <th className="border px-4 py-2 text-left">学年</th>
                        <th className="border px-4 py-2 text-left">料金 (円)</th>
                        <th className="border px-4 py-2 text-center">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {testRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="border px-2 py-1">
                                <input
                                    type="text"
                                    value={row.item}
                                    onChange={e => handleChange(idx, 'item', e.target.value)}
                                    className="w-full border px-1 py-0.5"
                                    placeholder="学年"
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

export default TestForm;

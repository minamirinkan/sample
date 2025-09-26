import React, { useState } from 'react';
import { saveTuitionSettings } from './saveTuitionSettings';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface MaterialOnceFormProps {
    yyyyMM: string;
    registrationLocation: string;
}

interface Material_onceRow {
    item: string;
    amount: number | string;
}

const MaterialOnceForm: React.FC<MaterialOnceFormProps> = ({ yyyyMM, registrationLocation }) => {
    const [material_onceRows, setmaterial_onceRows] = useState<Material_onceRow[]>([
        { item: '', amount: '' },
    ]);

    const handleChange = (index: number, field: keyof Material_onceRow, value: string) => {
        const updated = [...material_onceRows];
        if (field === 'amount') {
            updated[index][field] = value === '' ? '' : Number(value);
        } else {
            updated[index][field] = value;
        }
        setmaterial_onceRows(updated);
    };

    const addRow = () => {
        setmaterial_onceRows([...material_onceRows, { item: '', amount: '' }]);
    };

    const removeRow = (index: number) => {
        setmaterial_onceRows(material_onceRows.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saveTuitionSettings({
                registrationLocation,
                yyyyMM,
                tuitionDataW: [],
                tuitionDataA: [],
                schedulesW: [],
                schedulesA: [],
                material_onceRows: material_onceRows.map(r => ({
                    id: r.item || crypto.randomUUID(),
                    item: r.item,
                    amount: Number(r.amount),
                })),
            });
            alert('保存完了');
        } catch (error) {
            console.error(error);
            alert('保存に失敗しました');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">教材費(都度)登録</h2>
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
                        <th className="border px-4 py-2 text-left">項目</th>
                        <th className="border px-4 py-2 text-left">金額 (円)</th>
                        <th className="border px-4 py-2 text-center">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {material_onceRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="border px-2 py-1">
                                <input
                                    type="text"
                                    value={row.item}
                                    onChange={e => handleChange(idx, 'item', e.target.value)}
                                    className="w-full border px-1 py-0.5"
                                    placeholder="項目"
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

export default MaterialOnceForm;

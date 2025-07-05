import React from 'react';

const CourseInfoSection = ({ formData, onChange }) => {
    const handleChange = (index, updatedFields) => {
        const newData = [...formData];
        newData[index] = { ...newData[index], ...updatedFields };
        onChange(newData);
    };

    const handleAddRow = () => {
        onChange([...formData, { selected: false, classType: '', times: '', duration: '', startYear: '', startMonth: '', endYear: '', endMonth: '', note: '' }]);
    };

    const handleRemoveRow = (index) => {
        const newData = formData.filter((_, i) => i !== index);
        onChange(newData);
    };

    const timesOptions = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = [2025, 2026, 2027];
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const classTypes = ['1名クラス', '2名クラス', '演習クラス'];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">受講情報</h3>
            <div className="overflow-x-auto">
                <table className="min-w-[1100px] table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-sm text-left">
                            <th className="border px-4 py-2 w-[100px] text-center">授業種別</th>{/* avoid whitespace */}
                            <th className="border px-4 py-2 w-[170px] text-center">授業形態</th>{/* avoid whitespace */}
                            <th className="border px-4 py-2 w-[110px] text-center">週回数</th>{/* avoid whitespace */}
                            <th className="border px-4 py-2 w-[120px] text-center">科目</th>{/* avoid whitespace */}
                            <th className="border px-4 py-2 w-[130px] text-center">授業時間</th>{/* avoid whitespace */}
                            <th className="border px-4 py-2 w-[160px] text-center">受講開始</th>{/* avoid whitespace */}
                            <th className="border px-4 py-2 w-[160px] text-center">受講終了</th>{/* avoid whitespace */}
                            <th className="border px-4 py-2 w-[150px]">備考</th>{/* avoid whitespace */}
                            <th className="border px-4 py-2 w-[80px] text-center">操作</th>{/* avoid whitespace */}
                        </tr>
                    </thead>
                    <tbody>
                        {formData.map((data, index) => (
                            <tr key={index} className="text-sm">
                                <td className="border px-4 py-2 text-center">通常</td>
                                <td className="border px-4 py-2 text-center">
                                    <select
                                        value={data.classType || ''}
                                        onChange={(e) => handleChange(index, { classType: e.target.value })}
                                        className="w-full border rounded px-2 py-1"
                                    >
                                        <option value="">選択</option>
                                        {classTypes.map((type, i) => (
                                            <option key={i} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="border px-4 py-2 text-center">
                                    <select
                                        value={data.times || ''}
                                        onChange={(e) => handleChange(index, { times: e.target.value })}
                                        className="w-full border rounded px-2 py-1"
                                    >
                                        <option value="">選択</option>
                                        {timesOptions.map((num) => (
                                            <option key={num} value={num}>{num}回</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="border px-4 py-2 text-center">
                                    <input
                                        type="text"
                                        value={data.subject || ''}
                                        onChange={(e) => handleChange(index, { subject: e.target.value })}
                                        className="w-full border rounded px-2 py-1"
                                        placeholder="科目を入力"
                                    />
                                </td>
                                <td className="border px-4 py-2 text-center">
                                    <select
                                        value={data.duration || ''}
                                        onChange={(e) => handleChange(index, { duration: e.target.value })}
                                        className="w-full border rounded px-2 py-1"
                                    >
                                        <option value="">選択</option>
                                        <option value="80分">80分</option>
                                        <option value="70分">70分</option>
                                        <option value="40分">40分</option>
                                    </select>
                                </td>
                                <td className="border px-4 py-2 text-center">
                                    <div className="flex gap-2">
                                        <select
                                            value={data.startYear || ''}
                                            onChange={(e) => handleChange(index, { startYear: e.target.value })}
                                            className="border rounded px-2 py-1"
                                        >
                                            <option value="">年</option>
                                            {years.map((y) => (
                                                <option key={y} value={y}>{y}年</option>
                                            ))}
                                        </select>
                                        <select
                                            value={data.startMonth || ''}
                                            onChange={(e) => handleChange(index, { startMonth: e.target.value })}
                                            className="border rounded px-2 py-1"
                                        >
                                            <option value="">月</option>
                                            {months.map((m) => (
                                                <option key={m} value={m}>{m}月</option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                                <td className="border px-4 py-2 text-center">
                                    <div className="flex gap-2">
                                        <select
                                            value={data.endYear || ''}
                                            onChange={(e) => handleChange(index, { endYear: e.target.value })}
                                            className="border rounded px-2 py-1"
                                        >
                                            <option value="">年</option>
                                            {years.map((y) => (
                                                <option key={y} value={y}>{y}年</option>
                                            ))}
                                        </select>
                                        <select
                                            value={data.endMonth || ''}
                                            onChange={(e) => handleChange(index, { endMonth: e.target.value })}
                                            className="border rounded px-2 py-1"
                                        >
                                            <option value="">月</option>
                                            {months.map((m) => (
                                                <option key={m} value={m}>{m}月</option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                                <td className="border px-4 py-2 text-center">
                                    <input
                                        type="text"
                                        value={data.note || ''}
                                        onChange={(e) => handleChange(index, { note: e.target.value })}
                                        className="w-full border rounded px-2 py-1"
                                        placeholder="備考を入力"
                                    />
                                </td>
                                <td className="border px-4 py-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRow(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        削除
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-2">
                <button
                    type="button"
                    onClick={handleAddRow}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    行を追加
                </button>
            </div>
        </div>
    );
};

export default CourseInfoSection;
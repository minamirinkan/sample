const CourseInfoSection = ({ formData, onChange, lessonType }) => {
    const handleChange = (index, updatedFields) => {
        const newData = [...formData];
        newData[index] = { ...newData[index], ...updatedFields };
        onChange(newData);
    };

    const createEmptyRow = (kind = '') => ({
        kind,
        classType: '',
        times: '',
        subject: '',
        duration: '',
        startYear: '',
        startMonth: '',
        endYear: '',
        endMonth: '',
        note: '',
    });

    const handleAddRow = () => {
        onChange([...formData, createEmptyRow('通常')]);
    };

    const handleAddRowWithKind = (kind) => {
        onChange([...formData, createEmptyRow(kind)]);
    };

    const handleRemoveRow = (index) => {
        const newData = formData.filter((_, i) => i !== index);
        onChange(newData);
    };

    const classTypes = ['1名クラス', '2名クラス', '演習クラス'];
    const timesOptions = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = [2025, 2026, 2027];
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">受講情報</h3>

            {lessonType ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-[1100px] table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-sm text-left">
                                    <th className="border px-4 py-2 w-[200px] text-center">授業種別</th>
                                    <th className="border px-4 py-2 w-[200px] text-center">授業形態</th>
                                    <th className="border px-4 py-2 w-[140px] text-center">週回数</th>
                                    <th className="border px-4 py-2 w-[120px] text-center">科目</th>
                                    <th className="border px-4 py-2 w-[150px] text-center">授業時間</th>
                                    <th className="border px-4 py-2 w-[160px] text-center">受講開始</th>
                                    <th className="border px-4 py-2 w-[160px] text-center">受講終了</th>
                                    <th className="border px-4 py-2 w-[150px]">備考</th>
                                    <th className="border px-4 py-2 w-[80px] text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.map((data, index) => (
                                    <tr key={index} className="text-sm">
                                        {/* 授業種別（レギュラーなら固定表示） */}
                                        <td className="border px-4 py-2 text-center">
                                            <span>{data.kind}</span>
                                        </td>

                                        {/* 授業形態 */}
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

                                        {/* 週回数 */}
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

                                        {/* 科目 */}
                                        <td className="border px-4 py-2 text-center">
                                            <input
                                                type="text"
                                                value={data.subject || ''}
                                                onChange={(e) => handleChange(index, { subject: e.target.value })}
                                                className="w-full border rounded px-2 py-1"
                                                placeholder="科目"
                                            />
                                        </td>

                                        {/* 授業時間 */}
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

                                        {/* 受講開始 */}
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

                                        {/* 受講終了 */}
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

                                        {/* 備考 */}
                                        <td className="border px-4 py-2 text-center">
                                            <input
                                                type="text"
                                                value={data.note || ''}
                                                onChange={(e) => handleChange(index, { note: e.target.value })}
                                                className="w-full border rounded px-2 py-1"
                                                placeholder="備考"
                                            />
                                        </td>

                                        {/* 削除ボタン */}
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
                    {/* ボタンUI */}
                    {lessonType === 'regular' ? (
                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                            >
                                行を追加
                            </button>
                        </div>
                    ) : (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {['補習', '春期講習', '夏期講習', '冬期講習'].map((kind) => (
                                <button
                                    key={kind}
                                    type="button"
                                    onClick={() => handleAddRowWithKind(kind)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                                >
                                    {kind}を追加
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <p className="text-gray-500">※ 上の授業形態を選択してください。</p>
            )}
        </div>
    );
};

export default CourseInfoSection;
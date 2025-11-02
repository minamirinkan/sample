import React, { useEffect } from 'react';
import { SchoolDataItem } from '../../../../contexts/types/schoolData';

interface CourseInfoSectionProps {
    formData: SchoolDataItem[];
    onChange: (newData: SchoolDataItem[]) => void;
    lessonType: 'regular' | 'nonRegular';
    setLessonType: React.Dispatch<React.SetStateAction<'regular' | 'nonRegular'>>;
}

const REGULAR_INITIAL_ROWS = [
    { kind: '通常', classType: '1名クラス' },
    { kind: '通常', classType: '2名クラス' },
    { kind: '通常', classType: '個別クラス' },
];

const NON_REGULAR_INITIAL_ROWS = [
    { kind: '補習', classType: '1名クラス' },
    { kind: '補習', classType: '2名クラス' },
    { kind: '補習', classType: '個別クラス' },
    { kind: '講習', classType: '1名クラス' },
    { kind: '講習', classType: '2名クラス' },
    { kind: '講習', classType: '個別クラス' },
];

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({
    formData,
    onChange,
    lessonType,
    setLessonType,
}) => {
    const [seasonSelected, setSeasonSelected] = React.useState<string | null>(null);
    const TIMES_OPTIONS = ['1', '2', '3', '4', '5', '6'];
    const years = [2025, 2026, 2027];
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // 初期行セット
    useEffect(() => {
        const initialRows: SchoolDataItem[] =
            lessonType === 'regular'
                ? REGULAR_INITIAL_ROWS.map((row) => ({
                    kind: row.kind,
                    classType: row.classType,
                    times: '',
                    duration: '',
                    startYear: '',
                    startMonth: '',
                    endYear: '',
                    endMonth: '',
                    note: '',
                    selected: false,
                }))
                : NON_REGULAR_INITIAL_ROWS.map((row) => ({
                    kind: row.kind,
                    classType: row.classType,
                    duration: '',
                    startYear: '',
                    startMonth: '',
                    endYear: '',
                    endMonth: '',
                    note: '',
                    selected: false,
                }));
        onChange(initialRows);
    }, [lessonType, onChange]);

    const handleChange = (index: number, updatedFields: Partial<SchoolDataItem>) => {
        const newData = [...formData];
        newData[index] = { ...newData[index], ...updatedFields };
        onChange(newData);
    };

    const handleCheckboxChange = (index: number, checked: boolean) => {
        const updated = [...formData];
        if (!checked) {
            if (!window.confirm('この行の入力内容をリセットします。よろしいですか？')) return;
            updated[index] = {
                ...updated[index],
                times: '',
                duration: '',
                startYear: '',
                startMonth: '',
                endYear: '',
                endMonth: '',
                note: '',
                selected: false,
            };
        } else {
            updated[index].selected = true;
        }
        onChange(updated);
    };

    // 講習ボタンを押したときに 4〜6行目の kind を変更
    const handleSeasonClick = (season: string) => {
        const newData = formData.map((row, index) => {
            if (lessonType === 'nonRegular' && index >= 3 && index <= 5) {
                return { ...row, kind: season };
            }
            return row;
        });
        onChange(newData);
        setSeasonSelected(season); // ここで押したことを記録
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">受講情報</h3>
                {lessonType === 'nonRegular' && (
                    <div className="flex gap-2">
                        {['春季講習', '夏季講習', '冬季講習'].map((season) => (
                            <button
                                key={season}
                                type="button"
                                className="px-3 py-1 border rounded bg-gray-100 hover:bg-blue-100"
                                onClick={() => handleSeasonClick(season)}
                            >
                                {season}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-[1000px] table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-sm text-left">
                            <th className="border px-2 py-2 w-[60px] text-center whitespace-nowrap">選択</th>
                            <th className="border px-2 py-2 w-[120px] text-center whitespace-nowrap">授業種別</th>
                            <th className="border px-2 py-2 w-[120px] text-center whitespace-nowrap">授業形態</th>
                            {lessonType === 'regular' && <th className="border px-2 py-2 w-[100px] text-center whitespace-nowrap">授業週回数</th>}
                            <th className="border px-2 py-2 w-[100px] text-center whitespace-nowrap">授業時間</th>
                            <th className="border px-2 py-2 w-[140px] text-center whitespace-nowrap">受講開始</th>
                            <th className="border px-2 py-2 w-[140px] text-center whitespace-nowrap">受講終了</th>
                            <th className="border px-2 py-2 w-[200px] text-center whitespace-nowrap">備考</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.map((data, index) => (
                            <tr key={index} className="text-sm">
                                <td className="border px-2 py-2 text-center whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={data.selected}
                                        onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                                        disabled={lessonType === 'nonRegular' && index >= 3 && index <= 5 && !seasonSelected}
                                    />
                                </td>
                                <td className="border px-2 py-2 text-center whitespace-nowrap">{data.kind}</td>
                                <td className="border px-2 py-2 text-center whitespace-nowrap">{data.classType}</td>

                                {lessonType === 'regular' && (
                                    <td className="border px-2 py-2 text-center whitespace-nowrap">
                                        <select
                                            value={data.times}
                                            onChange={(e) => handleChange(index, { times: e.target.value })}
                                            disabled={!data.selected}
                                            className={`border rounded px-1 py-1 text-center ${data.selected
                                                ? 'bg-white text-gray-900'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <option value="">--</option>
                                            {TIMES_OPTIONS.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>回
                                    </td>
                                )}

                                <td className="border px-2 py-2 text-center whitespace-nowrap">
                                    <select
                                        value={data.duration}
                                        onChange={(e) => handleChange(index, { duration: e.target.value })}
                                        disabled={!data.selected}
                                        className={`border rounded px-1 py-1 text-center ${data.selected
                                            ? 'bg-white text-gray-900'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <option value="">選択</option>
                                        <option value="80">80</option>
                                        <option value="70">70</option>
                                        <option value="40">40</option>
                                    </select> 分
                                </td>

                                <td className="border px-2 py-2 text-center whitespace-nowrap">
                                    <select
                                        value={data.startYear}
                                        onChange={(e) => handleChange(index, { startYear: e.target.value })}
                                        disabled={!data.selected}
                                        className={`border rounded px-1 py-1 text-center ${data.selected
                                            ? 'bg-white text-gray-900'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <option value="">年</option>
                                        {years.map((y) => (
                                            <option key={y} value={y}>{y}年</option>
                                        ))}
                                    </select>
                                    <select
                                        value={data.startMonth}
                                        onChange={(e) => handleChange(index, { startMonth: e.target.value })}
                                        disabled={!data.selected}
                                        className={`border rounded px-1 py-1 text-center ${data.selected
                                            ? 'bg-white text-gray-900'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <option value="">月</option>
                                        {months.map((m) => (
                                            <option key={m} value={m}>{m}月</option>
                                        ))}
                                    </select>
                                </td>

                                <td className="border px-2 py-2 text-center whitespace-nowrap">
                                    <select
                                        value={data.endYear}
                                        onChange={(e) => handleChange(index, { endYear: e.target.value })}
                                        disabled={!data.selected}
                                        className={`border rounded px-1 py-1 text-center ${data.selected
                                            ? 'bg-white text-gray-900'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <option value="">年</option>
                                        {years.map((y) => (
                                            <option key={y} value={y}>{y}年</option>
                                        ))}
                                    </select>
                                    <select
                                        value={data.endMonth}
                                        onChange={(e) => handleChange(index, { endMonth: e.target.value })}
                                        disabled={!data.selected}
                                        className={`border rounded px-1 py-1 text-center ${data.selected
                                            ? 'bg-white text-gray-900'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <option value="">月</option>
                                        {months.map((m) => (
                                            <option key={m} value={m}>{m}月</option>
                                        ))}
                                    </select>
                                </td>

                                <td className="border px-2 py-2 text-center whitespace-nowrap">
                                    <input
                                        type="text"
                                        value={data.note}
                                        onChange={(e) => handleChange(index, { note: e.target.value })}
                                        disabled={!data.selected}
                                        className={`border rounded px-1 py-1 text-center ${data.selected
                                            ? 'bg-white text-gray-900'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CourseInfoSection;

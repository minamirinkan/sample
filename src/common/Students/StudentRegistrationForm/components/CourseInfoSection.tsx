import React from 'react';
import SUBJECT_OPTIONS from '../subjectOptions';
import { SchoolDataItem } from '../../../../contexts/types/schoolData'; // 実際の型定義のパスに合わせて
import { SchoolLevel } from '../../../../contexts/types/schoolData';
interface CourseInfoSectionProps {
    formData: SchoolDataItem[];
    onChange: (newData: SchoolDataItem[]) => void;
    lessonType: string;
    schoolLevel: string | undefined;
    setLessonType: React.Dispatch<React.SetStateAction<'regular' | 'nonRegular'>>;
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({
    formData = [],
    onChange,
    lessonType,
    schoolLevel,
    setLessonType,
}) => {
    const subjects =
        schoolLevel && SUBJECT_OPTIONS[schoolLevel as SchoolLevel]
            ? [...SUBJECT_OPTIONS[schoolLevel as SchoolLevel], 'その他']
            : [];


    console.log('schoolLevel:', schoolLevel);
    console.log('subjects:', subjects);


    const handleChange = (index: number, updatedFields: Partial<SchoolDataItem>) => {
        const newData = [...formData];
        newData[index] = { ...newData[index], ...updatedFields };
        onChange(newData);
    };

    const createEmptyRow = (kind = ''): SchoolDataItem => ({
        kind,
        classType: '',
        times: '',
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

    const handleAddRowWithKind = (kind: string) => {
        console.log('追加する kind:', kind);
        const newRow = createEmptyRow(kind);
        console.log('追加される新規行:', newRow);
        onChange([...formData, newRow]);
    };

    const handleRemoveRow = (index: number) => {
        const newData = formData.filter((_, i) => i !== index);
        onChange(newData);
    };

    const classTypes = ['1名クラス', '2名クラス', '演習クラス'];
    const TIMES_OPTIONS = ['1', '2', '3', '4', '5', '6'];
    const years = [2025, 2026, 2027];
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">受講情報</h3>
            {lessonType ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-[2000px] table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-sm text-left">
                                    <th className="border px-4 py-2 w-[100px] text-center whitespace-nowrap">授業種別</th>
                                    <th className="border px-4 py-2 w-[100px] text-center whitespace-nowrap">授業形態</th>
                                    {lessonType === 'regular' ? (
                                        <th className="border px-4 py-2 w-[50px] text-center whitespace-nowrap">授業週回数</th>
                                    ) : (
                                        <th className="border px-4 py-2 w-[120px] text-center whitespace-nowrap">授業回数</th>
                                    )}
                                    <th className="border px-4 py-2 w-[50px] text-center whitespace-nowrap">授業時間</th>
                                    <th className="border px-4 py-2 w-[50px] text-center whitespace-nowrap">受講開始</th>
                                    <th className="border px-4 py-2 w-[50px] text-center whitespace-nowrap">受講終了</th>
                                    <th className="border px-4 py-2 w-[150px]">備考</th>
                                    <th className="border px-4 py-2 w-[80px] text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(formData || []).map((data, index) => (
                                    <tr key={index} className="text-sm">
                                        <td className="border px-4 py-2 text-center whitespace-nowrap text-ellipsis">
                                            <span>{data.kind}</span>
                                        </td>
                                        <td className="border px-1 py-2 min-w-[140px] text-center whitespace-nowrap text-ellipsis">
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
                                        <td className="border px-4 py-2 min-w-[70px] text-center whitespace-nowrap text-ellipsis">
                                            週 <select
                                                value={data.times || ''}
                                                onChange={(e) => handleChange(index, { times: e.target.value })}
                                                className="border rounded px-0.5 py-1 text-center"
                                            >
                                                <option value="">--</option>
                                                        {TIMES_OPTIONS.map((times) => (
                                                            <option key={times} value={times}>{times}</option>
                                                        ))}
                                            </select> 回
                                        </td>
                                        <td className="border px-2 py-2 min-w-[50px] text-center whitespace-nowrap text-ellipsis">
                                            <select
                                                value={data.duration || ''}
                                                onChange={(e) => handleChange(index, { duration: e.target.value })}
                                                className="border rounded px-3 py-1 text-center"
                                            >
                                                <option value="">選択</option>
                                                <option value="80">80</option>
                                                <option value="70">70</option>
                                                <option value="40">40</option>
                                            </select> 分
                                        </td>
                                        <td className="border px-4 py-2 text-center whitespace-nowrap text-ellipsis">
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
                                        <td className="border px-4 py-2 text-center whitespace-nowrap text-ellipsis">
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
                                        <td className="border px-4 py-2 min-w-[100px] text-center whitespace-nowrap text-ellipsis">
                                            <input
                                                type="text"
                                                value={data.note || ''}
                                                onChange={(e) => handleChange(index, { note: e.target.value })}
                                                className="w-full border rounded px-2 py-1"
                                                placeholder="備考"
                                            />
                                        </td>
                                        <td className="border px-4 py-2 text-center whitespace-nowrap text-ellipsis">
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
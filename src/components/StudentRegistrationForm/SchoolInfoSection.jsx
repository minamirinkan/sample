import React from 'react';
import { useEffect } from 'react';

const SchoolInfoSection = ({ schoolData, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ [field]: value }); // ← 全体ではなく1項目だけ返す
    };

    const schoolingStatuses = ['未就学児', '在学生', '既卒生'];
    const schoolTypes = ['国立', '公立', '私立', '通信制'];
    const schoolLevels = ['小学校', '中学校', '高等学校'];
    const schoolGrades = [
        '小1', '小2', '小3', '小4', '小5', '小6',
        '中1', '中2', '中3',
        '高1', '高2', '高3'
    ];

    const isUnenrolled = schoolData.schoolingStatus === '未就学児';
    const isGraduated = schoolData.schoolingStatus === '既卒生';
    const disableAllExceptGrade = isUnenrolled || isGraduated;

    useEffect(() => {
        if (schoolData.schoolingStatus === '既卒生') {
            onChange({ grade: '既卒' }); // ← ここもトップレベルgrade
        }
    }, [schoolData.schoolingStatus, onChange]);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">学校情報</h3>

            {/* 就学状況 */}
            <div>
                <label className="block font-medium mb-1">就学状況</label>
                <div className="flex gap-4">
                    {schoolingStatuses.map((status) => (
                        <label key={status} className="flex items-center gap-1">
                            <input
                                type="radio"
                                name="schoolingStatus"
                                value={status}
                                checked={schoolData.schoolingStatus === status}
                                onChange={() => handleChange('schoolingStatus', status)}
                            />
                            {status}
                        </label>
                    ))}
                </div>
            </div>

            {/* 学校区分 */}
            <div>
                <label className="block font-medium mb-1">学校区分</label>
                <select
                    value={schoolData.schoolType || ''}
                    onChange={(e) => handleChange('schoolType', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    disabled={disableAllExceptGrade}
                >
                    <option value="">選択してください</option>
                    {schoolTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            {/* 学校種 */}
            <div>
                <label className="block font-medium mb-1">学校種</label>
                <div className="flex gap-4">
                    {schoolLevels.map((level) => (
                        <label key={level} className="flex items-center gap-1">
                            <input
                                type="radio"
                                name="schoolLevel"
                                value={level}
                                checked={schoolData.schoolLevel === level}
                                onChange={() => handleChange('schoolLevel', level)}
                                disabled={disableAllExceptGrade}
                            />
                            {level}
                        </label>
                    ))}
                </div>
            </div>

            {/* 学校名 */}
            <div>
                <label className="block font-medium mb-1">学校名</label>
                <input
                    type="text"
                    value={schoolData.schoolName || ''}
                    onChange={(e) => handleChange('schoolName', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    placeholder="○○中学校"
                    disabled={disableAllExceptGrade}
                />
            </div>

            {/* 学校名ふりがな */}
            <div>
                <label className="block font-medium mb-1">学校名（フリガナ）</label>
                <input
                    type="text"
                    value={schoolData.schoolKana || ''}
                    onChange={(e) => handleChange('schoolKana', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    placeholder="○○チュウガッコウ"
                    disabled={disableAllExceptGrade}
                />
            </div>

            {/* 学年 */}
            <div>
                <label className="block font-medium mb-1">学年</label>
                <select
                    value={schoolData.grade || ''}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    disabled={isUnenrolled}
                >
                    <option value="">選択してください</option>
                    {schoolGrades.map((grade) => (
                        <option key={grade} value={grade}>
                            {grade}
                        </option>
                    ))}
                    {isGraduated && <option value="既卒">既卒</option>}
                </select>
            </div>
        </div>
    );
};

export default SchoolInfoSection;

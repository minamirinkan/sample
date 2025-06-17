import React from 'react';

const genders = ['男性', '女性', 'その他'];
const BasicInfoSection = ({ formData, onChange }) => {
    return (
        <>
            <div>
                <label className="block text-sm font-medium">講師コード</label>
                <input
                    type="text"
                    value={formData.code}
                    disabled
                    className="mt-1 w-full border rounded p-2 bg-gray-100 text-gray-700"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">姓</label>
                    <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => onChange('lastName', e.target.value)}
                        className="mt-1 w-full border rounded p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">名</label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => onChange('firstName', e.target.value)}
                        className="mt-1 w-full border rounded p-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">フリガナ（姓）</label>
                    <input
                        type="text"
                        value={formData.kanalastname}
                        onChange={(e) => onChange('kanalastName', e.target.value)}
                        className="mt-1 w-full border rounded p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">フリガナ（名）</label>
                    <input
                        type="text"
                        value={formData.kanafirstname}
                        onChange={(e) => onChange('kanafirstName', e.target.value)}
                        className="mt-1 w-full border rounded p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">性別</label>
                    <select value={formData.gender} onChange={(e) => onChange('gender', e.target.value)} className="border rounded p-2">
                    <option value="">性別を選択</option>
                    {genders.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                </div>
            </div>
        </>
    );
};

export default BasicInfoSection;

import React from 'react';

const EmploymentInfoSection = ({ formData, onChange }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium">雇用日</label>
                <input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => onChange('hireDate', e.target.value)}
                    className="mt-1 w-full border rounded p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium">状況</label>
                <select
                    value={formData.status}
                    onChange={(e) => onChange('status', e.target.value)}
                    className="mt-1 w-full border rounded p-2"
                >
                    <option value="在職中">在職中</option>
                    <option value="退職済">退職済</option>
                </select>
            </div>

            {/* ✅ 交通費（追加） */}
            <div className="mb-4">
                <label className="block mb-1">交通費</label>
                <input
                    type="text"
                    value={formData.transportation || ''}
                    onChange={(e) => onChange('transportation', e.target.value)}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="例：800"
                />
            </div>
        </div>
    );
};

export default EmploymentInfoSection;

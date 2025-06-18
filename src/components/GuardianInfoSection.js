// src/components/GuardianInfoSection.js
import React from 'react';
import InfoRow from './InfoRow';

const GuardianInfoSection = ({ formData, isEditing, onChange }) => (
    <div className="space-y-4 w-1/2 pl-6">
        {/* 保護者情報 */}
        <div className="bg-purple-50 p-3 rounded-md border border-purple-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-purple-700">保護者情報</h2>
            <InfoRow label="保護者氏名" value={formData.guardianName} name="guardianName" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="保護者氏名カナ" value={formData.guardianNameKana} name="guardianNameKana" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="続柄" value={formData.relationship} name="relationship" isEditing={isEditing} onChange={onChange} />
        </div>

        {/* 連絡先 */}
        <div className="bg-pink-50 p-3 rounded-md border border-pink-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-pink-700">連絡先</h2>
            <InfoRow label="電話番号" value={formData.guardianPhone} name="guardianPhone" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="メールアドレス" value={formData.guardianEmail} name="guardianEmail" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="緊急連絡先" value={formData.emergencyContact} name="emergencyContact" isEditing={isEditing} onChange={onChange} />
        </div>

        {/* 備考欄 */}
        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-yellow-700">備考欄</h2>
            <InfoRow label="備考" value={formData.guardianNote} name="guardianNote" isEditing={isEditing} onChange={onChange} />
        </div>
    </div>
);

export default GuardianInfoSection;

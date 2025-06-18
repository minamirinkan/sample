// src/components/GuardianInfoSection.js
import React from 'react';
import InfoRow from './InfoRow';

const GuardianInfoSection = ({ formData, isEditing, onChange }) => (
    <div className="space-y-4 w-1/2 pl-6">
        {/* 保護者情報 */}
        <div className="p-3 rounded-md border border-gray-300 border-t-4 border-t-blue-500 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 text-blue-600">
                保護者情報
            </h2>
            <InfoRow label="保護者氏名" value={formData.guardianName} name="guardianName" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="保護者氏名カナ" value={formData.guardianNameKana} name="guardianNameKana" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="続柄" value={formData.relationship} name="relationship" isEditing={isEditing} onChange={onChange} />
        </div>

        {/* 連絡先 */}
        <div className="p-3 rounded-md border border-gray-300 border-t-4 border-t-blue-500 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 text-blue-600">
                連絡先
            </h2>
            <InfoRow label="電話番号" value={formData.guardianPhone} name="guardianPhone" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="メールアドレス" value={formData.guardianEmail} name="guardianEmail" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="緊急連絡先" value={formData.emergencyContact} name="emergencyContact" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="住所" value={formData.address} name="address" isEditing={isEditing} onChange={onChange} />
        </div>

        {/* 備考欄 */}
        <div className="p-3 rounded-md border border-gray-300 border-t-4 border-t-blue-500 shadow-sm">
            <h2 className="text-lg font-semibold mb-3 text-blue-600">
                備考
            </h2>
            {!isEditing ? (
                <p className="min-h-[100px] whitespace-pre-wrap text-gray-800 p-2 border rounded bg-white">
                    {formData.notes || '－'}
                </p>
            ) : (
                <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={onChange}
                    rows={5}
                    className="w-full p-2 border rounded bg-white text-gray-800"
                    placeholder="備考を入力してください"
                />
            )}
        </div>

    </div>
);

export default GuardianInfoSection;

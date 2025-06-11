// src/components/StudentRegistrationForm/GuardianInfosection.jsx
const GuardianInfosection = ({ formData, onChange }) => (
    <fieldset>
        <legend className="font-semibold mb-2">保護者情報</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="保護者氏名" value={formData.guardianName} onChange={(e) => onChange('guardianName', e.target.value)} className="border rounded p-2" />
            <input type="text" placeholder="保護者氏名（ふりがな）" value={formData.guardianNameKana} onChange={(e) => onChange('guardianNameKana', e.target.value)} className="border rounded p-2" />
            <input type="text" placeholder="続柄" value={formData.relationship} onChange={(e) => onChange('relationship', e.target.value)} className="border rounded p-2" />
            <input type="tel" placeholder="保護者電話番号" value={formData.guardianPhone} onChange={(e) => onChange('guardianPhone', e.target.value)} className="border rounded p-2" />
            <input type="email" placeholder="保護者メールアドレス" value={formData.guardianEmail} onChange={(e) => onChange('guardianEmail', e.target.value)} className="border rounded p-2" />
            <input type="text" placeholder="緊急連絡先" value={formData.emergencyContact} onChange={(e) => onChange('emergencyContact', e.target.value)} className="border rounded p-2" />
        </div>
    </fieldset>
);

export default GuardianInfosection;

// src/components/StudentRegistrationForm/BasicInfoSection.jsx
const genders = ['男性', '女性', 'その他'];
const grades = ['小1', '小2', '小3', '小4', '小5', '小6', '中1', '中2', '中3', '高1', '高2', '高3'];

const BasicInfoSection = ({ formData, onChange }) => (
    <fieldset>
        <legend className="font-semibold mb-2">生徒の基本情報</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="姓" value={formData.lastName} onChange={(e) => onChange('lastName', e.target.value)} className="border rounded p-2" required />
            <input type="text" placeholder="名" value={formData.firstName} onChange={(e) => onChange('firstName', e.target.value)} className="border rounded p-2" required />
            <input type="text" placeholder="姓（フリガナ）" value={formData.lastNameKana} onChange={(e) => onChange('lastNameKana', e.target.value)} className="border rounded p-2" />
            <input type="text" placeholder="名（フリガナ）" value={formData.firstNameKana} onChange={(e) => onChange('firstNameKana', e.target.value)} className="border rounded p-2" />
            <input type="date" value={formData.birthDate} onChange={(e) => onChange('birthDate', e.target.value)} className="border rounded p-2" />
            <select value={formData.gender} onChange={(e) => onChange('gender', e.target.value)} className="border rounded p-2">
                <option value="">性別を選択</option>
                {genders.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={formData.grade} onChange={(e) => onChange('grade', e.target.value)} className="border rounded p-2">
                <option value="">学年を選択</option>
                {grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <input type="text" placeholder="学校名" value={formData.schoolName} onChange={(e) => onChange('schoolName', e.target.value)} className="border rounded p-2" />
            <input type="text" placeholder="住所" value={formData.address} onChange={(e) => onChange('address', e.target.value)} className="border rounded p-2" />
        </div>
    </fieldset>
);

export default BasicInfoSection;

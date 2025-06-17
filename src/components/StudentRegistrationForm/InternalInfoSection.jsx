// src/components/StudentRegistrationForm/InternalInfoSection.jsx
const statuses = ['在籍中', '休会', '退会'];

const InternalInfoSection = ({ formData, onChange }) => (
    <fieldset>
        <legend className="font-semibold mb-2">内部管理用</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
                type="text"
                placeholder="生徒ID"
                value={formData.studentId}
                readOnly
                className="border rounded p-2 bg-gray-100 cursor-not-allowed"
            />
            <input type="date" placeholder="登録日" value={formData.registrationDate} onChange={(e) => onChange('registrationDate', e.target.value)} className="border rounded p-2" />
            <select value={formData.status} onChange={(e) => onChange('status', e.target.value)} className="border rounded p-2">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
    </fieldset>
);

export default InternalInfoSection;

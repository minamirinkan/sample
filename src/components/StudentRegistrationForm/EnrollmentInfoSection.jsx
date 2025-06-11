// src/components/StudentRegistrationForm/EnrollmentInfosection.jsx
const courses = ['Aコース', 'Bコース', 'Cコース'];

const EnrollmentInfosection = ({ formData, onChange }) => (
    <fieldset>
        <legend className="font-semibold mb-2">入塾関連</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="date" placeholder="入塾日" value={formData.enrollmentDate} onChange={(e) => onChange('enrollmentDate', e.target.value)} className="border rounded p-2" />
            <select value={formData.courseClass} onChange={(e) => onChange('courseClass', e.target.value)} className="border rounded p-2">
                <option value="">コース／クラスを選択</option>
                {courses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
    </fieldset>
);

export default EnrollmentInfosection;

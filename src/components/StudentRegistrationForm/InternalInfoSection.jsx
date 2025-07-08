// src/components/StudentRegistrationForm/InternalInfoSection.jsx
const InternalInfoSection = ({ formData, onChange, lessonType, onLessonTypeChange }) => (
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
            <input
                type="date"
                placeholder="登録日"
                value={formData.registrationDate}
                onChange={(e) => onChange('registrationDate', e.target.value)}
                className="border rounded p-2"
            />

            {/* 授業形態（レギュラー or 非レギュラー） */}
            <div className="sm:col-span-2">
                <label className="block font-medium mb-1">授業形態</label>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            value="regular"
                            checked={lessonType === 'regular'}
                            onChange={(e) => onLessonTypeChange(e.target.value)}
                        />
                        レギュラー（新規・継続）
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            value="nonRegular"
                            checked={lessonType === 'nonRegular'}
                            onChange={(e) => onLessonTypeChange(e.target.value)}
                        />
                        非レギュラー（補習・講習のみ）
                    </label>
                </div>
            </div>
        </div>
    </fieldset>
);

export default InternalInfoSection;

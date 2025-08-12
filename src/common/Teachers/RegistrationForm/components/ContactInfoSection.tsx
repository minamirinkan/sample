import React from 'react';

interface FormData {
  university: string;
  universityGrade: string;
  phone: string;
  email: string;
}

interface ContactInfoSectionProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ formData, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium">大学名</label>
        <input
          type="text"
          value={formData.university}
          onChange={(e) => onChange('university', e.target.value)}
          className="mt-1 w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">学年</label>
        <select
          value={formData.universityGrade}
          onChange={(e) => onChange('universityGrade', e.target.value)}
          className="mt-1 w-full border rounded p-2"
        >
          <option value="">選択してください</option>
          {['高3', '大1', '大2', '大3', '大4', '院1', '院2', 'その他'].map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">電話番号</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="mt-1 w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">メールアドレス</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="mt-1 w-full border rounded p-2"
        />
      </div>
    </div>
  );
};

export default ContactInfoSection;
import React from 'react';
import { FormData } from '../TeacherRegistrationForm';

interface EmploymentInfoSectionProps {
  formData: FormData;
  onChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

const EmploymentInfoSection: React.FC<EmploymentInfoSectionProps> = ({ formData, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium">雇用日</label>
        <input
          type="date"
          name="hireDate"
          value={formData.hireDate instanceof Date ? formData.hireDate.toISOString().split("T")[0] : ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange('hireDate', e.target.value ? new Date(e.target.value) : undefined)
          }
          className="mt-1 w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">状況</label>
        <select
          value={formData.status}
          onChange={(e) => onChange('status', e.target.value as FormData['status'])}
          className="mt-1 w-full border rounded p-2"
        >
          <option value="在職中">在職中</option>
          <option value="退職済">退職済</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1">交通費</label>
        <input
          type="number"
          value={formData.transportation ?? ''}
          onChange={(e) => onChange('transportation', Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
          placeholder="例：800"
        />
      </div>
    </div>
  );
};

export default EmploymentInfoSection;

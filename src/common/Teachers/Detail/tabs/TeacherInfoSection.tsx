// src/components/TeacherInfoSection.tsx
import React from 'react';
import InfoRow from '../../../Students/components/InfoRow';
import { formatDate } from '../../../dateFormatter';
import { Teacher } from '@/schemas';

// --- 型定義 ---
export interface TeacherFormData {
  code: string;
  classroomName: string;
  hireDate: string | Date | null;
  status: string;
  transportation: number | string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  gender: string;
  phone: string;
  email: string;
  university: string;
  universityGrade: string;
}

interface TeacherInfoSectionProps {
  formData: Teacher;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

// --- コンポーネント ---
const TeacherInfoSection: React.FC<TeacherInfoSectionProps> = ({ formData, isEditing, onChange }) => (
  <div className="space-y-4 w-1/2 pr-6">
    <div className="p-3 rounded-md border border-gray-300 border-t-4 border-t-green-500 shadow-sm">
      <h2 className="text-lg font-semibold mb-3 text-green-600">雇用情報</h2>
      <InfoRow label="講師コード" value={formData.code} isEditing={false} />
      <InfoRow label="教室名" value={formData.classroomName} isEditing={false} />
      <InfoRow
        label="雇用日"
        value={formData.hireDate ? formatDate(formData.hireDate) : ''}
        name="hireDate"
        isEditing={isEditing}
        onChange={onChange}
      />
      <InfoRow label="ステータス" value={formData.status} name="status" isEditing={isEditing} onChange={onChange} />
      <InfoRow
  label="交通費（円）"
  value={formData.transportation?.toString() ?? ''}
  name="transportation"
  isEditing={isEditing}
  onChange={onChange}
/>

    </div>

    <div className="p-3 rounded-md border border-gray-300 border-t-4 border-t-green-500 shadow-sm">
      <h2 className="text-lg font-semibold mb-3 text-green-600">講師情報</h2>
      <InfoRow label="氏名（姓）" value={formData.lastName} name="lastName" isEditing={isEditing} onChange={onChange} />
      <InfoRow label="氏名（名）" value={formData.firstName} name="firstName" isEditing={isEditing} onChange={onChange} />
      <InfoRow label="氏名カナ（姓）" value={formData.lastNameKana} name="lastNameKana" isEditing={isEditing} onChange={onChange} />
      <InfoRow label="氏名カナ（名）" value={formData.firstNameKana} name="firstNameKana" isEditing={isEditing} onChange={onChange} />
      <InfoRow label="性別" value={formData.gender} name="gender" isEditing={isEditing} onChange={onChange} />
      <InfoRow label="電話番号" value={formData.phone} name="phone" isEditing={isEditing} onChange={onChange} />
      <InfoRow label="メールアドレス" value={formData.email} name="email" isEditing={isEditing} onChange={onChange} />
    </div>

    <div className="p-3 rounded-md border border-gray-300 border-t-4 border-t-green-500 shadow-sm">
      <h2 className="text-lg font-semibold mb-3 text-green-600">大学情報</h2>
      <InfoRow label="大学名" value={formData.university} name="university" isEditing={isEditing} onChange={onChange} />
      <InfoRow
        label="大学の学年"
        value={formData.universityGrade}
        name="universityGrade"
        isEditing={isEditing}
        onChange={onChange}
      />
    </div>
  </div>
);

export default TeacherInfoSection;

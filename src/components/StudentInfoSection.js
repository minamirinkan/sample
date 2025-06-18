// src/components/StudentInfoSection.js
import React from 'react';
import InfoRow from './InfoRow';

const StudentInfoSection = ({ formData, isEditing, onChange }) => (
    <div className="space-y-4 w-1/2 pr-6">
        <div className="bg-blue-50 p-3 rounded-md border border-blue-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-blue-700">在籍情報</h2>
            <InfoRow label="在籍状況" value={formData.status} isEditing={false} />
            <InfoRow label="受付日" value={formData.entryDate} isEditing={false} />
            <InfoRow label="コース/クラス" value={formData.courseClass} isEditing={false} />
        </div>

        <div className="bg-green-50 p-3 rounded-md border border-green-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-green-700">生徒情報</h2>
            <InfoRow label="生徒コード" value={formData.studentId} isEditing={false} readOnly />
            <InfoRow label="教室コード" value={formData.classroomCode} isEditing={false} readOnly />
            <InfoRow label="氏名（姓）" value={formData.lastName} name="lastName" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="氏名（名）" value={formData.firstName} name="firstName" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="氏名カナ（姓）" value={formData.lastNameKana} name="lastNameKana" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="氏名カナ（名）" value={formData.firstNameKana} name="firstNameKana" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="性別" value={formData.gender} isEditing={false} />
            <InfoRow label="生年月日" value={formData.birthDate} isEditing={false} />
        </div>

        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 text-yellow-700">学校情報</h2>
            <InfoRow label="学校名" value={formData.schoolName} name="schoolName" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="学年" value={formData.grade} name="grade" isEditing={isEditing} onChange={onChange} />
            <InfoRow label="入塾日" value={formData.enrollmentDate} isEditing={false} />
            <InfoRow label="住所" value={formData.address} name="address" isEditing={isEditing} onChange={onChange} />
        </div>
    </div>
);

export default StudentInfoSection;

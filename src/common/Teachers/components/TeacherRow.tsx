// src/components/TeacherRow.tsx
import React from 'react';
import { FaUserSlash } from 'react-icons/fa';
import { formatDate } from '../../dateFormatter';

// 型定義
export type Teacher = {
    id: number | string;
    code: string;
    lastName: string;
    firstName: string;
    lastNameKana: string;
    firstNameKana: string;
    subject: string;
    hireDate: string | Date;
    status: '在職中' | '退職済';
};

type TeacherRowProps = {
    teacher: Teacher;
    isSelected: boolean;
    onSelect: (id: number | string) => void;
    onShowDetail: (teacher: Teacher) => void;
};

// React.FCを使ってコンポーネントに型を適用
const TeacherRow: React.FC<TeacherRowProps> = ({ teacher, isSelected, onSelect, onShowDetail }) => (
    <tr className="hover:bg-gray-50 text-sm">
        <td className="border px-4 py-2">
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(teacher.id)}
            />
        </td>
        <td className="border px-4 py-2">{teacher.code}</td>
        <td className="border px-4 py-2">{teacher.lastName} {teacher.firstName}</td>
        <td className="border px-4 py-2">{teacher.lastNameKana} {teacher.firstNameKana}</td>
        <td className="border px-4 py-2">{teacher.subject}</td>
        <td className="border px-4 py-2">{formatDate(teacher.hireDate)}</td>
        <td className="border px-4 py-2 text-center">
            {teacher.status === '退職済' ? (
                <FaUserSlash className="text-red-500 inline-block" title="退職済" />
            ) : (
                <span className="text-green-600">在職中</span>
            )}
        </td>
        <td className="border px-4 py-2">
            <button
                onClick={() => onShowDetail(teacher)}
                className="text-blue-600 hover:underline"
            >
                詳細
            </button>
        </td>
    </tr>
);

export default TeacherRow;

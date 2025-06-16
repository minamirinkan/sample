// src/components/TeacherRow.js
import { FaUserSlash } from 'react-icons/fa';

const TeacherRow = ({ teacher, isSelected, onSelect }) => (
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
        <td className="border px-4 py-2">{teacher.kana || '－'}</td>
        <td className="border px-4 py-2">{teacher.subject}</td>
        <td className="border px-4 py-2">{teacher.hireDate || '－'}</td>
        <td className="border px-4 py-2 text-center">
            {teacher.status === '退職済' ? (
                <FaUserSlash className="text-red-500 inline-block" title="退職済" />
            ) : (
                <span className="text-green-600">在職中</span>
            )}
        </td>
        <td className="border px-4 py-2">
            <button className="text-blue-600 hover:underline text-sm">詳細</button>
        </td>
    </tr>
);

export default TeacherRow;

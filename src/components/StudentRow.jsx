import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { formatDate } from '../utils/dateFormatter';

const StudentRow = ({ student, isSelected, onSelect }) => {
    return (
        <tr className="hover:bg-gray-50 text-sm">
            <td className="border px-4 py-2">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(student.id)}
                />
            </td>
            <td className="border px-4 py-2">{student.code}</td>
            <td className="border px-4 py-2">{student.lastName} {student.firstName}</td>
            <td className="border px-4 py-2">{student.kana || '－'}</td>
            <td className="border px-4 py-2">{student.grade}</td>
            <td className="border px-4 py-2">{formatDate(student.entryDate)}</td>
            <td className="border px-4 py-2 text-center">
                {student.billingStatus === '未請求' && (
                    <FaExclamationTriangle className="text-red-500 inline-block" />
                )}
            </td>
            <td className="border px-4 py-2">
                <button className="text-blue-600 hover:underline text-sm">詳細</button>
            </td>
        </tr>
    );
};

export default StudentRow;

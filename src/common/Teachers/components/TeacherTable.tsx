// src/components/TeacherTable.tsx
import React, { useState, useEffect } from 'react';
import TeacherTableHeader from './TeacherTableHeader';
import TeacherRow from './TeacherRow';
import Pagination from '../../PaginationControls';
import type { Teacher as TeacherRowType } from './TeacherRow';

// 講師オブジェクトの型定義
export interface Teacher {
    id: number | string;
    code: string;
    lastName: string;
    firstName: string;
    lastNameKana: string;
    firstNameKana: string;
    subject: string;
    hireDate: string | Date;
    status: '在職中' | '退職済';
}


// Propsの型定義
interface TeacherTableProps {
  teachers: TeacherRowType[];           // ← 型を TeacherRow.tsx と一致させる
  onShowDetail: (teacher: TeacherRowType) => void;  // ← 型も一致
}


const TeacherTable: React.FC<TeacherTableProps> = ({ teachers, onShowDetail }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);


  const totalPages = Math.ceil(teachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, teachers.length);
  const currentTeachers = teachers.slice(startIndex, endIndex);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleCheckboxChange = (id: string | number) => {
    setSelectedIds((prev: (string | number)[]) =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">講師一覧</h2>
        <div className="flex items-center space-x-2 text-sm">
          <span>表示件数:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border px-2 py-1 rounded"
          >
            <option value={10}>10件</option>
            <option value={20}>20件</option>
            <option value={50}>50件</option>
          </select>
        </div>
      </div>

      <table className="w-full table-auto border-collapse">
        <TeacherTableHeader />
        <tbody>
          {currentTeachers.map((teacher) => (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              isSelected={selectedIds.includes(teacher.id)}
              onSelect={handleCheckboxChange}
              onShowDetail={onShowDetail}
            />
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-sm text-gray-600">
        {teachers.length > 0 ? (
          <>
            {teachers.length}件中 {startIndex + 1}〜{endIndex}件を表示中
          </>
        ) : (
          <>データがありません</>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default TeacherTable;

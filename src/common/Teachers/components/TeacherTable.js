// src/components/TeacherTable.js
import { useState, useEffect } from 'react';
import TeacherTableHeader from './TeacherTableHeader';
import TeacherRow from './TeacherRow';
import Pagination from '../../PaginationControls';

const TeacherTable = ({ teachers, onShowDetail }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);

    const totalPages = Math.ceil(teachers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, teachers.length);
    const currentTeachers = teachers.slice(startIndex, endIndex);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleCheckboxChange = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
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

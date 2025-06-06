import { useState, useEffect } from 'react';
import { FaUserSlash } from 'react-icons/fa';

const TeacherTable = ({ teachers }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);

    const totalPages = Math.ceil(teachers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, teachers.length);
    const currentTeachers = teachers.slice(startIndex, endIndex);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage, itemsPerPage]);

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
                <thead>
                    <tr className="bg-gray-100 text-sm">
                        <th className="border px-4 py-2 text-center">選択</th>
                        <th className="border px-4 py-2 text-center">講師コード</th>
                        <th className="border px-4 py-2 text-center">氏名</th>
                        <th className="border px-4 py-2 text-center">フリガナ</th>
                        <th className="border px-4 py-2 text-center">担当科目</th>
                        <th className="border px-4 py-2 text-center">雇用日</th>
                        <th className="border px-4 py-2 text-center">状況</th>
                        <th className="border px-4 py-2 text-center">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {currentTeachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-gray-50 text-sm">
                            <td className="border px-4 py-2">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(teacher.id)}
                                    onChange={() => handleCheckboxChange(teacher.id)}
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

            <div className="flex justify-center mt-4 space-x-2">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    前へ
                </button>

                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={`px-3 py-1 rounded ${number === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'
                            }`}
                    >
                        {number}
                    </button>
                ))}

                <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    次へ
                </button>
            </div>
        </div>
    );
};

export default TeacherTable;

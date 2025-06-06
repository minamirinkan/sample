import { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const StudentTable = ({ students }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);

    const totalPages = Math.ceil(students.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, students.length);
    const currentStudents = students.slice(startIndex, endIndex);
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
                <h2 className="text-xl font-bold">検索結果</h2>
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
                        <th className="border px-4 py-2 text-center">生徒コード</th>
                        <th className="border px-4 py-2 text-center">氏名</th>
                        <th className="border px-4 py-2 text-center">フリガナ</th>
                        <th className="border px-4 py-2 text-center">学年</th>
                        <th className="border px-4 py-2 text-center">受付年月日</th>
                        <th className="border px-4 py-2 text-center">
                            <div>請求</div>
                            <div>状況</div>
                        </th>
                        <th className="border px-4 py-2 text-center">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {currentStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 text-sm">
                            <td className="border px-4 py-2">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(student.id)}
                                    onChange={() => handleCheckboxChange(student.id)}
                                />
                            </td>
                            <td className="border px-4 py-2">{student.code}</td>
                            <td className="border px-4 py-2">{student.lastName} {student.firstName}</td>
                            <td className="border px-4 py-2">{student.kana || '－'}</td>
                            <td className="border px-4 py-2">{student.grade}</td>
                            <td className="border px-4 py-2">{student.entryDate || '－'}</td>
                            <td className="border px-4 py-2 text-center">
                                {student.billingStatus === '未請求' && (
                                    <FaExclamationTriangle className="text-red-500 inline-block" />
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
                {students.length > 0 ? (
                    <>
                        {students.length}件中 {startIndex + 1}〜{endIndex}件を表示中
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

export default StudentTable;

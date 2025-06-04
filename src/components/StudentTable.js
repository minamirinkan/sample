import { useState, useEffect } from 'react';

const StudentTable = ({ students }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // 総ページ数
    const totalPages = Math.ceil(students.length / itemsPerPage);

    // 現在ページの生徒リスト
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, students.length);
    const currentStudents = students.slice(startIndex, endIndex);

    // ページ番号リスト
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    // ページ変更時に先頭にスクロール
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage, itemsPerPage]);

    // 表示件数変更時に1ページ目に戻す
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">生徒一覧</h2>

                {/* 表示件数選択 */}
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
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-left">氏名</th>
                        <th className="border px-4 py-2 text-left">学年</th>
                        <th className="border px-4 py-2 text-left">生徒コード</th>
                    </tr>
                </thead>
                <tbody>
                    {currentStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">{student.lastName} {student.firstName}</td>
                            <td className="border px-4 py-2">{student.grade}</td>
                            <td className="border px-4 py-2">{student.code}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 件数表示 */}
            <div className="mt-4 text-sm text-gray-600">
                {students.length > 0 ? (
                    <>
                        {students.length}件中 {startIndex + 1}〜{endIndex}件を表示中
                    </>
                ) : (
                    <>データがありません</>
                )}
            </div>

            {/* ページネーション */}
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

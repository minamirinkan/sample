import { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import SearchForm from './SearchForm';
import Breadcrumb from './Breadcrumb';
import { mockTeachers } from '../data/mockTeachers';

const SuperAdminTeachers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const breadcrumbItems = ['講師マスタ', '一覧'];

    useEffect(() => {
        const lower = searchTerm.toLowerCase();
        const results = mockTeachers.filter(
            (teacher) =>
                teacher.lastName.toLowerCase().includes(lower) ||
                teacher.firstName.toLowerCase().includes(lower) ||
                teacher.kana?.toLowerCase().includes(lower) ||
                teacher.code.includes(searchTerm)
        );
        setFilteredTeachers(results);
        setCurrentPage(1); // 検索時に1ページ目へ戻す
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTeachers = filteredTeachers.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="space-y-4">
            {/* タイトル + パンくず */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    講師マスタ <span className="text-lg font-normal ml-1">一覧</span>
                </h1>
                <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* 検索フォーム */}
            <SearchForm onSearch={setSearchTerm} />

            {/* 一覧テーブル */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">検索結果</h2>
                    <div className="flex items-center space-x-2 text-sm">
                        <span>表示件数:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="border px-2 py-1 rounded"
                        >
                            <option value={10}>10件</option>
                            <option value={20}>20件</option>
                            <option value={50}>50件</option>
                        </select>
                    </div>
                </div>

                <table className="w-full table-auto border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-4 py-2">講師コード</th>
                            <th className="border px-4 py-2">氏名</th>
                            <th className="border px-4 py-2">フリガナ</th>
                            <th className="border px-4 py-2">担当科目</th>
                            <th className="border px-4 py-2">採用日</th>
                            <th className="border px-4 py-2">ステータス</th>
                            <th className="border px-4 py-2">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTeachers.map((teacher) => (
                            <tr key={teacher.id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">{teacher.code}</td>
                                <td className="border px-4 py-2">{teacher.lastName} {teacher.firstName}</td>
                                <td className="border px-4 py-2">{teacher.kana || '－'}</td>
                                <td className="border px-4 py-2">{teacher.subject || '－'}</td>
                                <td className="border px-4 py-2">{teacher.hireDate || '－'}</td>
                                <td className="border px-4 py-2 text-center">
                                    {teacher.status === '未登録' ? (
                                        <FaExclamationTriangle className="text-red-500 inline-block" />
                                    ) : (
                                        teacher.status
                                    )}
                                </td>
                                <td className="border px-4 py-2 text-blue-600 hover:underline cursor-pointer">
                                    詳細
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-4 text-sm text-gray-600">
                    {filteredTeachers.length > 0 ? (
                        <>
                            {filteredTeachers.length}件中 {startIndex + 1}〜{startIndex + currentTeachers.length}件を表示中
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`px-3 py-1 rounded ${number === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
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
        </div>
    );
};

export default SuperAdminTeachers;

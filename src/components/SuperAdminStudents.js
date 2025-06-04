import { useState, useEffect } from 'react';
import { filterStudents } from '../utils/filterStudents';
import SearchForm from './SearchForm';
import Breadcrumb from './Breadcrumb';
import StudentTable from './StudentTable';

// 仮データ（Firestore連携時に削除可）
const mockStudents = [
    { id: 1, code: '20230001', lastName: '山田', firstName: '太郎', grade: '中3' },
    { id: 2, code: '20230002', lastName: '佐藤', firstName: '花子', grade: '中2' },
    { id: 3, code: '20230003', lastName: '鈴木', firstName: '一郎', grade: '中1' },
];

const SuperAdminStudents = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const breadcrumbItems = ['生徒マスタ', '一覧'];

    useEffect(() => {
        const results = filterStudents(mockStudents, searchTerm);
        setFilteredStudents(results);
    }, [searchTerm]);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <div className="space-y-4">
            {/* タイトル + パンくず */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    生徒マスタ <span className="text-lg font-normal ml-1">一覧</span>
                </h1>
                <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* ✅ SearchForm を挿入 */}
            <SearchForm onSearch={handleSearch} />

            {/* 生徒一覧 表形式 */}
            <StudentTable students={filteredStudents} />
        </div>
    );
};

export default SuperAdminStudents;

import { useState, useEffect } from 'react';
import { filterStudents } from '../utils/filterStudents';
import SearchForm from './SearchForm';
import Breadcrumb from './Breadcrumb';
import StudentTable from './StudentTable';
import { mockStudents } from '../data/mockStudents';

const SuperAdminStudents = ({ onAddNewStudent }) => {
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
                <button onClick={onAddNewStudent} className="btn-primary">
                    新規登録
                </button>
            </div>

            <SearchForm onSearch={handleSearch} />
            <StudentTable students={filteredStudents} />
        </div>
    );
};

export default SuperAdminStudents;

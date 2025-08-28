// src/components/SuperAdminStudents.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminData } from '../../contexts/providers/AdminDataProvider';
import StudentSearchForm from './components/StudentSearchForm';
import Breadcrumb from './components/Breadcrumb';
import StudentTable from './components/StudentTable';
import { filterStudents } from './components/filterStudents';
import { Student } from '../../contexts/types/student';

const SuperAdminStudents: React.FC = () => {
    const { students } = useAdminData();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState<string>('');
    const breadcrumbItems: string[] = ['生徒マスタ', '一覧'];
    const filteredStudents = filterStudents(students.students ?? [], searchTerm);

    const handleShowDetail = (student: Student) => {
        navigate(`/admin/students/${student.id}`);
    };

    const handleAddNewStudent = () => {
        navigate('/admin/students/new');
    };

    const handleSearch = (term: string) => setSearchTerm(term);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    生徒マスタ <span className="text-lg font-normal ml-1">一覧</span>
                </h1>
                <Breadcrumb items={breadcrumbItems} />
                <button onClick={handleAddNewStudent} className="btn-primary">
                    新規登録
                </button>
            </div>

            <StudentSearchForm onSearch={handleSearch} />
            <StudentTable students={filteredStudents} onShowDetail={handleShowDetail} />
        </div>
    );
};

export default SuperAdminStudents;

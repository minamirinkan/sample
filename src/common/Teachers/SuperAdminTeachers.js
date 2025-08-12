// src/components/SuperAdminTeachers.js
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext'; // ← これを使う
import TeacherSearchForm from './components/TeacherSearchForm.js';
import Breadcrumb from '../Students/components/Breadcrumb';
import TeacherTable from './components/TeacherTable.js';
import { filterTeachers } from './utils/filterTeachers';
import TeacherDetail from './Detail/TeacherDetail.js';
import { useAdminData } from '../../contexts/providers/AdminDataProvider';

const SuperAdminTeachers = ({ onAddNewTeacher }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const { teachers } = useAdminData(); // ← classroomCode を含む
    const teacherList = teachers?.teachers || [];
    const [view, setView] = useState('list'); // 'list', 'detail', 'form'
    const [selectedTeacherDetail, setSelectedTeacherDetail] = useState(null);

    const breadcrumbItems = ['講師マスタ', '一覧'];

    useEffect(() => {
        setFilteredTeachers(filterTeachers(teachers || [], searchTerm));
    }, [searchTerm, teachers]);

    const handleShowDetail = (teacher) => {
        setSelectedTeacherDetail(teacher);
        setView('detail');
    };

    const handleBackToList = () => {
        setSelectedTeacherDetail(null);
        setView('list');
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <>
            {view === 'list' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">
                            講師マスタ <span className="text-lg font-normal ml-1">一覧</span>
                        </h1>
                        <Breadcrumb items={breadcrumbItems} />
                        <button onClick={onAddNewTeacher} className="btn-primary">
                            新規登録
                        </button>
                    </div>

                    <TeacherSearchForm onSearch={handleSearch} />
                    <TeacherTable teachers={teacherList} onShowDetail={handleShowDetail} />
                </div>
            )}

            {view === 'detail' && selectedTeacherDetail && (
                <TeacherDetail
                    teacher={selectedTeacherDetail}
                    onBack={handleBackToList}
                />
            )}
        </>
    );
};

export default SuperAdminTeachers;
